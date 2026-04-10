package middleware

import (
	"strings"

	"automarket/internal/services"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
)

func JWTMiddleware(secret string) fiber.Handler {
	jwtService := services.NewJWTService(secret)

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
		claims, err := jwtService.ValidateToken(tokenString)
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

		c.Locals("user_id", userID)
		c.Locals("user_role", role)
		c.Locals("email", (*claims)["email"])

		return c.Next()
	}
}

func GetUserID(c fiber.Ctx) (uuid.UUID, bool) {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	return userID, ok
}

func GetUserRole(c fiber.Ctx) string {
	role, _ := c.Locals("user_role").(string)
	return role
}
