package middleware

import (
	"github.com/gofiber/fiber/v3"
)

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
