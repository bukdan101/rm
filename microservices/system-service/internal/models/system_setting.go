package models

import (
	"time"

	"github.com/google/uuid"
)

// SystemSetting represents a key-value system setting
type SystemSetting struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Key       string     `gorm:"type:varchar(255);uniqueIndex" json:"key"`
	Value     string     `gorm:"type:text" json:"value"`
	Type      string     `gorm:"type:varchar(20);default:'string'" json:"type"` // string, number, boolean, json
	Group     string     `gorm:"type:varchar(100);index" json:"group"`
	CreatedAt time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}

func (SystemSetting) TableName() string {
	return "system_settings"
}
