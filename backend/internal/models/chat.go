package models

import (
	"time"

	"github.com/google/uuid"
)

// ============================================
// MODULE 9: CHAT & MESSAGING (3 tables)
// ============================================

type Conversation struct {
	ID             uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID   *uuid.UUID `gorm:"type:uuid;index" json:"car_listing_id"`
	BuyerID        *uuid.UUID `gorm:"type:uuid;index" json:"buyer_id"`
	SellerID       *uuid.UUID `gorm:"type:uuid;index" json:"seller_id"`
	LastMessage    *string    `gorm:"type:text;column:last_message" json:"last_message"`
	LastMessageAt  *time.Time `json:"last_message_at"`
	LastMessageBy  *uuid.UUID `gorm:"type:uuid" json:"last_message_by"`
	BuyerUnread    int        `gorm:"default:0;column:buyer_unread" json:"buyer_unread"`
	SellerUnread   int        `gorm:"default:0;column:seller_unread" json:"seller_unread"`
	Status         *string    `gorm:"type:text;default:'active';check:status IN ('active','closed','blocked')" json:"status"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
	// Relations
	Messages []Message `gorm:"foreignKey:ConversationID" json:"messages,omitempty"`
}

type Message struct {
	ID              uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ConversationID  uuid.UUID  `gorm:"type:uuid;index" json:"conversation_id"`
	SenderID        *uuid.UUID `gorm:"type:uuid;index" json:"sender_id"`
	Message         *string    `gorm:"type:text" json:"message"`
	MessageType     *string    `gorm:"type:text;default:'text';check:message_type IN ('text','image','file','location','system')" json:"message_type"`
	Metadata        *string    `gorm:"type:jsonb" json:"metadata"`
	IsRead          bool       `gorm:"default:false;column:is_read" json:"is_read"`
	ReadAt          *time.Time `json:"read_at"`
	DeletedForSender bool      `gorm:"default:false;column:deleted_for_sender" json:"deleted_for_sender"`
	DeletedForReceiver bool     `gorm:"default:false;column:deleted_for_receiver" json:"deleted_for_receiver"`
	CreatedAt       time.Time  `json:"created_at"`
	// Relations
	Attachments []MessageAttachment `gorm:"foreignKey:MessageID" json:"attachments,omitempty"`
}

type MessageAttachment struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	MessageID   *uuid.UUID `gorm:"type:uuid;index" json:"message_id"`
	FileName    *string    `gorm:"type:text;column:file_name" json:"file_name"`
	FileURL     *string    `gorm:"type:text;column:file_url" json:"file_url"`
	FileType    *string    `gorm:"type:text;column:file_type" json:"file_type"`
	FileSize    *int64     `gorm:"type:bigint" json:"file_size"`
	ThumbnailURL *string   `gorm:"type:text;column:thumbnail_url" json:"thumbnail_url"`
	CreatedAt   time.Time  `json:"created_at"`
}
