package models

import (
	"time"

	"github.com/google/uuid"
)

type UserDocument struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID         uuid.UUID  `gorm:"type:uuid;index" json:"user_id"`
	DocumentType   string     `gorm:"type:varchar(20);not null" json:"document_type"` // ktp, sim, npwp, kk
	DocumentNumber string     `gorm:"type:varchar(50);not null" json:"document_number"`
	DocumentURL    string     `gorm:"type:text;not null" json:"document_url"`
	Verified       bool       `gorm:"default:false" json:"verified"`
	VerifiedAt     *time.Time `gorm:"" json:"verified_at,omitempty"`
	CreatedAt      time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (UserDocument) TableName() string {
	return "user_documents"
}
