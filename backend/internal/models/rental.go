package models

import (
	"time"

	"github.com/google/uuid"
)

// ============================================
// MODULE 12: RENTAL SYSTEM (5 tables)
// ============================================

type RentalBooking struct {
	ID                 uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	BookingNumber      *string    `gorm:"type:text;uniqueIndex" json:"booking_number"`
	CarListingID       *uuid.UUID `gorm:"type:uuid" json:"car_listing_id"`
	RenterID           *uuid.UUID `gorm:"type:uuid" json:"renter_id"`
	OwnerID            *uuid.UUID `gorm:"type:uuid" json:"owner_id"`
	PickupDate         *time.Time `json:"pickup_date"`
	ReturnDate         *time.Time `json:"return_date"`
	ActualPickupDate   *time.Time `json:"actual_pickup_date"`
	ActualReturnDate   *time.Time `json:"actual_return_date"`
	PickupLocation     *string    `gorm:"type:text;column:pickup_location" json:"pickup_location"`
	ReturnLocation     *string    `gorm:"type:text;column:return_location" json:"return_location"`
	DailyRate          *int64     `gorm:"type:bigint" json:"daily_rate"`
	TotalDays          *int       `gorm:"column:total_days" json:"total_days"`
	BaseAmount         *int64     `gorm:"type:bigint" json:"base_amount"`
	MileageCharge      *int64     `gorm:"type:bigint;default:0" json:"mileage_charge"`
	LateFee            *int64     `gorm:"type:bigint;default:0" json:"late_fee"`
	DamageFee          *int64     `gorm:"type:bigint;default:0" json:"damage_fee"`
	OtherCharges       *int64     `gorm:"type:bigint;default:0" json:"other_charges"`
	DiscountAmount     *int64     `gorm:"type:bigint;default:0" json:"discount_amount"`
	TotalAmount        *int64     `gorm:"type:bigint" json:"total_amount"`
	DepositAmount      *int64     `gorm:"type:bigint" json:"deposit_amount"`
	DepositReturned    bool       `gorm:"default:false;column:deposit_returned" json:"deposit_returned"`
	CancelledAt        *time.Time `json:"cancelled_at"`
	CancellationReason *string    `gorm:"type:text" json:"cancellation_reason"`
	PickupInspectionID *uuid.UUID `gorm:"type:uuid" json:"pickup_inspection_id"`
	ReturnInspectionID *uuid.UUID `gorm:"type:uuid" json:"return_inspection_id"`
	Notes              *string    `gorm:"type:text" json:"notes"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
	// Relations
	Payments []RentalPayment `gorm:"foreignKey:BookingID" json:"payments,omitempty"`
}

type RentalAvailability struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID   *uuid.UUID `gorm:"type:uuid" json:"car_listing_id"`
	Date           *time.Time `gorm:"type:date" json:"date"`
	IsAvailable    bool       `gorm:"default:true;column:is_available" json:"is_available"`
	BookingID      *uuid.UUID `gorm:"type:uuid" json:"booking_id"`
	Notes          *string    `gorm:"type:text" json:"notes"`
	CreatedAt      time.Time  `json:"created_at"`
}

type RentalPayment struct {
	ID              uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	BookingID       *uuid.UUID `gorm:"type:uuid;index" json:"booking_id"`
	PaymentType     *string    `gorm:"type:text;check:payment_type IN ('deposit','rental','extra_charge','deposit_refund')" json:"payment_type"`
	Amount          *int64     `gorm:"type:bigint" json:"amount"`
	PaymentMethod   *string    `gorm:"type:text;column:payment_method" json:"payment_method"`
	PaymentReference *string   `gorm:"type:text;column:payment_reference" json:"payment_reference"`
	PaidAt          *time.Time `json:"paid_at"`
	CreatedAt       time.Time  `json:"created_at"`
}

type RentalInsurance struct {
	ID               uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	BookingID        *uuid.UUID `gorm:"type:uuid" json:"booking_id"`
	InsuranceProvider *string   `gorm:"type:text;column:insurance_provider" json:"insurance_provider"`
	PolicyNumber     *string    `gorm:"type:text;column:policy_number" json:"policy_number"`
	CoverageType     *string    `gorm:"type:text;column:coverage_type" json:"coverage_type"`
	CoverageAmount   *int64     `gorm:"type:bigint" json:"coverage_amount"`
	PremiumAmount    *int64     `gorm:"type:bigint" json:"premium_amount"`
	StartDate        *time.Time `json:"start_date"`
	EndDate          *time.Time `json:"end_date"`
	DocumentURL      *string    `gorm:"type:text;column:document_url" json:"document_url"`
	CreatedAt        time.Time  `json:"created_at"`
}

type RentalReview struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	BookingID   *uuid.UUID `gorm:"type:uuid;index" json:"booking_id"`
	ReviewerID  *uuid.UUID `gorm:"type:uuid" json:"reviewer_id"`
	RevieweeID  *uuid.UUID `gorm:"type:uuid" json:"reviewee_id"`
	Rating      int        `gorm:"check:rating >= 1 AND rating <= 5" json:"rating"`
	Comment     *string    `gorm:"type:text" json:"comment"`
	Response    *string    `gorm:"type:text" json:"response"`
	RespondedAt *time.Time `json:"responded_at"`
	CreatedAt   time.Time  `json:"created_at"`
}

// ============================================
// MODULE 13: REVIEWS (3 tables)
// ============================================

type CarReview struct {
	ID                 uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID       *uuid.UUID `gorm:"type:uuid;index" json:"car_listing_id"`
	UserID             *uuid.UUID `gorm:"type:uuid" json:"user_id"`
	OrderID            *uuid.UUID `gorm:"type:uuid" json:"order_id"`
	Rating             int        `gorm:"check:rating >= 1 AND rating <= 5" json:"rating"`
	Title              *string    `gorm:"type:text" json:"title"`
	Comment            *string    `gorm:"type:text" json:"comment"`
	Pros               *string    `gorm:"type:text" json:"pros"`
	Cons               *string    `gorm:"type:text" json:"cons"`
	IsVerifiedPurchase bool       `gorm:"default:false;column:is_verified_purchase" json:"is_verified_purchase"`
	IsAnonymous        bool       `gorm:"default:false;column:is_anonymous" json:"is_anonymous"`
	HelpfulCount       int        `gorm:"default:0;column:helpful_count" json:"helpful_count"`
	NotHelpfulCount    int        `gorm:"default:0;column:not_helpful_count" json:"not_helpful_count"`
	SellerResponse     *string    `gorm:"type:text;column:seller_response" json:"seller_response"`
	SellerRespondedAt  *time.Time `json:"seller_responded_at"`
	Status             *string    `gorm:"type:text;default:'active';check:status IN ('pending','active','hidden','deleted')" json:"status"`
	CreatedAt          time.Time  `json:"created_at"`
	UpdatedAt          time.Time  `json:"updated_at"`
	// Relations
	Images []ReviewImage `gorm:"foreignKey:ReviewID" json:"images,omitempty"`
}

type ReviewImage struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ReviewID     *uuid.UUID `gorm:"type:uuid;index" json:"review_id"`
	ImageURL     string     `gorm:"type:text;not null;column:image_url" json:"image_url"`
	ThumbnailURL *string    `gorm:"type:text;column:thumbnail_url" json:"thumbnail_url"`
	Caption      *string    `gorm:"type:text" json:"caption"`
	DisplayOrder int        `gorm:"default:0;column:display_order" json:"display_order"`
	CreatedAt    time.Time  `json:"created_at"`
}

type ReviewVote struct {
	ID         uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ReviewID   *uuid.UUID `gorm:"type:uuid;index" json:"review_id"`
	UserID     *uuid.UUID `gorm:"type:uuid" json:"user_id"`
	VoteType   *string    `gorm:"type:text;check:vote_type IN ('helpful','not_helpful')" json:"vote_type"`
	CreatedAt  time.Time  `json:"created_at"`
}
