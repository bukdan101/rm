package controllers

import (
	"strconv"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"automarket-system-service/internal/models"
)

// SettingsController handles system settings operations
type SettingsController struct {
	DB *gorm.DB
}

// NewSettingsController creates a new SettingsController
func NewSettingsController(db *gorm.DB) *SettingsController {
	return &SettingsController{DB: db}
}

// GetPublicSettings returns public system settings (by group or key)
func (c *SettingsController) GetPublicSettings(ctx *fiber.Ctx) error {
	group := ctx.Query("group")
	key := ctx.Query("key")

	query := c.DB.Model(&models.SystemSetting{})

	if group != "" {
		query = query.Where("`group` = ?", group)
	}
	if key != "" {
		query = query.Where("key = ?", key)
	}

	var settings []models.SystemSetting
	if err := query.Find(&settings).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to fetch settings"})
	}

	// Convert to key-value map with type casting
	result := make(map[string]any)
	for _, s := range settings {
		result[s.Key] = castValue(s.Value, s.Type)
	}

	return ctx.JSON(fiber.Map{"data": result})
}

// GetAllSettings returns all system settings (admin)
func (c *SettingsController) GetAllSettings(ctx *fiber.Ctx) error {
	group := ctx.Query("group")

	query := c.DB.Model(&models.SystemSetting{})
	if group != "" {
		query = query.Where("`group` = ?", group)
	}

	var settings []models.SystemSetting
	if err := query.Order("`key` ASC").Find(&settings).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to fetch settings"})
	}

	// Group by group name
	grouped := make(map[string][]models.SystemSetting)
	for _, s := range settings {
		grouped[s.Group] = append(grouped[s.Group], s)
	}

	return ctx.JSON(fiber.Map{"data": fiber.Map{
		"settings": settings,
		"grouped":  grouped,
	}})
}

// UpdateSetting updates a system setting (admin)
func (c *SettingsController) UpdateSetting(ctx *fiber.Ctx) error {
	var req struct {
		Key   string `json:"key" validate:"required"`
		Value string `json:"value" validate:"required"`
		Type  string `json:"type"`
		Group string `json:"group"`
	}

	if err := ctx.Bind().Body(&req); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var setting models.SystemSetting
	if err := c.DB.Where("key = ?", req.Key).First(&setting).Error; err != nil {
		return ctx.Status(404).JSON(fiber.Map{"error": "Setting not found"})
	}

	updates := map[string]any{
		"value": req.Value,
	}
	if req.Type != "" {
		updates["type"] = req.Type
	}
	if req.Group != "" {
		updates["group"] = req.Group
	}

	c.DB.Model(&setting).Updates(updates)

	return ctx.JSON(fiber.Map{"data": setting})
}

// SetSetting creates or updates a specific setting by key (admin)
func (c *SettingsController) SetSetting(ctx *fiber.Ctx) error {
	key := ctx.Params("key")

	var req struct {
		Value string `json:"value" validate:"required"`
		Type  string `json:"type"`
		Group string `json:"group"`
	}

	if err := ctx.Bind().Body(&req); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	// Determine type
	settingType := req.Type
	if settingType == "" {
		settingType = "string"
	}

	// Determine group
	group := req.Group
	if group == "" {
		group = "general"
	}

	// Upsert
	var setting models.SystemSetting
	result := c.DB.Where("key = ?", key).First(&setting)

	if result.Error != nil {
		// Create new
		setting = models.SystemSetting{
			Key:   key,
			Value: req.Value,
			Type:  settingType,
			Group: group,
		}
		if err := c.DB.Create(&setting).Error; err != nil {
			return ctx.Status(500).JSON(fiber.Map{"error": "Failed to create setting"})
		}
		return ctx.Status(201).JSON(fiber.Map{"data": setting})
	}

	// Update existing
	c.DB.Model(&setting).Updates(map[string]any{
		"value": req.Value,
		"type":  settingType,
		"group": group,
	})

	c.DB.Where("key = ?", key).First(&setting)

	return ctx.JSON(fiber.Map{"data": setting})
}

// castValue casts a string value to the appropriate type
func castValue(value string, valueType string) any {
	switch valueType {
	case "number":
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
		if floatVal, err := strconv.ParseFloat(value, 64); err == nil {
			return floatVal
		}
		return value
	case "boolean":
		return value == "true" || value == "1"
	case "json":
		return value // Return as raw string; frontend can parse
	default:
		return value
	}
}

// Ensure uuid import is used
var _ = uuid.Nil
