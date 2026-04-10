package models

import (
	"time"

	"github.com/google/uuid"
)

// RecentView represents a user's recent car listing view
type RecentView struct {
	ID            uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID        uuid.UUID `gorm:"type:uuid;index" json:"user_id"`
	CarListingID  uuid.UUID `gorm:"type:uuid;index" json:"car_listing_id"`
	ViewCount     int       `gorm:"default:1" json:"view_count"`
	LastViewedAt  time.Time `gorm:"autoUpdateTime" json:"last_viewed_at"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
}

// TableName specifies the table name for RecentView
func (RecentView) TableName() string {
	return "recent_views"
}
