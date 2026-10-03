package auth

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	"void2empire/internal/models"
	"void2empire/internal/rbac"
)

var (
	ErrEmailTaken   = errors.New("email already registered")
	ErrUserNotFound = errors.New("user not found")
)

// userColumns is the column list scanUser reads, in its order.
const userColumns = `id, full_name, email, password_hash, country, phone, kyc_verified, avatar_url, email_verified_at, created_at, updated_at`

type Repository struct {
	pool *pgxpool.Pool
}

func NewRepository(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) CreateUser(ctx context.Context, u *models.User) error {
	err := r.pool.QueryRow(ctx, `
		INSERT INTO users (id, full_name, email, password_hash, country, phone)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING created_at, updated_at
	`, u.ID, u.FullName, u.Email, u.PasswordHash, u.Country, u.Phone,
	).Scan(&u.CreatedAt, &u.UpdatedAt)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return ErrEmailTaken
		}
		return err
	}
	return nil
}

func (r *Repository) FindByEmail(ctx context.Context, email string) (*models.User, error) {
	return r.scanUser(r.pool.QueryRow(ctx, `
		SELECT `+userColumns+`
		FROM users WHERE email = $1
	`, email))
}

func (r *Repository) FindByID(ctx context.Context, id string) (*models.User, error) {
	return r.scanUser(r.pool.QueryRow(ctx, `
		SELECT `+userColumns+`
		FROM users WHERE id = $1
	`, id))
}

// RoleForUser resolves a caller's platform role from admin_users, the table
// internal/server named as the source. A user with no admin_users row is an
// ordinary user; what any role may then do is internal/rbac's matrix, not this
// function's decision.
//
// The hierarchy itself stays open (DR-026): this reads the schema as written and
// invents no role, no inheritance and no assignment rule. Migration 0002 seeds
// the 7 documented role names but no admin_users rows, so until an operator
// inserts one every caller resolves to RoleUser and every admin capability is
// denied.
//
// An unrecognised role name is passed through as-is: it is absent from the
// matrix, so rbac.AccessFor treats it as AccessNone and denies by construction.
func (r *Repository) RoleForUser(ctx context.Context, userID string) (rbac.Role, error) {
	var name string
	err := r.pool.QueryRow(ctx, `
		SELECT r.name
		FROM admin_users au
		JOIN roles r ON r.id = au.role_id
		WHERE au.user_id = $1
	`, userID).Scan(&name)
	if errors.Is(err, pgx.ErrNoRows) {
		return rbac.RoleUser, nil
	}
	if err != nil {
		return rbac.RoleUser, err
	}
	return rbac.Role(name), nil
}

func (r *Repository) scanUser(row pgx.Row) (*models.User, error) {
	var u models.User
	err := row.Scan(
		&u.ID, &u.FullName, &u.Email, &u.PasswordHash,
		&u.Country, &u.Phone, &u.KYCVerified, &u.AvatarURL, &u.EmailVerifiedAt, &u.CreatedAt, &u.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}
