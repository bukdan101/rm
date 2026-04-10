package models

import (
	"time"

	"github.com/google/uuid"
)

type CarListing struct {
	ID              uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ListingNumber   string     `gorm:"type:varchar(50);uniqueIndex;not null" json:"listing_number"`
	UserID          *uuid.UUID `gorm:"type:uuid;index" json:"user_id"`
	DealerID        *uuid.UUID `gorm:"type:uuid;index" json:"dealer_id"`
	BrandID         *uuid.UUID `gorm:"type:uuid;index" json:"brand_id"`
	ModelID         *uuid.UUID `gorm:"type:uuid;index" json:"model_id"`
	VariantID       *uuid.UUID `gorm:"type:uuid" json:"variant_id"`
	GenerationID    *uuid.UUID `gorm:"type:uuid" json:"generation_id"`
	Year            int        `gorm:"" json:"year"`
	ExteriorColorID *uuid.UUID `gorm:"type:uuid" json:"exterior_color_id"`
	InteriorColorID *uuid.UUID `gorm:"type:uuid" json:"interior_color_id"`
	Fuel            string     `gorm:"type:varchar(50)" json:"fuel"`
	Transmission    string     `gorm:"type:varchar(50)" json:"transmission"`
	BodyType        string     `gorm:"type:varchar(50)" json:"body_type"`
	EngineCapacity  int        `gorm:"" json:"engine_capacity"`
	SeatCount       int        `gorm:"" json:"seat_count"`
	Mileage         int        `gorm:"" json:"mileage"`
	VINNumber       string     `gorm:"type:varchar(100)" json:"vin_number"`
	PlateNumber     string     `gorm:"type:varchar(50)" json:"plate_number"`
	TransactionType string     `gorm:"type:varchar(20);default:'sale'" json:"transaction_type"` // sale, rental
	Condition       string     `gorm:"type:varchar(20)" json:"condition"`                        // new, used, reconditioned
	PriceCash       int64      `gorm:"" json:"price_cash"`
	PriceCredit     int64      `gorm:"" json:"price_credit"`
	PriceNegotiable bool       `gorm:"default:false" json:"price_negotiable"`
	City            string     `gorm:"type:varchar(100)" json:"city"`
	Province        string     `gorm:"type:varchar(100)" json:"province"`
	CityID          *uuid.UUID `gorm:"type:uuid" json:"city_id"`
	ProvinceID      *uuid.UUID `gorm:"type:uuid" json:"province_id"`
	ViewCount       int        `gorm:"default:0" json:"view_count"`
	FavoriteCount   int        `gorm:"default:0" json:"favorite_count"`
	InquiryCount    int        `gorm:"default:0" json:"inquiry_count"`
	ShareCount      int        `gorm:"default:0" json:"share_count"`
	Status          string     `gorm:"type:varchar(20);default:'draft'" json:"status"` // draft,pending,active,sold,expired,rejected,deleted
	SoldAt          *time.Time `gorm:"" json:"sold_at"`
	ExpiredAt       *time.Time `gorm:"" json:"expired_at"`
	RejectedReason  string     `gorm:"type:text" json:"rejected_reason"`
	Title           string     `gorm:"type:varchar(255)" json:"title"`
	Description     string     `gorm:"type:text" json:"description"`
	MetaTitle       string     `gorm:"type:varchar(255)" json:"meta_title"`
	MetaDescription string     `gorm:"type:text" json:"meta_description"`
	Slug            string     `gorm:"type:varchar(255);uniqueIndex" json:"slug"`
	PublishedAt     *time.Time `gorm:"" json:"published_at"`
	FeaturedUntil   *time.Time `gorm:"" json:"featured_until"`
	CreatedAt       time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
	DeletedAt       *time.Time `gorm:"index" json:"deleted_at"`
}

func (CarListing) TableName() string {
	return "car_listings"
}
