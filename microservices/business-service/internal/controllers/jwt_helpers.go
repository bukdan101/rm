package controllers

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// JWTParser parses and validates JWT tokens
type JWTParser struct {
	secret []byte
}

func NewJWTParser(secret string) *JWTParser {
	return &JWTParser{secret: []byte(secret)}
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

// ParseJWT is a convenience wrapper used by the main JWT middleware
func ParseJWT(tokenString, secret string) (*map[string]interface{}, error) {
	return NewJWTParser(secret).Parse(tokenString)
}

// GetUserID extracts user_id UUID from Fiber context
func GetUserID(c interface{ Locals(key interface{}) interface{} }) (string, bool) {
	v := c.Locals("user_id")
	if v == nil {
		return "", false
	}
	s, ok := v.(fmt.Stringer)
	if ok {
		return s.String(), true
	}
	return "", false
}

// GetUserRole extracts user role from Fiber context
func GetUserRole(c interface{ Locals(key interface{}) interface{} }) string {
	v := c.Locals("user_role")
	if v == nil {
		return ""
	}
	r, ok := v.(string)
	if ok {
		return r
	}
	return ""
}
