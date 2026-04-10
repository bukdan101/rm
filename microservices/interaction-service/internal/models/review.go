package models

import (
	"time"

	"github.com/google/uuid"
)

// CarReview represents a car listing review
type CarReview struct {
	ID                 uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID       uuid.UUID      `gorm:"type:uuid;index" json:"car_listing_id"`
	UserID             uuid.UUID      `gorm:"type:uuid;index" json:"user_id"`
	OrderID            *uuid.UUID     `gorm:"type:uuid" json:"order_id,omitempty"`
	Rating             int            `gorm:"check:rating >= 1 AND rating <= 5" json:"rating"`
	Title              string         `gorm:"type:varchar(255)" json:"title"`
	Comment            string         `gorm:"type:text" json:"comment"`
	Pros               string         `gorm:"type:text" json:"pros,omitempty"`
	Cons               string         `gorm:"type:text" json:"cons,omitempty"`
	IsVerifiedPurchase bool           `gorm:"default:false" json:"is_verified_purchase"`
	IsAnonymous        bool           `gorm:"default:false" json:"is_anonymous"`
	HelpfulCount       int            `gorm:"default:0" json:"helpful_count"`
	NotHelpfulCount    int            `gorm:"default:0" json:"not_helpful_count"`
	SellerResponse     string         `gorm:"type:text" json:"seller_response,omitempty"`
	SellerRespondedAt  *time.Time     `json:"seller_responded_at,omitempty"`
	Status             string         `gorm:"type:varchar(20);default:'active';check:status IN ('pending','active','hidden','deleted')" json:"status"`
	CreatedAt          time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt          time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
}

// TableName specifies the table name for CarReview
func (CarReview) TableName() string {
	return "car_reviews"
}

// ReviewImage represents an image attached to a review
type ReviewImage struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ReviewID     uuid.UUID `gorm:"type:uuid;index" json:"review_id"`
	ImageURL     string    `gorm:"type:text;not null" json:"image_url"`
	ThumbnailURL string    `gorm:"type:text" json:"thumbnail_url,omitempty"`
	Caption      string    `gorm:"type:varchar(255)" json:"caption,omitempty"`
	DisplayOrder int       `gorm:"default:0" json:"display_order"`
	CreatedAt    time.Time `gorm:"autoCreateTime" json:"created_at"`
}

// TableName specifies the table name for ReviewImage
func (ReviewImage) TableName() string {
	return "review_images"
}

// ReviewVote represents a user's vote on a review
type ReviewVote struct {
	ID       uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ReviewID uuid.UUID `gorm:"type:uuid;index" json:"review_id"`
	UserID   uuid.UUID `gorm:"type:uuid;index" json:"user_id"`
	VoteType string    `gorm:"type:varchar(20);check:vote_type IN ('helpful','not_helpful')" json:"vote_type"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}

// TableName specifies the table name for ReviewVote
func (ReviewVote) TableName() string {
	return "review_votes"
}
