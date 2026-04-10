package controllers

import (
	"automarket-listing-service/internal/models"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type BrandController struct {
	DB *gorm.DB
}

// ListBrands returns all brands
func (ctrl *BrandController) ListBrands(c fiber.Ctx) error {
	var brands []models.Brand

	query := ctrl.DB.Order("is_popular DESC, display_order ASC, name ASC")

	if c.Query("popular") == "true" {
		query = query.Where("is_popular = ?", true)
	}

	if err := query.Find(&brands).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data merek",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    brands,
	})
}

// GetModelsByBrand returns models for a given brand
func (ctrl *BrandController) GetModelsByBrand(c fiber.Ctx) error {
	brandID := c.Params("id")
	if _, err := uuid.Parse(brandID); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "ID merek tidak valid",
		})
	}

	var models_list []models.CarModel
	if err := ctrl.DB.Where("brand_id = ?", brandID).
		Order("is_popular DESC, display_order ASC, name ASC").
		Find(&models_list).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data model",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    models_list,
	})
}

// GetVariantsByModel returns variants for a given model
func (ctrl *BrandController) GetVariantsByModel(c fiber.Ctx) error {
	modelID := c.Params("id")
	if _, err := uuid.Parse(modelID); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "ID model tidak valid",
		})
	}

	var variants []models.CarVariant
	if err := ctrl.DB.Where("model_id = ?", modelID).
		Order("name ASC").
		Find(&variants).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data varian",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    variants,
	})
}
