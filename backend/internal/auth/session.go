package auth

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

// Server-side sessions. A JWT alone cannot be taken back once issued, so every
// token is also recorded in sessions (migration 0003) and RequireAuth accepts it
// only while its row is live. That is what lets logout, a password change and a
// password reset actually end a session instead of only deleting the cookie.
//
// The row holds a SHA-256 of the token, never the token: a leaked sessions table
// must not hand out working cookies. The column is named refresh_token_hash
// because the table was designed for refresh tokens; here it holds the hash of
// the access token the cookie carries.

var ErrSessionNotFound = errors.New("session not found or revoked")

// ClientInfo is recorded with a session so a user (or an operator) can tell
// sessions apart.
type ClientInfo struct {
	IP        string
	UserAgent string
}

// Session is what RequireAuth needs to know about a live session.
type Session struct {
	ID            string
	UserID        string
	EmailVerified bool
}

func tokenHash(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

// issueSession signs a token for the user and records its session.
func (s *Service) issueSession(ctx context.Context, userID string, client ClientInfo) (string, time.Time, error) {
	token, expiresAt, err := s.tokens.Generate(userID)
	if err != nil {
		return "", time.Time{}, err
	}
	if err := s.repo.CreateSession(ctx, uuid.NewString(), userID, tokenHash(token), client, expiresAt); err != nil {
		return "", time.Time{}, err
	}
	return token, expiresAt, nil
}

// Logout revokes the session behind a token. An unknown or already revoked
// token is not an error: the caller is logged out either way.
func (s *Service) Logout(ctx context.Context, token string) error {
	if token == "" {
		return nil
	}
	return s.repo.RevokeSessionByHash(ctx, tokenHash(token))
}

func (r *Repository) CreateSession(ctx context.Context, id, userID, hash string, client ClientInfo, expiresAt time.Time) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO sessions (id, user_id, refresh_token_hash, ip, user_agent, expires_at)
		VALUES ($1, $2, $3, NULLIF($4, ''), NULLIF($5, ''), $6)
	`, id, userID, hash, client.IP, truncate(client.UserAgent, 512), expiresAt)
	return err
}

// SessionForToken returns the live session a token hash belongs to, or
// ErrSessionNotFound when it was never issued, has expired or was revoked.
func (r *Repository) SessionForToken(ctx context.Context, hash string) (*Session, error) {
	var s Session
	err := r.pool.QueryRow(ctx, `
		SELECT s.id, s.user_id, u.email_verified_at IS NOT NULL
		FROM sessions s JOIN users u ON u.id = s.user_id
		WHERE s.refresh_token_hash = $1 AND s.revoked_at IS NULL AND s.expires_at > now()
	`, hash).Scan(&s.ID, &s.UserID, &s.EmailVerified)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrSessionNotFound
	}
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *Repository) RevokeSessionByHash(ctx context.Context, hash string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE sessions SET revoked_at = now(), updated_at = now()
		WHERE refresh_token_hash = $1 AND revoked_at IS NULL
	`, hash)
	return err
}

// RevokeUserSessions ends every live session of a user except keepID, which
// may be empty to end them all.
func (r *Repository) RevokeUserSessions(ctx context.Context, userID, keepID string) error {
	_, err := r.pool.Exec(ctx, `
		UPDATE sessions SET revoked_at = now(), updated_at = now()
		WHERE user_id = $1 AND revoked_at IS NULL AND id::text <> $2
	`, userID, keepID)
	return err
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	// Cut on a rune boundary: Postgres rejects invalid UTF-8.
	return strings.ToValidUTF8(s[:n], "")
}
