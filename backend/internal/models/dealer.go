package models

import (
	"time"

	"github.com/google/uuid"
)

// ============================================
// MODULE 6: DEALER SYSTEM (11 tables)
// ============================================

type Dealer struct {
	ID                uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	OwnerID           *uuid.UUID `gorm:"type:uuid;index" json:"owner_id"`
	Name              string     `gorm:"type:text;not null" json:"name"`
	Slug              *string    `gorm:"type:text;uniqueIndex" json:"slug"`
	Description       *string    `gorm:"type:text" json:"description"`
	LogoURL           *string    `gorm:"type:text;column:logo_url" json:"logo_url"`
	CoverURL          *string    `gorm:"type:text;column:cover_url" json:"cover_url"`
	Phone             *string    `gorm:"type:text" json:"phone"`
	Email             *string    `gorm:"type:text" json:"email"`
	Website           *string    `gorm:"type:text" json:"website"`
	Address           *string    `gorm:"type:text" json:"address"`
	CityID            *uuid.UUID `gorm:"type:uuid" json:"city_id"`
	ProvinceID        *uuid.UUID `gorm:"type:uuid" json:"province_id"`
	PostalCode        *string    `gorm:"type:text" json:"postal_code"`
	Rating            *float64   `gorm:"type:numeric" json:"rating"`
	ReviewCount       int        `gorm:"default:0;column:review_count" json:"review_count"`
	TotalListings     int        `gorm:"default:0;column:total_listings" json:"total_listings"`
	Verified          bool       `gorm:"default:false" json:"verified"`
	IsActive          bool       `gorm:"default:true;column:is_active" json:"is_active"`
	SubscriptionTier  string     `gorm:"type:text;default:'free';column:subscription_tier" json:"subscription_tier"`
	SubscriptionEndsAt *time.Time `json:"subscription_ends_at"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
	// Relations
	Owner    *Profile            `gorm:"foreignKey:OwnerID" json:"owner,omitempty"`
	Branches []DealerBranch      `gorm:"foreignKey:DealerID" json:"branches,omitempty"`
	Staff    []DealerStaff       `gorm:"foreignKey:DealerID" json:"staff,omitempty"`
	Reviews  []DealerReview      `gorm:"foreignKey:DealerID" json:"reviews,omitempty"`
	Offers   []DealerOffer       `gorm:"foreignKey:DealerID" json:"offers,omitempty"`
}

type DealerBranch struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	DealerID       *uuid.UUID `gorm:"type:uuid;index" json:"dealer_id"`
	Name           *string    `gorm:"type:text" json:"name"`
	Address        *string    `gorm:"type:text" json:"address"`
	CityID         *uuid.UUID `gorm:"type:uuid" json:"city_id"`
	Phone          *string    `gorm:"type:text" json:"phone"`
	OperatingHours *string    `gorm:"type:jsonb" json:"operating_hours"`
	IsMain         bool       `gorm:"default:false;column:is_main" json:"is_main"`
	CreatedAt      time.Time  `json:"created_at"`
}

type DealerStaff struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	DealerID  *uuid.UUID `gorm:"type:uuid;index" json:"dealer_id"`
	UserID    *uuid.UUID `gorm:"type:uuid" json:"user_id"`
	Role      string    `gorm:"type:text;default:'staff';check:role IN ('owner','manager','sales','inspector')" json:"role"`
	CanEdit   bool      `gorm:"default:false;column:can_edit" json:"can_edit"`
	CanDelete bool      `gorm:"default:false;column:can_delete" json:"can_delete"`
	CreatedAt time.Time `json:"created_at"`
}

type DealerDocument struct {
	ID            uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	DealerID      *uuid.UUID `gorm:"type:uuid" json:"dealer_id"`
	DocumentType  *string    `gorm:"type:text" json:"document_type"`
	DocumentName  *string    `gorm:"type:text" json:"document_name"`
	DocumentURL   *string    `gorm:"type:text" json:"document_url"`
	Verified      bool       `gorm:"default:false" json:"verified"`
	ExpiresAt     *time.Time `json:"expires_at"`
	CreatedAt     time.Time  `json:"created_at"`
}

type DealerInventory struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	DealerID       *uuid.UUID `gorm:"type:uuid;index" json:"dealer_id"`
	CarListingID   *uuid.UUID `gorm:"type:uuid" json:"car_listing_id"`
	Location       *string    `gorm:"type:text" json:"location"`
	StockStatus    *string    `gorm:"type:text;default:'available';column:stock_status" json:"stock_status"`
	Notes          *string    `gorm:"type:text" json:"notes"`
	CreatedAt      time.Time  `json:"created_at"`
}

type DealerReview struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	DealerID     *uuid.UUID `gorm:"type:uuid;index" json:"dealer_id"`
	UserID       *uuid.UUID `gorm:"type:uuid" json:"user_id"`
	Rating       int        `gorm:"check:rating >= 1 AND rating <= 5" json:"rating"`
	Title        *string    `gorm:"type:text" json:"title"`
	Comment      *string    `gorm:"type:text" json:"comment"`
	HelpfulCount int        `gorm:"default:0;column:helpful_count" json:"helpful_count"`
	CreatedAt    time.Time  `json:"created_at"`
}

type DealerMarketplaceSetting struct {
	ID                                  uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	TokenCostPublic                     int       `gorm:"default:1;column:token_cost_public" json:"token_cost_public"`
	TokenCostDealerMarketplace          int       `gorm:"default:2;column:token_cost_dealer_marketplace" json:"token_cost_dealer_marketplace"`
	TokenCostBoth                       int       `gorm:"default:3;column:token_cost_both" json:"token_cost_both"`
	DefaultOfferDurationHours           int       `gorm:"default:72;column:default_offer_duration_hours" json:"default_offer_duration_hours"`
	InspectionCost                      *int64    `gorm:"type:bigint;default:250000;column:inspection_cost" json:"inspection_cost"`
	InspectionRequiredForDealerMarketplace bool `gorm:"default:false;column:inspection_required_for_dealer_marketplace" json:"inspection_required_for_dealer_marketplace"`
	PlatformFeePercentage               *float64  `gorm:"type:numeric;default:0;column:platform_fee_percentage" json:"platform_fee_percentage"`
	PlatformFeeEnabled                  bool      `gorm:"default:false;column:platform_fee_enabled" json:"platform_fee_enabled"`
	IsActive                            bool      `gorm:"default:true;column:is_active" json:"is_active"`
	CreatedAt                           time.Time `json:"created_at"`
	UpdatedAt                           time.Time `json:"updated_at"`
}

type DealerMarketplaceFavorite struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	DealerID       *uuid.UUID `gorm:"type:uuid" json:"dealer_id"`
	CarListingID   *uuid.UUID `gorm:"type:uuid" json:"car_listing_id"`
	StaffID        *uuid.UUID `gorm:"type:uuid" json:"staff_id"`
	Notes          *string    `gorm:"type:text" json:"notes"`
	CreatedAt      time.Time  `json:"created_at"`
}

type DealerMarketplaceView struct {
	ID                  uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	DealerID            *uuid.UUID `gorm:"type:uuid" json:"dealer_id"`
	CarListingID        *uuid.UUID `gorm:"type:uuid" json:"car_listing_id"`
	StaffID             *uuid.UUID `gorm:"type:uuid" json:"staff_id"`
	ViewDurationSeconds *int       `json:"view_duration_seconds"`
	ViewedAt            time.Time  `json:"viewed_at"`
}

// DealerOffer is the B2B offer system
type DealerOffer struct {
	ID                  uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	OfferNumber         *string    `gorm:"type:text;uniqueIndex;column:offer_number" json:"offer_number"`
	DealerID            *uuid.UUID `gorm:"type:uuid;index" json:"dealer_id"`
	CarListingID        *uuid.UUID `gorm:"type:uuid;index" json:"car_listing_id"`
	UserID              *uuid.UUID `gorm:"type:uuid;index" json:"user_id"`
	OfferPrice          int64      `gorm:"type:bigint;not null;column:offer_price" json:"offer_price"`
	OriginalPrice       *int64     `gorm:"type:bigint;column:original_price" json:"original_price"`
	Message             *string    `gorm:"type:text" json:"message"`
	FinancingAvailable  bool       `gorm:"default:false;column:financing_available" json:"financing_available"`
	FinancingNotes      *string    `gorm:"type:text;column:financing_notes" json:"financing_notes"`
	InspectionIncluded  bool       `gorm:"default:false;column:inspection_included" json:"inspection_included"`
	PickupService       bool       `gorm:"default:false;column:pickup_service" json:"pickup_service"`
	PickupLocation      *string    `gorm:"type:text;column:pickup_location" json:"pickup_location"`
	Status              string     `gorm:"type:text;default:'pending';check:status IN ('pending','viewed','negotiating','accepted','rejected','expired','withdrawn')" json:"status"`
	ViewedAt            *time.Time `json:"viewed_at"`
	RespondedAt         *time.Time `json:"responded_at"`
	ExpiresAt           *time.Time `json:"expires_at"`
	AcceptedAt          *time.Time `json:"accepted_at"`
	RejectedAt          *time.Time `json:"rejected_at"`
	WithdrawnAt         *time.Time `json:"withdrawn_at"`
	RejectionReason     *string    `gorm:"type:text;column:rejection_reason" json:"rejection_reason"`
	CounterOfferPrice   *int64     `gorm:"type:bigint;column:counter_offer_price" json:"counter_offer_price"`
	CounterOfferBy      *uuid.UUID `gorm:"type:uuid;column:counter_offer_by" json:"counter_offer_by"`
	CounterOfferMessage *string    `gorm:"type:text;column:counter_offer_message" json:"counter_offer_message"`
	CounterOfferAt      *time.Time `json:"counter_offer_at"`
	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"`
	// Relations
	History []DealerOfferHistory `gorm:"foreignKey:OfferID" json:"history,omitempty"`
}

type DealerOfferHistory struct {
	ID            uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	OfferID       *uuid.UUID `gorm:"type:uuid;index" json:"offer_id"`
	Action        string     `gorm:"type:text;not null;check:action IN ('created','viewed','counter_offered','accepted','rejected','withdrawn','expired','message')" json:"action"`
	PreviousPrice *int64     `gorm:"type:bigint" json:"previous_price"`
	NewPrice      *int64     `gorm:"type:bigint" json:"new_price"`
	ActorID       *uuid.UUID `json:"actor_id"`
	ActorType     *string    `gorm:"type:text;check:actor_type IN ('dealer','user')" json:"actor_type"`
	Message       *string    `gorm:"type:text" json:"message"`
	CreatedAt     time.Time  `json:"created_at"`
}
