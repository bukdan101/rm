package models

import (
	"time"

	"github.com/google/uuid"
)

// EscrowAccount represents an escrow holding account
type EscrowAccount struct {
	ID                  uuid.UUID       `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	OrderID             uuid.UUID       `gorm:"type:uuid;index;not null" json:"order_id"`
	BuyerID             uuid.UUID       `gorm:"type:uuid" json:"buyer_id"`
	SellerID            uuid.UUID       `gorm:"type:uuid" json:"seller_id"`
	AmountHeld          int64           `gorm:"type:bigint;default:0" json:"amount_held"`
	ReleaseAmount       int64           `gorm:"type:bigint;default:0" json:"release_amount"`
	Status              string          `gorm:"type:text;default:'pending'" json:"status"` // pending, held, released, refunded, disputed
	HeldAt              *time.Time      `gorm:"" json:"held_at,omitempty"`
	ReleaseScheduledAt  *time.Time      `gorm:"" json:"release_scheduled_at,omitempty"`
	ReleasedAt          *time.Time      `gorm:"" json:"released_at,omitempty"`
	RefundedAt          *time.Time      `gorm:"" json:"refunded_at,omitempty"`
	ReleaseConditions   string          `gorm:"type:jsonb;default:'{}'" json:"release_conditions"`
	CreatedAt           time.Time       `gorm:"autoCreateTime" json:"created_at"`
}

func (EscrowAccount) TableName() string {
	return "escrow_accounts"
}
