package models

import (
	"time"

	"github.com/google/uuid"
)

type UserToken struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID         uuid.UUID  `gorm:"type:uuid;uniqueIndex" json:"user_id"`
	Balance        int        `gorm:"default:0" json:"balance"`
	TotalPurchased int        `gorm:"default:0" json:"total_purchased"`
	TotalUsed      int        `gorm:"default:0" json:"total_used"`
	TotalBonus     int        `gorm:"default:0" json:"total_bonus"`
	CreatedAt      time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt      time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}

func (UserToken) TableName() string {
	return "user_tokens"
}
