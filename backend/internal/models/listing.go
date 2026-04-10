package models

import (
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

// ============================================
// MODULE 4: LISTING SYSTEM (14 tables)
// ============================================

// CarListing is the MAIN listing table with 45+ columns
type CarListing struct {
	ID               uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ListingNumber    *string    `gorm:"type:text;uniqueIndex" json:"listing_number"`
	UserID           *uuid.UUID `gorm:"type:uuid;index" json:"user_id"`
	DealerID         *uuid.UUID `gorm:"type:uuid;index" json:"dealer_id"`
	BrandID          *uuid.UUID `gorm:"type:uuid;index" json:"brand_id"`
	ModelID          *uuid.UUID `gorm:"type:uuid;index" json:"model_id"`
	VariantID        *uuid.UUID `gorm:"type:uuid" json:"variant_id"`
	GenerationID     *uuid.UUID `gorm:"type:uuid" json:"generation_id"`
	Year             *int       `json:"year"`
	ExteriorColorID  *uuid.UUID `gorm:"type:uuid" json:"exterior_color_id"`
	InteriorColorID  *uuid.UUID `gorm:"type:uuid" json:"interior_color_id"`
	Fuel             *string    `gorm:"type:text" json:"fuel"` // bensin, diesel, electric, hybrid
	Transmission     *string    `gorm:"type:text" json:"transmission"`
	BodyType         *string    `gorm:"type:text" json:"body_type"`
	EngineCapacity   *int       `json:"engine_capacity"`
	SeatCount        *int       `json:"seat_count"`
	Mileage          *int       `json:"mileage"`
	VINNumber        *string    `gorm:"type:text;column:vin_number" json:"vin_number"`
	PlateNumber      *string    `gorm:"type:text;column:plate_number" json:"plate_number"`
	TransactionType  *string    `gorm:"type:text;column:transaction_type" json:"transaction_type"`
	Condition        *string    `gorm:"type:text" json:"condition"`
	PriceCash        *int64     `gorm:"type:bigint" json:"price_cash"`
	PriceCredit      *int64     `gorm:"type:bigint" json:"price_credit"`
	PriceNegotiable  bool       `gorm:"default:true;column:price_negotiable" json:"price_negotiable"`
	City             *string    `gorm:"type:text" json:"city"`
	Province         *string    `gorm:"type:text" json:"province"`
	CityID           *uuid.UUID `gorm:"type:uuid" json:"city_id"`
	ProvinceID       *uuid.UUID `gorm:"type:uuid" json:"province_id"`
	ViewCount        int        `gorm:"default:0;column:view_count" json:"view_count"`
	FavoriteCount    int        `gorm:"default:0;column:favorite_count" json:"favorite_count"`
	InquiryCount     int        `gorm:"default:0;column:inquiry_count" json:"inquiry_count"`
	ShareCount       int        `gorm:"default:0;column:share_count" json:"share_count"`
	Status           string     `gorm:"type:text;default:'draft';index;check:status IN ('draft','pending','active','sold','expired','rejected','deleted')" json:"status"`
	SoldAt           *time.Time `json:"sold_at"`
	ExpiredAt        *time.Time `json:"expired_at"`
	RejectedReason   *string    `gorm:"type:text" json:"rejected_reason"`
	Title            *string    `gorm:"type:text" json:"title"`
	Description      *string    `gorm:"type:text" json:"description"`
	MetaTitle        *string    `gorm:"type:text;column:meta_title" json:"meta_title"`
	MetaDescription  *string    `gorm:"type:text;column:meta_description" json:"meta_description"`
	Slug             *string    `gorm:"type:text;uniqueIndex" json:"slug"`
	PublishedAt      *time.Time `json:"published_at"`
	FeaturedUntil    *time.Time `json:"featured_until"`
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`
	DeletedAt        *time.Time `gorm:"index" json:"deleted_at"`
	// Relations
	Brand         *Brand           `gorm:"foreignKey:BrandID" json:"brand,omitempty"`
	Model         *CarModel        `gorm:"foreignKey:ModelID" json:"model,omitempty"`
	Variant       *CarVariant      `gorm:"foreignKey:VariantID" json:"variant,omitempty"`
	User          *User            `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Dealer        *Dealer          `gorm:"foreignKey:DealerID" json:"dealer,omitempty"`
	Images        []CarImage       `gorm:"foreignKey:CarListingID" json:"images,omitempty"`
	Videos        []CarVideo       `gorm:"foreignKey:CarListingID" json:"videos,omitempty"`
	Features      *CarFeatures     `gorm:"foreignKey:CarListingID" json:"features,omitempty"`
	FeatureValues []CarFeatureValue `gorm:"foreignKey:CarListingID" json:"feature_values,omitempty"`
	Documents     *CarDocument     `gorm:"foreignKey:CarListingID" json:"documents,omitempty"`
	RentalPrice   *CarRentalPrice  `gorm:"foreignKey:CarListingID" json:"rental_price,omitempty"`
	Inspection    *CarInspection   `gorm:"foreignKey:CarListingID" json:"inspection,omitempty"`
	PriceHistory  []CarPriceHistory `gorm:"foreignKey:CarListingID" json:"price_history,omitempty"`
}

type CarImage struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID   uuid.UUID  `gorm:"type:uuid;index" json:"car_listing_id"`
	ImageURL       string     `gorm:"type:text;not null;column:image_url" json:"image_url"`
	ThumbnailURL   *string    `gorm:"type:text;column:thumbnail_url" json:"thumbnail_url"`
	Caption        *string    `gorm:"type:text" json:"caption"`
	IsPrimary      bool       `gorm:"default:false;column:is_primary" json:"is_primary"`
	DisplayOrder   int        `gorm:"default:0;column:display_order" json:"display_order"`
	CreatedAt      time.Time  `json:"created_at"`
}

