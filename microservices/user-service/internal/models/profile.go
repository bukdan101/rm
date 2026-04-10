package models

import (
	"time"

	"github.com/google/uuid"
)

type Profile struct {
	ID            uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name          string     `gorm:"type:varchar(255);not null" json:"name"`
	Phone         string     `gorm:"type:varchar(20)" json:"phone,omitempty"`
	AvatarURL     string     `gorm:"type:text" json:"avatar_url,omitempty"`
	Role          string     `gorm:"type:varchar(50);not null;default:'user'" json:"role"` // user, dealer, admin, inspector
	EmailVerified bool       `gorm:"default:false" json:"email_verified"`
	PhoneVerified bool       `gorm:"default:false" json:"phone_verified"`
	IsActive      bool       `gorm:"default:true" json:"is_active"`
	LastLogin     *time.Time `gorm:"" json:"last_login,omitempty"`
	CreatedAt     time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt     time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}

func (Profile) TableName() string {
	return "profiles"
}
