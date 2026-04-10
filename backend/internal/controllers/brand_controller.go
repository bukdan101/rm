package controllers

import (
        "automarket/internal/models"
        "automarket/internal/utils"

        "github.com/gofiber/fiber/v3"
        "gorm.io/gorm"
)

// GetBrands returns all brands
func GetBrands(c fiber.Ctx) error {
        db := c.Locals("db").(*gorm.DB)

        var brands []models.Brand
        db.Order("display_order ASC, name ASC").Find(&brands)

        return utils.SuccessResponse(c, brands)
}

// GetModelsByBrand returns models for a specific brand
func GetModelsByBrand(c fiber.Ctx) error {
        db := c.Locals("db").(*gorm.DB)
        brandID := c.Params("id")

        var models_list []models.CarModel
        db.Where("brand_id = ?", brandID).Order("display_order ASC, name ASC").Find(&models_list)

        return utils.SuccessResponse(c, models_list)
}

// GetVariantsByModel returns variants for a specific model
func GetVariantsByModel(c fiber.Ctx) error {
        db := c.Locals("db").(*gorm.DB)
        modelID := c.Params("id")

        var variants []models.CarVariant
        db.Where("model_id = ?", modelID).Find(&variants)

        return utils.SuccessResponse(c, variants)
}

// GetColors returns all car colors
func GetColors(c fiber.Ctx) error {
        db := c.Locals("db").(*gorm.DB)

        var colors []models.CarColor
        db.Order("name ASC").Find(&colors)

        return utils.SuccessResponse(c, colors)
}

// GetLocations returns provinces/cities/districts
func GetProvinces(c fiber.Ctx) error {
        db := c.Locals("db").(*gorm.DB)
        var provinces []models.Province
        db.Where("is_active = ?", true).Order("name ASC").Find(&provinces)
        return utils.SuccessResponse(c, provinces)
}

func GetCities(c fiber.Ctx) error {
        db := c.Locals("db").(*gorm.DB)
        provinceID := c.Query("province_id")
        if provinceID == "" {
                return utils.ErrorMsg(c, fiber.StatusBadRequest, "province_id diperlukan")
        }
        var cities []models.City
        db.Where("province_id = ? AND is_active = ?", provinceID, true).Order("name ASC").Find(&cities)
        return utils.SuccessResponse(c, cities)
}

func GetDistricts(c fiber.Ctx) error {
        db := c.Locals("db").(*gorm.DB)
        cityID := c.Query("city_id")
        if cityID == "" {
                return utils.ErrorMsg(c, fiber.StatusBadRequest, "city_id diperlukan")
        }
        var districts []models.District
        db.Where("city_id = ? AND is_active = ?", cityID, true).Order("name ASC").Find(&districts)
        return utils.SuccessResponse(c, districts)
}

// GetDealers returns all active dealers
func GetDealers(c fiber.Ctx) error {
        db := c.Locals("db").(*gorm.DB)
        var dealers []models.Dealer
        db.Where("is_active = ?", true).Order("name ASC").Find(&dealers)
        return utils.SuccessResponse(c, dealers)
}

// GetDealerBySlug returns a dealer profile
func GetDealerBySlug(c fiber.Ctx) error {
        db := c.Locals("db").(*gorm.DB)
        slug := c.Params("slug")

        var dealer models.Dealer
        if err := db.Preload("Owner").Where("slug = ?", slug).First(&dealer).Error; err != nil {
                return utils.ErrorMsg(c, fiber.StatusNotFound, "Dealer tidak ditemukan")
        }

        return utils.SuccessResponse(c, dealer)
}

// GetInspectionItems returns all 160 inspection items grouped by category
func GetInspectionItems(c fiber.Ctx) error {
        db := c.Locals("db").(*gorm.DB)

        var categories []models.InspectionCategory
        db.Preload("Items", func(db *gorm.DB) *gorm.DB {
                return db.Order("display_order ASC")
        }).Order("display_order ASC").Find(&categories)

        return utils.SuccessResponse(c, categories)
}

// GetTokenPackages returns available token packages
func GetTokenPackages(c fiber.Ctx) error {
        db := c.Locals("db").(*gorm.DB)

        var packages []models.TokenPackage
        db.Where("is_active = ?", true).Order("price ASC").Find(&packages)

        return utils.SuccessResponse(c, packages)
}

// GetTokenBalance returns the authenticated user's token balance
func GetTokenBalance(c fiber.Ctx) error {
        db := c.Locals("db").(*gorm.DB)
        userID, _ := c.Locals("user_id").(interface{})

        var userToken models.UserToken
        if err := db.Where("user_id = ?", userID).First(&userToken).Error; err != nil {
                // Return default empty balance
                return utils.SuccessResponse(c, fiber.Map{
                        "balance":        0,
                        "total_purchased": 0,
                        "total_used":     0,
                        "total_bonus":    0,
                })
        }

        return utils.SuccessResponse(c, userToken)
}

// GetTokenTransactions returns token transaction history
func GetTokenTransactions(c fiber.Ctx) error {
        db := c.Locals("db").(*gorm.DB)
        userID, _ := c.Locals("user_id").(interface{})

        var transactions []models.TokenTransaction
        db.Where("user_id = ?", userID).Order("created_at DESC").Limit(50).Find(&transactions)

        return utils.SuccessResponse(c, transactions)
}
