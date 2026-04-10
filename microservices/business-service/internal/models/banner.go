package models

import (
	"time"

	"github.com/google/uuid"
)

// Banner represents a promotional banner
type Banner struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Title     string     `gorm:"type:text;not null" json:"title"`
	Subtitle  string     `gorm:"type:text" json:"subtitle"`
	ImageURL  string     `gorm:"type:text;not null" json:"image_url"`
	Link      string     `gorm:"type:text" json:"link"`
	Position  string     `gorm:"type:text;default:'home'" json:"position"` // home, listing, dealer
	SortOrder int        `gorm:"default:0" json:"sort_order"`
	IsActive  bool       `gorm:"default:true" json:"is_active"`
	ClickCount int       `gorm:"default:0" json:"click_count"`
	ViewCount int        `gorm:"default:0" json:"view_count"`
	StartDate *time.Time `json:"start_date"`
	EndDate   *time.Time `json:"end_date"`
	CreatedAt time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}

func (Banner) TableName() string {
	return "banners"
}
