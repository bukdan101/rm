package models

import (
	"time"

	"github.com/google/uuid"
)

// Notification represents a system notification
type Notification struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Type      string     `gorm:"type:varchar(50)" json:"type"` // message, offer, listing, system, payment
	Title     string     `gorm:"type:text" json:"title"`
	Body      string     `gorm:"type:text" json:"body"`
	Data      map[string]any `gorm:"type:jsonb;serializer:json" json:"data"`
	Icon      string     `gorm:"type:varchar(255)" json:"icon"`
	ImageURL  string     `gorm:"type:varchar(1000)" json:"image_url"`
	Link      string     `gorm:"type:varchar(1000)" json:"link"`
	CreatedAt time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (Notification) TableName() string {
	return "notifications"
}

// UserNotification represents a notification delivered to a specific user
type UserNotification struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID         uuid.UUID  `gorm:"type:uuid;index" json:"user_id"`
	NotificationID uuid.UUID  `gorm:"type:uuid;index" json:"notification_id"`
	IsRead         bool       `gorm:"default:false" json:"is_read"`
	ReadAt         *time.Time `json:"read_at"`
	Clicked        bool       `gorm:"default:false" json:"clicked"`
	ClickedAt      *time.Time `json:"clicked_at"`
	CreatedAt      time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (UserNotification) TableName() string {
	return "user_notifications"
}

// NotificationTemplate represents a template for generating notifications
type NotificationTemplate struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Type      string     `gorm:"type:varchar(50);uniqueIndex" json:"type"`
	Name      string     `gorm:"type:varchar(255)" json:"name"`
	Subject   string     `gorm:"type:text" json:"subject"`
	Body      string     `gorm:"type:text" json:"body"`
	Channels  string     `gorm:"type:varchar(50);default:'in_app'" json:"channels"` // push, email, sms, in_app
	IsActive  bool       `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}

func (NotificationTemplate) TableName() string {
	return "notification_templates"
}

// NotificationLog represents a log of sent notifications
type NotificationLog struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TemplateID   *uuid.UUID `gorm:"type:uuid" json:"template_id"`
	UserID       uuid.UUID  `gorm:"type:uuid;index" json:"user_id"`
	Channel      string     `gorm:"type:varchar(20)" json:"channel"` // push, email, sms
	Status       string     `gorm:"type:varchar(20);default:'pending'" json:"status"` // pending, sent, delivered, failed
	ErrorMessage string     `gorm:"type:text" json:"error_message"`
	SentAt       *time.Time `json:"sent_at"`
	DeliveredAt  *time.Time `json:"delivered_at"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (NotificationLog) TableName() string {
	return "notification_logs"
}
