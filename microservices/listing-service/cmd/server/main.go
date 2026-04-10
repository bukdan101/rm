package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"

	"automarket-listing-service/internal/controllers"
	"automarket-listing-service/internal/models"
	"automarket-listing-service/internal/routes"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/gofiber/fiber/v3/middleware/recover"
	"github.com/google/uuid"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	printBanner()

	// Load .env file
	if err := loadDotEnv(); err != nil {
		log.Printf("⚠️  .env file not found, using environment variables: %v", err)
	}

	// Load configuration from environment
	config := loadConfig()

	log.Printf("🔧 Environment: %s", config.AppEnv)
	log.Printf("🔧 DB: %s:%s/%s [%s]", config.DBHost, config.DBPort, config.DBName, config.DBSchema)
	log.Printf("🔧 Port: %s", config.AppPort)

	// Connect to PostgreSQL
	db := connectDB(config)

	// Auto-migrate tables
	migrateTables(db)

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      "AutoMarket Listing Service",
		ServerHeader: "AutoMarket/1.0",
	})

	// Global middleware
	app.Use(logger.New())
	app.Use(recover.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
		AllowHeaders: "Origin,Content-Type,Accept,Authorization",
	}))
	app.Use(rateLimiter())

	// Health check at GET /api/health
	app.Get("/api/health", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"success": true,
			"message": "Listing service is healthy",
			"service": "automarket-listing-service",
			"port":    config.AppPort,
			"env":     config.AppEnv,
		})
	})

	// JWT Middleware (inline since this is a separate Go module)
	jwtMiddleware := createJWTMiddleware(config.JWTSecret)

	// Controllers
	listingCtrl := &controllers.ListingController{DB: db}
	brandCtrl := &controllers.BrandController{DB: db}
	masterCtrl := &controllers.MasterDataController{DB: db}
	inspCtrl := &controllers.InspectionController{DB: db}

	// Setup routes
	routes.SetupRoutes(app, listingCtrl, brandCtrl, masterCtrl, inspCtrl, jwtMiddleware)

	// Start server
	log.Printf("🚀 AutoMarket Listing Service running on port %s", config.AppPort)
	if err := app.Listen(":" + config.AppPort); err != nil {
		log.Fatalf("❌ Failed to start server: %v", err)
	}
}

// printBanner shows the service startup banner
func printBanner() {
	banner := `
╔══════════════════════════════════════════════════════╗
║          🚗 AutoMarket Listing Service              ║
║          Microservice v1.0.0                        ║
║          Port: 8002 | Schema: listing_schema        ║
╚══════════════════════════════════════════════════════╝`
	fmt.Println(banner)
}

// Config holds service configuration
type Config struct {
	AppPort     string
	AppEnv      string
	DBHost      string
	DBPort      string
	DBUser      string
	DBPassword  string
	DBName      string
	DBSchema    string
	JWTSecret   string
}

