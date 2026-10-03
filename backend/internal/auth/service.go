package auth

import (
	"context"
	"errors"
	"log"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"

	"void2empire/internal/mail"
	"void2empire/internal/models"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrEmailNotVerified   = errors.New("verify your email to sign in; we sent you a new code")
	ErrWeakPassword       = errors.New("password must contain an uppercase letter, a lowercase letter, a number, and a special character")

	hasUpper   = regexp.MustCompile(`[A-Z]`)
	hasLower   = regexp.MustCompile(`[a-z]`)
	hasNumber  = regexp.MustCompile(`[0-9]`)
	hasSpecial = regexp.MustCompile(`[^A-Za-z0-9]`)
)

type Service struct {
	repo   *Repository
	tokens *TokenManager
	mailer mail.Sender
	// codeKey keys the HMAC that verification codes are stored under.
	codeKey []byte
	// frontendURL is where emailed links point, e.g. http://localhost:3000.
	frontendURL string
}

func NewService(repo *Repository, tokens *TokenManager, mailer mail.Sender, codeKey []byte, frontendURL string) *Service {
	return &Service{repo: repo, tokens: tokens, mailer: mailer, codeKey: codeKey, frontendURL: frontendURL}
}

func validatePasswordStrength(password string) error {
	if !hasUpper.MatchString(password) || !hasLower.MatchString(password) ||
		!hasNumber.MatchString(password) || !hasSpecial.MatchString(password) {
		return ErrWeakPassword
	}
	return nil
}

// Register creates the account and emails a verification code. It issues no
// session: the account cannot sign in until the email is verified, and
// VerifyEmail is what starts the first session.
func (s *Service) Register(ctx context.Context, req RegisterRequest) (*models.User, error) {
	if err := validatePasswordStrength(req.Password); err != nil {
		return nil, err
	}

	hash, err := HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	user := &models.User{
		ID:           uuid.NewString(),
		FullName:     req.FullName,
		Email:        normalizeEmail(req.Email),
		PasswordHash: hash,
		Country:      req.Country,
		Phone:        req.Phone,
	}

	if err := s.repo.CreateUser(ctx, user); err != nil {
		return nil, err
	}
	s.sendCodeAfterRegister(ctx, user)
	return user, nil
}

// Login checks the password and starts a session. An account whose email is
// not verified gets a fresh code and ErrEmailNotVerified instead; that is said
// only after the password matched, so it reveals nothing to a guesser.
func (s *Service) Login(ctx context.Context, req LoginRequest, client ClientInfo) (*models.User, string, time.Time, error) {
	user, err := s.repo.FindByEmailFold(ctx, req.Email)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			// Spend the same bcrypt time as a real check, so response time does
			// not tell which emails are registered.
			VerifyPassword(dummyPasswordHash, req.Password)
			return nil, "", time.Time{}, ErrInvalidCredentials
		}
		return nil, "", time.Time{}, err
	}

	if user.PasswordHash == "" {
		// A Google-only account: same timing, same answer as a wrong password.
		VerifyPassword(dummyPasswordHash, req.Password)
		return nil, "", time.Time{}, ErrInvalidCredentials
	}
	if !VerifyPassword(user.PasswordHash, req.Password) {
		return nil, "", time.Time{}, ErrInvalidCredentials
	}

	if user.EmailVerifiedAt == nil {
		if err := s.sendEmailCode(ctx, user); err != nil && !errors.Is(err, ErrResendTooSoon) {
			log.Printf("auth: verification email for user %s not sent at login: %v", user.ID, err)
		}
		return nil, "", time.Time{}, ErrEmailNotVerified
	}

	token, expiresAt, err := s.issueSession(ctx, user.ID, client)
	if err != nil {
		return nil, "", time.Time{}, err
	}
	return user, token, expiresAt, nil
}

func (s *Service) CurrentUser(ctx context.Context, userID string) (*models.User, error) {
	return s.repo.FindByID(ctx, userID)
}

// normalizeEmail is the form an address is stored in: trimmed and lowercased,
// so the same mailbox typed in another case is the same account.
func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}
