package models

import (
	"time"

	"github.com/google/uuid"
)

// Coupon represents a discount coupon
type Coupon struct {
	ID               uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Code             string    `gorm:"type:text;uniqueIndex;not null" json:"code"`
	Name             string    `gorm:"type:text;not null" json:"name"`
	Description      string    `gorm:"type:text" json:"description"`
	DiscountType     string    `gorm:"type:text;not null" json:"discount_type"` // percentage, fixed
	DiscountValue    float64   `gorm:"type:numeric;not null" json:"discount_value"`
	UsageLimit       int       `gorm:"type:int;default:0" json:"usage_limit"`
	UsedCount        int       `gorm:"type:int;default:0" json:"used_count"`
	IsActive         bool      `gorm:"default:true" json:"is_active"`
	CreatedAt        time.Time `gorm:"autoCreateTime" json:"created_at"`
}

func (Coupon) TableName() string {
	return "coupons"
}
