package controllers

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWTBuilder builds and signs JWT tokens
type JWTBuilder struct {
	secret []byte
	claims map[string]interface{}
}

func NewJWTBuilder(secret string, claims map[string]interface{}) *JWTBuilder {
	return &JWTBuilder{
		secret: []byte(secret),
		claims: claims,
	}
}

func (b *JWTBuilder) SignedString() (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims(b.claims))
	return token.SignedString(b.secret)
}

// JWTParser parses and validates JWT tokens
type JWTParser struct {
	secret []byte
}

func NewJWTParser(secret string) *JWTParser {
	return &JWTParser{
		secret: []byte(secret),
	}
}

func (p *JWTParser) Parse(tokenString string) (*map[string]interface{}, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return p.secret, nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("token tidak valid")
	}

	// Check expiration
	if exp, ok := claims["exp"].(float64); ok {
		if time.Now().Unix() > int64(exp) {
			return nil, fmt.Errorf("token sudah expired")
		}
	}

	result := make(map[string]interface{})
	for k, v := range claims {
		result[k] = v
	}
	return &result, nil
}
