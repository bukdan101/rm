package models

import (
	"time"

	"github.com/google/uuid"
)

// DealerBranch represents a dealer branch location
type DealerBranch struct {
	ID             uuid.UUID       `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	DealerID       uuid.UUID       `gorm:"type:uuid;index;not null" json:"dealer_id"`
	Name           string          `gorm:"type:text;not null" json:"name"`
	Address        string          `gorm:"type:text" json:"address"`
	CityID         *uuid.UUID      `gorm:"type:uuid" json:"city_id"`
	Phone          string          `gorm:"type:text" json:"phone"`
	OperatingHours jsonb           `gorm:"type:jsonb" json:"operating_hours"`
	IsMain         bool            `gorm:"default:false" json:"is_main"`
	CreatedAt      time.Time       `gorm:"autoCreateTime" json:"created_at"`
}

// jsonb is a custom type for PostgreSQL JSONB fields
type jsonb map[string]interface{}

func (DealerBranch) TableName() string {
	return "dealer_branches"
}
