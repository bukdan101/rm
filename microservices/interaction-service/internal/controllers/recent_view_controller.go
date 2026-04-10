package controllers

import (
	"time"

	"automarket-interaction-service/internal/models"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// RecentViewController handles recent view tracking
type RecentViewController struct {
	DB *gorm.DB
}

// TrackView records or updates a recent view for a car listing
func (rvc *RecentViewController) TrackView(c fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "User tidak terautentikasi",
		})
	}

	var req struct {
		CarListingID string `json:"car_listing_id"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data tidak valid",
		})
	}

	if req.CarListingID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "car_listing_id wajib diisi",
		})
	}

	carListingID, err := uuid.Parse(req.CarListingID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format car_listing_id tidak valid",
		})
	}

	// Check if view already exists
	var existing models.RecentView
	if err := rvc.DB.Where("user_id = ? AND car_listing_id = ?", userID, carListingID).First(&existing).Error; err == nil {
		// Update existing view
		now := time.Now()
		rvc.DB.Model(&existing).Updates(map[string]interface{}{
			"view_count":    gorm.Expr("view_count + 1"),
			"last_viewed_at": now,
		})
		rvc.DB.Where("id = ?", existing.ID).First(&existing)

		return c.JSON(fiber.Map{
			"success": true,
			"message": "View berhasil dicatat",
			"data":    existing,
		})
	}

	// Create new view
	view := models.RecentView{
		UserID:       userID,
		CarListingID: carListingID,
		ViewCount:    1,
	}

	if err := rvc.DB.Create(&view).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mencatat view",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "View berhasil dicatat",
		"data":    view,
	})
}

// GetRecentViews returns the user's recent views, ordered by most recently viewed
func (rvc *RecentViewController) GetRecentViews(c fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "User tidak terautentikasi",
		})
	}

	var views []models.RecentView
	if err := rvc.DB.Where("user_id = ?", userID).
		Order("last_viewed_at DESC").
		Limit(50).
		Find(&views).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Terjadi kesalahan pada server",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    views,
	})
}
