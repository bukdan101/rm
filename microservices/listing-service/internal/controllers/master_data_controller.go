package controllers

import (
	"automarket-listing-service/internal/models"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

type MasterDataController struct {
	DB *gorm.DB
}

// ListColors returns all car colors
func (ctrl *MasterDataController) ListColors(c fiber.Ctx) error {
	var colors []models.CarColor
	if err := ctrl.DB.Order("is_popular DESC, name ASC").Find(&colors).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data warna",
			"error":   err.Error(),
		})
	}
	return c.JSON(fiber.Map{"success": true, "data": colors})
}

// ListBodyTypes returns all body types
func (ctrl *MasterDataController) ListBodyTypes(c fiber.Ctx) error {
	var bodyTypes []models.CarBodyType
	if err := ctrl.DB.Order("name ASC").Find(&bodyTypes).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data tipe body",
			"error":   err.Error(),
		})
	}
	return c.JSON(fiber.Map{"success": true, "data": bodyTypes})
}

// ListFuelTypes returns all fuel types
func (ctrl *MasterDataController) ListFuelTypes(c fiber.Ctx) error {
	var fuelTypes []models.CarFuelType
	if err := ctrl.DB.Order("name ASC").Find(&fuelTypes).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data tipe bahan bakar",
			"error":   err.Error(),
		})
	}
	return c.JSON(fiber.Map{"success": true, "data": fuelTypes})
}

// ListTransmissions returns all transmission types
func (ctrl *MasterDataController) ListTransmissions(c fiber.Ctx) error {
	var transmissions []models.CarTransmission
	if err := ctrl.DB.Order("name ASC").Find(&transmissions).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data transmisi",
			"error":   err.Error(),
		})
	}
	return c.JSON(fiber.Map{"success": true, "data": transmissions})
}

// ListCategories returns all categories
func (ctrl *MasterDataController) ListCategories(c fiber.Ctx) error {
	var categories []models.Category
	query := ctrl.DB.Order("sort_order ASC, name ASC")
	if c.Query("active") == "true" {
		query = query.Where("is_active = ?", true)
	}
	if c.Query("featured") == "true" {
		query = query.Where("is_featured = ?", true)
	}
	if err := query.Find(&categories).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data kategori",
			"error":   err.Error(),
		})
	}
	return c.JSON(fiber.Map{"success": true, "data": categories})
}

// ListFeatureCategories returns all feature categories with groups and items
func (ctrl *MasterDataController) ListFeatureCategories(c fiber.Ctx) error {
	var categories []models.FeatureCategory
	if err := ctrl.DB.Order("display_order ASC").Find(&categories).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data kategori fitur",
			"error":   err.Error(),
		})
	}

	// Fetch groups for all categories
	var groups []models.FeatureGroup
	ctrl.DB.Order("display_order ASC").Find(&groups)

	// Fetch items for all groups
	var items []models.FeatureItem
	ctrl.DB.Order("display_order ASC").Find(&items)

	// Build nested response
	type GroupWithItems struct {
		models.FeatureGroup
		Items []models.FeatureItem `json:"items"`
	}

	type CategoryWithGroups struct {
		models.FeatureCategory
		Groups []GroupWithItems `json:"groups"`
	}

	result := make([]CategoryWithGroups, 0, len(categories))
	for _, cat := range categories {
		cg := CategoryWithGroups{FeatureCategory: cat}
		for _, grp := range groups {
			if grp.CategoryID != nil && *grp.CategoryID == cat.ID {
				gwi := GroupWithItems{FeatureGroup: grp}
				for _, item := range items {
					if item.GroupID != nil && *item.GroupID == grp.ID {
						gwi.Items = append(gwi.Items, item)
					}
				}
				cg.Groups = append(cg.Groups, gwi)
			}
		}
		result = append(result, cg)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    result,
	})
}

// ListInspectionItems returns all inspection categories and items
func (ctrl *MasterDataController) ListInspectionItems(c fiber.Ctx) error {
	var categories []models.InspectionCategory
	if err := ctrl.DB.Order("display_order ASC").Find(&categories).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data kategori inspeksi",
			"error":   err.Error(),
		})
	}

	var items []models.InspectionItem
	ctrl.DB.Order("display_order ASC").Find(&items)

	type CategoryWithItems struct {
		models.InspectionCategory
		Items []models.InspectionItem `json:"items"`
	}

	result := make([]CategoryWithItems, 0, len(categories))
	totalItems := 0
	for _, cat := range categories {
		cwi := CategoryWithItems{InspectionCategory: cat}
		for _, item := range items {
			if item.CategoryID != nil && *item.CategoryID == cat.ID {
				cwi.Items = append(cwi.Items, item)
				totalItems++
			}
		}
		cwi.TotalItems = len(cwi.Items)
		result = append(result, cwi)
	}

	return c.JSON(fiber.Map{
		"success":     true,
		"data":        result,
		"total_items": totalItems,
	})
}
