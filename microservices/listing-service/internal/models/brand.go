package models

import (
	"time"

	"github.com/google/uuid"
)

type Brand struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name        string     `gorm:"type:text;not null" json:"name"`
	Slug        string     `gorm:"type:text;uniqueIndex;not null" json:"slug"`
	LogoURL     string     `gorm:"type:text" json:"logo_url"`
	Country     string     `gorm:"type:varchar(100)" json:"country"`
	IsPopular   bool       `gorm:"default:false" json:"is_popular"`
	DisplayOrder int       `gorm:"default:0" json:"display_order"`
	CreatedAt   time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (Brand) TableName() string {
	return "brands"
}

type CarModel struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	BrandID     *uuid.UUID `gorm:"type:uuid;index" json:"brand_id"`
	Name        string     `gorm:"type:text;not null" json:"name"`
	Slug        string     `gorm:"type:text" json:"slug"`
	BodyType    string     `gorm:"type:varchar(50)" json:"body_type"`
	IsPopular   bool       `gorm:"default:false" json:"is_popular"`
	DisplayOrder int       `gorm:"default:0" json:"display_order"`
	CreatedAt   time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (CarModel) TableName() string {
	return "car_models"
}

type CarVariant struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ModelID        *uuid.UUID `gorm:"type:uuid;index" json:"model_id"`
	Name           string     `gorm:"type:text;not null" json:"name"`
	EngineCapacity int        `gorm:"" json:"engine_capacity"`
	Transmission   string     `gorm:"type:varchar(50)" json:"transmission"`
	FuelType       string     `gorm:"type:varchar(50)" json:"fuel_type"`
	SeatCount      int        `gorm:"" json:"seat_count"`
	PriceNew       int64      `gorm:"" json:"price_new"`
	CreatedAt      time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (CarVariant) TableName() string {
	return "car_variants"
}
