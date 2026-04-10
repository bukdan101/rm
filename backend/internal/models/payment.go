package models

import (
	"time"

	"github.com/google/uuid"
)

// ============================================
// MODULE 8: PAYMENT & ORDERS (11 tables)
// ============================================

type Payment struct {
	ID               uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	PaymentNumber    *string    `gorm:"type:text;uniqueIndex" json:"payment_number"`
	OrderID          *uuid.UUID `gorm:"type:uuid;index" json:"order_id"`
	PayerID          *uuid.UUID `gorm:"type:uuid" json:"payer_id"`
	PayeeID          *uuid.UUID `gorm:"type:uuid" json:"payee_id"`
	Amount           *int64     `gorm:"type:bigint" json:"amount"`
	Currency         string     `gorm:"type:text;default:'IDR'" json:"currency"`
	PaymentMethod    *string    `gorm:"type:text;column:payment_method" json:"payment_method"`
	PaymentProvider  *string    `gorm:"type:text;column:payment_provider" json:"payment_provider"`
	ProviderReference *string   `gorm:"type:text;column:provider_reference" json:"provider_reference"`
	PlatformFee      *int64     `gorm:"type:bigint;default:0" json:"platform_fee"`
	ProcessingFee    *int64     `gorm:"type:bigint;default:0" json:"processing_fee"`
	PaidAt           *time.Time `json:"paid_at"`
	FailedAt         *time.Time `json:"failed_at"`
	RefundedAt       *time.Time `json:"refunded_at"`
	FailureReason    *string    `gorm:"type:text;column:failure_reason" json:"failure_reason"`
	CreatedAt        time.Time  `json:"created_at"`
}

type PaymentMethod struct {
	ID            uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID        *uuid.UUID `gorm:"type:uuid" json:"user_id"`
	MethodType    *string    `gorm:"type:text;check:method_type IN ('bank_transfer','credit_card','debit_card','ewallet','va')" json:"method_type"`
	Provider      *string    `gorm:"type:text" json:"provider"`
	AccountNumber *string    `gorm:"type:text;column:account_number" json:"account_number"`
	AccountName   *string    `gorm:"type:text;column:account_name" json:"account_name"`
	IsDefault     bool       `gorm:"default:false;column:is_default" json:"is_default"`
	IsVerified    bool       `gorm:"default:false;column:is_verified" json:"is_verified"`
	CreatedAt     time.Time  `json:"created_at"`
}

type Transaction struct {
	ID               uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TransactionNumber *string   `gorm:"type:text;uniqueIndex" json:"transaction_number"`
	OrderID          *uuid.UUID `gorm:"type:uuid;index" json:"order_id"`
	PaymentID        *uuid.UUID `gorm:"type:uuid" json:"payment_id"`
	TransactionType  *string    `gorm:"type:text;check:transaction_type IN ('payment','refund','release','fee','adjustment')" json:"transaction_type"`
	Amount           *int64     `gorm:"type:bigint" json:"amount"`
	FromAccount      *uuid.UUID `json:"from_account"`
	ToAccount        *uuid.UUID `json:"to_account"`
	Description      *string    `gorm:"type:text" json:"description"`
	CreatedAt        time.Time  `json:"created_at"`
}

type Invoice struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	InvoiceNumber  *string    `gorm:"type:text;uniqueIndex" json:"invoice_number"`
	OrderID        *uuid.UUID `gorm:"type:uuid" json:"order_id"`
	UserID         *uuid.UUID `gorm:"type:uuid" json:"user_id"`
	Items          *string    `gorm:"type:jsonb" json:"items"`
	Subtotal       *int64     `gorm:"type:bigint" json:"subtotal"`
	Taxes          *int64     `gorm:"type:bigint;default:0" json:"taxes"`
	Fees           *int64     `gorm:"type:bigint;default:0" json:"fees"`
	Discounts      *int64     `gorm:"type:bigint;default:0" json:"discounts"`
	Total          *int64     `gorm:"type:bigint" json:"total"`
	Status         *string    `gorm:"type:text;check:status IN ('draft','sent','paid','cancelled')" json:"status"`
	IssuedAt       *time.Time `json:"issued_at"`
	DueAt          *time.Time `json:"due_at"`
	PaidAt         *time.Time `json:"paid_at"`
	InvoiceURL     *string    `gorm:"type:text;column:invoice_url" json:"invoice_url"`
	CreatedAt      time.Time  `json:"created_at"`
}

