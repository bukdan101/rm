package models

import (
	"time"

	"github.com/google/uuid"
)

type UserSession struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID  `gorm:"type:uuid;index" json:"user_id"`
	Token     string     `gorm:"type:text;not null" json:"token"`
	IPAddress string     `gorm:"type:varchar(45)" json:"ip_address"`
	UserAgent string     `gorm:"type:text" json:"user_agent"`
	ExpiresAt time.Time  `gorm:"not null" json:"expires_at"`
	CreatedAt time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (UserSession) TableName() string {
	return "user_sessions"
}
