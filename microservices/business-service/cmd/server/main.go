package main

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"automarket-business-service/internal/controllers"
	"automarket-business-service/internal/models"
	"automarket-business-service/internal/routes"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/gofiber/fiber/v3/middleware/recover"
	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	config := loadConfig()

	log.Printf("🔧 Environment: %s", config.AppEnv)
	log.Printf("🔧 DB: %s:%s/%s [%s]", config.DBHost, config.DBPort, config.DBName, config.DBSchema)

	db := connectDB(config)
	migrateTables(db)

	app := fiber.New(fiber.Config{
		AppName:      "AutoMarket Business Service",
		ServerHeader: "AutoMarket/1.0",
	})

	app.Use(logger.New())
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
		AllowHeaders: "Origin,Content-Type,Accept,Authorization",
	}))

	// Health check
	app.Get("/api/health", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"success": true,
			"message": "Business service is healthy",
			"service": "automarket-business-service",
			"port":    config.AppPort,
		})
	})

	jwtMiddleware := createJWTMiddleware(config.JWTSecret)
	adminMiddleware := createAdminMiddleware()

	// Controllers
	dealerCtrl := &controllers.DealerController{DB: db}
	offerCtrl := &controllers.OfferController{DB: db}
	marketplaceCtrl := &controllers.MarketplaceController{DB: db}
	bannerCtrl := &controllers.BannerController{DB: db}
	broadcastCtrl := &controllers.BroadcastController{DB: db}
	categoryCtrl := &controllers.CategoryController{DB: db}
	supportCtrl := &controllers.SupportController{DB: db}
	adminCtrl := &controllers.AdminController{DB: db}

	// Setup routes
	routes.SetupRoutes(app, dealerCtrl, offerCtrl, marketplaceCtrl, bannerCtrl, broadcastCtrl, categoryCtrl, supportCtrl, adminCtrl, jwtMiddleware, adminMiddleware)

	log.Printf("🚀 AutoMarket Business Service running on port %s", config.AppPort)
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

func loadConfig() *Config {
	return &Config{
		AppPort:          getEnv("APP_PORT", "8005"),
		AppEnv:           getEnv("APP_ENV", "development"),
		DBHost:           getEnv("DB_HOST", "localhost"),
		DBPort:           getEnv("DB_PORT", "5432"),
		DBUser:           getEnv("DB_USER", "postgres"),
		DBPassword:       getEnv("DB_PASSWORD", "postgres"),
		DBName:           getEnv("DB_NAME", "automarket"),
		DBSchema:         getEnv("DB_SCHEMA", "business_schema"),
		JWTSecret:        getEnv("JWT_SECRET", "automarket-super-secret-jwt-key-2024"),
		JWTExpirationHrs: getEnvInt("JWT_EXPIRATION_HOURS", 24),
	}
}

func connectDB(config *Config) *gorm.DB {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable TimeZone=Asia/Jakarta search_path=%s,public",
		config.DBHost, config.DBPort, config.DBUser, config.DBPassword, config.DBName, config.DBSchema,
	)

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

	db.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"")
	db.Exec("CREATE EXTENSION IF NOT EXISTS \"pgcrypto\"")

	// Ensure the schema exists
	db.Exec(fmt.Sprintf("CREATE SCHEMA IF NOT EXISTS %s", config.DBSchema))
	// Set search path explicitly
	db.Exec(fmt.Sprintf("SET search_path TO %s,public", config.DBSchema))

	log.Printf("✅ PostgreSQL connected [schema: %s]", config.DBSchema)
	return db
}

func migrateTables(db *gorm.DB) {
	log.Println("📦 Running auto-migration for business_schema...")
	err := db.AutoMigrate(
		// Dealers & branches
		&models.Dealer{},
		&models.DealerBranch{},
		&models.DealerStaff{},
		&models.DealerDocument{},
		&models.DealerReview{},
		&models.DealerInventory{},
		// Marketplace
		&models.DealerMarketplaceSetting{},
		&models.DealerMarketplaceFavorite{},
		&models.DealerMarketplaceView{},
		// Offers
		&models.DealerOffer{},
		&models.DealerOfferHistory{},
		// Platform content
		&models.Banner{},
		&models.Broadcast{},
		&models.Category{},
		// Support
		&models.SupportTicket{},
		&models.SupportTicketMessage{},
	)
	if err != nil {
		log.Fatalf("❌ Auto-migration failed: %v", err)
	}
	log.Println("✅ All 16 tables migrated successfully")
}

// JWT Middleware — replicates the user-service pattern inline
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
		claims, err := controllers.ParseJWT(tokenString, secret)
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
