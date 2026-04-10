package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type CarView struct {
	ID            uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID  *uuid.UUID `gorm:"type:uuid;index" json:"car_listing_id"`
	ViewerID      *uuid.UUID `gorm:"type:uuid" json:"viewer_id"`
	IPAddress     string     `gorm:"type:varchar(45)" json:"ip_address"`
	UserAgent     string     `gorm:"type:text" json:"user_agent"`
	Referrer      string     `gorm:"type:text" json:"referrer"`
	ViewDuration  int        `gorm:"default:0" json:"view_duration"`
	CreatedAt     time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (CarView) TableName() string {
	return "car_views"
}

type CarCompare struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID         *uuid.UUID `gorm:"type:uuid" json:"user_id"`
	CarListingIDs  pq.StringArray `gorm:"type:uuid[]" json:"car_listing_ids"`
	CreatedAt      time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (CarCompare) TableName() string {
	return "car_compares"
}

type CarFavorite struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID         *uuid.UUID `gorm:"type:uuid;index" json:"user_id"`
	CarListingID   *uuid.UUID `gorm:"type:uuid;index" json:"car_listing_id"`
	Notes          string     `gorm:"type:text" json:"notes"`
	CreatedAt      time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (CarFavorite) TableName() string {
	return "car_favorites"
}

type RecentView struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID         *uuid.UUID `gorm:"type:uuid" json:"user_id"`
	CarListingID   *uuid.UUID `gorm:"type:uuid" json:"car_listing_id"`
	ViewCount      int        `gorm:"default:0" json:"view_count"`
	LastViewedAt   time.Time  `gorm:"autoUpdateTime" json:"last_viewed_at"`
	CreatedAt      time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (RecentView) TableName() string {
	return "recent_views"
}

type TrendingCar struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID   *uuid.UUID `gorm:"type:uuid" json:"car_listing_id"`
	Period         string     `gorm:"type:varchar(20)" json:"period"` // daily, weekly, monthly
	ViewCount      int        `gorm:"default:0" json:"view_count"`
	InquiryCount   int        `gorm:"default:0" json:"inquiry_count"`
	FavoriteCount  int        `gorm:"default:0" json:"favorite_count"`
	Score          float64    `gorm:"type:numeric(10,2)" json:"score"`
	Rank           int        `gorm:"default:0" json:"rank"`
	CreatedAt      time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (TrendingCar) TableName() string {
	return "trending_cars"
}
