package auth

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"html"
	"log"
	"math/big"
	"time"

	"github.com/google/uuid"

	"void2empire/internal/mail"
	"void2empire/internal/models"
)

// Email verification via a 6-digit OTP (REQ-008).
const (
	codePurposeEmail = "email_verification"
	codeChannelEmail = "email"

	codeTTL = 10 * time.Minute
	// codeMaxAttempts caps guesses per code. With a million codes and five
	// guesses, a code falls to guessing one time in 200,000.
	codeMaxAttempts = 5
	// codeResendCooldown matches RESEND_COOLDOWN_SECONDS on the verify page.
	codeResendCooldown = 60 * time.Second
	// codeHourlyLimit bounds how many emails one account can trigger, which
	// also protects the provider's daily sending quota.
	codeHourlyLimit = 5
)

var (
	// ErrInvalidCode covers a wrong, expired, used-up or never-issued code, and
	// an unknown email, so the response never says which.
	ErrInvalidCode   = errors.New("invalid or expired code")
	ErrResendTooSoon = errors.New("a code was sent recently; wait a minute before asking for another")
)

// codeHash is HMAC-SHA256 under a server key, not a plain hash: there are only
// a million 6-digit codes, so a leaked table of plain hashes would reverse in
// milliseconds.
func (s *Service) codeHash(code string) string {
	mac := hmac.New(sha256.New, s.codeKey)
	mac.Write([]byte(code))
	return hex.EncodeToString(mac.Sum(nil))
}

func newCode() (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(1_000_000))
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", n.Int64()), nil
}

// sendEmailCode issues a fresh code to the user and emails it, enforcing the
// resend cooldown and hourly cap.
func (s *Service) sendEmailCode(ctx context.Context, user *models.User) error {
	now := time.Now()

	latest, err := s.repo.LatestCode(ctx, user.ID, codePurposeEmail)
	if err != nil {
		return err
	}
	if latest != nil && now.Sub(latest.CreatedAt) < codeResendCooldown {
		return ErrResendTooSoon
	}
	sent, err := s.repo.CountCodesSince(ctx, user.ID, codePurposeEmail, now.Add(-time.Hour))
	if err != nil {
		return err
	}
	if sent >= codeHourlyLimit {
		return ErrResendTooSoon
	}

	code, err := newCode()
	if err != nil {
		return err
	}
	record := &verificationCode{
		ID:        uuid.NewString(),
		UserID:    user.ID,
		CodeHash:  s.codeHash(code),
		ExpiresAt: now.Add(codeTTL),
	}
	if err := s.repo.ReplaceCode(ctx, record, codeChannelEmail, codePurposeEmail); err != nil {
		return err
	}

	return s.mailer.Send(ctx, verificationEmail(user, code))
}

// ResendEmailCode answers success for an unknown or already verified email
// without sending anything, so the endpoint cannot be used to probe accounts.
func (s *Service) ResendEmailCode(ctx context.Context, email string) error {
	user, err := s.repo.FindByEmailFold(ctx, email)
	if errors.Is(err, ErrUserNotFound) {
		return nil
	}
	if err != nil {
		return err
	}
	if user.EmailVerifiedAt != nil {
		return nil
	}
	return s.sendEmailCode(ctx, user)
}

// VerifyEmail checks a code and, on success, starts the account's session. A
// code is only ever issued to an unverified account, after registration or a
// correct password, so this cannot be used to sign into a verified one.
func (s *Service) VerifyEmail(ctx context.Context, email, code string, client ClientInfo) (*models.User, string, time.Time, error) {
	user, err := s.verifyEmailCode(ctx, email, code)
	if err != nil {
		return nil, "", time.Time{}, err
	}
	token, expiresAt, err := s.issueSession(ctx, user.ID, client)
	if err != nil {
		return nil, "", time.Time{}, err
	}
	return user, token, expiresAt, nil
}

func (s *Service) verifyEmailCode(ctx context.Context, email, code string) (*models.User, error) {
	user, err := s.repo.FindByEmailFold(ctx, email)
	if errors.Is(err, ErrUserNotFound) {
		return nil, ErrInvalidCode
	}
	if err != nil {
		return nil, err
	}

	latest, err := s.repo.LatestCode(ctx, user.ID, codePurposeEmail)
	if err != nil {
		return nil, err
	}
	if latest == nil || latest.ConsumedAt != nil || time.Now().After(latest.ExpiresAt) {
		return nil, ErrInvalidCode
	}

	ok, err := s.repo.SpendAttempt(ctx, latest.ID, codeMaxAttempts)
	if err != nil {
		return nil, err
	}
	if !ok || !hmac.Equal([]byte(s.codeHash(code)), []byte(latest.CodeHash)) {
		return nil, ErrInvalidCode
	}

	consumed, err := s.repo.ConsumeCodeAndVerifyEmail(ctx, latest.ID, user.ID)
	if err != nil {
		return nil, err
	}
	if !consumed {
		return nil, ErrInvalidCode
	}

	return s.repo.FindByID(ctx, user.ID)
}

// sendCodeAfterRegister sends the first code. A failure is logged rather than
// returned: the account already exists, and the verify page's resend button
// recovers from a missed email, whereas failing here would leave the user with
// an account they were told was not created.
func (s *Service) sendCodeAfterRegister(ctx context.Context, user *models.User) {
	if err := s.sendEmailCode(ctx, user); err != nil {
		log.Printf("auth: verification email for user %s not sent: %v", user.ID, err)
	}
}

func verificationEmail(user *models.User, code string) mail.Message {
	return mail.Message{
		To:      user.Email,
		Subject: fmt.Sprintf("%s is your Void2Empire verification code", code),
		Text: fmt.Sprintf(
			"Hi %s,\n\nYour Void2Empire verification code is %s.\n\nIt expires in %d minutes. If you did not create an account, ignore this email.\n",
			user.FullName, code, int(codeTTL.Minutes()),
		),
		HTML: fmt.Sprintf(`<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0f172a">
  <h2 style="margin:0 0 16px">Verify your email</h2>
  <p>Hi %s,</p>
  <p>Enter this code to verify your Void2Empire account:</p>
  <p style="font-size:32px;font-weight:bold;letter-spacing:8px;margin:24px 0;color:#1d4ed8">%s</p>
  <p style="color:#475569">It expires in %d minutes. If you did not create an account, ignore this email.</p>
</div>`, html.EscapeString(user.FullName), code, int(codeTTL.Minutes())),
	}
}
