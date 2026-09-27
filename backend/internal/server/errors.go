package server

import (
	"errors"
	"log"
	"net/http"

	"github.com/labstack/echo/v4"

	"void2empire/internal/httpx"
	"void2empire/internal/money"
	"void2empire/internal/rbac"
	"void2empire/internal/statemachine"
)

// newErrorHandler centralizes mapping of returned errors onto the Sec 32 error
// model. Handlers that already convert their own errors via httpx are unaffected
// (they return nil to Echo). This is the safety net and the standard mapping
// point for handlers that simply `return err`.
//
// It never leaks internals: unmapped errors are logged server-side and surfaced
// as a generic 500 INTERNAL_ERROR.
func newErrorHandler() echo.HTTPErrorHandler {
	return func(err error, c echo.Context) {
		if err == nil || c.Response().Committed {
			return
		}

		var he *echo.HTTPError
		switch {
		case errors.As(err, &he):
			// Echo's own errors (404, 405, bind failures, ...): pass the status
			// through, attaching a code only where Sec 32 defines one unambiguously.
			msg, _ := he.Message.(string)
			if msg == "" {
				msg = http.StatusText(he.Code)
			}
			logIfServerFault(he.Code, err)
			_ = httpx.ErrorWithCode(c, he.Code, httpx.CodeForStatus(he.Code), msg)

		case errors.Is(err, statemachine.ErrInvalidTransition):
			_ = httpx.ErrorWithCode(c, http.StatusConflict, "INVALID_STATE_TRANSITION", "invalid state transition")

		case errors.Is(err, money.ErrInvalidAmount):
			_ = httpx.ErrorWithCode(c, http.StatusBadRequest, "VALIDATION_FAILED", "invalid amount")

		case errors.Is(err, rbac.ErrPermissionDenied):
			_ = httpx.ErrorWithCode(c, http.StatusForbidden, "PERMISSION_DENIED", "permission denied")

		default:
			log.Printf("unhandled error: %v", err)
			_ = httpx.ErrorWithCode(c, http.StatusInternalServerError, "INTERNAL_ERROR", "internal error")
		}
	}
}

func logIfServerFault(status int, err error) {
	if status >= http.StatusInternalServerError {
		log.Printf("server error (status=%d): %v", status, err)
	}
}
