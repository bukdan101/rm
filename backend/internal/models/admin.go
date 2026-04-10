package models

import (
	"time"

	"github.com/google/uuid"
)

// ActivityLog represents a system activity log entry.
type ActivityLog struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID     *uuid.UUID `gorm:"type:uuid;index" json:"user_id"`
	Action     string    `gorm:"type:text;not null" json:"action"` // create, update, delete, login, etc.
	EntityType string    `gorm:"type:text" json:"entity_type"` // listing, dealer, user, etc.
	EntityID   *uuid.UUID `gorm:"type:uuid" json:"entity_id"`
	OldData    *string   `gorm:"type:text" json:"old_data"` // JSON
	NewData    *string   `gorm:"type:text" json:"new_data"` // JSON
	IPAddress  *string   `gorm:"type:text" json:"ip_address"`
	UserAgent  *string   `gorm:"type:text" json:"user_agent"`
	CreatedAt  time.Time `json:"created_at"`
}

// Banner represents a promotional banner.
type Banner struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Title     string     `gorm:"type:text;not null" json:"title"`
	Subtitle  *string    `gorm:"type:text" json:"subtitle"`
	ImageURL  string     `gorm:"type:text;not null" json:"image_url"`
	Link      *string    `gorm:"type:text" json:"link"`
	Position  string     `gorm:"type:text;default:'home'" json:"position"` // home, listing, dealer
	SortOrder int        `gorm:"default:0" json:"sort_order"`
	IsActive  bool       `gorm:"default:true" json:"is_active"`
	ClickCount int       `gorm:"default:0" json:"click_count"`
	ViewCount int        `gorm:"default:0" json:"view_count"`
	StartDate *time.Time `json:"start_date"`
	EndDate   *time.Time `json:"end_date"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

// SystemSetting represents a system configuration setting.
type SystemSetting struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Key       string    `gorm:"type:text;uniqueIndex;not null" json:"key"`
	Value     string    `gorm:"type:text" json:"value"`
	Type      string    `gorm:"type:text;default:'string'" json:"type"` // string, number, boolean, json
	Group     *string   `gorm:"type:text" json:"group"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// SupportTicket represents a support ticket.
type SupportTicket struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID      uuid.UUID  `gorm:"type:uuid;index" json:"user_id"`
	Subject     string     `gorm:"type:text;not null" json:"subject"`
	Category    string     `gorm:"type:text;default:'general'" json:"category"` // general, payment, listing, account, dealer
	Priority    string     `gorm:"type:text;default:'normal'" json:"priority"` // low, normal, high, urgent
	Status      string     `gorm:"type:text;default:'open'" json:"status"` // open, in_progress, waiting, resolved, closed
	AssignedTo  *uuid.UUID `gorm:"type:uuid" json:"assigned_to"`
	ResolvedAt  *time.Time `json:"resolved_at"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`

	Messages []SupportTicketMessage `gorm:"foreignKey:TicketID" json:"messages,omitempty"`
}

// SupportTicketMessage represents a message within a support ticket.
type SupportTicketMessage struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TicketID  uuid.UUID `gorm:"type:uuid;index" json:"ticket_id"`
	SenderID  uuid.UUID `gorm:"type:uuid;index" json:"sender_id"`
	IsAdmin   bool      `gorm:"default:false" json:"is_admin"`
	Message   string    `gorm:"type:text;not null" json:"message"`
	CreatedAt time.Time `json:"created_at"`

	Ticket SupportTicket `gorm:"foreignKey:TicketID" json:"ticket,omitempty"`
}

// Report represents a user report (listing, dealer, user).
type Report struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ReporterID  uuid.UUID  `gorm:"type:uuid;index" json:"reporter_id"`
	EntityType  string     `gorm:"type:text;not null" json:"entity_type"` // listing, dealer, user, review
	EntityID    uuid.UUID  `gorm:"type:uuid;index" json:"entity_id"`
	Reason      string     `gorm:"type:text;not null" json:"reason"`
	Description *string    `gorm:"type:text" json:"description"`
	Status      string     `gorm:"type:text;default:'pending'" json:"status"` // pending, reviewed, resolved, dismissed
	ReviewedBy  *uuid.UUID `gorm:"type:uuid" json:"reviewed_by"`
	ReviewedAt  *time.Time `json:"reviewed_at"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

// KycVerification represents a KYC verification request.
type KycVerification struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID         uuid.UUID  `gorm:"type:uuid;uniqueIndex" json:"user_id"`
	FullName       *string    `gorm:"type:text" json:"full_name"`
	NIK            *string    `gorm:"type:text" json:"nik"`
	BirthPlace     *string    `gorm:"type:text" json:"birth_place"`
	BirthDate      *time.Time `json:"birth_date"`
	Gender         *string    `gorm:"type:text" json:"gender"`
	Address        *string    `gorm:"type:text" json:"address"`
	ProvinceID     *uuid.UUID `gorm:"type:uuid" json:"province_id"`
	CityID         *uuid.UUID `gorm:"type:uuid" json:"city_id"`
	DistrictID     *uuid.UUID `gorm:"type:uuid" json:"district_id"`
	VillageID      *uuid.UUID `gorm:"type:uuid" json:"village_id"`
	KTPPhotoURL    *string    `gorm:"type:text" json:"ktp_photo_url"`
	SelfiePhotoURL *string    `gorm:"type:text" json:"selfie_photo_url"`
	Status         string     `gorm:"type:text;default:'not_submitted'" json:"status"` // not_submitted, pending, approved, rejected
	RejectionReason *string   `gorm:"type:text" json:"rejection_reason"`
	VerifiedBy     *uuid.UUID `gorm:"type:uuid" json:"verified_by"`
	VerifiedAt     *time.Time `json:"verified_at"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}
