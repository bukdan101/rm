package models

import (
	"time"

	"github.com/google/uuid"
)

type CarImage struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID *uuid.UUID `gorm:"type:uuid;index" json:"car_listing_id"`
	ImageURL     string     `gorm:"type:text;not null" json:"image_url"`
	ThumbnailURL string     `gorm:"type:text" json:"thumbnail_url"`
	Caption      string     `gorm:"type:varchar(255)" json:"caption"`
	IsPrimary    bool       `gorm:"default:false" json:"is_primary"`
	DisplayOrder int        `gorm:"default:0" json:"display_order"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (CarImage) TableName() string {
	return "car_images"
}

type CarVideo struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID *uuid.UUID `gorm:"type:uuid;index" json:"car_listing_id"`
	VideoURL     string     `gorm:"type:text;not null" json:"video_url"`
	ThumbnailURL string     `gorm:"type:text" json:"thumbnail_url"`
	Title        string     `gorm:"type:varchar(255)" json:"title"`
	Duration     int        `gorm:"default:0" json:"duration"`
	IsPrimary    bool       `gorm:"default:false" json:"is_primary"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (CarVideo) TableName() string {
	return "car_videos"
}
