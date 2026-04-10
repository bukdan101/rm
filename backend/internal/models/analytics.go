package models

import (
	"time"

	"github.com/google/uuid"
)

// ============================================
// MODULE 14: ANALYTICS (6 tables)
// ============================================

type AnalyticsEvent struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID      *uuid.UUID `gorm:"type:uuid" json:"user_id"`
	EventType   string     `gorm:"type:text;not null;column:event_type" json:"event_type"`
	EventName   string     `gorm:"type:text;not null;column:event_name" json:"event_name"`
	Properties  *string    `gorm:"type:jsonb" json:"properties"`
	SessionID   *string    `gorm:"type:text;column:session_id" json:"session_id"`
	DeviceType  *string    `gorm:"type:text;column:device_type" json:"device_type"`
	Platform    *string    `gorm:"type:text" json:"platform"`
	AppVersion  *string    `gorm:"type:text;column:app_version" json:"app_version"`
	IPAddress   *string    `gorm:"type:text;column:ip_address" json:"ip_address"`
	UserAgent   *string    `gorm:"type:text;column:user_agent" json:"user_agent"`
	CreatedAt   time.Time  `json:"created_at"`
}

type AnalyticsPageView struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID       *uuid.UUID `gorm:"type:uuid" json:"user_id"`
	PageType     *string    `gorm:"type:text;column:page_type" json:"page_type"`
	PageID       *uuid.UUID `gorm:"type:uuid;column:page_id" json:"page_id"`
	PageURL      *string    `gorm:"type:text;column:page_url" json:"page_url"`
	Referrer     *string    `gorm:"type:text" json:"referrer"`
	SessionID    *string    `gorm:"type:text;column:session_id" json:"session_id"`
	TimeOnPage   *int       `gorm:"column:time_on_page" json:"time_on_page"`
	ScrollDepth  *int       `gorm:"column:scroll_depth" json:"scroll_depth"`
	CreatedAt    time.Time  `json:"created_at"`
}

type AnalyticsClick struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID       *uuid.UUID `gorm:"type:uuid" json:"user_id"`
	ElementType  *string    `gorm:"type:text;column:element_type" json:"element_type"`
	ElementID    *string    `gorm:"type:text;column:element_id" json:"element_id"`
	ElementText  *string    `gorm:"type:text;column:element_text" json:"element_text"`
	PageURL      *string    `gorm:"type:text;column:page_url" json:"page_url"`
	XPosition    *int       `gorm:"column:x_position" json:"x_position"`
	YPosition    *int       `gorm:"column:y_position" json:"y_position"`
	SessionID    *string    `gorm:"type:text;column:session_id" json:"session_id"`
	CreatedAt    time.Time  `json:"created_at"`
}

type AnalyticsConversion struct {
	ID               uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID           *uuid.UUID `gorm:"type:uuid" json:"user_id"`
	ConversionType   *string    `gorm:"type:text;column:conversion_type" json:"conversion_type"`
	ConversionValue  *int64     `gorm:"type:bigint;column:conversion_value" json:"conversion_value"`
	FunnelStep       *string    `gorm:"type:text;column:funnel_step" json:"funnel_step"`
	FunnelComplete   *bool      `gorm:"default:false;column:funnel_complete" json:"funnel_complete"`
	SessionID        *string    `gorm:"type:text;column:session_id" json:"session_id"`
	Attribution      *string    `gorm:"type:jsonb" json:"attribution"`
	CreatedAt        time.Time  `json:"created_at"`
}

type SearchLog struct {
	ID               uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID           *uuid.UUID `gorm:"type:uuid" json:"user_id"`
	Query            *string    `gorm:"type:text" json:"query"`
	Filters          *string    `gorm:"type:jsonb" json:"filters"`
	ResultsCount     *int       `gorm:"column:results_count" json:"results_count"`
	ClickedListingID *uuid.UUID `gorm:"type:uuid;column:clicked_listing_id" json:"clicked_listing_id"`
	SessionID        *string    `gorm:"type:text;column:session_id" json:"session_id"`
	IPAddress        *string    `gorm:"type:text;column:ip_address" json:"ip_address"`
	CreatedAt        time.Time  `json:"created_at"`
}

type Recommendation struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID         *uuid.UUID `gorm:"type:uuid" json:"user_id"`
	CarListingID   *uuid.UUID `gorm:"type:uuid" json:"car_listing_id"`
	Score          *float64   `gorm:"type:numeric" json:"score"`
	Reason         *string    `gorm:"type:text" json:"reason"`
	Source         *string    `gorm:"type:text;check:source IN ('similar','popular','recently_viewed','personalized','trending')" json:"source"`
	CreatedAt      time.Time  `json:"created_at"`
}

// Favorites (simple table)
type Favorites struct {
	ID        uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID    *uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	ListingID *uuid.UUID `gorm:"type:uuid;not null;column:listing_id" json:"listing_id"`
	CreatedAt time.Time  `json:"created_at"`
}
