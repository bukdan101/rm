package models

import (
	"time"

	"github.com/google/uuid"
)

// RentalBooking represents a car rental booking
type RentalBooking struct {
	ID                    uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	BookingNumber         string     `gorm:"type:text;uniqueIndex;not null" json:"booking_number"`
	CarListingID          uuid.UUID  `gorm:"type:uuid;index" json:"car_listing_id"`
	RenterID              uuid.UUID  `gorm:"type:uuid;index" json:"renter_id"`
	OwnerID               uuid.UUID  `gorm:"type:uuid;index" json:"owner_id"`
	PickupDate            *time.Time `gorm:"" json:"pickup_date"`
	ReturnDate            *time.Time `gorm:"" json:"return_date"`
	ActualPickupDate      *time.Time `gorm:"" json:"actual_pickup_date,omitempty"`
	ActualReturnDate      *time.Time `gorm:"" json:"actual_return_date,omitempty"`
	PickupLocation        string     `gorm:"type:text" json:"pickup_location,omitempty"`
	ReturnLocation        string     `gorm:"type:text" json:"return_location,omitempty"`
	DailyRate             int64      `gorm:"type:bigint;default:0" json:"daily_rate"`
	TotalDays             int        `gorm:"type:int;default:1" json:"total_days"`
	BaseAmount            int64      `gorm:"type:bigint;default:0" json:"base_amount"`
	MileageCharge         int64      `gorm:"type:bigint;default:0" json:"mileage_charge"`
	LateFee               int64      `gorm:"type:bigint;default:0" json:"late_fee"`
	DamageFee             int64      `gorm:"type:bigint;default:0" json:"damage_fee"`
	OtherCharges          int64      `gorm:"type:bigint;default:0" json:"other_charges"`
	DiscountAmount        int64      `gorm:"type:bigint;default:0" json:"discount_amount"`
	TotalAmount           int64      `gorm:"type:bigint;default:0" json:"total_amount"`
	DepositAmount         int64      `gorm:"type:bigint;default:0" json:"deposit_amount"`
	DepositReturned       bool       `gorm:"default:false" json:"deposit_returned"`
	CancelledAt           *time.Time `gorm:"" json:"cancelled_at,omitempty"`
	CancellationReason    string     `gorm:"type:text" json:"cancellation_reason,omitempty"`
	PickupInspectionID    *uuid.UUID `gorm:"type:uuid" json:"pickup_inspection_id,omitempty"`
	ReturnInspectionID    *uuid.UUID `gorm:"type:uuid" json:"return_inspection_id,omitempty"`
	Notes                 string     `gorm:"type:text" json:"notes,omitempty"`
	Status                string     `gorm:"type:text;default:'pending'" json:"status"`
	CreatedAt             time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt             time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}

func (RentalBooking) TableName() string {
	return "rental_bookings"
}

// RentalPayment represents a payment for a rental booking
type RentalPayment struct {
	ID              uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	BookingID       uuid.UUID  `gorm:"type:uuid;index;not null" json:"booking_id"`
	PaymentType     string     `gorm:"type:text;not null" json:"payment_type"` // deposit, rental, extra_charge, deposit_refund
	Amount          int64      `gorm:"type:bigint;not null" json:"amount"`
	PaymentMethod   string     `gorm:"type:text" json:"payment_method,omitempty"`
	PaymentReference string    `gorm:"type:text" json:"payment_reference,omitempty"`
	PaidAt          *time.Time `gorm:"" json:"paid_at,omitempty"`
	CreatedAt       time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (RentalPayment) TableName() string {
	return "rental_payments"
}

// RentalReview represents a review for a rental booking
type RentalReview struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	BookingID    uuid.UUID  `gorm:"type:uuid;index;not null" json:"booking_id"`
	ReviewerID   uuid.UUID  `gorm:"type:uuid;index" json:"reviewer_id"`
	RevieweeID   uuid.UUID  `gorm:"type:uuid" json:"reviewee_id"`
	Rating       int        `gorm:"type:int;check:rating >= 1 AND rating <= 5" json:"rating"`
	Comment      string     `gorm:"type:text" json:"comment,omitempty"`
	Response     string     `gorm:"type:text" json:"response,omitempty"`
	RespondedAt  *time.Time `gorm:"" json:"responded_at,omitempty"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (RentalReview) TableName() string {
	return "rental_reviews"
}
