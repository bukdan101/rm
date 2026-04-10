package models

import (
	"time"

	"github.com/google/uuid"
)

// ============================================
// MODULE 3: VEHICLE MASTER DATA (12 tables)
// ============================================

type Brand struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"type:text;not null" json:"name"`
	Slug        *string   `gorm:"type:text;uniqueIndex" json:"slug"`
	LogoURL     *string   `gorm:"type:text" json:"logo_url"`
	Country     *string   `gorm:"type:text" json:"country"`
	IsPopular   bool      `gorm:"default:false" json:"is_popular"`
	DisplayOrder int      `gorm:"default:0" json:"display_order"`
	CreatedAt   time.Time `json:"created_at"`
	// Relations
	Models []CarModel `gorm:"foreignKey:BrandID" json:"models,omitempty"`
}

type CarModel struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	BrandID      *uuid.UUID `gorm:"type:uuid;index" json:"brand_id"`
	Name         string    `gorm:"type:text;not null" json:"name"`
	Slug         *string   `gorm:"type:text" json:"slug"`
	BodyType     *string   `gorm:"type:text" json:"body_type"`
	IsPopular    bool      `gorm:"default:false" json:"is_popular"`
	DisplayOrder int       `gorm:"default:0" json:"display_order"`
	CreatedAt    time.Time `json:"created_at"`
	// Relations
	Variants    []CarVariant    `gorm:"foreignKey:ModelID" json:"variants,omitempty"`
	Generations []CarGeneration `gorm:"foreignKey:ModelID" json:"generations,omitempty"`
}

type CarVariant struct {
	ID              uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ModelID         *uuid.UUID `gorm:"type:uuid;index" json:"model_id"`
	Name            string    `gorm:"type:text;not null" json:"name"`
	EngineCapacity  *int      `json:"engine_capacity"`
	Transmission    *string   `gorm:"type:text" json:"transmission"`
	FuelType        *string   `gorm:"type:text" json:"fuel_type"`
	SeatCount       *int      `json:"seat_count"`
	PriceNew        *int64    `json:"price_new"`
	CreatedAt       time.Time `json:"created_at"`
}

type CarGeneration struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ModelID   *uuid.UUID `gorm:"type:uuid;index" json:"model_id"`
	Name      *string   `gorm:"type:text" json:"name"`
	YearStart *int      `json:"year_start"`
	YearEnd   *int      `json:"year_end"`
	CreatedAt time.Time `json:"created_at"`
}

type CarColor struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name       string    `gorm:"type:text;not null" json:"name"`
	HexCode    *string   `gorm:"type:text" json:"hex_code"`
	IsMetallic bool      `gorm:"default:false" json:"is_metallic"`
	IsPopular  bool      `gorm:"default:false" json:"is_popular"`
	CreatedAt  time.Time `json:"created_at"`
}

type CarBodyType struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"type:text;not null" json:"name"`
	Description *string   `gorm:"type:text" json:"description"`
	IconURL     *string   `gorm:"type:text" json:"icon_url"`
	CreatedAt   time.Time `json:"created_at"`
}

type CarFuelType struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"type:text;not null" json:"name"`
	Description *string   `gorm:"type:text" json:"description"`
	IconURL     *string   `gorm:"type:text" json:"icon_url"`
	CreatedAt   time.Time `json:"created_at"`
}

type CarTransmission struct {
	ID          uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"type:text;not null" json:"name"`
	Description *string   `gorm:"type:text" json:"description"`
	CreatedAt   time.Time `json:"created_at"`
}

type FeatureCategory struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name         string    `gorm:"type:text;not null" json:"name"`
	Icon         *string   `gorm:"type:text" json:"icon"`
	DisplayOrder int       `gorm:"default:0" json:"display_order"`
	CreatedAt    time.Time `json:"created_at"`
	// Relations
	Groups []FeatureGroup `gorm:"foreignKey:CategoryID" json:"groups,omitempty"`
}

type FeatureGroup struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CategoryID   *uuid.UUID `gorm:"type:uuid;index" json:"category_id"`
	Name         string    `gorm:"type:text;not null" json:"name"`
	DisplayOrder int       `gorm:"default:0" json:"display_order"`
	CreatedAt    time.Time `json:"created_at"`
	// Relations
	Items []FeatureItem `gorm:"foreignKey:GroupID" json:"items,omitempty"`
}

type FeatureItem struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	GroupID      *uuid.UUID `gorm:"type:uuid;index" json:"group_id"`
	Name         string    `gorm:"type:text;not null" json:"name"`
	Description  *string   `gorm:"type:text" json:"description"`
	Icon         *string   `gorm:"type:text" json:"icon"`
	DisplayOrder int       `gorm:"default:0" json:"display_order"`
	CreatedAt    time.Time `json:"created_at"`
}

type Category struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name         string     `gorm:"type:varchar(255);not null" json:"name"`
	Slug         string     `gorm:"type:varchar(255);uniqueIndex;not null" json:"slug"`
	Description  *string    `gorm:"type:text" json:"description"`
	IconURL      *string    `gorm:"type:text" json:"icon_url"`
	ParentID     *uuid.UUID `gorm:"type:uuid" json:"parent_id"`
	SortOrder    int        `gorm:"default:0" json:"sort_order"`
	IsActive     bool       `gorm:"default:true" json:"is_active"`
	IsFeatured   bool       `gorm:"default:false" json:"is_featured"`
	ListingCount int        `gorm:"default:0" json:"listing_count"`
	CreatedAt    time.Time  `json:"created_at"`
}
