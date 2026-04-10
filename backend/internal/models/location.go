package models

import (
	"time"

	"github.com/google/uuid"
)

// ============================================
// MODULE 2: LOCATION (4 tables)
// ============================================

type Country struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Code         string    `gorm:"type:text;uniqueIndex;not null" json:"code"`
	Name         string    `gorm:"type:text;not null" json:"name"`
	PhoneCode    *string   `gorm:"type:text" json:"phone_code"`
	CurrencyCode *string   `gorm:"type:text" json:"currency_code"`
	CurrencyName *string   `gorm:"type:text" json:"currency_name"`
	IsActive     bool      `gorm:"default:true" json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	// Relations
	Provinces []Province `gorm:"foreignKey:CountryID" json:"provinces,omitempty"`
}

type Province struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CountryID *uuid.UUID `gorm:"type:uuid;index" json:"country_id"`
	Code      string    `gorm:"type:text;uniqueIndex" json:"code"`
	Name      string    `gorm:"type:text;not null" json:"name"`
	IsActive  bool      `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	// Relations
	Cities []City `gorm:"foreignKey:ProvinceID" json:"cities,omitempty"`
}

type City struct {
	ID         uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ProvinceID *uuid.UUID `gorm:"type:uuid;index" json:"province_id"`
	Name       string     `gorm:"type:text;not null" json:"name"`
	Type       *string    `gorm:"type:text;check:type IN ('kota','kabupaten')" json:"type"`
	Latitude   *float64   `json:"latitude"`
	Longitude  *float64   `json:"longitude"`
	IsActive   bool       `gorm:"default:true" json:"is_active"`
	CreatedAt  time.Time  `json:"created_at"`
	// Relations
	Districts []District `gorm:"foreignKey:CityID" json:"districts,omitempty"`
}

type District struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CityID    *uuid.UUID `gorm:"type:uuid;index" json:"city_id"`
	Name      string     `gorm:"type:text;not null" json:"name"`
	PostalCode *string   `gorm:"type:text" json:"postal_code"`
	Latitude  *float64   `json:"latitude"`
	Longitude *float64   `json:"longitude"`
	IsActive  bool       `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time  `json:"created_at"`
}
