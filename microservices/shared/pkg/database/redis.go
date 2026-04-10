package database

import (
	"context"
	"fmt"
	"log"

	"github.com/redis/go-redis/v9"
)

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
