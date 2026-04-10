package models

import (
	"time"

	"github.com/google/uuid"
)

type CarFeatures struct {
	ID              uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID    *uuid.UUID `gorm:"type:uuid;uniqueIndex" json:"car_listing_id"`
	Sunroof         bool       `gorm:"default:false" json:"sunroof"`
	CruiseControl   bool       `gorm:"default:false" json:"cruise_control"`
	RearCamera      bool       `gorm:"default:false" json:"rear_camera"`
	FrontCamera     bool       `gorm:"default:false" json:"front_camera"`
	KeylessStart    bool       `gorm:"default:false" json:"keyless_start"`
	PushStart       bool       `gorm:"default:false" json:"push_start"`
	ServiceBook     bool       `gorm:"default:false" json:"service_book"`
	Airbag          bool       `gorm:"default:false" json:"airbag"`
	ABS             bool       `gorm:"default:false" json:"abs"`
	ESP             bool       `gorm:"default:false" json:"esp"`
	HillStart       bool       `gorm:"default:false" json:"hill_start"`
	AutoPark        bool       `gorm:"default:false" json:"auto_park"`
	LaneKeep        bool       `gorm:"default:false" json:"lane_keep"`
	AdaptiveCruise  bool       `gorm:"default:false" json:"adaptive_cruise"`
	BlindSpot       bool       `gorm:"default:false" json:"blind_spot"`
	WirelessCharger bool       `gorm:"default:false" json:"wireless_charger"`
	AppleCarplay    bool       `gorm:"default:false" json:"apple_carplay"`
	AndroidAuto     bool       `gorm:"default:false" json:"android_auto"`
	Bluetooth       bool       `gorm:"default:false" json:"bluetooth"`
	Navigation      bool       `gorm:"default:false" json:"navigation"`
	CreatedAt       time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (CarFeatures) TableName() string {
	return "car_features"
}

type CarFeatureValue struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID   *uuid.UUID `gorm:"type:uuid;index" json:"car_listing_id"`
	FeatureItemID  *uuid.UUID `gorm:"type:uuid;index" json:"feature_item_id"`
	Value          bool       `gorm:"default:false" json:"value"`
	Notes          string     `gorm:"type:text" json:"notes"`
	CreatedAt      time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (CarFeatureValue) TableName() string {
	return "car_feature_values"
}
