package models

import (
	"time"

	"github.com/google/uuid"
)

// CarVideo represents a video associated with a car listing (no foreign keys)
type CarVideo struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID uuid.UUID  `gorm:"type:uuid;index" json:"car_listing_id"`
	VideoURL     string     `gorm:"type:text;not null" json:"video_url"`
	ThumbnailURL *string    `gorm:"type:text" json:"thumbnail_url"`
	Title        *string    `gorm:"type:text" json:"title"`
	Duration     *int       `json:"duration"`
	IsPrimary    bool       `gorm:"default:false" json:"is_primary"`
	CreatedAt    time.Time  `json:"created_at"`
}

func (CarVideo) TableName() string {
	return "car_videos"
}
