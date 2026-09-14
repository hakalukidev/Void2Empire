package models

import "time"

type User struct {
	ID           string    `json:"id"`
	FullName     string    `json:"fullName"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Country      string    `json:"country"`
	Phone        string    `json:"phone"`
	KYCVerified  bool      `json:"kycVerified"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}
