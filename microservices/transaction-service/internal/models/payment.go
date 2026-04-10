package models

import (
	"time"

	"github.com/google/uuid"
)

// Payment represents a payment record
type Payment struct {
	ID                uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	PaymentNumber     string     `gorm:"type:text;uniqueIndex;not null" json:"payment_number"`
	OrderID           uuid.UUID  `gorm:"type:uuid;index;not null" json:"order_id"`
	PayerID           uuid.UUID  `gorm:"type:uuid;index" json:"payer_id"`
	PayeeID           uuid.UUID  `gorm:"type:uuid" json:"payee_id"`
	Amount            int64      `gorm:"type:bigint;not null" json:"amount"`
	Currency          string     `gorm:"type:text;default:'IDR'" json:"currency"`
	PaymentMethod     string     `gorm:"type:text" json:"payment_method"`
	PaymentProvider   string     `gorm:"type:text" json:"payment_provider"`
	ProviderReference string     `gorm:"type:text" json:"provider_reference"`
	PlatformFee       int64      `gorm:"type:bigint;default:0" json:"platform_fee"`
	ProcessingFee     int64      `gorm:"type:bigint;default:0" json:"processing_fee"`
	Status            string     `gorm:"type:text;default:'pending'" json:"status"`
	PaidAt            *time.Time `gorm:"" json:"paid_at,omitempty"`
	FailedAt          *time.Time `gorm:"" json:"failed_at,omitempty"`
	RefundedAt        *time.Time `gorm:"" json:"refunded_at,omitempty"`
	FailureReason     string     `gorm:"type:text" json:"failure_reason,omitempty"`
	CreatedAt         time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (Payment) TableName() string {
	return "payments"
}

// Transaction represents a financial transaction
type Transaction struct {
	ID               uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TransactionNumber string   `gorm:"type:text;uniqueIndex;not null" json:"transaction_number"`
	OrderID          uuid.UUID `gorm:"type:uuid;index" json:"order_id"`
	PaymentID        *uuid.UUID `gorm:"type:uuid" json:"payment_id,omitempty"`
	TransactionType  string    `gorm:"type:text;not null" json:"transaction_type"` // payment, refund, release, fee, adjustment
	Amount           int64     `gorm:"type:bigint;not null" json:"amount"`
	FromAccount      *uuid.UUID `gorm:"type:uuid" json:"from_account,omitempty"`
	ToAccount        *uuid.UUID `gorm:"type:uuid" json:"to_account,omitempty"`
	Description      string    `gorm:"type:text" json:"description,omitempty"`
	CreatedAt        time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (Transaction) TableName() string {
	return "transactions"
}

// Refund represents a refund record
type Refund struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	RefundNumber string     `gorm:"type:text;uniqueIndex;not null" json:"refund_number"`
	OrderID      uuid.UUID  `gorm:"type:uuid;index;not null" json:"order_id"`
	PaymentID    uuid.UUID  `gorm:"type:uuid" json:"payment_id"`
	Amount       int64      `gorm:"type:bigint;not null" json:"amount"`
	Reason       string     `gorm:"type:text" json:"reason"`
	Status       string     `gorm:"type:text;default:'pending'" json:"status"`
	ProcessedAt  *time.Time `gorm:"" json:"processed_at,omitempty"`
	CompletedAt  *time.Time `gorm:"" json:"completed_at,omitempty"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (Refund) TableName() string {
	return "refunds"
}
