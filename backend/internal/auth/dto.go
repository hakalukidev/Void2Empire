package auth

type RegisterRequest struct {
	FullName string `json:"fullName" validate:"required,min=2"`
	Email    string `json:"email" validate:"required,email"`
	Country  string `json:"country" validate:"required,min=2"`
	Phone    string `json:"phone" validate:"required,min=6"`
	Password string `json:"password" validate:"required,min=8"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type UserResponse struct {
	ID          string `json:"id"`
	FullName    string `json:"fullName"`
	Email       string `json:"email"`
	Country     string `json:"country"`
	Phone       string `json:"phone"`
	KYCVerified bool   `json:"kycVerified"`
	CreatedAt   string `json:"createdAt"`
}
