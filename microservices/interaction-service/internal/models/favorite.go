package models

import (
	"time"

	"github.com/google/uuid"
)

// CarFavorite represents a user's favorite car listing
type CarFavorite struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID        uuid.UUID `gorm:"type:uuid;index" json:"user_id"`
	CarListingID  uuid.UUID `gorm:"type:uuid;index" json:"car_listing_id"`
	Notes         string    `gorm:"type:text" json:"notes,omitempty"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
}

// TableName specifies the table name for CarFavorite
func (CarFavorite) TableName() string {
	return "car_favorites"
}