func loadConfig() *Config {
	return &Config{
		AppPort:     getEnv("APP_PORT", "8002"),
		AppEnv:      getEnv("APP_ENV", "development"),
		DBHost:      getEnv("DB_HOST", "localhost"),
		DBPort:      getEnv("DB_PORT", "5432"),
		DBUser:      getEnv("DB_USER", "postgres"),
		DBPassword:  getEnv("DB_PASSWORD", "postgres"),
		DBName:      getEnv("DB_NAME", "automarket"),
		DBSchema:    getEnv("DB_SCHEMA", "listing_schema"),
		JWTSecret:   getEnv("JWT_SECRET", "automarket-super-secret-jwt-key-2024"),
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

	// Create schema if not exists
	db.Exec("CREATE SCHEMA IF NOT EXISTS " + config.DBSchema)
	// Set search_path for this session
	db.Exec("SET search_path TO " + config.DBSchema + ",public")

	log.Printf("✅ PostgreSQL connected [schema: %s]", config.DBSchema)
	return db
}

func migrateTables(db *gorm.DB) {
	log.Println("📦 Running auto-migration for listing service...")
	err := db.AutoMigrate(
		// Car Listings & Related
		&models.CarListing{},
		&models.CarImage{},
		&models.CarFeatures{},
		&models.CarFeatureValue{},
		&models.CarDocument{},
		&models.CarRentalPrice{},

		// Brands, Models, Variants
		&models.Brand{},
		&models.CarModel{},
		&models.CarVariant{},

		// Master Data
		&models.CarColor{},
		&models.CarBodyType{},
		&models.CarFuelType{},
		&models.CarTransmission{},
		&models.Category{},
		&models.FeatureCategory{},
		&models.FeatureGroup{},
		&models.FeatureItem{},

		// Inspection
		&models.InspectionCategory{},
		&models.InspectionItem{},
		&models.CarInspection{},
		&models.InspectionResult{},
		&models.InspectionPhoto{},
		&models.InspectionCertificate{},

		// Interactions & Tracking
		&models.CarView{},
		&models.CarCompare{},
		&models.CarFavorite{},
		&models.RecentView{},
		&models.TrendingCar{},

		// History
		&models.CarPriceHistory{},
		&models.CarStatusHistory{},
	)
	if err != nil {
		log.Fatalf("❌ Auto-migration failed: %v", err)
	}
	log.Println("✅ All 31 tables migrated successfully")
}

// createJWTMiddleware provides inline JWT validation
// Since listing-service is a separate Go module, JWT parsing is done inline
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

		// Parse JWT token (inline HS256 implementation)
		claims, err := parseJWT(tokenString, secret)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"success": false,
				"message": "Token tidak valid atau sudah expired",
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

// parseJWT is a minimal inline JWT parser (HS256 only)
func parseJWT(tokenString, secret string) (map[string]interface{}, error) {
	parts := strings.Split(tokenString, ".")
	if len(parts) != 3 {
		return nil, fmt.Errorf("format token tidak valid")
	}

	// Decode header to verify algorithm
	headerBytes, err := base64RawURLEncodeDecode(parts[0])
	if err != nil {
		return nil, fmt.Errorf("gagal mendekode header: %v", err)
	}

	var header struct {
		Alg string `json:"alg"`
		Typ string `json:"typ"`
	}
	if err := json.Unmarshal(headerBytes, &header); err != nil {
		return nil, fmt.Errorf("gagal mem-parsing header: %v", err)
	}
	if header.Alg != "HS256" {
		return nil, fmt.Errorf("algoritma tidak didukung: %s", header.Alg)
	}

	// Decode payload
	payload, err := base64RawURLEncodeDecode(parts[1])
	if err != nil {
		return nil, fmt.Errorf("gagal mendekode token: %v", err)
	}

	var claims map[string]interface{}
	if err := json.Unmarshal(payload, &claims); err != nil {
		return nil, fmt.Errorf("gagal mem-parsing claims: %v", err)
	}

	// Check expiration
	if exp, ok := claims["exp"].(float64); ok {
		if time.Now().Unix() > int64(exp) {
			return nil, fmt.Errorf("token sudah expired")
		}
	}

	// Verify signature using HMAC-SHA256
	signingInput := parts[0] + "." + parts[1]
	sig, err := base64RawURLEncodeDecode(parts[2])
	if err != nil {
		return nil, fmt.Errorf("gagal mendekode signature: %v", err)
	}

	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(signingInput))
	expectedSig := mac.Sum(nil)

	if !hmac.Equal(sig, expectedSig) {
		return nil, fmt.Errorf("signature token tidak valid")
	}

	return claims, nil
}

// base64RawURLEncodeDecode decodes a base64url-encoded string (no padding)
func base64RawURLEncodeDecode(s string) ([]byte, error) {
	// Add padding if needed
	if m := len(s) % 4; m != 0 {
		s += strings.Repeat("=", 4-m)
	}
	return base64.URLEncoding.DecodeString(s)
}

// rateLimiter returns a simple in-memory rate limiter middleware
func rateLimiter() fiber.Handler {
	type visitor struct {
		timestamps []time.Time
	}

	var (
		mu       sync.Mutex
		visitors = make(map[string]*visitor)
		rate     = 100             // max requests
		window   = 1 * time.Minute // per window
		cleanup  = 5 * time.Minute // cleanup interval
	)

	// Background cleanup goroutine
	go func() {
		ticker := time.NewTicker(cleanup)
		defer ticker.Stop()
		for range ticker.C {
			mu.Lock()
			now := time.Now()
			for ip, v := range visitors {
				valid := v.timestamps[:0]
				for _, ts := range v.timestamps {
					if now.Sub(ts) < window {
						valid = append(valid, ts)
					}
				}
				v.timestamps = valid
				if len(valid) == 0 {
					delete(visitors, ip)
				}
			}
			mu.Unlock()
		}
	}()

	return func(c fiber.Ctx) error {
		ip := c.IP()

		mu.Lock()
		v, exists := visitors[ip]
		if !exists {
			v = &visitor{}
			visitors[ip] = v
		}

		now := time.Now()
		// Filter out expired timestamps
		valid := v.timestamps[:0]
		for _, ts := range v.timestamps {
			if now.Sub(ts) < window {
				valid = append(valid, ts)
			}
		}
		v.timestamps = valid

		if len(v.timestamps) >= rate {
			mu.Unlock()
			return c.Status(http.StatusTooManyRequests).JSON(fiber.Map{
				"success": false,
				"message": "Terlalu banyak permintaan. Silakan coba lagi nanti.",
			})
		}

		v.timestamps = append(v.timestamps, now)
		mu.Unlock()

		return c.Next()
	}
}

// --- Helper functions ---

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// suppress unused warning
var _ = getEnvInt

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

// loadDotEnv attempts to load .env file
func loadDotEnv() error {
	data, err := os.ReadFile(".env")
	if err != nil {
		return err
	}

	lines := strings.Split(string(data), "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}

		idx := strings.Index(line, "=")
		if idx == -1 {
			continue
		}
		key := strings.TrimSpace(line[:idx])
		value := strings.TrimSpace(line[idx+1:])
		value = strings.Trim(value, `"'`)
		os.Setenv(key, value)
	}

	return nil
}
