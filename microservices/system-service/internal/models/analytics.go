package models

import (
	"time"

	"github.com/google/uuid"
)

// AnalyticsEvent represents a tracked analytics event
type AnalyticsEvent struct {
	ID          uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID      *uuid.UUID     `gorm:"type:uuid;index" json:"user_id"`
	EventType   string         `gorm:"type:varchar(100);index" json:"event_type"`
	EventName   string         `gorm:"type:varchar(255);index" json:"event_name"`
	Properties  map[string]any `gorm:"type:jsonb;serializer:json" json:"properties"`
	SessionID   string         `gorm:"type:varchar(255);index" json:"session_id"`
	DeviceType  string         `gorm:"type:varchar(50)" json:"device_type"`
	Platform    string         `gorm:"type:varchar(50)" json:"platform"`
	AppVersion  string         `gorm:"type:varchar(50)" json:"app_version"`
	IPAddress   string         `gorm:"type:varchar(45)" json:"ip_address"`
	UserAgent   string         `gorm:"type:text" json:"user_agent"`
	CreatedAt   time.Time      `gorm:"autoCreateTime;index" json:"created_at"`
}

func (AnalyticsEvent) TableName() string {
	return "analytics_events"
}

// AnalyticsPageView represents a tracked page view
type AnalyticsPageView struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID       *uuid.UUID `gorm:"type:uuid;index" json:"user_id"`
	PageType     string     `gorm:"type:varchar(100);index" json:"page_type"`
	PageID       *uuid.UUID `gorm:"type:uuid" json:"page_id"`
	PageURL      string     `gorm:"type:text" json:"page_url"`
	Referrer     string     `gorm:"type:text" json:"referrer"`
	SessionID    string     `gorm:"type:varchar(255);index" json:"session_id"`
	TimeOnPage   int        `gorm:"default:0" json:"time_on_page"`
	ScrollDepth  int        `gorm:"default:0" json:"scroll_depth"`
	CreatedAt    time.Time  `gorm:"autoCreateTime;index" json:"created_at"`
}

func (AnalyticsPageView) TableName() string {
	return "analytics_page_views"
}

// AnalyticsClick represents a tracked click event
type AnalyticsClick struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID      *uuid.UUID `gorm:"type:uuid" json:"user_id"`
	ElementType string     `gorm:"type:varchar(100)" json:"element_type"`
	ElementID   string     `gorm:"type:varchar(255)" json:"element_id"`
	ElementText string     `gorm:"type:varchar(500)" json:"element_text"`
	PageURL     string     `gorm:"type:text" json:"page_url"`
	XPosition   int        `gorm:"default:0" json:"x_position"`
	YPosition   int        `gorm:"default:0" json:"y_position"`
	SessionID   string     `gorm:"type:varchar(255);index" json:"session_id"`
	CreatedAt   time.Time  `gorm:"autoCreateTime;index" json:"created_at"`
}

func (AnalyticsClick) TableName() string {
	return "analytics_clicks"
}

// AnalyticsConversion represents a tracked conversion event
type AnalyticsConversion struct {
	ID              uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID          *uuid.UUID     `gorm:"type:uuid;index" json:"user_id"`
	ConversionType  string         `gorm:"type:varchar(100);index" json:"conversion_type"`
	ConversionValue int64          `gorm:"type:bigint" json:"conversion_value"`
	FunnelStep      string         `gorm:"type:varchar(100)" json:"funnel_step"`
	FunnelComplete  bool           `gorm:"default:false" json:"funnel_complete"`
	SessionID       string         `gorm:"type:varchar(255);index" json:"session_id"`
	Attribution     map[string]any `gorm:"type:jsonb;serializer:json" json:"attribution"`
	CreatedAt       time.Time      `gorm:"autoCreateTime;index" json:"created_at"`
}

func (AnalyticsConversion) TableName() string {
	return "analytics_conversions"
}

// SearchLog represents a logged search query
type SearchLog struct {
	ID                uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID            *uuid.UUID     `gorm:"type:uuid;index" json:"user_id"`
	Query             string         `gorm:"type:text" json:"query"`
	Filters           map[string]any `gorm:"type:jsonb;serializer:json" json:"filters"`
	ResultsCount      int            `gorm:"default:0" json:"results_count"`
	ClickedListingID  *uuid.UUID     `gorm:"type:uuid" json:"clicked_listing_id"`
	SessionID         string         `gorm:"type:varchar(255);index" json:"session_id"`
	IPAddress         string         `gorm:"type:varchar(45)" json:"ip_address"`
	CreatedAt         time.Time      `gorm:"autoCreateTime;index" json:"created_at"`
}

func (SearchLog) TableName() string {
	return "search_logs"
}
