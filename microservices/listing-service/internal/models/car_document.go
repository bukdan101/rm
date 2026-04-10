package models

import (
	"time"

	"github.com/google/uuid"
)

type CarDocument struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID   *uuid.UUID `gorm:"type:uuid;uniqueIndex" json:"car_listing_id"`
	LicensePlate   string     `gorm:"type:varchar(50)" json:"license_plate"`
	SellWithPlate  bool       `gorm:"default:true" json:"sell_with_plate"`
	STNKStatus     string     `gorm:"type:varchar(50)" json:"stnk_status"`     // active, expired, none
	BPKBStatus     string     `gorm:"type:varchar(50)" json:"bpkb_status"`     // original, copy, none
	OwnershipType  string     `gorm:"type:varchar(50)" json:"ownership_type"`  // personal, company, lease
	RegistrationDate *time.Time `gorm:"" json:"registration_date"`
	PreviousOwners int        `gorm:"default:0" json:"previous_owners"`
	CreatedAt      time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (CarDocument) TableName() string {
	return "car_documents"
}
