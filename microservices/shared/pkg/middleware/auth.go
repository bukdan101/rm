package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

// JWTMiddleware validates JWT tokens and sets user context
func JWTMiddleware(secret string) fiber.Handler {
	return func(c fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Token tidak ditemukan",
			})
		}

		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Format token tidak valid. Gunakan: Bearer <token>",
			})
		}

		tokenString := parts[1]
		claims, err := ValidateToken(tokenString, secret)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Token tidak valid atau sudah expired",
			})
		}

		userIDStr, ok := (*claims)["user_id"].(string)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Token tidak mengandung user_id",
			})
		}

		userID, err := uuid.Parse(userIDStr)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "user_id tidak valid",
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

// RequireRole checks if user has required role
func RequireRole(roles ...string) fiber.Handler {
	return func(c fiber.Ctx) error {
		userRole := GetUserRole(c)
		if userRole == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Token tidak valid",
			})
		}

		for _, role := range roles {
			if userRole == role {
				return c.Next()
			}
		}

		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Akses ditolak. Role tidak diizinkan.",
		})
	}
}

// RequireAdmin checks if user is admin
func RequireAdmin() fiber.Handler {
	return RequireRole("admin")
}

// GetUserID extracts user ID from context
func GetUserID(c fiber.Ctx) (uuid.UUID, bool) {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	return userID, ok
}

// GetUserRole extracts role from context
func GetUserRole(c fiber.Ctx) string {
	role, _ := c.Locals("user_role").(string)
	return role
}

// ValidateToken parses and validates a JWT token
func ValidateToken(tokenString, secret string) (*jwt.MapClaims, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
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