type Order struct {
	ID                uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	OrderNumber       *string    `gorm:"type:text;uniqueIndex" json:"order_number"`
	BuyerID           *uuid.UUID `gorm:"type:uuid" json:"buyer_id"`
	SellerID          *uuid.UUID `gorm:"type:uuid" json:"seller_id"`
	CarListingID      *uuid.UUID `gorm:"type:uuid" json:"car_listing_id"`
	AgreedPrice       *int64     `gorm:"type:bigint" json:"agreed_price"`
	PlatformFee       *int64     `gorm:"type:bigint" json:"platform_fee"`
	SellerFee         *int64     `gorm:"type:bigint" json:"seller_fee"`
	BuyerFee          *int64     `gorm:"type:bigint" json:"buyer_fee"`
	TotalAmount       *int64     `gorm:"type:bigint" json:"total_amount"`
	EscrowID          *uuid.UUID `gorm:"type:uuid" json:"escrow_id"`
	EscrowStatus      *string    `gorm:"type:text" json:"escrow_status"`
	ConfirmedAt       *time.Time `json:"confirmed_at"`
	ProcessingAt      *time.Time `json:"processing_at"`
	CompletedAt       *time.Time `json:"completed_at"`
	CancelledAt       *time.Time `json:"cancelled_at"`
	CancelledBy       *uuid.UUID `json:"cancelled_by"`
	CancellationReason *string  `gorm:"type:text" json:"cancellation_reason"`
	Notes             *string    `gorm:"type:text" json:"notes"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
	// Relations
	Items []OrderItem `gorm:"foreignKey:OrderID" json:"items,omitempty"`
}

type OrderItem struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	OrderID     *uuid.UUID `gorm:"type:uuid;index" json:"order_id"`
	ItemType    *string    `gorm:"type:text;default:'car'" json:"item_type"`
	ItemID      *uuid.UUID `gorm:"type:uuid" json:"item_id"`
	ItemName    *string    `gorm:"type:text" json:"item_name"`
	Quantity    int        `gorm:"default:1" json:"quantity"`
	UnitPrice   *int64     `gorm:"type:bigint" json:"unit_price"`
	TotalPrice  *int64     `gorm:"type:bigint" json:"total_price"`
	Notes       *string    `gorm:"type:text" json:"notes"`
	CreatedAt   time.Time  `json:"created_at"`
}

type EscrowAccount struct {
	ID                   uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	OrderID              *uuid.UUID `gorm:"type:uuid" json:"order_id"`
	BuyerID              *uuid.UUID `gorm:"type:uuid" json:"buyer_id"`
	SellerID             *uuid.UUID `gorm:"type:uuid" json:"seller_id"`
	AmountHeld           *int64     `gorm:"type:bigint" json:"amount_held"`
	ReleaseAmount        *int64     `gorm:"type:bigint" json:"release_amount"`
	Status               *string    `gorm:"type:text;check:status IN ('pending','held','released','refunded','disputed')" json:"status"`
	HeldAt               *time.Time `json:"held_at"`
	ReleaseScheduledAt   *time.Time `json:"release_scheduled_at"`
	ReleasedAt           *time.Time `json:"released_at"`
	RefundedAt           *time.Time `json:"refunded_at"`
	ReleaseConditions    *string    `gorm:"type:jsonb" json:"release_conditions"`
	CreatedAt            time.Time  `json:"created_at"`
}

type Refund struct {
	ID            uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	RefundNumber  *string    `gorm:"type:text;uniqueIndex" json:"refund_number"`
	OrderID       *uuid.UUID `gorm:"type:uuid" json:"order_id"`
	PaymentID     *uuid.UUID `gorm:"type:uuid" json:"payment_id"`
	Amount        *int64     `gorm:"type:bigint" json:"amount"`
	Reason        *string    `gorm:"type:text" json:"reason"`
	ProcessedAt   *time.Time `json:"processed_at"`
	CompletedAt   *time.Time `json:"completed_at"`
	CreatedAt     time.Time  `json:"created_at"`
}

type Withdrawal struct {
	ID                 uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	WithdrawalNumber   *string    `gorm:"type:text;uniqueIndex" json:"withdrawal_number"`
	UserID             *uuid.UUID `gorm:"type:uuid" json:"user_id"`
	Amount             float64    `gorm:"type:numeric;not null" json:"amount"`
	BankName           string     `gorm:"type:varchar(255);not null;column:bank_name" json:"bank_name"`
	BankAccountNumber  string     `gorm:"type:varchar(255);not null;column:bank_account_number" json:"bank_account_number"`
	Status             string     `gorm:"type:varchar(255);default:'pending'" json:"status"` // pending, approved, rejected, completed
	CreatedAt          time.Time  `json:"created_at"`
}

type FeeSetting struct {
	ID               uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	PlatformFeePercent *float64 `gorm:"type:numeric;default:2.5" json:"platform_fee_percent"`
	TransactionFee   *float64  `gorm:"type:numeric;default:5000" json:"transaction_fee"`
	WithdrawalFee    *float64  `gorm:"type:numeric;default:10000" json:"withdrawal_fee"`
	MinWithdrawal    *float64  `gorm:"type:numeric;default:50000" json:"min_withdrawal"`
	CreatedAt        time.Time `json:"created_at"`
}

type Coupon struct {
	ID            uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Code          string     `gorm:"type:varchar(255);uniqueIndex;not null" json:"code"`
	Name          string     `gorm:"type:varchar(255);not null" json:"name"`
	Description   *string    `gorm:"type:text" json:"description"`
	DiscountType  string     `gorm:"type:varchar(255);not null;column:discount_type" json:"discount_type"`
	DiscountValue float64    `gorm:"type:numeric;not null" json:"discount_value"`
	UsageLimit    *int       `json:"usage_limit"`
	UsedCount     int        `gorm:"default:0;column:used_count" json:"used_count"`
	IsActive      bool       `gorm:"default:true;column:is_active" json:"is_active"`
	CreatedAt     time.Time  `json:"created_at"`
}
