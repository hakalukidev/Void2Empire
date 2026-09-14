package httpx

import "github.com/labstack/echo/v4"

type ErrorBody struct {
	Error string `json:"error"`
}

func Error(c echo.Context, status int, message string) error {
	return c.JSON(status, ErrorBody{Error: message})
}
