package database

import (
	"fmt"
	"log"
	"time"

	"automarket/internal/config"
	"automarket/internal/models"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	gormlogger "gorm.io/gorm/logger"
)

func ConnectPostgres(cfg *config.Config) *gorm.DB {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable TimeZone=Asia/Jakarta",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName,
	)

	logLevel := gormlogger.Info
	if cfg.AppEnv == "production" {
		logLevel = gormlogger.Warn
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: gormlogger.Default.LogMode(logLevel),
	})
	if err != nil {
		log.Fatalf("Failed to connect to PostgreSQL: %v", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("Failed to get DB instance: %v", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Enable uuid-ossp extension
	db.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"")
	db.Exec("CREATE EXTENSION IF NOT EXISTS \"pgcrypto\"")

	// Auto-migrate ALL 101 models
	log.Println("Running AutoMigrate for all 101 models...")
	err = db.AutoMigrate(
		// Auth & Users (7)
		&models.User{},
		&models.Profile{},
		&models.UserSettings{},
		&models.UserSession{},
		&models.UserVerification{},
		&models.UserDocument{},
		&models.UserAddress{},

		// Location (4)
		&models.Country{},
		&models.Province{},
		&models.City{},
		&models.District{},

		// Vehicle Master Data (12)
		&models.Brand{},
		&models.CarModel{},
		&models.CarVariant{},
		&models.CarGeneration{},
		&models.CarColor{},
		&models.CarBodyType{},
		&models.CarFuelType{},
		&models.CarTransmission{},
		&models.FeatureCategory{},
		&models.FeatureGroup{},
		&models.FeatureItem{},
		&models.Category{},

		// Listing System (14)
		&models.CarListing{},
		&models.CarImage{},
		&models.CarVideo{},
		&models.CarDocument{},
		&models.CarFeatures{},
		&models.CarFeatureValue{},
		&models.CarRentalPrice{},
		&models.CarPriceHistory{},
		&models.CarStatusHistory{},
		&models.CarView{},
		&models.CarCompare{},
		&models.CarFavorite{},
		&models.RecentView{},
		&models.TrendingCar{},

		// Inspection System (6)
		&models.InspectionCategory{},
		&models.InspectionItem{},
		&models.CarInspection{},
		&models.InspectionResult{},
		&models.InspectionPhoto{},
		&models.InspectionCertificate{},

		// Dealer System (12)
		&models.Dealer{},
		&models.DealerBranch{},
		&models.DealerStaff{},
		&models.DealerDocument{},
		&models.DealerInventory{},
		&models.DealerReview{},
		&models.DealerMarketplaceSetting{},
		&models.DealerMarketplaceFavorite{},
		&models.DealerMarketplaceView{},
		&models.DealerOffer{},
		&models.DealerOfferHistory{},

		// Token/Credit System (6)
		&models.TokenPackage{},
		&models.TokenSetting{},
		&models.TokenTransaction{},
		&models.UserToken{},
		&models.TopupRequest{},
		&models.BoostSetting{},

		// Payment & Orders (11)
		&models.Payment{},
		&models.PaymentMethod{},
		&models.Transaction{},
		&models.Invoice{},
		&models.Order{},
		&models.OrderItem{},
		&models.EscrowAccount{},
		&models.Refund{},
		&models.Withdrawal{},
		&models.FeeSetting{},
		&models.Coupon{},

		// Chat & Messaging (3)
		&models.Conversation{},
		&models.Message{},
		&models.MessageAttachment{},

		// Notifications (5)
		&models.Notification{},
		&models.UserNotification{},
		&models.NotificationTemplate{},
		&models.NotificationLog{},
		&models.Broadcast{},

		// KYC (1)
		&models.KycVerification{},

		// Rental System (5)
		&models.RentalBooking{},
		&models.RentalAvailability{},
		&models.RentalPayment{},
		&models.RentalInsurance{},
		&models.RentalReview{},

		// Reviews (3)
		&models.CarReview{},
		&models.ReviewImage{},
		&models.ReviewVote{},

		// Analytics (6)
		&models.AnalyticsEvent{},
		&models.AnalyticsPageView{},
		&models.AnalyticsClick{},
		&models.AnalyticsConversion{},
		&models.SearchLog{},
		&models.Recommendation{},

		// Support & Admin (6)
		&models.ActivityLog{},
		&models.Banner{},
		&models.SystemSetting{},
		&models.SupportTicket{},
		&models.SupportTicketMessage{},
		&models.Report{},
	)

	if err != nil {
		log.Fatalf("AutoMigrate failed: %v", err)
	}

	log.Println("✅ PostgreSQL connected and all 101 tables migrated successfully")
	return db
}
