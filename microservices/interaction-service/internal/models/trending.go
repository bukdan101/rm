package models

import (
	"time"

	"github.com/google/uuid"
)

// TrendingCar represents trending car data for a given period
type TrendingCar struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID  uuid.UUID `gorm:"type:uuid;index" json:"car_listing_id"`
	Period        string    `gorm:"type:varchar(20);check:period IN ('daily','weekly','monthly')" json:"period"`
	ViewCount     int       `gorm:"default:0" json:"view_count"`
	InquiryCount  int       `gorm:"default:0" json:"inquiry_count"`
	FavoriteCount int       `gorm:"default:0" json:"favorite_count"`
	Score         float64   `gorm:"type:numeric(8,2)" json:"score"`
	Rank          int       `json:"rank"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
}

// TableName specifies the table name for TrendingCar
func (TrendingCar) TableName() string {
	return "trending_cars"
}
