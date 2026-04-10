package controllers

import (
	"strings"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"automarket-system-service/internal/models"
)

// ChatController handles chat and messaging operations
type ChatController struct {
	DB *gorm.DB
}

// NewChatController creates a new ChatController
func NewChatController(db *gorm.DB) *ChatController {
	return &ChatController{DB: db}
}

// ListConversations returns paginated conversations for the authenticated user
func (c *ChatController) ListConversations(ctx *fiber.Ctx) error {
	userID := ctx.Locals("user_id").(uuid.UUID)
	page := ctx.QueryInt("page", 1)
	limit := ctx.QueryInt("limit", 20)
	search := ctx.Query("search")

	offset := (page - 1) * limit

	var conversations []models.Conversation
	query := c.DB.Model(&models.Conversation{}).
		Where("buyer_id = ? OR seller_id = ?", userID, userID)

	if search != "" {
		query = query.Where("last_message ILIKE ?", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	if err := query.Order("last_message_at DESC NULLS LAST").
		Offset(offset).
		Limit(limit).
		Find(&conversations).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch conversations",
		})
	}

	return ctx.JSON(fiber.Map{
		"data": conversations,
		"pagination": fiber.Map{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": (total + int64(limit) - 1) / int64(limit),
		},
	})
}

// CreateConversation starts a new conversation
func (c *ChatController) CreateConversation(ctx *fiber.Ctx) error {
	userID := ctx.Locals("user_id").(uuid.UUID)

	var req struct {
		CarListingID string `json:"car_listing_id" validate:"required"`
		SellerID     string `json:"seller_id" validate:"required"`
	}

	if err := ctx.Bind().Body(&req); err != nil {
		return ctx.Status(400).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	carListingID, err := uuid.Parse(req.CarListingID)
	if err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Invalid car_listing_id"})
	}

	sellerID, err := uuid.Parse(req.SellerID)
	if err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Invalid seller_id"})
	}

	// Check if conversation already exists
	var existing models.Conversation
	if err := c.DB.Where(
		"car_listing_id = ? AND buyer_id = ? AND seller_id = ? AND status = ?",
		carListingID, userID, sellerID, "active",
	).First(&existing).Error; err == nil {
		return ctx.JSON(fiber.Map{"data": existing})
	}

	conversation := models.Conversation{
		CarListingID: &carListingID,
		BuyerID:      userID,
		SellerID:     sellerID,
		Status:       "active",
	}

	if err := c.DB.Create(&conversation).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{
			"error": "Failed to create conversation",
		})
	}

	return ctx.Status(201).JSON(fiber.Map{"data": conversation})
}

// GetConversation returns a single conversation with its messages
func (c *ChatController) GetConversation(ctx *fiber.Ctx) error {
	userID := ctx.Locals("user_id").(uuid.UUID)
	conversationID := ctx.Params("id")

	convUUID, err := uuid.Parse(conversationID)
	if err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Invalid conversation ID"})
	}

	var conversation models.Conversation
	if err := c.DB.Where(
		"id = ? AND (buyer_id = ? OR seller_id = ?)",
		convUUID, userID, userID,
	).First(&conversation).Error; err != nil {
		return ctx.Status(404).JSON(fiber.Map{"error": "Conversation not found"})
	}

	// Get recent messages
	var messages []models.Message
	c.DB.Where("conversation_id = ?", convUUID).
		Order("created_at ASC").
		Limit(50).
		Find(&messages)

	return ctx.JSON(fiber.Map{
		"data": fiber.Map{
			"conversation": conversation,
			"messages":     messages,
		},
	})
}

