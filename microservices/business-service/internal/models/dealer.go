package models

import (
	"time"

	"github.com/google/uuid"
)

// Dealer represents a car dealer business
type Dealer struct {
	ID                 uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	OwnerID            *uuid.UUID `gorm:"type:uuid;index" json:"owner_id"`
	Name               string     `gorm:"type:text;not null" json:"name"`
	Slug               string     `gorm:"type:text;uniqueIndex;not null" json:"slug"`
	Description        string     `gorm:"type:text" json:"description"`
	LogoURL            string     `gorm:"type:text" json:"logo_url"`
	CoverURL           string     `gorm:"type:text" json:"cover_url"`
	Phone              string     `gorm:"type:text" json:"phone"`
	Email              string     `gorm:"type:text" json:"email"`
	Website            string     `gorm:"type:text" json:"website"`
	Address            string     `gorm:"type:text" json:"address"`
	CityID             *uuid.UUID `gorm:"type:uuid" json:"city_id"`
	ProvinceID         *uuid.UUID `gorm:"type:uuid" json:"province_id"`
	PostalCode         string     `gorm:"type:text" json:"postal_code"`
	Rating             float64    `gorm:"type:numeric;default:0" json:"rating"`
	ReviewCount        int        `gorm:"default:0" json:"review_count"`
	TotalListings      int        `gorm:"default:0" json:"total_listings"`
	Verified           bool       `gorm:"default:false" json:"verified"`
	IsActive           bool       `gorm:"default:true" json:"is_active"`
	SubscriptionTier   string     `gorm:"type:text;default:'free'" json:"subscription_tier"`
	SubscriptionEndsAt *time.Time `json:"subscription_ends_at"`
	CreatedAt          time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt          time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}

func (Dealer) TableName() string {
	return "dealers"
}
