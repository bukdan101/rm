package models

import (
	"time"

	"github.com/google/uuid"
)

// DealerReview represents a review/rating for a dealer
type DealerReview struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	DealerID     uuid.UUID  `gorm:"type:uuid;index;not null" json:"dealer_id"`
	UserID       uuid.UUID  `gorm:"type:uuid;not null" json:"user_id"`
	Rating       int        `gorm:"not null;min:1;max:5" json:"rating"`
	Title        string     `gorm:"type:text" json:"title"`
	Comment      string     `gorm:"type:text" json:"comment"`
	HelpfulCount int        `gorm:"default:0" json:"helpful_count"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (DealerReview) TableName() string {
	return "dealer_reviews"
}
