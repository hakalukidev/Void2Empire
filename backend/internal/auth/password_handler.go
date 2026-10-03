package auth

import (
	"errors"
	"log"
	"net/http"

	"github.com/labstack/echo/v4"

	"void2empire/internal/httpx"
)

// ForgotPassword answers 204 whether or not the email has an account, so it
// cannot be used to find out who is registered.
func (h *Handler) ForgotPassword(c echo.Context) error {
	var req ForgotPasswordRequest
	if err := c.Bind(&req); err != nil {
		return httpx.Error(c, http.StatusBadRequest, "invalid request body")
	}
	if err := c.Validate(&req); err != nil {
		return httpx.Error(c, http.StatusBadRequest, "enter a valid email")
	}

	if err := h.service.RequestPasswordReset(c.Request().Context(), req.Email); err != nil {
		log.Printf("auth: password reset request failed: %v", err)
		return httpx.Error(c, http.StatusInternalServerError, "could not send reset email")
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *Handler) ResetPassword(c echo.Context) error {
	var req ResetPasswordRequest
	if err := c.Bind(&req); err != nil {
		return httpx.Error(c, http.StatusBadRequest, "invalid request body")
	}
	if err := c.Validate(&req); err != nil {
		return httpx.Error(c, http.StatusBadRequest, "password must be at least 8 characters")
	}

	if err := h.service.ResetPassword(c.Request().Context(), req.Token, req.Password); err != nil {
		switch {
		case errors.Is(err, ErrInvalidResetToken), errors.Is(err, ErrWeakPassword):
			return httpx.Error(c, http.StatusBadRequest, err.Error())
		default:
			log.Printf("auth: password reset failed: %v", err)
			return httpx.Error(c, http.StatusInternalServerError, "could not reset password")
		}
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *Handler) ChangePassword(c echo.Context) error {
	userID, _ := c.Get(ContextUserIDKey).(string)
	sessionID, _ := c.Get(ContextSessionIDKey).(string)

	var req ChangePasswordRequest
	if err := c.Bind(&req); err != nil {
		return httpx.Error(c, http.StatusBadRequest, "invalid request body")
	}
	if err := c.Validate(&req); err != nil {
		return httpx.Error(c, http.StatusBadRequest, "new password must be at least 8 characters")
	}

	if err := h.service.ChangePassword(c.Request().Context(), userID, sessionID, req.CurrentPassword, req.NewPassword); err != nil {
		switch {
		// 400, not 401: the session is fine, and a 401 would sign the person out.
		case errors.Is(err, ErrWrongPassword), errors.Is(err, ErrWeakPassword), errors.Is(err, ErrNoPassword):
			return httpx.Error(c, http.StatusBadRequest, err.Error())
		case errors.Is(err, ErrUserNotFound):
			return httpx.Error(c, http.StatusUnauthorized, "not authenticated")
		default:
			log.Printf("auth: password change failed: %v", err)
			return httpx.Error(c, http.StatusInternalServerError, "could not change password")
		}
	}
	return c.NoContent(http.StatusNoContent)
}

func (h *Handler) UpdateProfile(c echo.Context) error {
	userID, _ := c.Get(ContextUserIDKey).(string)

	var req UpdateProfileRequest
	if err := c.Bind(&req); err != nil {
		return httpx.Error(c, http.StatusBadRequest, "invalid request body")
	}
	if err := c.Validate(&req); err != nil {
		return httpx.Error(c, http.StatusBadRequest, "name must be 2 to 100 characters")
	}

	user, err := h.service.UpdateProfile(c.Request().Context(), userID, req)
	if err != nil {
		switch {
		case errors.Is(err, ErrInvalidName):
			return httpx.Error(c, http.StatusBadRequest, err.Error())
		case errors.Is(err, ErrUserNotFound):
			return httpx.Error(c, http.StatusUnauthorized, "not authenticated")
		default:
			log.Printf("auth: profile update failed: %v", err)
			return httpx.Error(c, http.StatusInternalServerError, "could not update profile")
		}
	}
	return c.JSON(http.StatusOK, toUserResponse(user))
}
