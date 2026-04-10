package models

import (
	"time"

	"github.com/google/uuid"
)

type UserVerification struct {
	ID              uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID          uuid.UUID  `gorm:"type:uuid;index" json:"user_id"`
	VerificationType string    `gorm:"type:varchar(20);not null" json:"verification_type"` // email, phone, kyc
	Code            string     `gorm:"type:varchar(10);not null" json:"code"`
	Verified        bool       `gorm:"default:false" json:"verified"`
	ExpiresAt       time.Time  `gorm:"not null" json:"expires_at"`
	CreatedAt       time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (UserVerification) TableName() string {
	return "user_verifications"
}
