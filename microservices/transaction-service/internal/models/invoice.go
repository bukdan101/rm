package models

import (
	"time"

	"github.com/google/uuid"
)

// Invoice represents a billing invoice
type Invoice struct {
	ID          uuid.UUID       `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	InvoiceNumber string        `gorm:"type:text;uniqueIndex;not null" json:"invoice_number"`
	OrderID     *uuid.UUID      `gorm:"type:uuid;index" json:"order_id,omitempty"`
	UserID      uuid.UUID       `gorm:"type:uuid;index" json:"user_id"`
	Items       string          `gorm:"type:jsonb;default:'[]'" json:"items"`
	Subtotal    int64           `gorm:"type:bigint;default:0" json:"subtotal"`
	Taxes       int64           `gorm:"type:bigint;default:0" json:"taxes"`
	Fees        int64           `gorm:"type:bigint;default:0" json:"fees"`
	Discounts   int64           `gorm:"type:bigint;default:0" json:"discounts"`
	Total       int64           `gorm:"type:bigint;default:0" json:"total"`
	Status      string          `gorm:"type:text;default:'draft'" json:"status"` // draft, sent, paid, cancelled
	IssuedAt    *time.Time      `gorm:"" json:"issued_at,omitempty"`
	DueAt       *time.Time      `gorm:"" json:"due_at,omitempty"`
	PaidAt      *time.Time      `gorm:"" json:"paid_at,omitempty"`
	InvoiceURL  string          `gorm:"type:text" json:"invoice_url,omitempty"`
	CreatedAt   time.Time       `gorm:"autoCreateTime" json:"created_at"`
}

func (Invoice) TableName() string {
	return "invoices"
}
