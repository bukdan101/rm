package models

import (
	"time"

	"github.com/google/uuid"
)

// CarReview represents a user review for a car listing.
type CarReview struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ListingID uuid.UUID `gorm:"type:uuid;index" json:"listing_id"`
	UserID    uuid.UUID `gorm:"type:uuid;index" json:"user_id"`
	Rating    int       `gorm:"not null" json:"rating"` // 1-5
	Title     *string   `gorm:"type:text" json:"title"`
	Comment   *string   `gorm:"type:text" json:"comment"`
	IsVerified bool     `gorm:"default:false" json:"is_verified"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	Listing CarListing `gorm:"foreignKey:ListingID" json:"listing,omitempty"`
	Images  []ReviewImage `gorm:"foreignKey:ReviewID" json:"images,omitempty"`
	Votes   []ReviewVote  `gorm:"foreignKey:ReviewID" json:"votes,omitempty"`
}

// ReviewImage stores images attached to a review.
type ReviewImage struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ReviewID  uuid.UUID `gorm:"type:uuid;index" json:"review_id"`
	URL       string    `gorm:"type:text;not null" json:"url"`
	SortOrder int       `gorm:"default:0" json:"sort_order"`
	CreatedAt time.Time `json:"created_at"`

	Review CarReview `gorm:"foreignKey:ReviewID" json:"review,omitempty"`
}

// ReviewVote represents a vote (helpful/not helpful) on a review.
type ReviewVote struct {
	ID        uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ReviewID  uuid.UUID `gorm:"type:uuid;index;uniqueIndex:idx_review_user" json:"review_id"`
	UserID    uuid.UUID `gorm:"type:uuid;index;uniqueIndex:idx_review_user" json:"user_id"`
	VoteType  string    `gorm:"type:text;not null" json:"vote_type"` // helpful, not_helpful
	CreatedAt time.Time `json:"created_at"`

	Review CarReview `gorm:"foreignKey:ReviewID" json:"review,omitempty"`
}
