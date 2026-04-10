package models

import (
	"time"

	"github.com/google/uuid"
)

// Notification represents a notification template/content.
type Notification struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Type       string    `gorm:"type:text;not null" json:"type"` // message, offer, listing, system, payment
	Title      string    `gorm:"type:text;not null" json:"title"`
	Body       string    `gorm:"type:text;not null" json:"body"`
	Data       *string   `gorm:"type:text" json:"data"` // JSON
	Icon       *string   `gorm:"type:text" json:"icon"`
	ImageURL   *string   `gorm:"type:text" json:"image_url"`
	Link       *string   `gorm:"type:text" json:"link"`
	CreatedAt  time.Time `json:"created_at"`
}

// UserNotification represents a notification sent to a specific user.
type UserNotification struct {
	ID              uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID          uuid.UUID  `gorm:"type:uuid;index" json:"user_id"`
	NotificationID  uuid.UUID  `gorm:"type:uuid;index" json:"notification_id"`
	IsRead          bool       `gorm:"default:false" json:"is_read"`
	ReadAt          *time.Time `json:"read_at"`
	Clicked         bool       `gorm:"default:false" json:"clicked"`
	ClickedAt       *time.Time `json:"clicked_at"`
	CreatedAt       time.Time  `json:"created_at"`

	Notification Notification `gorm:"foreignKey:NotificationID" json:"notification,omitempty"`
}

// NotificationTemplate represents a reusable notification template.
type NotificationTemplate struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Type      string    `gorm:"type:text;uniqueIndex;not null" json:"type"`
	Name      string    `gorm:"type:text;not null" json:"name"`
	Subject   *string   `gorm:"type:text" json:"subject"`
	Body      string    `gorm:"type:text;not null" json:"body"`
	Channels  *string   `gorm:"type:text" json:"channels"` // push, email, sms, in_app
	IsActive  bool      `gorm:"default:true" json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// NotificationLog tracks notification delivery status.
type NotificationLog struct {
	ID              uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TemplateID      *uuid.UUID `gorm:"type:uuid" json:"template_id"`
	UserID          uuid.UUID  `gorm:"type:uuid;index" json:"user_id"`
	Channel         string     `gorm:"type:text;not null" json:"channel"` // push, email, sms
	Status          string     `gorm:"type:text;default:'pending'" json:"status"` // pending, sent, delivered, failed
	ErrorMessage    *string    `gorm:"type:text" json:"error_message"`
	SentAt          *time.Time `json:"sent_at"`
	DeliveredAt     *time.Time `json:"delivered_at"`
	CreatedAt       time.Time  `json:"created_at"`
}

// Broadcast represents a broadcast notification to all users.
type Broadcast struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Title       string     `gorm:"type:text;not null" json:"title"`
	Body        string     `gorm:"type:text;not null" json:"body"`
	ImageURL    *string    `gorm:"type:text" json:"image_url"`
	Link        *string    `gorm:"type:text" json:"link"`
	Segment     *string    `gorm:"type:text" json:"segment"` // all, users, dealers, admins
	ScheduledAt *time.Time `json:"scheduled_at"`
	SentAt      *time.Time `json:"sent_at"`
	Status      string     `gorm:"type:text;default:'draft'" json:"status"` // draft, scheduled, sent, cancelled
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}
