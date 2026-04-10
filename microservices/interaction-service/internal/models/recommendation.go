package models

import (
	"time"

	"github.com/google/uuid"
)

// Recommendation represents a personalized car recommendation for a user
type Recommendation struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID       uuid.UUID  `gorm:"type:uuid;index" json:"user_id"`
	CarListingID uuid.UUID  `gorm:"type:uuid;index" json:"car_listing_id"`
	Score        float64    `gorm:"type:numeric(5,2)" json:"score"`
	Reason       string     `gorm:"type:text" json:"reason,omitempty"`
	Source       string     `gorm:"type:varchar(30);check:source IN ('similar','popular','recently_viewed','personalized','trending')" json:"source"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

// TableName specifies the table name for Recommendation
func (Recommendation) TableName() string {
	return "recommendations"
}
