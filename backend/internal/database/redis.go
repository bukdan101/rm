package database

import (
	"context"
	"fmt"
	"log"

	"automarket/internal/config"

	"github.com/redis/go-redis/v9"
)

func ConnectRedis(cfg *config.Config) *redis.Client {
	rdb := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", cfg.RedisHost, cfg.RedisPort),
		Password: cfg.RedisPassword,
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
