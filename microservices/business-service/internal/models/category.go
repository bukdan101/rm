package models

import (
	"time"

	"github.com/google/uuid"
)

// Category represents a vehicle category
type Category struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name         string     `gorm:"type:varchar(255);not null" json:"name"`
	Slug         string     `gorm:"type:text;uniqueIndex;not null" json:"slug"`
	Description  string     `gorm:"type:text" json:"description"`
	IconURL      string     `gorm:"type:text" json:"icon_url"`
	ParentID     *uuid.UUID `gorm:"type:uuid" json:"parent_id"`
	SortOrder    int        `gorm:"default:0" json:"sort_order"`
	IsActive     bool       `gorm:"default:true" json:"is_active"`
	IsFeatured   bool       `gorm:"default:false" json:"is_featured"`
	ListingCount int        `gorm:"default:0" json:"listing_count"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (Category) TableName() string {
	return "categories"
}
