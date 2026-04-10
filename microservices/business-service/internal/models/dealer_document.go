package models

import (
	"time"

	"github.com/google/uuid"
)

// DealerDocument represents dealer verification documents
type DealerDocument struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	DealerID     uuid.UUID  `gorm:"type:uuid;not null" json:"dealer_id"`
	DocumentType string     `gorm:"type:text;not null" json:"document_type"`
	DocumentName string     `gorm:"type:text" json:"document_name"`
	DocumentURL  string     `gorm:"type:text;not null" json:"document_url"`
	Verified     bool       `gorm:"default:false" json:"verified"`
	ExpiresAt    *time.Time `json:"expires_at"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (DealerDocument) TableName() string {
	return "dealer_documents"
}
