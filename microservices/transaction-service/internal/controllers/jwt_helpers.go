package controllers

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
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

// JWTMiddleware validates JWT and sets user_id in context
func JWTMiddleware(secret string) fiber.Handler {
	return func(c fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(APIResponse{
				Success: false,
				Message: "Token tidak ditemukan",
			})
		}

		if len(authHeader) < 8 || authHeader[:7] != "Bearer " {
			return c.Status(fiber.StatusUnauthorized).JSON(APIResponse{
				Success: false,
				Message: "Format token tidak valid. Gunakan: Bearer <token>",
			})
		}

		tokenString := authHeader[7:]
		parser := NewJWTParser(secret)
		claims, err := parser.Parse(tokenString)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(APIResponse{
				Success: false,
				Message: "Token tidak valid atau sudah expired",
			})
		}

		userIDStr, ok := (*claims)["user_id"].(string)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(APIResponse{
				Success: false,
				Message: "Token tidak mengandung user_id",
			})
		}

		userID, err := uuid.Parse(userIDStr)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(APIResponse{
				Success: false,
				Message: "user_id tidak valid",
			})
		}

		role, _ := (*claims)["role"].(string)
		email, _ := (*claims)["email"].(string)

		c.Locals("user_id", userID)
		c.Locals("user_role", role)
		c.Locals("email", email)

		return c.Next()
	}
}

// AdminMiddleware checks if the user has admin role
func AdminMiddleware() fiber.Handler {
	return func(c fiber.Ctx) error {
		role, _ := c.Locals("user_role").(string)
		if role != "admin" {
			return c.Status(fiber.StatusForbidden).JSON(APIResponse{
				Success: false,
				Message: "Akses ditolak. Hanya admin yang diizinkan.",
			})
		}
		return c.Next()
	}
}

// GetUserID extracts UUID from context
func GetUserID(c fiber.Ctx) (uuid.UUID, bool) {
	raw := c.Locals("user_id")
	if raw == nil {
		return uuid.Nil, false
	}
	userID, ok := raw.(uuid.UUID)
	return userID, ok
}

// GetUserRole extracts role from context
func GetUserRole(c fiber.Ctx) string {
	role, _ := c.Locals("user_role").(string)
	return role
}
