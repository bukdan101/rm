package models

import (
	"time"

	"github.com/google/uuid"
)

// Order represents a purchase order
type Order struct {
	ID                 uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	OrderNumber        string     `gorm:"type:text;uniqueIndex;not null" json:"order_number"`
	BuyerID            uuid.UUID  `gorm:"type:uuid;index" json:"buyer_id"`
	SellerID           uuid.UUID  `gorm:"type:uuid;index" json:"seller_id"`
	CarListingID       uuid.UUID  `gorm:"type:uuid;index" json:"car_listing_id"`
	AgreedPrice        int64      `gorm:"type:bigint" json:"agreed_price"`
	PlatformFee        int64      `gorm:"type:bigint;default:0" json:"platform_fee"`
	SellerFee          int64      `gorm:"type:bigint;default:0" json:"seller_fee"`
	BuyerFee           int64      `gorm:"type:bigint;default:0" json:"buyer_fee"`
	TotalAmount        int64      `gorm:"type:bigint;default:0" json:"total_amount"`
	EscrowID           *uuid.UUID `gorm:"type:uuid" json:"escrow_id,omitempty"`
	EscrowStatus       string     `gorm:"type:text;default:'none'" json:"escrow_status"`
	ConfirmedAt        *time.Time `gorm:"" json:"confirmed_at,omitempty"`
	ProcessingAt       *time.Time `gorm:"" json:"processing_at,omitempty"`
	CompletedAt        *time.Time `gorm:"" json:"completed_at,omitempty"`
	CancelledAt        *time.Time `gorm:"" json:"cancelled_at,omitempty"`
	CancelledBy        *uuid.UUID `gorm:"type:uuid" json:"cancelled_by,omitempty"`
	CancellationReason string     `gorm:"type:text" json:"cancellation_reason,omitempty"`
	Notes              string     `gorm:"type:text" json:"notes,omitempty"`
	Status             string     `gorm:"type:text;default:'pending'" json:"status"`
	CreatedAt          time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt          time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}

func (Order) TableName() string {
	return "orders"
}

// OrderItem represents an item in an order
type OrderItem struct {
	ID         uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	OrderID    uuid.UUID `gorm:"type:uuid;index;not null" json:"order_id"`
	ItemType   string    `gorm:"type:text;default:'car'" json:"item_type"`
	ItemID     uuid.UUID `gorm:"type:uuid" json:"item_id"`
	ItemName   string    `gorm:"type:text" json:"item_name"`
	Quantity   int       `gorm:"type:int;default:1" json:"quantity"`
	UnitPrice  int64     `gorm:"type:bigint" json:"unit_price"`
	TotalPrice int64     `gorm:"type:bigint" json:"total_price"`
	Notes      string    `gorm:"type:text" json:"notes,omitempty"`
	CreatedAt  time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (OrderItem) TableName() string {
	return "order_items"
}
