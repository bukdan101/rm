package services

import (
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

type JWTService struct {
	secretKey     []byte
	expirationHrs int
}

type JWTClaims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	jwt.RegisteredClaims
}

func NewJWTService(secret string) *JWTService {
	return &JWTService{
		secretKey:     []byte(secret),
		expirationHrs: 24,
	}
}

func (s *JWTService) GenerateToken(userID uuid.UUID, email string, role string) (string, error) {
	claims := &JWTClaims{
		UserID: userID.String(),
		Email:  email,
		Role:   role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Duration(s.expirationHrs) * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "automarket",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.secretKey)
}

func (s *JWTService) ValidateToken(tokenString string) (*jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return s.secretKey, nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, err
	}

	return &claims, nil
}

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
