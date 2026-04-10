package main

import (
	"fmt"
	"log"
	"os"
	"strconv"
	"time"

	"automarket-interaction-service/internal/controllers"
	"automarket-interaction-service/internal/models"
	"automarket-interaction-service/internal/routes"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/gofiber/fiber/v3/middleware/recover"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// Load .env file
	loadEnv()

	config := loadConfig()

	log.Printf("🔧 Environment: %s", config.AppEnv)
	log.Printf("🔧 DB: %s:%s/%s [%s]", config.DBHost, config.DBPort, config.DBName, config.DBSchema)

	// Connect to PostgreSQL
	db := connectDB(config)

	// Auto-migrate tables
	migrateTables(db)

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      "AutoMarket Interaction Service",
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
			"message": "Interaction service is healthy",
			"service": "automarket-interaction-service",
			"port":    config.AppPort,
		})
	})

	// JWT Middleware
	jwtMiddleware := createJWTMiddleware(config.JWTSecret)
	adminMiddleware := createAdminMiddleware()

	// Controllers
	reviewCtrl := &controllers.ReviewController{DB: db}
	favoriteCtrl := &controllers.FavoriteController{DB: db}
	recentViewCtrl := &controllers.RecentViewController{DB: db}
	recommendationCtrl := &controllers.RecommendationController{DB: db}
	trendingCtrl := &controllers.TrendingController{DB: db}

	// Setup routes
	routes.SetupRoutes(app, reviewCtrl, favoriteCtrl, recentViewCtrl, recommendationCtrl, trendingCtrl, jwtMiddleware, adminMiddleware)

	// Start server
	log.Printf("🚀 AutoMarket Interaction Service running on port %s", config.AppPort)
	if err := app.Listen(":" + config.AppPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// Config holds service configuration
type Config struct {
	AppPort          string
	AppEnv           string
	DBHost           string
	DBPort           string
	DBUser           string
	DBPassword       string
	DBName           string
	DBSchema         string
	JWTSecret        string
	JWTExpirationHrs int
}

func loadEnv() {
	// Optionally load .env file using godotenv
	// This is a simple loadEnv that does nothing if godotenv is not available
	// The service will use system environment variables
}

func loadConfig() *Config {
	return &Config{
		AppPort:          getEnv("APP_PORT", "8003"),
		AppEnv:           getEnv("APP_ENV", "development"),
		DBHost:           getEnv("DB_HOST", "localhost"),
		DBPort:           getEnv("DB_PORT", "5432"),
		DBUser:           getEnv("DB_USER", "postgres"),
		DBPassword:       getEnv("DB_PASSWORD", "postgres"),
		DBName:           getEnv("DB_NAME", "automarket"),
		DBSchema:         getEnv("DB_SCHEMA", "interaction_schema"),
		JWTSecret:        getEnv("JWT_SECRET", "automarket-super-secret-jwt-key-2024"),
		JWTExpirationHrs: getEnvInt("JWT_EXPIRATION_HOURS", 24),
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
		time.Sleep(2 * time.Second)
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

	// Create schema if it doesn't exist
	db.Exec(fmt.Sprintf("CREATE SCHEMA IF NOT EXISTS %s", config.DBSchema))

	log.Printf("✅ PostgreSQL connected [schema: %s]", config.DBSchema)
	return db
}

func migrateTables(db *gorm.DB) {
	log.Println("📦 Running auto-migration...")
	err := db.AutoMigrate(
		&models.CarReview{},
		&models.ReviewImage{},
		&models.ReviewVote{},
		&models.CarFavorite{},
		&models.RecentView{},
		&models.Recommendation{},
		&models.TrendingCar{},
	)
	if err != nil {
		log.Fatalf("❌ Auto-migration failed: %v", err)
	}
	log.Println("✅ All 7 tables migrated successfully")
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

		if len(authHeader) < 8 || authHeader[:7] != "Bearer " {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Format token tidak valid. Gunakan: Bearer <token>",
			})
		}

		tokenString := authHeader[7:]

		claims, err := parseToken(tokenString, secret)
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

func parseToken(tokenString, secret string) (*map[string]interface{}, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(secret), nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("token tidak valid")
	}

	result := make(map[string]interface{})
	for k, v := range claims {
		result[k] = v
	}
	return &result, nil
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
