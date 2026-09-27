package httpx

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type ErrorBody struct {
	Error string `json:"error"`
	Code  string `json:"code,omitempty"`
}

func Error(c echo.Context, status int, message string) error {
	return c.JSON(status, ErrorBody{Error: message})
}

// ErrorWithCode writes the flat error body plus a machine-readable code from the
// Sec 32 error model, so clients can localize by code (DR-033).
func ErrorWithCode(c echo.Context, status int, code, message string) error {
	return c.JSON(status, ErrorBody{Error: message, Code: code})
}

// CodeForStatus maps an HTTP status to the unambiguous error code defined in
// Sec 32. Ambiguous statuses (409/422/503 map to several codes) return "" and are
// omitted; callers holding a specific domain error should use ErrorWithCode with
// the exact code instead of relying on this.
func CodeForStatus(status int) string {
	switch status {
	case http.StatusBadRequest:
		return "VALIDATION_FAILED"
	case http.StatusUnauthorized:
		return "AUTH_REQUIRED"
	case http.StatusForbidden:
		return "FORBIDDEN"
	case http.StatusNotFound:
		return "NOT_FOUND"
	case http.StatusTooManyRequests:
		return "RATE_LIMITED"
	case http.StatusInternalServerError:
		return "INTERNAL_ERROR"
	case http.StatusBadGateway:
		return "PROVIDER_ERROR"
	case http.StatusGatewayTimeout:
		return "PROVIDER_TIMEOUT"
	default:
		return ""
	}
}
