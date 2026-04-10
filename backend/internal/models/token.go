package models

import (
	"time"

	"github.com/google/uuid"
)

// ============================================
// MODULE 7: TOKEN/CREDIT SYSTEM (6 tables)
// ============================================

type TokenPackage struct {
	ID                uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name              string    `gorm:"type:varchar(255);not null" json:"name"`
	Description       *string   `gorm:"type:text" json:"description"`
	Tokens            int       `gorm:"not null" json:"tokens"`
	Price             int       `gorm:"not null" json:"price"`
	DiscountPercentage *float64  `gorm:"type:numeric;default:0" json:"discount_percentage"`
	BonusTokens       int       `gorm:"default:0;column:bonus_tokens" json:"bonus_tokens"`
	IsPopular         bool      `gorm:"default:false;column:is_popular" json:"is_popular"`
	IsActive          bool      `gorm:"default:true;column:is_active" json:"is_active"`
	DisplayOrder      int       `gorm:"default:0;column:display_order" json:"display_order"`
	CreatedAt         time.Time `json:"created_at"`
}

type TokenSetting struct {
	ID                     uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TokenPriceBase         int       `gorm:"default:1000;column:token_price_base" json:"token_price_base"`
	AIPredictionTokens     int       `gorm:"default:5;column:ai_prediction_tokens" json:"ai_prediction_tokens"`
	ListingNormalTokens    int       `gorm:"default:10;column:listing_normal_tokens" json:"listing_normal_tokens"`
	ListingDealerTokens    int       `gorm:"default:20;column:listing_dealer_tokens" json:"listing_dealer_tokens"`
	DealerContactTokens    int       `gorm:"default:5;column:dealer_contact_tokens" json:"dealer_contact_tokens"`
	BoostTokens            int       `gorm:"default:3;column:boost_tokens" json:"boost_tokens"`
	IsActive               bool      `gorm:"default:true;column:is_active" json:"is_active"`
	CreatedAt              time.Time `json:"created_at"`
}

type TokenTransaction struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TransactionNumber *string `gorm:"type:text;uniqueIndex" json:"transaction_number"`
	UserID         *uuid.UUID `gorm:"type:uuid;index" json:"user_id"`
	DealerID       *uuid.UUID `gorm:"type:uuid" json:"dealer_id"`
	TransactionType *string   `gorm:"type:varchar(255)" json:"transaction_type"` // purchase, usage, bonus, admin_adjustment
	Amount         int        `gorm:"default:0" json:"amount"`
	BalanceBefore  *int       `gorm:"column:balance_before" json:"balance_before"`
	BalanceAfter   *int       `gorm:"column:balance_after" json:"balance_after"`
	ReferenceType  *string    `gorm:"type:varchar(255);column:reference_type" json:"reference_type"`
	ReferenceID    *uuid.UUID `gorm:"type:uuid;column:reference_id" json:"reference_id"`
	Description    *string    `gorm:"type:text" json:"description"`
	CreatedAt      time.Time  `json:"created_at"`
}

type UserToken struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID         *uuid.UUID `gorm:"type:uuid;uniqueIndex" json:"user_id"`
	DealerID       *uuid.UUID `gorm:"type:uuid" json:"dealer_id"`
	Balance        int        `gorm:"default:0" json:"balance"`
	TotalPurchased int        `gorm:"default:0;column:total_purchased" json:"total_purchased"`
	TotalUsed      int        `gorm:"default:0;column:total_used" json:"total_used"`
	TotalBonus     int        `gorm:"default:0;column:total_bonus" json:"total_bonus"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type TopupRequest struct {
	ID               uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TopupNumber      *string    `gorm:"type:text;uniqueIndex" json:"topup_number"`
	UserID           *uuid.UUID `gorm:"type:uuid" json:"user_id"`
	DealerID         *uuid.UUID `gorm:"type:uuid" json:"dealer_id"`
	Amount           float64    `gorm:"type:numeric;not null" json:"amount"`
	Tokens           int        `gorm:"default:0" json:"tokens"`
	PaymentProofURL  *string    `gorm:"type:text;column:payment_proof_url" json:"payment_proof_url"`
	PaymentMethod    *string    `gorm:"type:varchar(255);column:payment_method" json:"payment_method"`
	Status           string     `gorm:"type:varchar(255);default:'pending'" json:"status"` // pending, approved, rejected
	RejectionReason  *string    `gorm:"type:text" json:"rejection_reason"`
	ReviewedBy       *uuid.UUID `json:"reviewed_by"`
	CreatedAt        time.Time  `json:"created_at"`
}

type BoostSetting struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	BoostType      string     `gorm:"type:varchar(255);not null" json:"boost_type"` // highlight, top_search, featured
	Name           string     `gorm:"type:varchar(255);not null" json:"name"`
	Description    *string    `gorm:"type:text" json:"description"`
	PriceTokens    int        `gorm:"not null;column:price_tokens" json:"price_tokens"`
	DurationDays   int        `gorm:"default:7;column:duration_days" json:"duration_days"`
	IsActive       bool       `gorm:"default:true;column:is_active" json:"is_active"`
	CreatedAt      time.Time  `json:"created_at"`
}
