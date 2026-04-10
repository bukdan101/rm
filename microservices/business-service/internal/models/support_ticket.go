package models

import (
	"time"

	"github.com/google/uuid"
)

// SupportTicket represents a customer support ticket
type SupportTicket struct {
	ID         uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID     uuid.UUID  `gorm:"type:uuid;index;not null" json:"user_id"`
	Subject    string     `gorm:"type:text;not null" json:"subject"`
	Category   string     `gorm:"type:text;default:'general'" json:"category"` // general, payment, listing, account, dealer
	Priority   string     `gorm:"type:text;default:'normal'" json:"priority"` // low, normal, high, urgent
	Status     string     `gorm:"type:text;default:'open'" json:"status"`     // open, in_progress, waiting, resolved, closed
	AssignedTo *uuid.UUID `gorm:"type:uuid" json:"assigned_to"`
	ResolvedAt *time.Time `json:"resolved_at"`
	CreatedAt  time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt  time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}

func (SupportTicket) TableName() string {
	return "support_tickets"
}

// SupportTicketMessage represents a message within a support ticket
type SupportTicketMessage struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TicketID  uuid.UUID  `gorm:"type:uuid;index;not null" json:"ticket_id"`
	SenderID  uuid.UUID  `gorm:"type:uuid;index;not null" json:"sender_id"`
	IsAdmin   bool       `gorm:"default:false" json:"is_admin"`
	Message   string     `gorm:"type:text;not null" json:"message"`
	CreatedAt time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (SupportTicketMessage) TableName() string {
	return "support_ticket_messages"
}
