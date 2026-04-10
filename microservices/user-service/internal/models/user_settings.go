package models

import (
	"time"

	"github.com/google/uuid"
)

type UserSettings struct {
	ID                  uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID              uuid.UUID `gorm:"type:uuid;index" json:"user_id"`
	EmailNotifications  bool      `gorm:"default:true" json:"email_notifications"`
	PushNotifications   bool      `gorm:"default:true" json:"push_notifications"`
	SmsNotifications    bool      `gorm:"default:false" json:"sms_notifications"`
	Language            string    `gorm:"type:varchar(10);default:'id'" json:"language"`
	Currency            string    `gorm:"type:varchar(10);default:'IDR'" json:"currency"`
	CreatedAt           time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt           time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

func (UserSettings) TableName() string {
	return "user_settings"
}
