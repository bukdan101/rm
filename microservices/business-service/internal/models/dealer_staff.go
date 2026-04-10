package models

import (
	"time"

	"github.com/google/uuid"
)

// DealerStaff represents staff members of a dealer
type DealerStaff struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	DealerID  uuid.UUID  `gorm:"type:uuid;index;not null" json:"dealer_id"`
	UserID    *uuid.UUID `gorm:"type:uuid" json:"user_id"`
	Role      string     `gorm:"type:text;not null;default:'sales'" json:"role"` // owner, manager, sales, inspector
	CanEdit   bool       `gorm:"default:false" json:"can_edit"`
	CanDelete bool       `gorm:"default:false" json:"can_delete"`
	CreatedAt time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (DealerStaff) TableName() string {
	return "dealer_staff"
}
