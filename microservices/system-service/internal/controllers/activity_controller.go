package controllers

import (
        "github.com/gofiber/fiber/v3"
        "github.com/google/uuid"
        "gorm.io/gorm"

        "automarket-system-service/internal/models"
)

// ActivityController handles activity log operations
type ActivityController struct {
        DB *gorm.DB
}

// NewActivityController creates a new ActivityController
func NewActivityController(db *gorm.DB) *ActivityController {
        return &ActivityController{DB: db}
}

// ListActivityLogs returns paginated activity logs (admin)
func (c *ActivityController) ListActivityLogs(ctx *fiber.Ctx) error {
        page := ctx.QueryInt("page", 1)
        limit := ctx.QueryInt("limit", 50)
        userID := ctx.Query("user_id")
        action := ctx.Query("action")
        entityType := ctx.Query("entity_type")

        offset := (page - 1) * limit

        query := c.DB.Model(&models.ActivityLog{})

        if userID != "" {
                query = query.Where("user_id = ?", userID)
        }
        if action != "" {
                query = query.Where("action = ?", action)
        }
        if entityType != "" {
                query = query.Where("entity_type = ?", entityType)
        }

        var logs []models.ActivityLog
        var total int64
        query.Count(&total)

        if err := query.Order("created_at DESC").
                Offset(offset).
                Limit(limit).
                Find(&logs).Error; err != nil {
                return ctx.Status(500).JSON(fiber.Map{"error": "Failed to fetch activity logs"})
        }

        return ctx.JSON(fiber.Map{
                "data": logs,
                "pagination": fiber.Map{
                        "page":  page,
                        "limit": limit,
                        "total": total,
                },
        })
}

// CreateActivityLog creates a new activity log entry (internal use)
func (c *ActivityController) CreateActivityLog(userID string, action string, entityType string, entityID string, oldData map[string]any, newData map[string]any, ip string, userAgent string) error {
        log := models.ActivityLog{
                Action:     action,
                EntityType: entityType,
                OldData:    oldData,
                NewData:    newData,
                IPAddress:  ip,
                UserAgent:  userAgent,
        }

        if userID != "" {
                log.UserID = parseUUID(userID)
        }
        if entityID != "" {
                eid := parseUUID(entityID)
                log.EntityID = &eid
        }

        return c.DB.Create(&log).Error
}

// parseUUID parses a UUID string, returns Nil UUID on error
func parseUUID(s string) uuid.UUID {
        uid, err := uuid.Parse(s)
        if err != nil {
                return uuid.Nil
        }
        return uid
}
