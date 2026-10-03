package auth

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
)

// verificationCode is one row of verification_codes (migration 0003).
type verificationCode struct {
	ID         string
	UserID     string
	CodeHash   string
	ExpiresAt  time.Time
	Attempts   int
	ConsumedAt *time.Time
	CreatedAt  time.Time
}

// LatestCode returns the newest code of a purpose for a user, used or not, or
// nil when none was ever issued. The newest is the only one that can still be
// valid: ReplaceCode retires the others as it inserts.
func (r *Repository) LatestCode(ctx context.Context, userID, purpose string) (*verificationCode, error) {
	var c verificationCode
	err := r.pool.QueryRow(ctx, `
		SELECT id, user_id, code_hash, expires_at, attempts, consumed_at, created_at
		FROM verification_codes
		WHERE user_id = $1 AND purpose = $2
		ORDER BY created_at DESC
		LIMIT 1
	`, userID, purpose).Scan(&c.ID, &c.UserID, &c.CodeHash, &c.ExpiresAt, &c.Attempts, &c.ConsumedAt, &c.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &c, nil
}

// CountCodesSince counts the codes of a purpose issued to a user after since.
func (r *Repository) CountCodesSince(ctx context.Context, userID, purpose string, since time.Time) (int, error) {
	var n int
	err := r.pool.QueryRow(ctx, `
		SELECT count(*) FROM verification_codes
		WHERE user_id = $1 AND purpose = $2 AND created_at > $3
	`, userID, purpose, since).Scan(&n)
	return n, err
}

// ReplaceCode retires every live code of the same purpose and stores the new
// one, in one transaction, so a user never holds two working codes at once.
// Retired codes are marked consumed: consumed_at means "can no longer be used",
// whether by success or by replacement.
func (r *Repository) ReplaceCode(ctx context.Context, c *verificationCode, channel, purpose string) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx, `
		UPDATE verification_codes SET consumed_at = now()
		WHERE user_id = $1 AND purpose = $2 AND consumed_at IS NULL
	`, c.UserID, purpose); err != nil {
		return err
	}

	if err := tx.QueryRow(ctx, `
		INSERT INTO verification_codes (id, user_id, channel, purpose, code_hash, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING created_at
	`, c.ID, c.UserID, channel, purpose, c.CodeHash, c.ExpiresAt).Scan(&c.CreatedAt); err != nil {
		return err
	}

	return tx.Commit(ctx)
}

// SpendAttempt charges one guess against a live code before it is compared,
// so parallel guesses cannot all slip in under the cap. It reports false when
// the code is already used up, consumed or out of guesses.
func (r *Repository) SpendAttempt(ctx context.Context, codeID string, maxAttempts int) (bool, error) {
	tag, err := r.pool.Exec(ctx, `
		UPDATE verification_codes SET attempts = attempts + 1
		WHERE id = $1 AND consumed_at IS NULL AND attempts < $2
	`, codeID, maxAttempts)
	if err != nil {
		return false, err
	}
	return tag.RowsAffected() == 1, nil
}

// ConsumeCodeAndVerifyEmail spends the code and marks the email verified
// together. It reports false when another request consumed the code first.
func (r *Repository) ConsumeCodeAndVerifyEmail(ctx context.Context, codeID, userID string) (bool, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return false, err
	}
	defer tx.Rollback(ctx)

	tag, err := tx.Exec(ctx, `
		UPDATE verification_codes SET consumed_at = now()
		WHERE id = $1 AND consumed_at IS NULL
	`, codeID)
	if err != nil {
		return false, err
	}
	if tag.RowsAffected() == 0 {
		return false, nil
	}

	if _, err := tx.Exec(ctx, `
		UPDATE users SET email_verified_at = COALESCE(email_verified_at, now()), updated_at = now()
		WHERE id = $1
	`, userID); err != nil {
		return false, err
	}

	return true, tx.Commit(ctx)
}

// FindCodeByHash looks a code up by its hash, for tokens that arrive without
// the user they belong to. It returns nil when there is no such code.
func (r *Repository) FindCodeByHash(ctx context.Context, codeHash, purpose string) (*verificationCode, error) {
	var c verificationCode
	err := r.pool.QueryRow(ctx, `
		SELECT id, user_id, code_hash, expires_at, attempts, consumed_at, created_at
		FROM verification_codes
		WHERE code_hash = $1 AND purpose = $2
	`, codeHash, purpose).Scan(&c.ID, &c.UserID, &c.CodeHash, &c.ExpiresAt, &c.Attempts, &c.ConsumedAt, &c.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &c, nil
}

// ConsumeCodeAndSetPassword spends a reset token and stores the new password
// hash together. It reports false when another request consumed it first.
func (r *Repository) ConsumeCodeAndSetPassword(ctx context.Context, codeID, userID, passwordHash string) (bool, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return false, err
	}
	defer tx.Rollback(ctx)

	tag, err := tx.Exec(ctx, `
		UPDATE verification_codes SET consumed_at = now()
		WHERE id = $1 AND consumed_at IS NULL AND expires_at > now()
	`, codeID)
	if err != nil {
		return false, err
	}
	if tag.RowsAffected() == 0 {
		return false, nil
	}

	if _, err := tx.Exec(ctx, `
		UPDATE users
		SET password_hash = $2, email_verified_at = COALESCE(email_verified_at, now()), updated_at = now()
		WHERE id = $1
	`, userID, passwordHash); err != nil {
		return false, err
	}

	if _, err := tx.Exec(ctx, `
		UPDATE sessions SET revoked_at = now(), updated_at = now()
		WHERE user_id = $1 AND revoked_at IS NULL
	`, userID); err != nil {
		return false, err
	}

	return true, tx.Commit(ctx)
}
