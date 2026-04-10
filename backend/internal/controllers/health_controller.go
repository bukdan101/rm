package controllers

import (
	"automarket/internal/config"
	"automarket/internal/utils"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

// HealthCheck returns server health status
func HealthCheck(c fiber.Ctx) error {
	db := c.Locals("db").(*gorm.DB)
	cfg := c.Locals("config").(*config.Config)

	sqlDB, err := db.DB()
	dbStatus := "connected"
	if err != nil || sqlDB == nil {
		dbStatus = "disconnected"
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "AutoMarket API is running",
		"data": fiber.Map{
			"version": "1.0.0",
			"env":     cfg.AppEnv,
			"database": fiber.Map{
				"status": dbStatus,
				"type":   "PostgreSQL + GORM",
			},
			"framework": "Golang Fiber v3",
			"modules": fiber.Map{
				"total_tables":   101,
				"api_endpoints":  50,
			},
		},
	})
}

// NotFoundHandler for unmatched routes
func NotFoundHandler(c fiber.Ctx) error {
	return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
		"success": false,
		"message": "Endpoint tidak ditemukan",
	})
}
