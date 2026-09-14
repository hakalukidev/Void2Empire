package server

import "github.com/go-playground/validator/v10"

type RequestValidator struct {
	validate *validator.Validate
}

func NewRequestValidator() *RequestValidator {
	return &RequestValidator{validate: validator.New()}
}

func (v *RequestValidator) Validate(i interface{}) error {
	return v.validate.Struct(i)
}