type CarVideo struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID   uuid.UUID  `gorm:"type:uuid;index" json:"car_listing_id"`
	VideoURL       string     `gorm:"type:text;not null;column:video_url" json:"video_url"`
	ThumbnailURL   *string    `gorm:"type:text;column:thumbnail_url" json:"thumbnail_url"`
	Title          *string    `gorm:"type:text" json:"title"`
	Duration       *int       `json:"duration"`
	IsPrimary      bool       `gorm:"default:false;column:is_primary" json:"is_primary"`
	CreatedAt      time.Time  `json:"created_at"`
}

type CarDocument struct {
	ID              uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID    *uuid.UUID `gorm:"type:uuid;uniqueIndex" json:"car_listing_id"`
	LicensePlate    *string    `gorm:"type:text;column:license_plate" json:"license_plate"`
	SellWithPlate   bool       `gorm:"default:false;column:sell_with_plate" json:"sell_with_plate"`
	STNKStatus      *string    `gorm:"type:text;column:stnk_status" json:"stnk_status"`
	BPKBStatus      *string    `gorm:"type:text;column:bpkb_status" json:"bpkb_status"`
	OwnershipType   *string    `gorm:"type:text;column:ownership_type" json:"ownership_type"`
	RegistrationDate *time.Time `json:"registration_date"`
	PreviousOwners  *int       `json:"previous_owners"`
	CreatedAt       time.Time  `json:"created_at"`
}

type CarFeatures struct {
	ID               uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID     *uuid.UUID `gorm:"type:uuid;uniqueIndex" json:"car_listing_id"`
	Sunroof          bool       `gorm:"default:false" json:"sunroof"`
	CruiseControl    bool       `gorm:"default:false;column:cruise_control" json:"cruise_control"`
	RearCamera       bool       `gorm:"default:false;column:rear_camera" json:"rear_camera"`
	FrontCamera      bool       `gorm:"default:false;column:front_camera" json:"front_camera"`
	KeylessStart     bool       `gorm:"default:false;column:keyless_start" json:"keyless_start"`
	PushStart        bool       `gorm:"default:false;column:push_start" json:"push_start"`
	ServiceBook      bool       `gorm:"default:false;column:service_book" json:"service_book"`
	Airbag           bool       `gorm:"default:false" json:"airbag"`
	ABS              bool       `gorm:"default:false" json:"abs"`
	ESP              bool       `gorm:"default:false" json:"esp"`
	HillStart        bool       `gorm:"default:false;column:hill_start" json:"hill_start"`
	AutoPark         bool       `gorm:"default:false;column:auto_park" json:"auto_park"`
	LaneKeep         bool       `gorm:"default:false;column:lane_keep" json:"lane_keep"`
	AdaptiveCruise   bool       `gorm:"default:false;column:adaptive_cruise" json:"adaptive_cruise"`
	BlindSpot        bool       `gorm:"default:false;column:blind_spot" json:"blind_spot"`
	WirelessCharger  bool       `gorm:"default:false;column:wireless_charger" json:"wireless_charger"`
	AppleCarplay     bool       `gorm:"default:false;column:apple_carplay" json:"apple_carplay"`
	AndroidAuto      bool       `gorm:"default:false;column:android_auto" json:"android_auto"`
	Bluetooth        bool       `gorm:"default:false" json:"bluetooth"`
	Navigation       bool       `gorm:"default:false" json:"navigation"`
	CreatedAt        time.Time  `json:"created_at"`
}

