package auth

import (
	"context"
	"errors"
	"regexp"
	"time"

	"github.com/google/uuid"

	"void2empire/internal/models"
)

var (
	ErrInvalidCredentials = errors.New("invalid email or password")
	ErrWeakPassword       = errors.New("password must contain an uppercase letter, a lowercase letter, a number, and a special character")

	hasUpper   = regexp.MustCompile(`[A-Z]`)
	hasLower   = regexp.MustCompile(`[a-z]`)
	hasNumber  = regexp.MustCompile(`[0-9]`)
	hasSpecial = regexp.MustCompile(`[^A-Za-z0-9]`)
)

type Service struct {
	repo   *Repository
	tokens *TokenManager
}

func NewService(repo *Repository, tokens *TokenManager) *Service {
	return &Service{repo: repo, tokens: tokens}
}

func validatePasswordStrength(password string) error {
	if !hasUpper.MatchString(password) || !hasLower.MatchString(password) ||
		!hasNumber.MatchString(password) || !hasSpecial.MatchString(password) {
		return ErrWeakPassword
	}
	return nil
}

func (s *Service) Register(ctx context.Context, req RegisterRequest) (*models.User, string, time.Time, error) {
	if err := validatePasswordStrength(req.Password); err != nil {
		return nil, "", time.Time{}, err
	}

	hash, err := HashPassword(req.Password)
	if err != nil {
		return nil, "", time.Time{}, err
	}

	user := &models.User{
		ID:           uuid.NewString(),
		FullName:     req.FullName,
		Email:        req.Email,
		PasswordHash: hash,
		Country:      req.Country,
		Phone:        req.Phone,
	}

	if err := s.repo.CreateUser(ctx, user); err != nil {
		return nil, "", time.Time{}, err
	}

	token, expiresAt, err := s.tokens.Generate(user.ID)
	if err != nil {
		return nil, "", time.Time{}, err
	}

	return user, token, expiresAt, nil
}

func (s *Service) Login(ctx context.Context, req LoginRequest) (*models.User, string, time.Time, error) {
	user, err := s.repo.FindByEmail(ctx, req.Email)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			return nil, "", time.Time{}, ErrInvalidCredentials
		}
		return nil, "", time.Time{}, err
	}

	if !VerifyPassword(user.PasswordHash, req.Password) {
		return nil, "", time.Time{}, ErrInvalidCredentials
	}

	token, expiresAt, err := s.tokens.Generate(user.ID)
	if err != nil {
		return nil, "", time.Time{}, err
	}

	return user, token, expiresAt, nil
}

func (s *Service) CurrentUser(ctx context.Context, userID string) (*models.User, error) {
	return s.repo.FindByID(ctx, userID)
}
