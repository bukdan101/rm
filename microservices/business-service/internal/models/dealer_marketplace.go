package models

import (
	"time"

	"github.com/google/uuid"
)

// DealerMarketplaceSetting represents platform marketplace settings
type DealerMarketplaceSetting struct {
	ID                             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TokenCostPublic                int        `gorm:"default:1" json:"token_cost_public"`
	TokenCostDealerMarketplace     int        `gorm:"default:2" json:"token_cost_dealer_marketplace"`
	TokenCostBoth                  int        `gorm:"default:3" json:"token_cost_both"`
	DefaultOfferDurationHours      int        `gorm:"default:72" json:"default_offer_duration_hours"`
	InspectionCost                 int64      `gorm:"default:250000" json:"inspection_cost"`
	InspectionRequiredForDealerMP  bool       `gorm:"default:false" json:"inspection_required_for_dealer_marketplace"`
	PlatformFeePercentage          float64    `gorm:"type:numeric;default:0" json:"platform_fee_percentage"`
	PlatformFeeEnabled             bool       `gorm:"default:false" json:"platform_fee_enabled"`
	IsActive                       bool       `gorm:"default:true" json:"is_active"`
	CreatedAt                      time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt                      time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}

func (DealerMarketplaceSetting) TableName() string {
	return "dealer_marketplace_settings"
}

// DealerMarketplaceFavorite represents a dealer's favorited car listings
type DealerMarketplaceFavorite struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	DealerID     uuid.UUID  `gorm:"type:uuid;not null" json:"dealer_id"`
	CarListingID uuid.UUID  `gorm:"type:uuid;not null" json:"car_listing_id"`
	StaffID      *uuid.UUID `gorm:"type:uuid" json:"staff_id"`
	Notes        string     `gorm:"type:text" json:"notes"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (DealerMarketplaceFavorite) TableName() string {
	return "dealer_marketplace_favorites"
}

// DealerMarketplaceView tracks dealer views on car listings
type DealerMarketplaceView struct {
	ID                  uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	DealerID            uuid.UUID `gorm:"type:uuid;not null" json:"dealer_id"`
	CarListingID        uuid.UUID `gorm:"type:uuid;not null" json:"car_listing_id"`
	StaffID             *uuid.UUID `gorm:"type:uuid" json:"staff_id"`
	ViewDurationSeconds int       `json:"view_duration_seconds"`
	ViewedAt            time.Time `json:"viewed_at"`
	CreatedAt           time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (DealerMarketplaceView) TableName() string {
	return "dealer_marketplace_views"
}