type CarFeatureValue struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID   *uuid.UUID `gorm:"type:uuid;index" json:"car_listing_id"`
	FeatureItemID  *uuid.UUID `gorm:"type:uuid;index" json:"feature_item_id"`
	Value          bool       `gorm:"default:false" json:"value"`
	Notes          *string    `gorm:"type:text" json:"notes"`
	CreatedAt      time.Time  `json:"created_at"`
}

type CarRentalPrice struct {
	ID             uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID   *uuid.UUID `gorm:"type:uuid;uniqueIndex" json:"car_listing_id"`
	PricePerDay    *int64    `gorm:"type:bigint" json:"price_per_day"`
	PricePerWeek   *int64    `gorm:"type:bigint" json:"price_per_week"`
	PricePerMonth  *int64    `gorm:"type:bigint" json:"price_per_month"`
	CreatedAt      time.Time `json:"created_at"`
}

type CarPriceHistory struct {
	ID              uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID    *uuid.UUID `gorm:"type:uuid;index" json:"car_listing_id"`
	PriceCashOld    *int64     `gorm:"type:bigint" json:"price_cash_old"`
	PriceCashNew    *int64     `gorm:"type:bigint" json:"price_cash_new"`
	PriceCreditOld  *int64     `gorm:"type:bigint" json:"price_credit_old"`
	PriceCreditNew  *int64     `gorm:"type:bigint" json:"price_credit_new"`
	ChangedBy       *uuid.UUID `json:"changed_by"`
	ChangedAt       time.Time  `json:"changed_at"`
	Reason          *string    `gorm:"type:text" json:"reason"`
}

type CarStatusHistory struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID   *uuid.UUID `gorm:"type:uuid;index" json:"car_listing_id"`
	StatusOld      *string    `gorm:"type:text;column:status_old" json:"status_old"`
	StatusNew      *string    `gorm:"type:text;column:status_new" json:"status_new"`
	ChangedBy      *uuid.UUID `json:"changed_by"`
	ChangedAt      time.Time  `json:"changed_at"`
	Notes          *string    `gorm:"type:text" json:"notes"`
}

type CarView struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID   *uuid.UUID `gorm:"type:uuid;index" json:"car_listing_id"`
	ViewerID       *uuid.UUID `json:"viewer_id"`
	IPAddress      *string    `gorm:"type:text;column:ip_address" json:"ip_address"`
	UserAgent      *string    `gorm:"type:text;column:user_agent" json:"user_agent"`
	Referrer       *string    `gorm:"type:text" json:"referrer"`
	ViewDuration   *int       `json:"view_duration"`
	CreatedAt      time.Time  `json:"created_at"`
}

type CarCompare struct {
	ID             uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID         *uuid.UUID `gorm:"type:uuid" json:"user_id"`
	CarListingIDs  pq.StringArray `gorm:"type:uuid[]" json:"car_listing_ids"`
	CreatedAt      time.Time `json:"created_at"`
}

type CarFavorite struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID         *uuid.UUID `gorm:"type:uuid;index" json:"user_id"`
	CarListingID   *uuid.UUID `gorm:"type:uuid;index" json:"car_listing_id"`
	Notes          *string    `gorm:"type:text" json:"notes"`
	CreatedAt      time.Time  `json:"created_at"`
}

type RecentView struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID         *uuid.UUID `gorm:"type:uuid" json:"user_id"`
	CarListingID   *uuid.UUID `gorm:"type:uuid" json:"car_listing_id"`
	ViewCount      int        `gorm:"default:1;column:view_count" json:"view_count"`
	LastViewedAt   time.Time  `json:"last_viewed_at"`
}

type TrendingCar struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID   *uuid.UUID `gorm:"type:uuid" json:"car_listing_id"`
	Period         *string    `gorm:"type:text" json:"period"`
	ViewCount      int        `gorm:"default:0;column:view_count" json:"view_count"`
	InquiryCount   int        `gorm:"default:0;column:inquiry_count" json:"inquiry_count"`
	FavoriteCount  int        `gorm:"default:0;column:favorite_count" json:"favorite_count"`
	Score          *float64   `json:"score"`
	Rank           *int       `json:"rank"`
	CreatedAt      time.Time  `json:"created_at"`
}
