package server

import (
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/labstack/echo/v4"

	"void2empire/internal/httpx"
	"void2empire/internal/money"
	"void2empire/internal/rbac"
	"void2empire/internal/statemachine"
)

func TestErrorHandlerMapsDomainSentinels(t *testing.T) {
	cases := []struct {
		name       string
		err        error
		wantStatus int
		wantCode   string
	}{
		{"invalid transition", statemachine.ErrInvalidTransition, http.StatusConflict, "INVALID_STATE_TRANSITION"},
		{"invalid amount", money.ErrInvalidAmount, http.StatusBadRequest, "VALIDATION_FAILED"},
		{"permission denied", rbac.ErrPermissionDenied, http.StatusForbidden, "PERMISSION_DENIED"},
		{"wrapped transition", wrapped{statemachine.ErrInvalidTransition}, http.StatusConflict, "INVALID_STATE_TRANSITION"},
		{"unmapped", errors.New("boom"), http.StatusInternalServerError, "INTERNAL_ERROR"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			e := echo.New()
			e.HTTPErrorHandler = newErrorHandler()
			e.GET("/x", func(c echo.Context) error { return tc.err })

			rec := httptest.NewRecorder()
			e.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/x", nil))

			if rec.Code != tc.wantStatus {
				t.Fatalf("status = %d, want %d", rec.Code, tc.wantStatus)
			}
			var body httpx.ErrorBody
			if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
				t.Fatalf("decode body: %v (raw=%q)", err, rec.Body.String())
			}
			if body.Code != tc.wantCode {
				t.Fatalf("code = %q, want %q", body.Code, tc.wantCode)
			}
			if body.Error == "" {
				t.Fatal("expected a non-empty message")
			}
		})
	}
}

func TestErrorHandlerPassesThroughEchoHTTPError(t *testing.T) {
	e := echo.New()
	e.HTTPErrorHandler = newErrorHandler()
	e.GET("/missing", func(c echo.Context) error {
		return echo.NewHTTPError(http.StatusNotFound, "no such thing")
	})

	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/missing", nil))

	if rec.Code != http.StatusNotFound {
		t.Fatalf("status = %d, want 404", rec.Code)
	}
	var body httpx.ErrorBody
	if err := json.Unmarshal(rec.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode body: %v", err)
	}
	if body.Code != "NOT_FOUND" {
		t.Fatalf("code = %q, want NOT_FOUND", body.Code)
	}
	if body.Error != "no such thing" {
		t.Fatalf("message = %q, want %q", body.Error, "no such thing")
	}
}

func TestErrorHandlerDoesNotLeakInternalMessage(t *testing.T) {
	e := echo.New()
	e.HTTPErrorHandler = newErrorHandler()
	e.GET("/secret", func(c echo.Context) error { return errors.New("db password is hunter2") })

	rec := httptest.NewRecorder()
	e.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/secret", nil))

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("status = %d, want 500", rec.Code)
	}
	var body httpx.ErrorBody
	_ = json.Unmarshal(rec.Body.Bytes(), &body)
	if body.Error != "internal error" {
		t.Fatalf("message = %q, want generic %q", body.Error, "internal error")
	}
}

// wrapped lets us assert errors.Is/As unwrapping through a custom error type.
type wrapped struct{ err error }

func (w wrapped) Error() string { return "wrapped: " + w.err.Error() }
func (w wrapped) Unwrap() error { return w.err }
