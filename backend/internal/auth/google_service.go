package auth

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"

	"void2empire/internal/models"
)

var (
	ErrGoogleEmailUnverified = errors.New("google has not verified this email address")
	// ErrGoogleAccountConflict means the email already belongs to an account
	// linked to a different Google account; relinking it would hand that
	// account to whoever holds the new one.
	ErrGoogleAccountConflict = errors.New("this email is linked to a different google account")
)

// LoginWithGoogle signs a Google profile in, in this order: an account already
// linked to the Google id; else an account with the same email, which gets
// linked; else a new account. Linking by email is safe only because Google has
// verified the address, so an unverified one is refused outright.
func (s *Service) LoginWithGoogle(ctx context.Context, p *GoogleProfile) (*models.User, string, time.Time, error) {
	if !p.EmailVerified {
		return nil, "", time.Time{}, ErrGoogleEmailUnverified
	}

	user, err := s.googleUser(ctx, p)
	if err != nil {
		return nil, "", time.Time{}, err
	}

	token, expiresAt, err := s.tokens.Generate(user.ID)
	if err != nil {
		return nil, "", time.Time{}, err
	}
	return user, token, expiresAt, nil
}

func (s *Service) googleUser(ctx context.Context, p *GoogleProfile) (*models.User, error) {
	user, err := s.repo.FindByGoogleSub(ctx, p.Subject)
	if err == nil {
		return user, nil
	}
	if !errors.Is(err, ErrUserNotFound) {
		return nil, err
	}

	user, err = s.repo.FindByEmailFold(ctx, p.Email)
	switch {
	case err == nil:
		linked, err := s.repo.LinkGoogle(ctx, user.ID, p.Subject)
		if err != nil {
			return nil, err
		}
		if !linked {
			return nil, ErrGoogleAccountConflict
		}
		return s.repo.FindByID(ctx, user.ID)
	case !errors.Is(err, ErrUserNotFound):
		return nil, err
	}

	user = &models.User{ID: uuid.NewString(), FullName: googleDisplayName(p), Email: p.Email}
	if err := s.repo.CreateGoogleUser(ctx, user, p.Subject); err != nil {
		return nil, err
	}
	return user, nil
}

// googleDisplayName falls back to the email's local part for the rare Google
// account that shares no name.
func googleDisplayName(p *GoogleProfile) string {
	if name := strings.TrimSpace(p.Name); name != "" {
		return name
	}
	local, _, _ := strings.Cut(p.Email, "@")
	return local
}
