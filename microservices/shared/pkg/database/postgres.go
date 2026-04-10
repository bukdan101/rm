package database

import (
	"fmt"
	"log"
	"time"

	"github.com/redis/go-redis/v9"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
)

// ConnectPostgres connects to PostgreSQL with schema isolation
// Each microservice sets search_path to its own schema
func ConnectPostgres(host, port, user, password, dbname, schema string) *gorm.DB {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable TimeZone=Asia/Jakarta search_path=%s,public",
		host, port, user, password, dbname, schema,
	)

	logLevel := gormlogger.Info
	// Can add env check for production

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormlogger.Default.LogMode(logLevel),
	})
	if err != nil {
		log.Fatalf("Failed to connect to PostgreSQL [%s]: %v", schema, err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("Failed to get DB instance: %v", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Enable extensions
	db.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"")
	db.Exec("CREATE EXTENSION IF NOT EXISTS \"pgcrypto\"")

	log.Printf("✅ PostgreSQL connected [schema: %s]", schema)
	return db
}

// ConnectRedis connects to Redis
func ConnectRedis(host, port, password string) *redis.Client {
	rdb := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", host, port),
		Password: password,
		DB:       0,
	})

	ctx := context.Background()
	_, err := rdb.Ping(ctx).Result()
	if err != nil {
		log.Printf("⚠️  Redis connection failed (caching disabled): %v", err)
		return rdb
	}

	log.Println("✅ Redis connected successfully")
	return rdb
}
