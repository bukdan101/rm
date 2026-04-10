package models

import (
	"time"

	"github.com/google/uuid"
)

// TokenPackage represents a purchasable token package
type TokenPackage struct {
	ID                uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name              string    `gorm:"type:text;not null" json:"name"`
	Description       string    `gorm:"type:text" json:"description"`
	Tokens            int       `gorm:"type:int;not null" json:"tokens"`
	Price             int       `gorm:"type:int;not null" json:"price"`
	DiscountPercentage float64  `gorm:"type:numeric;default:0" json:"discount_percentage"`
	BonusTokens       int       `gorm:"type:int;default:0" json:"bonus_tokens"`
	IsPopular         bool      `gorm:"default:false" json:"is_popular"`
	IsActive          bool      `gorm:"default:true" json:"is_active"`
	DisplayOrder      int       `gorm:"type:int;default:0" json:"display_order"`
	CreatedAt         time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (TokenPackage) TableName() string {
	return "token_packages"
}

// TokenSetting represents global token system settings
type TokenSetting struct {
	ID                    uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TokenPriceBase        int       `gorm:"type:int;default:1000" json:"token_price_base"`
	AIPredictionTokens    int       `gorm:"type:int;default:5" json:"ai_prediction_tokens"`
	ListingNormalTokens   int       `gorm:"type:int;default:10" json:"listing_normal_tokens"`
	ListingDealerTokens   int       `gorm:"type:int;default:20" json:"listing_dealer_tokens"`
	DealerContactTokens   int       `gorm:"type:int;default:5" json:"dealer_contact_tokens"`
	BoostTokens           int       `gorm:"type:int;default:3" json:"boost_tokens"`
	IsActive              bool      `gorm:"default:true" json:"is_active"`
	CreatedAt             time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (TokenSetting) TableName() string {
	return "token_settings"
}

// TokenTransaction represents a token balance transaction
type TokenTransaction struct {
	ID               uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TransactionNumber string   `gorm:"type:text;uniqueIndex;not null" json:"transaction_number"`
	UserID           uuid.UUID `gorm:"type:uuid;index" json:"user_id"`
	DealerID         *uuid.UUID `gorm:"type:uuid" json:"dealer_id,omitempty"`
	TransactionType  string    `gorm:"type:text;not null" json:"transaction_type"` // purchase, usage, bonus, topup, refund, adjustment
	Amount           int       `gorm:"type:int;not null" json:"amount"`
	BalanceBefore    int       `gorm:"type:int;not null" json:"balance_before"`
	BalanceAfter     int       `gorm:"type:int;not null" json:"balance_after"`
	ReferenceType    string    `gorm:"type:text" json:"reference_type,omitempty"`
	ReferenceID      *uuid.UUID `gorm:"type:uuid" json:"reference_id,omitempty"`
	Description      string    `gorm:"type:text" json:"description,omitempty"`
	CreatedAt        time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (TokenTransaction) TableName() string {
	return "token_transactions"
}

// TopupRequest represents a token topup request from user
type TopupRequest struct {
	ID               uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TopupNumber      string     `gorm:"type:text;uniqueIndex;not null" json:"topup_number"`
	UserID           uuid.UUID  `gorm:"type:uuid;index" json:"user_id"`
	DealerID         *uuid.UUID `gorm:"type:uuid" json:"dealer_id,omitempty"`
	Amount           float64    `gorm:"type:numeric" json:"amount"`
	Tokens           int        `gorm:"type:int" json:"tokens"`
	PaymentProofURL  string     `gorm:"type:text" json:"payment_proof_url,omitempty"`
	PaymentMethod    string     `gorm:"type:text" json:"payment_method,omitempty"`
	Status           string     `gorm:"type:text;default:'pending'" json:"status"` // pending, approved, rejected
	RejectionReason  string     `gorm:"type:text" json:"rejection_reason,omitempty"`
	ReviewedBy       *uuid.UUID `gorm:"type:uuid" json:"reviewed_by,omitempty"`
	CreatedAt        time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (TopupRequest) TableName() string {
	return "topup_requests"
}
