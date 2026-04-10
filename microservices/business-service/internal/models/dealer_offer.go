package models

import (
	"time"

	"github.com/google/uuid"
)

// DealerOffer represents a B2B offer from a dealer to a seller
type DealerOffer struct {
	ID                  uuid.UUID   `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	OfferNumber         string      `gorm:"type:text;uniqueIndex;not null" json:"offer_number"`
	DealerID            uuid.UUID   `gorm:"type:uuid;index;not null" json:"dealer_id"`
	CarListingID        uuid.UUID   `gorm:"type:uuid;index;not null" json:"car_listing_id"`
	UserID              uuid.UUID   `gorm:"type:uuid;index;not null" json:"user_id"`
	OfferPrice          int64       `gorm:"not null" json:"offer_price"`
	OriginalPrice       *int64      `json:"original_price"`
	Message             string      `gorm:"type:text" json:"message"`
	FinancingAvailable  bool        `gorm:"default:false" json:"financing_available"`
	FinancingNotes      string      `gorm:"type:text" json:"financing_notes"`
	InspectionIncluded  bool        `gorm:"default:false" json:"inspection_included"`
	PickupService       bool        `gorm:"default:false" json:"pickup_service"`
	PickupLocation      string      `gorm:"type:text" json:"pickup_location"`
	Status              string      `gorm:"type:text;default:'pending'" json:"status"` // pending, viewed, negotiating, accepted, rejected, expired, withdrawn
	ViewedAt            *time.Time  `json:"viewed_at"`
	RespondedAt         *time.Time  `json:"responded_at"`
	ExpiresAt           *time.Time  `json:"expires_at"`
	AcceptedAt          *time.Time  `json:"accepted_at"`
	RejectedAt          *time.Time  `json:"rejected_at"`
	WithdrawnAt         *time.Time  `json:"withdrawn_at"`
	RejectionReason     string      `gorm:"type:text" json:"rejection_reason"`
	CounterOfferPrice   *int64      `json:"counter_offer_price"`
	CounterOfferBy      *uuid.UUID  `gorm:"type:uuid" json:"counter_offer_by"`
	CounterOfferMessage string      `gorm:"type:text" json:"counter_offer_message"`
	CounterOfferAt      *time.Time  `json:"counter_offer_at"`
	CreatedAt           time.Time   `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt           time.Time   `gorm:"autoUpdateTime" json:"updated_at"`
}

func (DealerOffer) TableName() string {
	return "dealer_offers"
}

// DealerOfferHistory tracks the history of actions on an offer
type DealerOfferHistory struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	OfferID      uuid.UUID  `gorm:"type:uuid;index;not null" json:"offer_id"`
	Action       string     `gorm:"type:text;not null" json:"action"` // created, viewed, counter_offered, accepted, rejected, withdrawn, expired, message
	PreviousPrice *int64    `json:"previous_price"`
	NewPrice     *int64     `json:"new_price"`
	ActorID      uuid.UUID  `gorm:"type:uuid;not null" json:"actor_id"`
	ActorType    string     `gorm:"type:text;not null" json:"actor_type"` // dealer, user
	Message      string     `gorm:"type:text" json:"message"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (DealerOfferHistory) TableName() string {
	return "dealer_offer_histories"
}
