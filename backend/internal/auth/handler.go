package auth

import (
	"errors"
	"log"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"

	"void2empire/internal/httpx"
	"void2empire/internal/models"
)

type CookieOptions struct {
	Name   string
	Domain string
	Secure bool
}

type Handler struct {
	service *Service
	cookie  CookieOptions
}

func NewHandler(service *Service, cookie CookieOptions) *Handler {
	return &Handler{service: service, cookie: cookie}
}

func (h *Handler) Register(c echo.Context) error {
	var req RegisterRequest
	if err := c.Bind(&req); err != nil {
		return httpx.Error(c, http.StatusBadRequest, "invalid request body")
	}
	if err := c.Validate(&req); err != nil {
		return httpx.Error(c, http.StatusBadRequest, err.Error())
	}

	user, token, expiresAt, err := h.service.Register(c.Request().Context(), req)
	if err != nil {
		switch {
		case errors.Is(err, ErrEmailTaken):
			return httpx.Error(c, http.StatusConflict, err.Error())
		case errors.Is(err, ErrWeakPassword):
			return httpx.Error(c, http.StatusBadRequest, err.Error())
		default:
			return httpx.Error(c, http.StatusInternalServerError, "could not create account")
		}
	}

	h.setAuthCookie(c, token, expiresAt)
	return c.JSON(http.StatusCreated, toUserResponse(user))
}

func (h *Handler) Login(c echo.Context) error {
	var req LoginRequest
	if err := c.Bind(&req); err != nil {
		return httpx.Error(c, http.StatusBadRequest, "invalid request body")
	}
	if err := c.Validate(&req); err != nil {
		return httpx.Error(c, http.StatusBadRequest, err.Error())
	}

	user, token, expiresAt, err := h.service.Login(c.Request().Context(), req)
	if err != nil {
		if errors.Is(err, ErrInvalidCredentials) {
			return httpx.Error(c, http.StatusUnauthorized, err.Error())
		}
		return httpx.Error(c, http.StatusInternalServerError, "could not log in")
	}

	h.setAuthCookie(c, token, expiresAt)
	return c.JSON(http.StatusOK, toUserResponse(user))
}

// VerifyEmail checks a 6-digit code. It returns the updated user but issues no
// session: the code proves control of the inbox, not knowledge of the password.
func (h *Handler) VerifyEmail(c echo.Context) error {
	var req VerifyEmailRequest
	if err := c.Bind(&req); err != nil {
		return httpx.Error(c, http.StatusBadRequest, "invalid request body")
	}
	if err := c.Validate(&req); err != nil {
		return httpx.Error(c, http.StatusBadRequest, "enter the 6-digit code")
	}

	user, err := h.service.VerifyEmail(c.Request().Context(), req.Email, req.Code)
	if err != nil {
		if errors.Is(err, ErrInvalidCode) {
			return httpx.ErrorWithCode(c, http.StatusBadRequest, "INVALID_CODE", err.Error())
		}
		return httpx.Error(c, http.StatusInternalServerError, "could not verify email")
	}

	return c.JSON(http.StatusOK, toUserResponse(user))
}

// ResendVerificationCode answers 204 whether or not the email has an account,
// so it cannot be used to find out who is registered.
func (h *Handler) ResendVerificationCode(c echo.Context) error {
	var req ResendCodeRequest
	if err := c.Bind(&req); err != nil {
		return httpx.Error(c, http.StatusBadRequest, "invalid request body")
	}
	if err := c.Validate(&req); err != nil {
		return httpx.Error(c, http.StatusBadRequest, err.Error())
	}

	if err := h.service.ResendEmailCode(c.Request().Context(), req.Email); err != nil {
		if errors.Is(err, ErrResendTooSoon) {
			return httpx.ErrorWithCode(c, http.StatusTooManyRequests, "RATE_LIMITED", err.Error())
		}
		log.Printf("auth: resend verification code failed: %v", err)
		return httpx.Error(c, http.StatusInternalServerError, "could not send code")
	}

	return c.NoContent(http.StatusNoContent)
}

func (h *Handler) Logout(c echo.Context) error {
	c.SetCookie(&http.Cookie{
		Name:     h.cookie.Name,
		Value:    "",
		Path:     "/",
		Domain:   h.cookie.Domain,
		Expires:  time.Unix(0, 0),
		MaxAge:   -1,
		HttpOnly: true,
		Secure:   h.cookie.Secure,
		SameSite: http.SameSiteLaxMode,
	})
	return c.NoContent(http.StatusNoContent)
}

func (h *Handler) Me(c echo.Context) error {
	userID, ok := c.Get(ContextUserIDKey).(string)
	if !ok || userID == "" {
		return httpx.Error(c, http.StatusUnauthorized, "not authenticated")
	}

	user, err := h.service.CurrentUser(c.Request().Context(), userID)
	if err != nil {
		if errors.Is(err, ErrUserNotFound) {
			return httpx.Error(c, http.StatusUnauthorized, "not authenticated")
		}
		return httpx.Error(c, http.StatusInternalServerError, "could not load user")
	}

	return c.JSON(http.StatusOK, toUserResponse(user))
}

func (h *Handler) setAuthCookie(c echo.Context, token string, expiresAt time.Time) {
	c.SetCookie(&http.Cookie{
		Name:     h.cookie.Name,
		Value:    token,
		Path:     "/",
		Domain:   h.cookie.Domain,
		Expires:  expiresAt,
		HttpOnly: true,
		Secure:   h.cookie.Secure,
		SameSite: http.SameSiteLaxMode,
	})
}

func toUserResponse(u *models.User) UserResponse {
	return UserResponse{
		ID:            u.ID,
		FullName:      u.FullName,
		Email:         u.Email,
		Country:       u.Country,
		Phone:         u.Phone,
		KYCVerified:   u.KYCVerified,
		EmailVerified: u.EmailVerifiedAt != nil,
		CreatedAt:     u.CreatedAt.Format(time.RFC3339),
	}
}
