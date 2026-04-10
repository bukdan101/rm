package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Conversation represents a chat conversation between buyer and seller about a car listing
type Conversation struct {
	ID              uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	CarListingID    *uuid.UUID     `gorm:"type:uuid;index" json:"car_listing_id"`
	BuyerID         uuid.UUID      `gorm:"type:uuid;index" json:"buyer_id"`
	SellerID        uuid.UUID      `gorm:"type:uuid;index" json:"seller_id"`
	LastMessage     string         `gorm:"type:text;default:''" json:"last_message"`
	LastMessageAt   *time.Time     `json:"last_message_at"`
	LastMessageBy   *uuid.UUID     `gorm:"type:uuid" json:"last_message_by"`
	BuyerUnread     int            `gorm:"default:0" json:"buyer_unread"`
	SellerUnread    int            `gorm:"default:0" json:"seller_unread"`
	Status          string         `gorm:"type:varchar(20);default:'active'" json:"status"` // active, closed, blocked
	CreatedAt       time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
}

func (Conversation) TableName() string {
	return "conversations"
}

// Message represents a message within a conversation
type Message struct {
	ID                   uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ConversationID       uuid.UUID      `gorm:"type:uuid;index" json:"conversation_id"`
	SenderID             uuid.UUID      `gorm:"type:uuid;index" json:"sender_id"`
	Message              string         `gorm:"type:text" json:"message"`
	MessageType          string         `gorm:"type:varchar(20);default:'text'" json:"message_type"` // text, image, file, location, system
	Metadata             map[string]any `gorm:"type:jsonb;serializer:json" json:"metadata"`
	IsRead               bool           `gorm:"default:false" json:"is_read"`
	ReadAt               *time.Time     `json:"read_at"`
	DeletedForSender     bool           `gorm:"default:false;column:deleted_for_sender" json:"deleted_for_sender"`
	DeletedForReceiver   bool           `gorm:"default:false;column:deleted_for_receiver" json:"deleted_for_receiver"`
	CreatedAt            time.Time      `gorm:"autoCreateTime" json:"created_at"`
}

func (Message) TableName() string {
	return "messages"
}

// MessageAttachment represents an attachment for a message
type MessageAttachment struct {
	ID           uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	MessageID    uuid.UUID  `gorm:"type:uuid;index" json:"message_id"`
	FileName     string     `gorm:"type:varchar(500)" json:"file_name"`
	FileURL      string     `gorm:"type:varchar(1000)" json:"file_url"`
	FileType     string     `gorm:"type:varchar(100)" json:"file_type"`
	FileSize     int64      `gorm:"type:bigint" json:"file_size"`
	ThumbnailURL string     `gorm:"type:varchar(1000)" json:"thumbnail_url"`
	CreatedAt    time.Time  `gorm:"autoCreateTime" json:"created_at"`
}

func (MessageAttachment) TableName() string {
	return "message_attachments"
}
