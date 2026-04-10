package models

import (
	"time"

	"github.com/google/uuid"
)

type CarPriceHistory struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID   *uuid.UUID `gorm:"type:uuid;index" json:"car_listing_id"`
	PriceCashOld   int64      `gorm:"" json:"price_cash_old"`
	PriceCashNew   int64      `gorm:"" json:"price_cash_new"`
	PriceCreditOld int64      `gorm:"" json:"price_credit_old"`
	PriceCreditNew int64      `gorm:"" json:"price_credit_new"`
	ChangedBy      *uuid.UUID `gorm:"type:uuid" json:"changed_by"`
	ChangedAt      time.Time  `gorm:"autoCreateTime" json:"changed_at"`
	Notes          string     `gorm:"type:text" json:"notes"`
	CreatedAt      time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (CarPriceHistory) TableName() string {
	return "car_price_history"
}

type CarStatusHistory struct {
	ID         uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID *uuid.UUID `gorm:"type:uuid;index" json:"car_listing_id"`
	StatusOld  string     `gorm:"type:varchar(20)" json:"status_old"`
	StatusNew  string     `gorm:"type:varchar(20)" json:"status_new"`
	ChangedBy  *uuid.UUID `gorm:"type:uuid" json:"changed_by"`
	ChangedAt  time.Time  `gorm:"autoCreateTime" json:"changed_at"`
	Notes      string     `gorm:"type:text" json:"notes"`
	CreatedAt  time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (CarStatusHistory) TableName() string {
	return "car_status_history"
}
