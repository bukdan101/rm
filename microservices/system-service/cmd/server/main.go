package main

import (
	"log"
	"os"
	"strconv"

	"automarket-system-service/internal/controllers"
	"automarket-system-service/internal/handlers"
	"automarket-system-service/internal/models"
	"automarket-system-service/internal/routes"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/limiter"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/gofiber/fiber/v3/middleware/recover"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Load configuration from environment
	config := loadConfig()

	printBanner(config)

	log.Printf("🔧 Environment: %s", config.AppEnv)
	log.Printf("🔧 DB: %s:%s/%s [%s]", config.DBHost, config.DBPort, config.DBName, config.DBSchema)

	// Connect to PostgreSQL
	db := connectDB(config)

	// Auto-migrate all tables
	migrateTables(db)

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      "AutoMarket System Service",
		ServerHeader: "AutoMarket/1.0",
	})

	// Global Middleware
	app.Use(logger.New())
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
		AllowHeaders: "Origin,Content-Type,Accept,Authorization",
	}))
	app.Use(limiter.New(limiter.Config{
		Max:               100,
		Expiration:        60, // 1 minute window
		LimiterMiddleware: limiter.SlidingWindow{},
	}))

	// JWT Middleware (inline, standalone)
	jwtMiddleware := createJWTMiddleware(config.JWTSecret)
	adminMiddleware := createAdminMiddleware()

	// Initialize controllers
	chatCtrl := controllers.NewChatController(db)
	notifCtrl := controllers.NewNotificationController(db)
	analyticsCtrl := controllers.NewAnalyticsController(db)
	activityCtrl := controllers.NewActivityController(db)
	settingsCtrl := controllers.NewSettingsController(db)

	// Initialize WebSocket hub
	wsHub := handlers.NewWSHub(db)

	// Setup routes
	routes.SetupRoutes(
		app,
		chatCtrl,
		notifCtrl,
		analyticsCtrl,
		activityCtrl,
		settingsCtrl,
		jwtMiddleware,
		adminMiddleware,
		wsHub,
		config.JWTSecret,
	)

	// Start server
	log.Printf("🚀 AutoMarket System Service running on port %s", config.AppPort)
	if err := app.Listen(":" + config.AppPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// ============================================
// Configuration
// ============================================

// Config holds service configuration
type Config struct {
	AppPort  string
	AppEnv   string
	DBHost   string
	DBPort   string
	DBUser   string
	DBPass   string
	DBName   string
	DBSchema string
	JWTSecret string
}

func loadConfig() *Config {
	return &Config{
		AppPort:  getEnv("PORT", "8006"),
		AppEnv:   getEnv("ENV", "development"),
		DBHost:   getEnv("DB_HOST", "localhost"),
		DBPort:   getEnv("DB_PORT", "5432"),
		DBUser:   getEnv("DB_USER", "postgres"),
		DBPass:   getEnv("DB_PASSWORD", "postgres"),
		DBName:   getEnv("DB_NAME", "automarket"),
		DBSchema: getEnv("DB_SCHEMA", "system_schema"),
		JWTSecret: getEnv("JWT_SECRET", "your-super-secret-jwt-key-change-in-production"),
	}
}

// ============================================
// Database
// ============================================

func connectDB(config *Config) *gorm.DB {
	dsn := "host=" + config.DBHost +
		" port=" + config.DBPort +
		" user=" + config.DBUser +
		" password=" + config.DBPass +
		" dbname=" + config.DBName +
		" sslmode=disable" +
		" TimeZone=Asia/Jakarta" +
		" search_path=" + config.DBSchema + ",public"

	var db *gorm.DB
	var err error
	maxRetries := 10
	for i := 0; i < maxRetries; i++ {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err == nil {
			break
		}
		log.Printf("⚠️  DB connection attempt %d/%d failed: %v", i+1, maxRetries, err)
	}

	if err != nil {
		log.Fatalf("❌ Failed to connect to PostgreSQL after %d retries: %v", maxRetries, err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("❌ Failed to get DB instance: %v", err)
	}
	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)

	// Enable UUID extension
	db.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"")
	db.Exec("CREATE EXTENSION IF NOT EXISTS \"pgcrypto\"")

	log.Printf("✅ PostgreSQL connected [schema: %s]", config.DBSchema)
	return db
}

func migrateTables(db *gorm.DB) {
	log.Println("📦 Running auto-migration...")
	err := db.AutoMigrate(
		// Chat models (3)
		&models.Conversation{},
		&models.Message{},
		&models.MessageAttachment{},
		// Notification models (4)
		&models.Notification{},
		&models.UserNotification{},
		&models.NotificationTemplate{},
		&models.NotificationLog{},
		// Analytics models (5)
		&models.AnalyticsEvent{},
		&models.AnalyticsPageView{},
		&models.AnalyticsClick{},
		&models.AnalyticsConversion{},
		&models.SearchLog{},
		// Activity log model (1)
		&models.ActivityLog{},
		// System setting model (1)
		&models.SystemSetting{},
	)
	if err != nil {
		log.Fatalf("❌ Auto-migration failed: %v", err)
	}
	log.Println("✅ All 14 tables migrated successfully")
}

// ============================================
// JWT Middleware (inline, standalone)
// ============================================

func createJWTMiddleware(secret string) fiber.Handler {
	return func(c fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Token tidak ditemukan",
			})
		}

		// Bearer token extraction
		if len(authHeader) < 8 || authHeader[:7] != "Bearer " {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Format token tidak valid. Gunakan: Bearer <token>",
			})
		}

		tokenString := authHeader[7:]

		// Parse and validate JWT token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (any, error) {
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.NewError(fiber.StatusUnauthorized, "Metode signing token tidak didukung")
			}
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Token tidak valid atau sudah expired",
			})
		}

		// Extract claims
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Token claims tidak valid",
			})
		}

		// Extract user_id from claims
		userIDStr, ok := claims["user_id"].(string)
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

		role, _ := claims["role"].(string)
		email, _ := claims["email"].(string)

		c.Locals("user_id", userID)
		c.Locals("user_role", role)
		c.Locals("email", email)

		return c.Next()
	}
}

func createAdminMiddleware() fiber.Handler {
	return func(c fiber.Ctx) error {
		role, _ := c.Locals("user_role").(string)
		if role != "admin" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"success": false,
				"message": "Akses ditolak. Hanya admin yang diizinkan.",
			})
		}
		return c.Next()
	}
}

// ============================================
// Helpers
// ============================================

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// getEnvInt is kept for potential future use
var _ = strconv.Atoi

func printBanner(config *Config) {
	banner := `
╔══════════════════════════════════════════════════╗
║                                                  ║
║        🚗  AutoMarket System Service  🚗        ║
║                                                  ║
║   Chat • Notifications • Analytics • Settings    ║
║                                                  ║
║   Environment : %-30s ║
║   Port        : %-30s ║
║   Database    : %-30s ║
║                                                  ║
╚══════════════════════════════════════════════════╝
`
	log.Printf(banner, config.AppEnv, config.AppPort, config.DBName+"/"+config.DBSchema)
}
