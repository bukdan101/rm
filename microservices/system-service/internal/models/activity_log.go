package models

import (
	"time"

	"github.com/google/uuid"
)

// ActivityLog represents a user activity log entry
type ActivityLog struct {
	ID         uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID     uuid.UUID      `gorm:"type:uuid;index" json:"user_id"`
	Action     string         `gorm:"type:varchar(100);index" json:"action"`
	EntityType string         `gorm:"type:varchar(100);index" json:"entity_type"`
	EntityID   *uuid.UUID     `gorm:"type:uuid" json:"entity_id"`
	OldData    map[string]any `gorm:"type:jsonb;serializer:json" json:"old_data"`
	NewData    map[string]any `gorm:"type:jsonb;serializer:json" json:"new_data"`
	IPAddress  string         `gorm:"type:varchar(45)" json:"ip_address"`
	UserAgent  string         `gorm:"type:text" json:"user_agent"`
	CreatedAt  time.Time      `gorm:"autoCreateTime;index" json:"created_at"`
}

func (ActivityLog) TableName() string {
	return "activity_logs"
}
