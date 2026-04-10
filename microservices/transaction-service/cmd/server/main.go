package main

import (
	"log"
	"os"
	"strconv"

	"automarket-transaction-service/internal/controllers"
	"automarket-transaction-service/internal/models"
	"automarket-transaction-service/internal/routes"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/gofiber/fiber/v3/middleware/recover"
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
		AppName:      "AutoMarket Transaction Service",
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

	// JWT Middleware
	jwtMiddleware := controllers.JWTMiddleware(config.JWTSecret)
	adminMiddleware := controllers.AdminMiddleware()

	// Controllers
	orderCtrl := &controllers.OrderController{
		DB: db,
	}

	paymentCtrl := &controllers.PaymentController{
		DB: db,
	}

	tokenCtrl := &controllers.TokenController{
		DB: db,
	}

	rentalCtrl := &controllers.RentalController{
		DB: db,
	}

	couponCtrl := &controllers.CouponController{
		DB: db,
	}

	adminCtrl := &controllers.AdminController{
		DB: db,
	}

	// Setup routes
	routes.SetupRoutes(app, orderCtrl, paymentCtrl, tokenCtrl, rentalCtrl, couponCtrl, adminCtrl, jwtMiddleware, adminMiddleware)

	// Start server
	log.Printf("🚀 AutoMarket Transaction Service running on port %s", config.AppPort)
	if err := app.Listen(":" + config.AppPort); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// Config holds service configuration
type Config struct {
	AppPort  string
	AppEnv   string
	DBHost   string
	DBPort   string
	DBUser   string
	DBPassword string
	DBName   string
	DBSchema string
	JWTSecret string
}

func loadConfig() *Config {
	return &Config{
		AppPort:    getEnv("APP_PORT", "8004"),
		AppEnv:     getEnv("APP_ENV", "development"),
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "postgres"),
		DBPassword: getEnv("DB_PASSWORD", "postgres"),
		DBName:     getEnv("DB_NAME", "automarket"),
		DBSchema:   getEnv("DB_SCHEMA", "transaction_schema"),
		JWTSecret:  getEnv("JWT_SECRET", "automarket-super-secret-jwt-key-2024"),
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
		&models.Order{},
		&models.OrderItem{},
		&models.Payment{},
		&models.Transaction{},
		&models.Invoice{},
		&models.EscrowAccount{},
		&models.Refund{},
		&models.TokenPackage{},
		&models.TokenSetting{},
		&models.TokenTransaction{},
		&models.TopupRequest{},
		&models.Coupon{},
		&models.RentalBooking{},
		&models.RentalPayment{},
		&models.RentalReview{},
	)
	if err != nil {
		log.Fatalf("❌ Auto-migration failed: %v", err)
	}
	log.Println("✅ All 15 tables migrated successfully")
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
