package models

import (
	"time"

	"github.com/google/uuid"
)

// ============================================
// MODULE 1: AUTH & USERS (7 tables)
// ============================================

type User struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name      *string   `gorm:"type:text" json:"name"`
	Email     *string   `gorm:"type:text;uniqueIndex" json:"email"`
	Phone     *string   `gorm:"type:text" json:"phone"`
	Role      string    `gorm:"type:text;default:'user'" json:"role"` // user, dealer, admin, inspector
	CreatedAt time.Time `json:"created_at"`
	// Relations
	Profile      *Profile      `gorm:"foreignKey:ID" json:"profile,omitempty"`
	Settings     *UserSettings `gorm:"foreignKey:UserID" json:"settings,omitempty"`
	Addresses    []UserAddress `gorm:"foreignKey:UserID" json:"addresses,omitempty"`
	Documents    []UserDocument `gorm:"foreignKey:UserID" json:"documents,omitempty"`
	Tokens       *UserToken    `gorm:"foreignKey:UserID" json:"tokens,omitempty"`
}

type Profile struct {
	ID            uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name          *string    `gorm:"type:text" json:"name"`
	Phone         *string    `gorm:"type:text" json:"phone"`
	AvatarURL     *string    `gorm:"type:text" json:"avatar_url"`
	Role          string     `gorm:"type:text;default:'user';check:role IN ('user','dealer','admin','inspector')" json:"role"`
	EmailVerified bool       `gorm:"default:false" json:"email_verified"`
	PhoneVerified bool       `gorm:"default:false" json:"phone_verified"`
	IsActive      bool       `gorm:"default:true" json:"is_active"`
	LastLogin     *time.Time `json:"last_login"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
	// Relations
	Dealer *Dealer `gorm:"foreignKey:OwnerID" json:"dealer,omitempty"`
}

type UserSettings struct {
	ID                 uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID             uuid.UUID `gorm:"type:uuid;uniqueIndex" json:"user_id"`
	EmailNotifications bool      `gorm:"default:true" json:"email_notifications"`
	PushNotifications  bool      `gorm:"default:true" json:"push_notifications"`
	SmsNotifications   bool      `gorm:"default:false" json:"sms_notifications"`
	Language           string    `gorm:"type:text;default:'id'" json:"language"`
	Currency           string    `gorm:"type:text;default:'IDR'" json:"currency"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

type UserSession struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID  `gorm:"type:uuid;index" json:"user_id"`
	Token     *string    `gorm:"type:text" json:"token"`
	IPAddress *string    `gorm:"type:text" json:"ip_address"`
	UserAgent *string    `gorm:"type:text" json:"user_agent"`
	ExpiresAt *time.Time `json:"expires_at"`
	CreatedAt time.Time  `json:"created_at"`
}

type UserVerification struct {
	ID              uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID          uuid.UUID  `gorm:"type:uuid;index" json:"user_id"`
	VerificationType string    `gorm:"type:text;check:verification_type IN ('email','phone','kyc')" json:"verification_type"`
	Code            *string    `gorm:"type:text" json:"code"`
	Verified        bool       `gorm:"default:false" json:"verified"`
	ExpiresAt       *time.Time `json:"expires_at"`
	CreatedAt       time.Time  `json:"created_at"`
}

type UserDocument struct {
	ID            uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID        uuid.UUID  `gorm:"type:uuid;index" json:"user_id"`
	DocumentType  string     `gorm:"type:text;check:document_type IN ('ktp','sim','npwp','kk')" json:"document_type"`
	DocumentNumber *string   `gorm:"type:text" json:"document_number"`
	DocumentURL   *string    `gorm:"type:text" json:"document_url"`
	Verified      bool       `gorm:"default:false" json:"verified"`
	VerifiedAt    *time.Time `json:"verified_at"`
	CreatedAt     time.Time  `json:"created_at"`
}

type UserAddress struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;index" json:"user_id"`
	Label     string    `gorm:"type:text;default:'Rumah'" json:"label"`
	Address   *string   `gorm:"type:text" json:"address"`
	CityID    *uuid.UUID `gorm:"type:uuid" json:"city_id"`
	ProvinceID *uuid.UUID `gorm:"type:uuid" json:"province_id"`
	PostalCode *string   `gorm:"type:text" json:"postal_code"`
	IsPrimary bool      `gorm:"default:false" json:"is_primary"`
	CreatedAt time.Time `json:"created_at"`
}
