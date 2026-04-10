package main

import (
	"log"
	"time"

	"automarket/internal/config"
	"automarket/internal/database"
	"automarket/internal/routes"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/limiter"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/gofiber/fiber/v3/middleware/recover"
)

func main() {
	// Load configuration
	cfg := config.LoadConfig()

	// Connect to PostgreSQL
	db := database.ConnectPostgres(cfg)

	// Connect to Redis (non-blocking)
	_ = database.ConnectRedis(cfg)

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      "AutoMarket API v1.0",
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
		ErrorHandler: func(c fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"success": false,
				"message": err.Error(),
			})
		},
	})

	// Global middleware
	app.Use(logger.New(logger.Config{
		Format:     "${time} | ${status} | ${latency} | ${ip} | ${method} ${path}\n",
		TimeFormat: "2006-01-02 15:04:05",
	}))
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:3000",
			"http://localhost:8080",
		},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowHeaders: []string{
			"Origin", "Content-Type", "Accept", "Authorization",
			"X-Requested-With", "X-HTTP-Method-Override",
		},
		AllowCredentials: true,
		MaxAge:           86400,
	}))
	app.Use(limiter.New(limiter.Config{
		Max:        100,
		Expiration: 1 * time.Minute,
		KeyGenerator: func(c fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"success": false,
				"message": "Terlalu banyak request. Coba lagi nanti.",
			})
		},
	}))

	// Setup all routes
	routes.SetupRoutes(app, db, cfg)

	// Start server
	log.Printf("╔══════════════════════════════════════════════╗")
	log.Printf("║  🚀 AutoMarket Indonesia API Server          ║")
	log.Printf("║  Version: 1.0.0                              ║")
	log.Printf("║  Framework: Golang Fiber v3                  ║")
	log.Printf("║  Database: PostgreSQL + GORM                 ║")
	log.Printf("║  Tables: 101 models migrated                 ║")
	log.Printf("║  Port: %s                                   ║", cfg.AppPort)
	log.Printf("║  Env: %s                                    ║", cfg.AppEnv)
	log.Printf("╚══════════════════════════════════════════════╝")

	if err := app.Listen(":" + cfg.AppPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
