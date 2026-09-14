package auth

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	"binarytrade/internal/models"
)

var (
	ErrEmailTaken   = errors.New("email already registered")
	ErrUserNotFound = errors.New("user not found")
)

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
		SELECT id, full_name, email, password_hash, country, phone, kyc_verified, created_at, updated_at
		FROM users WHERE email = $1
	`, email))
}

func (r *Repository) FindByID(ctx context.Context, id string) (*models.User, error) {
	return r.scanUser(r.pool.QueryRow(ctx, `
		SELECT id, full_name, email, password_hash, country, phone, kyc_verified, created_at, updated_at
		FROM users WHERE id = $1
	`, id))
}

func (r *Repository) scanUser(row pgx.Row) (*models.User, error) {
	var u models.User
	err := row.Scan(
		&u.ID, &u.FullName, &u.Email, &u.PasswordHash,
		&u.Country, &u.Phone, &u.KYCVerified, &u.CreatedAt, &u.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, ErrUserNotFound
	}
	if err != nil {
		return nil, err
	}
	return &u, nil
}
