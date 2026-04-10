package controllers

import (
	"strconv"

	"automarket-interaction-service/internal/models"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

// TrendingController handles trending cars operations
type TrendingController struct {
	DB *gorm.DB
}

// GetTrending returns trending cars for a given period
func (tc *TrendingController) GetTrending(c fiber.Ctx) error {
	period := c.Query("period", "weekly")

	validPeriods := map[string]bool{"daily": true, "weekly": true, "monthly": true}
	if !validPeriods[period] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Period tidak valid. Pilihan: daily, weekly, monthly",
		})
	}

	limit := 20
	if l, err := strconv.Atoi(c.Query("limit", "20")); err == nil && l > 0 && l <= 100 {
		limit = l
	}

	var trending []models.TrendingCar

	tc.DB.Model(&models.TrendingCar{}).
		Where("period = ?", period).
		Order("rank ASC, score DESC").
		Limit(limit).
		Find(&trending)

	return c.JSON(fiber.Map{
		"success": true,
		"period":  period,
		"data":    trending,
	})
}
