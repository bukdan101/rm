package models

import (
	"time"

	"github.com/google/uuid"
)

// InspectionCategory represents categories of inspection items (160 points total)
type InspectionCategory struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Name         string     `gorm:"type:varchar(255);not null" json:"name"`
	Description  string     `gorm:"type:text" json:"description"`
	Icon         string     `gorm:"type:varchar(255)" json:"icon"`
	DisplayOrder int        `gorm:"default:0" json:"display_order"`
	TotalItems   int        `gorm:"default:0" json:"total_items"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (InspectionCategory) TableName() string { return "inspection_categories" }

// InspectionItem represents individual inspection checklist items
type InspectionItem struct {
	ID           int        `gorm:"primaryKey;autoIncrement" json:"id"`
	CategoryID   *uuid.UUID `gorm:"type:uuid;index" json:"category_id"`
	Name         string     `gorm:"type:varchar(255);not null" json:"name"`
	Description  string     `gorm:"type:text" json:"description"`
	DisplayOrder int        `gorm:"default:0" json:"display_order"`
	IsCritical   bool       `gorm:"default:false" json:"is_critical"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (InspectionItem) TableName() string { return "inspection_items" }

// CarInspection represents the full inspection report for a listing
type CarInspection struct {
	ID                   uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID         *uuid.UUID `gorm:"type:uuid;index" json:"car_listing_id"`
	InspectorID          *uuid.UUID `gorm:"type:uuid" json:"inspector_id"`
	InspectorName        string     `gorm:"type:varchar(255)" json:"inspector_name"`
	InspectionPlace      string     `gorm:"type:varchar(255)" json:"inspection_place"`
	InspectionDate       *time.Time `gorm:"" json:"inspection_date"`
	TotalPoints          int        `gorm:"default:160" json:"total_points"`
	PassedPoints         int        `gorm:"default:0" json:"passed_points"`
	FailedPoints         int        `gorm:"default:0" json:"failed_points"`
	InspectionScore      float64    `gorm:"type:numeric(5,2)" json:"inspection_score"`
	AccidentFree         bool       `gorm:"default:true" json:"accident_free"`
	FloodFree            bool       `gorm:"default:true" json:"flood_free"`
	FireFree             bool       `gorm:"default:true" json:"fire_free"`
	OdometerTampered     bool       `gorm:"default:false" json:"odometer_tampered"`
	RiskLevel            string     `gorm:"type:varchar(20);default:'low'" json:"risk_level"` // low,medium,high,very_high
	OverallGrade         string     `gorm:"type:varchar(5)" json:"overall_grade"`            // A+,A,B+,B,C,D,E
	Recommended          bool       `gorm:"default:false" json:"recommended"`
	RecommendationNotes  string     `gorm:"type:text" json:"recommendation_notes"`
	CertificateNumber    string     `gorm:"type:varchar(100);uniqueIndex" json:"certificate_number"`
	CertificateURL       string     `gorm:"type:text" json:"certificate_url"`
	CertificateIssuedAt  *time.Time `gorm:"" json:"certificate_issued_at"`
	CertificateExpiresAt *time.Time `gorm:"" json:"certificate_expires_at"`
	Status               string     `gorm:"type:varchar(20);default:'pending'" json:"status"` // pending,in_progress,completed,verified
	CreatedAt            time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt            time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}

func (CarInspection) TableName() string { return "car_inspections" }

// InspectionResult represents results for each inspection item
type InspectionResult struct {
	ID                  uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	InspectionID        *uuid.UUID `gorm:"type:uuid;index" json:"inspection_id"`
	ItemID              int        `gorm:"" json:"item_id"`
	Status              string     `gorm:"type:varchar(50)" json:"status"` // baik,sedang,perlu_perbaikan,istimewa
	Notes               string     `gorm:"type:text" json:"notes"`
	ImageURL            string     `gorm:"type:text" json:"image_url"`
	Severity            string     `gorm:"type:varchar(20)" json:"severity"` // minor,moderate,major,critical
	RepairCostEstimate  int64      `gorm:"" json:"repair_cost_estimate"`
	CreatedAt           time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (InspectionResult) TableName() string { return "inspection_results" }

// InspectionPhoto represents photos taken during inspection
type InspectionPhoto struct {
	ID                 uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	InspectionID       *uuid.UUID `gorm:"type:uuid;index" json:"inspection_id"`
	InspectionResultID *uuid.UUID `gorm:"type:uuid" json:"inspection_result_id"`
	ImageURL           string     `gorm:"type:text;not null" json:"image_url"`
	Caption            string     `gorm:"type:varchar(255)" json:"caption"`
	Position           string     `gorm:"type:varchar(50)" json:"position"` // front,rear,left,right,top,bottom,engine,trunk,interior
	DisplayOrder       int        `gorm:"default:0" json:"display_order"`
	CreatedAt          time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (InspectionPhoto) TableName() string { return "inspection_photos" }

// InspectionCertificate represents issued inspection certificates
type InspectionCertificate struct {
	ID                 uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	InspectionID       *uuid.UUID `gorm:"type:uuid" json:"inspection_id"`
	CertificateNumber  string     `gorm:"type:varchar(100);uniqueIndex;not null" json:"certificate_number"`
	CertificateURL     string     `gorm:"type:text" json:"certificate_url"`
	IssuedAt           *time.Time `gorm:"" json:"issued_at"`
	ExpiresAt          *time.Time `gorm:"" json:"expires_at"`
	IsValid            bool       `gorm:"default:true" json:"is_valid"`
	CreatedAt          time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (InspectionCertificate) TableName() string { return "inspection_certificates" }