// GetMessages returns paginated messages for a conversation
func (c *ChatController) GetMessages(ctx *fiber.Ctx) error {
	userID := ctx.Locals("user_id").(uuid.UUID)
	conversationID := ctx.Params("id")

	convUUID, err := uuid.Parse(conversationID)
	if err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Invalid conversation ID"})
	}

	// Verify user is part of conversation
	var conversation models.Conversation
	if err := c.DB.Where(
		"id = ? AND (buyer_id = ? OR seller_id = ?)",
		convUUID, userID, userID,
	).First(&conversation).Error; err != nil {
		return ctx.Status(404).JSON(fiber.Map{"error": "Conversation not found"})
	}

	page := ctx.QueryInt("page", 1)
	limit := ctx.QueryInt("limit", 30)
	offset := (page - 1) * limit

	var messages []models.Message
	var total int64

	query := c.DB.Model(&models.Message{}).
		Where("conversation_id = ?", convUUID)

	// Filter out deleted messages for current user
	if userID == conversation.BuyerID {
		query = query.Where("deleted_for_buyer = ?", false)
	} else {
		query = query.Where("deleted_for_seller = ?", false)
	}

	query.Count(&total)

	if err := query.Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&messages).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to fetch messages"})
	}

	return ctx.JSON(fiber.Map{
		"data": messages,
		"pagination": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// SendMessage sends a new message in a conversation
func (c *ChatController) SendMessage(ctx *fiber.Ctx) error {
	userID := ctx.Locals("user_id").(uuid.UUID)
	conversationID := ctx.Params("id")

	convUUID, err := uuid.Parse(conversationID)
	if err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Invalid conversation ID"})
	}

	var req struct {
		Message     string         `json:"message" validate:"required"`
		MessageType string         `json:"message_type"`
		Metadata    map[string]any `json:"metadata"`
	}

	if err := ctx.Bind().Body(&req); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if strings.TrimSpace(req.Message) == "" {
		return ctx.Status(400).JSON(fiber.Map{"error": "Message cannot be empty"})
	}

	// Verify conversation
	var conversation models.Conversation
	if err := c.DB.Where(
		"id = ? AND (buyer_id = ? OR seller_id = ?) AND status = ?",
		convUUID, userID, userID, "active",
	).First(&conversation).Error; err != nil {
		return ctx.Status(404).JSON(fiber.Map{"error": "Conversation not found or not active"})
	}

	msgType := req.MessageType
	if msgType == "" {
		msgType = "text"
	}

	// Create message
	message := models.Message{
		ConversationID: convUUID,
		SenderID:       userID,
		Message:        req.Message,
		MessageType:    msgType,
		Metadata:       req.Metadata,
	}

	if err := c.DB.Create(&message).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to send message"})
	}

	// Update conversation
	now := message.CreatedAt
	lastMsg := req.Message
	if len(lastMsg) > 100 {
		lastMsg = lastMsg[:100]
	}
	c.DB.Model(&conversation).Updates(map[string]any{
		"last_message":   lastMsg,
		"last_message_at": now,
		"last_message_by": userID,
	})

	// Increment unread count for the other party
	if userID == conversation.BuyerID {
		c.DB.Model(&conversation).Update("seller_unread", gorm.Expr("seller_unread + 1"))
	} else {
		c.DB.Model(&conversation).Update("buyer_unread", gorm.Expr("buyer_unread + 1"))
	}

	return ctx.Status(201).JSON(fiber.Map{"data": message})
}

// MarkAsRead marks a conversation as read for the authenticated user
func (c *ChatController) MarkAsRead(ctx *fiber.Ctx) error {
	userID := ctx.Locals("user_id").(uuid.UUID)
	conversationID := ctx.Params("id")

	convUUID, err := uuid.Parse(conversationID)
	if err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Invalid conversation ID"})
	}

	var conversation models.Conversation
	if err := c.DB.Where("id = ?", convUUID).First(&conversation).Error; err != nil {
		return ctx.Status(404).JSON(fiber.Map{"error": "Conversation not found"})
	}

	now := time.Now()

	// Clear unread count
	if userID == conversation.BuyerID {
		c.DB.Model(&conversation).Updates(map[string]any{
			"buyer_unread": 0,
		})
	} else if userID == conversation.SellerID {
		c.DB.Model(&conversation).Updates(map[string]any{
			"seller_unread": 0,
		})
	}

	// Mark unread messages as read
	c.DB.Model(&models.Message{}).
		Where("conversation_id = ? AND sender_id != ? AND is_read = ?", convUUID, userID, false).
		Updates(map[string]any{
			"is_read": true,
			"read_at": now,
		})

	return ctx.JSON(fiber.Map{"data": fiber.Map{"message": "Conversation marked as read"}})
}

// CloseConversation closes a conversation
func (c *ChatController) CloseConversation(ctx *fiber.Ctx) error {
	userID := ctx.Locals("user_id").(uuid.UUID)
	conversationID := ctx.Params("id")

	convUUID, err := uuid.Parse(conversationID)
	if err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Invalid conversation ID"})
	}

	var conversation models.Conversation
	if err := c.DB.Where(
		"id = ? AND (buyer_id = ? OR seller_id = ?)",
		convUUID, userID, userID,
	).First(&conversation).Error; err != nil {
		return ctx.Status(404).JSON(fiber.Map{"error": "Conversation not found"})
	}

	c.DB.Model(&conversation).Update("status", "closed")

	return ctx.JSON(fiber.Map{"data": fiber.Map{"message": "Conversation closed"}})
}
