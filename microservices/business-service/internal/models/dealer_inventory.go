package models

import (
	"time"

	"github.com/google/uuid"
)

// DealerInventory represents a dealer's vehicle inventory
type DealerInventory struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	DealerID     uuid.UUID  `gorm:"type:uuid;index;not null" json:"dealer_id"`
	CarListingID *uuid.UUID `gorm:"type:uuid" json:"car_listing_id"`
	Location     string     `gorm:"type:text" json:"location"`
	StockStatus  string     `gorm:"type:text;default:'available'" json:"stock_status"` // available, reserved, sold
	Notes        string     `gorm:"type:text" json:"notes"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (DealerInventory) TableName() string {
	return "dealer_inventory"
}
