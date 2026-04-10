package models

import (
	"time"

	"github.com/google/uuid"
)

// Broadcast represents a platform broadcast/notification
type Broadcast struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Title       string     `gorm:"type:text;not null" json:"title"`
	Body        string     `gorm:"type:text" json:"body"`
	ImageURL    string     `gorm:"type:text" json:"image_url"`
	Link        string     `gorm:"type:text" json:"link"`
	Segment     string     `gorm:"type:text;default:'all'" json:"segment"` // all, users, dealers, admins
	ScheduledAt *time.Time `json:"scheduled_at"`
	SentAt      *time.Time `json:"sent_at"`
	Status      string     `gorm:"type:text;default:'draft'" json:"status"` // draft, scheduled, sent, cancelled
	CreatedAt   time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}

func (Broadcast) TableName() string {
	return "broadcasts"
}
