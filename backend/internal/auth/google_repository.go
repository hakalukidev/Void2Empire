package auth

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5/pgconn"

	"void2empire/internal/models"
)

func (r *Repository) FindByGoogleSub(ctx context.Context, sub string) (*models.User, error) {
	return r.scanUser(r.pool.QueryRow(ctx, `SELECT `+userColumns+` FROM users WHERE google_sub = $1`, sub))
}

// FindByEmailFold matches email case-insensitively. Google reports addresses
// lowercased while a password signup keeps whatever case was typed, and the two
// must still resolve to one account.
func (r *Repository) FindByEmailFold(ctx context.Context, email string) (*models.User, error) {
	return r.scanUser(r.pool.QueryRow(ctx, `
		SELECT `+userColumns+` FROM users WHERE lower(email) = lower($1)
		ORDER BY created_at LIMIT 1
	`, email))
}

// LinkGoogle attaches a Google account to an existing user. It reports false
// when the user is already linked to a different Google account, which the
// caller must refuse rather than overwrite. Google has verified the address,
// so the email counts as verified too.
func (r *Repository) LinkGoogle(ctx context.Context, userID, sub string) (bool, error) {
	tag, err := r.pool.Exec(ctx, `
		UPDATE users
		SET google_sub = $2, email_verified_at = COALESCE(email_verified_at, now()), updated_at = now()
		WHERE id = $1 AND (google_sub IS NULL OR google_sub = $2)
	`, userID, sub)
	if err != nil {
		return false, err
	}
	return tag.RowsAffected() == 1, nil
}

// CreateGoogleUser inserts an account that signs in only through Google: no
// password (an empty hash bcrypt never matches) and no country or phone yet,
// since Google supplies neither.
func (r *Repository) CreateGoogleUser(ctx context.Context, u *models.User, sub string) error {
	err := r.pool.QueryRow(ctx, `
		INSERT INTO users (id, full_name, email, password_hash, country, phone, google_sub, email_verified_at)
		VALUES ($1, $2, $3, '', '', '', $4, now())
		RETURNING email_verified_at, created_at, updated_at
	`, u.ID, u.FullName, u.Email, sub).Scan(&u.EmailVerifiedAt, &u.CreatedAt, &u.UpdatedAt)

	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" {
		return ErrEmailTaken
	}
	return err
}
