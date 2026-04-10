package main

import (
	"log"
	"os"
	"strconv"

	"automarket-user-service/internal/controllers"
	"automarket-user-service/internal/models"
	"automarket-user-service/internal/routes"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/gofiber/fiber/v3/middleware/recover"
	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Load configuration from environment
	config := loadConfig()

	log.Printf("🔧 Environment: %s", config.AppEnv)
	log.Printf("🔧 DB: %s:%s/%s [%s]", config.DBHost, config.DBPort, config.DBName, config.DBSchema)

	// Connect to PostgreSQL
	db := connectDB(config)

	// Auto-migrate tables
	migrateTables(db)

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      "AutoMarket User Service",
		ServerHeader: "AutoMarket/1.0",
	})

	// Middleware
	app.Use(logger.New())
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
		AllowHeaders: "Origin,Content-Type,Accept,Authorization",
	}))

	// Health check
	app.Get("/health", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"success": true,
			"message": "User service is healthy",
			"service": "automarket-user-service",
			"port":    config.AppPort,
		})
	})

	// JWT Middleware
	jwtMiddleware := createJWTMiddleware(config.JWTSecret)
	adminMiddleware := createAdminMiddleware()

	// Controllers
	authCtrl := &controllers.AuthController{
		DB:          db,
		JWTSecret:   config.JWTSecret,
		JWTExpHrs:   config.JWTExpirationHrs,
		GoogleCID:   config.GoogleClientID,
		GoogleCSec:  config.GoogleClientSecret,
		GoogleRedir: config.GoogleRedirectURL,
	}

	userCtrl := &controllers.UserController{
		DB: db,
	}

	kycCtrl := &controllers.KycController{
		DB: db,
	}

	tokenCtrl := &controllers.TokenController{
		DB: db,
	}

	// Setup routes
	routes.SetupRoutes(app, authCtrl, userCtrl, kycCtrl, tokenCtrl, jwtMiddleware, adminMiddleware)

	// Start server
	log.Printf("🚀 AutoMarket User Service running on port %s", config.AppPort)
	if err := app.Listen(":" + config.AppPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// Config holds service configuration
type Config struct {
	AppPort            string
	AppEnv             string
	DBHost             string
	DBPort             string
	DBUser             string
	DBPassword         string
	DBName             string
	DBSchema           string
	JWTSecret          string
	JWTExpirationHrs   int
	GoogleClientID     string
	GoogleClientSecret string
	GoogleRedirectURL  string
}

func loadConfig() *Config {
	return &Config{
		AppPort:            getEnv("APP_PORT", "8001"),
		AppEnv:             getEnv("APP_ENV", "development"),
		DBHost:             getEnv("DB_HOST", "localhost"),
		DBPort:             getEnv("DB_PORT", "5432"),
		DBUser:             getEnv("DB_USER", "postgres"),
		DBPassword:         getEnv("DB_PASSWORD", "postgres"),
		DBName:             getEnv("DB_NAME", "automarket"),
		DBSchema:           getEnv("DB_SCHEMA", "user_schema"),
		JWTSecret:          getEnv("JWT_SECRET", "automarket-super-secret-jwt-key-2024"),
		JWTExpirationHrs:   getEnvInt("JWT_EXPIRATION_HOURS", 24),
		GoogleClientID:     getEnv("GOOGLE_CLIENT_ID", ""),
		GoogleClientSecret: getEnv("GOOGLE_CLIENT_SECRET", ""),
		GoogleRedirectURL:  getEnv("GOOGLE_REDIRECT_URL", ""),
	}
}

func connectDB(config *Config) *gorm.DB {
	dsn := "host=" + config.DBHost +
		" port=" + config.DBPort +
		" user=" + config.DBUser +
		" password=" + config.DBPassword +
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

	// Enable UUID extensions
	db.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"")
	db.Exec("CREATE EXTENSION IF NOT EXISTS \"pgcrypto\"")

	log.Printf("✅ PostgreSQL connected [schema: %s]", config.DBSchema)
	return db
}

func migrateTables(db *gorm.DB) {
	log.Println("📦 Running auto-migration...")
	err := db.AutoMigrate(
		&models.Profile{},
		&models.UserSettings{},
		&models.UserSession{},
		&models.UserToken{},
		&models.KycVerification{},
		&models.UserVerification{},
		&models.UserAddress{},
		&models.UserDocument{},
	)
	if err != nil {
		log.Fatalf("❌ Auto-migration failed: %v", err)
	}
	log.Println("✅ All 8 tables migrated successfully")
}

func createJWTMiddleware(secret string) fiber.Handler {
	return func(c fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Token tidak ditemukan",
			})
		}

		// Simple Bearer token extraction
		if len(authHeader) < 8 || authHeader[:7] != "Bearer " {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Format token tidak valid. Gunakan: Bearer <token>",
			})
		}

		tokenString := authHeader[7:]

		// Validate token
		parser := controllers.NewJWTParser(secret)
		claims, err := parser.Parse(tokenString)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Token tidak valid atau sudah expired",
			})
		}

		// Extract claims
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

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	if n, err := strconv.Atoi(v); err == nil {
		return n
	}
	return fallback
}
