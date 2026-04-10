package controllers

import (
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"automarket-system-service/internal/models"
)

// NotificationController handles notification operations
type NotificationController struct {
	DB *gorm.DB
}

// NewNotificationController creates a new NotificationController
func NewNotificationController(db *gorm.DB) *NotificationController {
	return &NotificationController{DB: db}
}

// ListNotifications returns paginated notifications for the authenticated user
func (c *NotificationController) ListNotifications(ctx *fiber.Ctx) error {
	userID := ctx.Locals("user_id").(uuid.UUID)
	page := ctx.QueryInt("page", 1)
	limit := ctx.QueryInt("limit", 20)
	notifType := ctx.Query("type")

	offset := (page - 1) * limit

	query := c.DB.Model(&models.UserNotification{}).
		Where("user_id = ?", userID)

	if notifType != "" {
		query = query.Joins("JOIN notifications ON notifications.id = user_notifications.notification_id").
			Where("notifications.type = ?", notifType)
	}

	var userNotifications []models.UserNotification
	var total int64

	query.Count(&total)

	if err := query.Preload("Notification").
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&userNotifications).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{
			"error": "Failed to fetch notifications",
		})
	}

	return ctx.JSON(fiber.Map{
		"data": userNotifications,
		"pagination": fiber.Map{
			"page":       page,
			"limit":      limit,
			"total":      total,
			"totalPages": (total + int64(limit) - 1) / int64(limit),
		},
	})
}

// MarkNotificationRead marks a specific notification as read
func (c *NotificationController) MarkNotificationRead(ctx *fiber.Ctx) error {
	userID := ctx.Locals("user_id").(uuid.UUID)
	notifID := ctx.Params("id")

	notifUUID, err := uuid.Parse(notifID)
	if err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Invalid notification ID"})
	}

	now := time.Now()
	result := c.DB.Model(&models.UserNotification{}).
		Where("id = ? AND user_id = ?", notifUUID, userID).
		Updates(map[string]any{
			"is_read": true,
			"read_at": now,
		})

	if result.RowsAffected == 0 {
		return ctx.Status(404).JSON(fiber.Map{"error": "Notification not found"})
	}

	return ctx.JSON(fiber.Map{"data": fiber.Map{"message": "Notification marked as read"}})
}

// MarkAllRead marks all notifications as read for the user
func (c *NotificationController) MarkAllRead(ctx *fiber.Ctx) error {
	userID := ctx.Locals("user_id").(uuid.UUID)

	now := time.Now()
	c.DB.Model(&models.UserNotification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Updates(map[string]any{
			"is_read": true,
			"read_at": now,
		})

	return ctx.JSON(fiber.Map{"data": fiber.Map{"message": "All notifications marked as read"}})
}

// UnreadCount returns the unread notification count for the user
func (c *NotificationController) UnreadCount(ctx *fiber.Ctx) error {
	userID := ctx.Locals("user_id").(uuid.UUID)

	var count int64
	c.DB.Model(&models.UserNotification{}).
		Where("user_id = ? AND is_read = ?", userID, false).
		Count(&count)

	return ctx.JSON(fiber.Map{"data": fiber.Map{"unread_count": count}})
}

// ListTemplates returns all notification templates (admin)
func (c *NotificationController) ListTemplates(ctx *fiber.Ctx) error {
	var templates []models.NotificationTemplate
	if err := c.DB.Order("created_at DESC").Find(&templates).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to fetch templates"})
	}

	return ctx.JSON(fiber.Map{"data": templates})
}

// CreateTemplate creates a new notification template (admin)
func (c *NotificationController) CreateTemplate(ctx *fiber.Ctx) error {
	var req models.NotificationTemplate
	if err := ctx.Bind().Body(&req); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	if req.Type == "" {
		return ctx.Status(400).JSON(fiber.Map{"error": "Type is required"})
	}
	if req.Name == "" {
		return ctx.Status(400).JSON(fiber.Map{"error": "Name is required"})
	}

	if err := c.DB.Create(&req).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to create template"})
	}

	return ctx.Status(201).JSON(fiber.Map{"data": req})
}

// UpdateTemplate updates a notification template (admin)
func (c *NotificationController) UpdateTemplate(ctx *fiber.Ctx) error {
	templateID := ctx.Params("id")

	templateUUID, err := uuid.Parse(templateID)
	if err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Invalid template ID"})
	}

	var req struct {
		Name     *string `json:"name"`
		Subject  *string `json:"subject"`
		Body     *string `json:"body"`
		Channels *string `json:"channels"`
		IsActive *bool   `json:"is_active"`
	}

	if err := ctx.Bind().Body(&req); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var template models.NotificationTemplate
	if err := c.DB.Where("id = ?", templateUUID).First(&template).Error; err != nil {
		return ctx.Status(404).JSON(fiber.Map{"error": "Template not found"})
	}

	updates := map[string]any{}
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.Subject != nil {
		updates["subject"] = *req.Subject
	}
	if req.Body != nil {
		updates["body"] = *req.Body
	}
	if req.Channels != nil {
		updates["channels"] = *req.Channels
	}
	if req.IsActive != nil {
		updates["is_active"] = *req.IsActive
	}

	c.DB.Model(&template).Updates(updates)

	return ctx.JSON(fiber.Map{"data": template})
}

// Broadcast sends a notification to all or specific users (admin)
func (c *NotificationController) Broadcast(ctx *fiber.Ctx) error {
	var req struct {
		Type     string         `json:"type" validate:"required"`
		Title    string         `json:"title" validate:"required"`
		Body     string         `json:"body" validate:"required"`
		Icon     string         `json:"icon"`
		ImageURL string         `json:"image_url"`
		Link     string         `json:"link"`
		Data     map[string]any `json:"data"`
		UserIDs  []string       `json:"user_ids"` // If empty, broadcast to all
	}

	if err := ctx.Bind().Body(&req); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Create notification
	notification := models.Notification{
		Type:     req.Type,
		Title:    req.Title,
		Body:     req.Body,
		Icon:     req.Icon,
		ImageURL: req.ImageURL,
		Link:     req.Link,
		Data:     req.Data,
	}

	if err := c.DB.Create(&notification).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to create notification"})
	}

	// Create user notifications
	if len(req.UserIDs) > 0 {
		// Send to specific users
		userNotifications := make([]models.UserNotification, 0, len(req.UserIDs))
		for _, uidStr := range req.UserIDs {
			uid, err := uuid.Parse(uidStr)
			if err != nil {
				continue
			}
			userNotifications = append(userNotifications, models.UserNotification{
				UserID:         uid,
				NotificationID: notification.ID,
			})
		}
		if len(userNotifications) > 0 {
			c.DB.Create(&userNotifications)
		}
	}

	return ctx.Status(201).JSON(fiber.Map{
		"data": fiber.Map{
			"notification": notification,
			"recipients":   len(req.UserIDs),
		},
	})
}
