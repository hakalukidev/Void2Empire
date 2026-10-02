package auth

import (
	"regexp"
	"testing"
)

func TestNewCodeIsSixDigits(t *testing.T) {
	sixDigits := regexp.MustCompile(`^\d{6}$`)
	for range 200 {
		code, err := newCode()
		if err != nil {
			t.Fatal(err)
		}
		if !sixDigits.MatchString(code) {
			t.Fatalf("code %q is not 6 digits", code)
		}
	}
}

func TestCodeHashIsKeyed(t *testing.T) {
	a := &Service{codeKey: []byte("key-a")}
	b := &Service{codeKey: []byte("key-b")}

	if a.codeHash("123456") != a.codeHash("123456") {
		t.Error("hash is not deterministic")
	}
	if a.codeHash("123456") == a.codeHash("123457") {
		t.Error("different codes share a hash")
	}
	if a.codeHash("123456") == b.codeHash("123456") {
		t.Error("hash does not depend on the key")
	}
}
