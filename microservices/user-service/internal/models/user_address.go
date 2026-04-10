package models

import (
	"time"

	"github.com/google/uuid"
)

type UserAddress struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID  `gorm:"type:uuid;index" json:"user_id"`
	Label     string     `gorm:"type:varchar(100);not null;default:'Rumah'" json:"label"`
	Address   string     `gorm:"type:text;not null" json:"address"`
	CityID    *uuid.UUID `gorm:"type:uuid;index" json:"city_id,omitempty"`
	ProvinceID *uuid.UUID `gorm:"type:uuid;index" json:"province_id,omitempty"`
	PostalCode string     `gorm:"type:varchar(10)" json:"postal_code,omitempty"`
	IsPrimary bool       `gorm:"default:false" json:"is_primary"`
	CreatedAt time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (UserAddress) TableName() string {
	return "user_addresses"
}
