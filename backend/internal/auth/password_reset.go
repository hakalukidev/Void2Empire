package auth

import (
	"context"
	"errors"
	"fmt"
	"html"
	"log"
	"net/url"
	"strings"
	"time"

	"github.com/google/uuid"

	"void2empire/internal/mail"
	"void2empire/internal/models"
)

// Password reset by emailed link (REQ-009), and password change for a
// signed-in user. Reset tokens live in verification_codes beside the email
// OTPs, under their own purpose, stored as an HMAC like the codes are.
const (
	codePurposePasswordReset = "password_reset"

	resetTTL = 30 * time.Minute
	// resetHourlyLimit bounds reset emails per account, as codeHourlyLimit does
	// for verification codes.
	resetHourlyLimit = 5
)

var (
	// ErrInvalidResetToken covers a wrong, expired, used or replaced link.
	ErrInvalidResetToken = errors.New("this reset link is invalid or has expired; request a new one")
	ErrWrongPassword     = errors.New("current password is incorrect")
	// ErrNoPassword is a Google-only account, which has no password to check
	// the current one against. Forgot-password sets one.
	ErrNoPassword = errors.New("this account signs in with Google and has no password yet; use \"Forgot password\" to set one")
)

// RequestPasswordReset emails a reset link. It answers nil for an unknown
// email and when the account has hit its sending limit, so the endpoint never
// reveals who is registered.
func (s *Service) RequestPasswordReset(ctx context.Context, email string) error {
	user, err := s.repo.FindByEmailFold(ctx, email)
	if errors.Is(err, ErrUserNotFound) {
		return nil
	}
	if err != nil {
		return err
	}

	now := time.Now()
	latest, err := s.repo.LatestCode(ctx, user.ID, codePurposePasswordReset)
	if err != nil {
		return err
	}
	if latest != nil && now.Sub(latest.CreatedAt) < codeResendCooldown {
		return nil
	}
	sent, err := s.repo.CountCodesSince(ctx, user.ID, codePurposePasswordReset, now.Add(-time.Hour))
	if err != nil {
		return err
	}
	if sent >= resetHourlyLimit {
		return nil
	}

	token, err := randomToken(32)
	if err != nil {
		return err
	}
	record := &verificationCode{
		ID:        uuid.NewString(),
		UserID:    user.ID,
		CodeHash:  s.codeHash(token),
		ExpiresAt: now.Add(resetTTL),
	}
	if err := s.repo.ReplaceCode(ctx, record, codeChannelEmail, codePurposePasswordReset); err != nil {
		return err
	}

	link := s.frontendURL + "/reset-password?token=" + url.QueryEscape(token)
	if err := s.mailer.Send(ctx, passwordResetEmail(user, link)); err != nil {
		// Logged, not returned: the response must look the same either way.
		log.Printf("auth: password reset email for user %s not sent: %v", user.ID, err)
	}
	return nil
}

// ResetPassword spends a reset token, sets the new password and signs out
// every session of the account. Following the link proves control of the
// inbox, so the email counts as verified too.
func (s *Service) ResetPassword(ctx context.Context, token, password string) error {
	if err := validatePasswordStrength(password); err != nil {
		return err
	}
	token = strings.TrimSpace(token)
	if token == "" {
		return ErrInvalidResetToken
	}

	code, err := s.repo.FindCodeByHash(ctx, s.codeHash(token), codePurposePasswordReset)
	if err != nil {
		return err
	}
	if code == nil || code.ConsumedAt != nil || time.Now().After(code.ExpiresAt) {
		return ErrInvalidResetToken
	}

	hash, err := HashPassword(password)
	if err != nil {
		return err
	}
	ok, err := s.repo.ConsumeCodeAndSetPassword(ctx, code.ID, code.UserID, hash)
	if err != nil {
		return err
	}
	if !ok {
		return ErrInvalidResetToken
	}
	return nil
}

// ChangePassword sets a new password for a signed-in user who knows the
// current one, and signs out every other session: if the password changed
// because it leaked, those sessions may be the attacker's.
func (s *Service) ChangePassword(ctx context.Context, userID, sessionID, current, next string) error {
	user, err := s.repo.FindByID(ctx, userID)
	if err != nil {
		return err
	}
	if user.PasswordHash == "" {
		return ErrNoPassword
	}
	if !VerifyPassword(user.PasswordHash, current) {
		return ErrWrongPassword
	}
	if err := validatePasswordStrength(next); err != nil {
		return err
	}

	hash, err := HashPassword(next)
	if err != nil {
		return err
	}
	if err := s.repo.SetPassword(ctx, userID, hash); err != nil {
		return err
	}
	return s.repo.RevokeUserSessions(ctx, userID, sessionID)
}

// UpdateProfile changes what a user may edit about themselves. Email is not
// among it: changing it would need re-verification.
func (s *Service) UpdateProfile(ctx context.Context, userID string, req UpdateProfileRequest) (*models.User, error) {
	name := strings.TrimSpace(req.FullName)
	if len([]rune(name)) < 2 {
		return nil, ErrInvalidName
	}
	if err := s.repo.UpdateFullName(ctx, userID, name); err != nil {
		return nil, err
	}
	return s.repo.FindByID(ctx, userID)
}

var ErrInvalidName = errors.New("name must be at least 2 characters")

func passwordResetEmail(user *models.User, link string) mail.Message {
	minutes := int(resetTTL.Minutes())
	return mail.Message{
		To:      user.Email,
		Subject: "Reset your Void2Empire password",
		Text: fmt.Sprintf(
			"Hi %s,\n\nOpen this link to choose a new password:\n\n%s\n\nIt expires in %d minutes and works once. If you did not ask to reset your password, ignore this email; your password stays the same.\n",
			user.FullName, link, minutes,
		),
		HTML: fmt.Sprintf(`<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0f172a">
  <h2 style="margin:0 0 16px">Reset your password</h2>
  <p>Hi %s,</p>
  <p>Click the button below to choose a new password for your Void2Empire account.</p>
  <p style="margin:24px 0"><a href="%s" style="display:inline-block;background:#1d4ed8;color:#ffffff;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:8px">Reset password</a></p>
  <p style="color:#475569">It expires in %d minutes and works once. If you did not ask to reset your password, ignore this email; your password stays the same.</p>
</div>`, html.EscapeString(user.FullName), html.EscapeString(link), minutes),
	}
}
