package models

import (
	"time"

	"github.com/google/uuid"
)

type CarRentalPrice struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID   *uuid.UUID `gorm:"type:uuid;uniqueIndex" json:"car_listing_id"`
	PricePerDay    int64      `gorm:"" json:"price_per_day"`
	PricePerWeek   int64      `gorm:"" json:"price_per_week"`
	PricePerMonth  int64      `gorm:"" json:"price_per_month"`
	CreatedAt      time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (CarRentalPrice) TableName() string {
	return "car_rental_prices"
}
