package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	AppPort           string
	AppEnv            string
	DBHost            string
	DBPort            string
	DBUser            string
	DBPassword        string
	DBName            string
	RedisHost         string
	RedisPort         string
	RedisPassword     string
	JWTSecret         string
	JWTExpirationHrs  int
	GoogleClientID    string
	GoogleClientSecret string
	GoogleRedirectURL string
	MinioEndpoint     string
	MinioAccessKey    string
	MinioSecretKey    string
	MinioBucket       string
	MinioUseSSL       bool
}

func LoadConfig() *Config {
	_ = godotenv.Load()

	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8080"
	}
	env := os.Getenv("APP_ENV")
	if env == "" {
		env = "development"
	}
	jwtHrs := 24
	if h := os.Getenv("JWT_EXPIRATION_HOURS"); h != "" {
		if v, err := strconv.Atoi(h); err == nil {
			jwtHrs = v
		}
	}
	minioSSL := false
	if s := os.Getenv("MINIO_USE_SSL"); s == "true" {
		minioSSL = true
	}

	return &Config{
		AppPort:           port,
		AppEnv:            env,
		DBHost:            getEnv("DB_HOST", "localhost"),
		DBPort:            getEnv("DB_PORT", "5432"),
		DBUser:            getEnv("DB_USER", "postgres"),
		DBPassword:        getEnv("DB_PASSWORD", "postgres"),
		DBName:            getEnv("DB_NAME", "automarket"),
		RedisHost:         getEnv("REDIS_HOST", "localhost"),
		RedisPort:         getEnv("REDIS_PORT", "6379"),
		RedisPassword:     os.Getenv("REDIS_PASSWORD"),
		JWTSecret:         os.Getenv("JWT_SECRET"),
		JWTExpirationHrs:  jwtHrs,
		GoogleClientID:    os.Getenv("GOOGLE_CLIENT_ID"),
		GoogleClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		GoogleRedirectURL: os.Getenv("GOOGLE_REDIRECT_URL"),
		MinioEndpoint:     getEnv("MINIO_ENDPOINT", "localhost:9000"),
		MinioAccessKey:    os.Getenv("MINIO_ACCESS_KEY"),
		MinioSecretKey:    os.Getenv("MINIO_SECRET_KEY"),
		MinioBucket:       getEnv("MINIO_BUCKET", "automarket"),
		MinioUseSSL:       minioSSL,
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
