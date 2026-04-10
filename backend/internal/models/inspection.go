package models

import (
	"time"

	"github.com/google/uuid"
)

// ============================================
// MODULE 5: INSPECTION SYSTEM (6 tables)
// ============================================

type InspectionCategory struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name         string    `gorm:"type:text;not null" json:"name"`
	Description  *string   `gorm:"type:text" json:"description"`
	Icon         *string   `gorm:"type:text" json:"icon"`
	DisplayOrder int       `gorm:"default:0" json:"display_order"`
	TotalItems   int       `gorm:"default:0;column:total_items" json:"total_items"`
	CreatedAt    time.Time `json:"created_at"`
	// Relations
	Items []InspectionItem `gorm:"foreignKey:CategoryID" json:"items,omitempty"`
}

type InspectionItem struct {
	ID           int        `gorm:"primaryKey;autoIncrement" json:"id"`
	CategoryID   *uuid.UUID `gorm:"type:uuid;index" json:"category_id"`
	Name         string     `gorm:"type:text;not null" json:"name"`
	Description  *string    `gorm:"type:text" json:"description"`
	DisplayOrder int        `gorm:"default:0" json:"display_order"`
	IsCritical   bool       `gorm:"default:false;column:is_critical" json:"is_critical"`
	CreatedAt    time.Time  `json:"created_at"`
	// Relations
	Results []InspectionResult `gorm:"foreignKey:ItemID" json:"results,omitempty"`
}

type CarInspection struct {
	ID                  uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID        *uuid.UUID `gorm:"type:uuid;index" json:"car_listing_id"`
	InspectorID         *uuid.UUID `gorm:"type:uuid" json:"inspector_id"`
	InspectorName       *string    `gorm:"type:text;column:inspector_name" json:"inspector_name"`
	InspectionPlace     *string    `gorm:"type:text;column:inspection_place" json:"inspection_place"`
	InspectionDate      time.Time  `gorm:"default:now();column:inspection_date" json:"inspection_date"`
	TotalPoints         int        `gorm:"default:160;column:total_points" json:"total_points"`
	PassedPoints        *int       `gorm:"column:passed_points" json:"passed_points"`
	FailedPoints        int        `gorm:"default:0;column:failed_points" json:"failed_points"`
	InspectionScore     *float64   `gorm:"type:numeric;column:inspection_score" json:"inspection_score"`
	AccidentFree        bool       `gorm:"default:true;column:accident_free" json:"accident_free"`
	FloodFree           bool       `gorm:"default:true;column:flood_free" json:"flood_free"`
	FireFree            bool       `gorm:"default:true;column:fire_free" json:"fire_free"`
	OdometerTampered    bool       `gorm:"default:false;column:odometer_tampered" json:"odometer_tampered"`
	RiskLevel           *string    `gorm:"type:text;default:'low';check:risk_level IN ('low','medium','high','very_high')" json:"risk_level"`
	OverallGrade        *string    `gorm:"type:text;check:overall_grade IN ('A+','A','B+','B','C','D','E')" json:"overall_grade"`
	Recommended         bool       `gorm:"default:true" json:"recommended"`
	RecommendationNotes *string    `gorm:"type:text;column:recommendation_notes" json:"recommendation_notes"`
	CertificateNumber   *string    `gorm:"type:text;uniqueIndex;column:certificate_number" json:"certificate_number"`
	CertificateURL      *string    `gorm:"type:text;column:certificate_url" json:"certificate_url"`
	CertificateIssuedAt *time.Time `json:"certificate_issued_at"`
	CertificateExpiresAt *time.Time `json:"certificate_expires_at"`
	Status              string     `gorm:"type:text;default:'pending';check:status IN ('pending','in_progress','completed','verified')" json:"status"`
	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"`
	// Relations
	Results  []InspectionResult `gorm:"foreignKey:InspectionID" json:"results,omitempty"`
	Photos   []InspectionPhoto  `gorm:"foreignKey:InspectionID" json:"photos,omitempty"`
}

type InspectionResult struct {
	ID                  uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	InspectionID        *uuid.UUID `gorm:"type:uuid;index" json:"inspection_id"`
	ItemID              *int       `gorm:"index" json:"item_id"`
	Status              *string    `gorm:"type:text;default:'baik'" json:"status"` // baik, sedang, perlu_perbaikan, istimewa
	Notes               *string    `gorm:"type:text" json:"notes"`
	ImageURL            *string    `gorm:"type:text;column:image_url" json:"image_url"`
	Severity            *string    `gorm:"type:text;check:severity IN ('minor','moderate','major','critical')" json:"severity"`
	RepairCostEstimate  *int64     `gorm:"type:bigint" json:"repair_cost_estimate"`
	CreatedAt           time.Time  `json:"created_at"`
}

type InspectionPhoto struct {
	ID                  uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	InspectionID        *uuid.UUID `gorm:"type:uuid;index" json:"inspection_id"`
	InspectionResultID  *uuid.UUID `gorm:"type:uuid" json:"inspection_result_id"`
	ImageURL            string     `gorm:"type:text;not null;column:image_url" json:"image_url"`
	Caption             *string    `gorm:"type:text" json:"caption"`
	Position            *string    `gorm:"type:text" json:"position"`
	DisplayOrder        int        `gorm:"default:0;column:display_order" json:"display_order"`
	CreatedAt           time.Time  `json:"created_at"`
}

type InspectionCertificate struct {
	ID                uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	InspectionID      *uuid.UUID `gorm:"type:uuid" json:"inspection_id"`
	CertificateNumber *string    `gorm:"type:text;uniqueIndex" json:"certificate_number"`
	CertificateURL    *string    `gorm:"type:text" json:"certificate_url"`
	IssuedAt          *time.Time `json:"issued_at"`
	ExpiresAt         *time.Time `json:"expires_at"`
	IsValid           bool       `gorm:"default:true" json:"is_valid"`
	CreatedAt         time.Time  `json:"created_at"`
}
