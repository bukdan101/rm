package models

import (
	"time"

	"github.com/google/uuid"
)

// CarColor represents car color options
type CarColor struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name       string    `gorm:"type:varchar(100);not null" json:"name"`
	HexCode    string    `gorm:"type:varchar(10)" json:"hex_code"`
	IsMetallic bool      `gorm:"default:false" json:"is_metallic"`
	IsPopular  bool      `gorm:"default:false" json:"is_popular"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (CarColor) TableName() string { return "car_colors" }

// CarBodyType represents body type categories
type CarBodyType struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"type:varchar(100);not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	IconURL     string    `gorm:"type:text" json:"icon_url"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (CarBodyType) TableName() string { return "car_body_types" }

// CarFuelType represents fuel type options
type CarFuelType struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"type:varchar(100);not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	IconURL     string    `gorm:"type:text" json:"icon_url"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (CarFuelType) TableName() string { return "car_fuel_types" }

// CarTransmission represents transmission options
type CarTransmission struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"type:varchar(100);not null" json:"name"`
	Description string    `gorm:"type:text" json:"description"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (CarTransmission) TableName() string { return "car_transmissions" }

// Category represents listing categories
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

func (Category) TableName() string { return "categories" }

// FeatureCategory represents feature categories (e.g., Safety, Comfort, Entertainment)
type FeatureCategory struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"type:varchar(255);not null" json:"name"`
	Icon        string    `gorm:"type:varchar(255)" json:"icon"`
	DisplayOrder int       `gorm:"default:0" json:"display_order"`
	TotalItems  int       `gorm:"default:0" json:"total_items"`
	CreatedAt   time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (FeatureCategory) TableName() string { return "feature_categories" }

// FeatureGroup represents groups within a feature category
type FeatureGroup struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CategoryID   *uuid.UUID `gorm:"type:uuid;index" json:"category_id"`
	Name         string     `gorm:"type:varchar(255);not null" json:"name"`
	DisplayOrder int        `gorm:"default:0" json:"display_order"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (FeatureGroup) TableName() string { return "feature_groups" }

// FeatureItem represents individual features
type FeatureItem struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	GroupID      *uuid.UUID `gorm:"type:uuid;index" json:"group_id"`
	Name         string     `gorm:"type:varchar(255);not null" json:"name"`
	Description  string     `gorm:"type:text" json:"description"`
	Icon         string     `gorm:"type:varchar(255)" json:"icon"`
	DisplayOrder int        `gorm:"default:0" json:"display_order"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (FeatureItem) TableName() string { return "feature_items" }
