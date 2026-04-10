package models

import (
	"time"

	"github.com/google/uuid"
)

type KycVerification struct {
	ID              uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	UserID          uuid.UUID  `gorm:"type:uuid;uniqueIndex" json:"user_id"`
	FullName        string     `gorm:"type:varchar(255);not null" json:"full_name"`
	Nik             string     `gorm:"type:varchar(16);not null" json:"nik"`
	BirthPlace      string     `gorm:"type:varchar(100);not null" json:"birth_place"`
	BirthDate       time.Time  `gorm:"not null" json:"birth_date"`
	Gender          string     `gorm:"type:varchar(20);not null" json:"gender"`
	Address         string     `gorm:"type:text;not null" json:"address"`
	ProvinceID      *uuid.UUID `gorm:"type:uuid;index" json:"province_id,omitempty"`
	CityID          *uuid.UUID `gorm:"type:uuid;index" json:"city_id,omitempty"`
	DistrictID      *uuid.UUID `gorm:"type:uuid;index" json:"district_id,omitempty"`
	VillageID       *uuid.UUID `gorm:"type:uuid;index" json:"village_id,omitempty"`
	KtpPhotoURL     string     `gorm:"type:text" json:"ktp_photo_url,omitempty"`
	SelfiePhotoURL  string     `gorm:"type:text" json:"selfie_photo_url,omitempty"`
	Status          string     `gorm:"type:varchar(50);not null;default:'not_submitted'" json:"status"` // not_submitted, pending, approved, rejected
	RejectionReason string     `gorm:"type:text" json:"rejection_reason,omitempty"`
	VerifiedBy      *uuid.UUID `gorm:"type:uuid;index" json:"verified_by,omitempty"`
	VerifiedAt      *time.Time `gorm:"" json:"verified_at,omitempty"`
	CreatedAt       time.Time  `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time  `gorm:"autoUpdateTime" json:"updated_at"`
}

func (KycVerification) TableName() string {
	return "kyc_verifications"
}
