package services

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// JWTService handles JWT token operations
type JWTService struct {
	secretKey     []byte
	expirationHrs int
}

// NewJWTService creates a new JWT service
func NewJWTService(secret string, expirationHrs ...int) *JWTService {
	hrs := 24
	if len(expirationHrs) > 0 && expirationHrs[0] > 0 {
		hrs = expirationHrs[0]
	}
	return &JWTService{
		secretKey:     []byte(secret),
		expirationHrs: hrs,
	}
}

// GenerateToken generates a new JWT token
func (s *JWTService) GenerateToken(userID uuid.UUID, email string, role string) (string, error) {
	claims := &jwt.MapClaims{
		"user_id": userID.String(),
		"email":   email,
		"role":    role,
		"exp":     time.Now().Add(time.Duration(s.expirationHrs) * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
		"iss":     "automarket",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.secretKey)
}

// ValidateToken validates a JWT token
func (s *JWTService) ValidateToken(tokenString string) (*jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return s.secretKey, nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return &claims, nil
}

// RefreshToken refreshes an existing JWT token
func (s *JWTService) RefreshToken(tokenString string) (string, error) {
	claims, err := s.ValidateToken(tokenString)
	if err != nil {
		return "", err
	}

	userIDStr, _ := (*claims)["user_id"].(string)
	email, _ := (*claims)["email"].(string)
	role, _ := (*claims)["role"].(string)

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return "", err
	}

	return s.GenerateToken(userID, email, role)
}
