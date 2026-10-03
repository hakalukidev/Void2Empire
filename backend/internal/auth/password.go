package auth

import "golang.org/x/crypto/bcrypt"

func HashPassword(plain string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(plain), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

func VerifyPassword(hash, plain string) bool {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(plain)) == nil
}

// dummyPasswordHash is compared against when there is no real hash to check,
// so a login for an unknown email costs the same bcrypt time as a real one.
var dummyPasswordHash = func() string {
	hash, err := bcrypt.GenerateFromPassword([]byte("void2empire-timing-equalizer"), bcrypt.DefaultCost)
	if err != nil {
		panic(err)
	}
	return string(hash)
}()
