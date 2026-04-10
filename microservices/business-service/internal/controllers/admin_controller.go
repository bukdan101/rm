package controllers

import (
	"log"
	"strconv"
	"time"

	"automarket-business-service/internal/models"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AdminController handles admin-only endpoints
type AdminController struct {
	DB *gorm.DB
}

// ListAllDealers lists all dealers (admin)
func (ctrl *AdminController) ListAllDealers(c fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	perPage, _ := strconv.Atoi(c.Query("per_page", "20"))
	verified := c.Query("verified")
	active := c.Query("active")
	search := c.Query("search")
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	query := ctrl.DB.Model(&models.Dealer{})
	if verified == "true" {
		query = query.Where("verified = ?", true)
	} else if verified == "false" {
		query = query.Where("verified = ?", false)
	}
	if active == "true" {
		query = query.Where("is_active = ?", true)
	} else if active == "false" {
		query = query.Where("is_active = ?", false)
	}
	if search != "" {
		query = query.Where("name ILIKE ? OR email ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	var dealers []models.Dealer
	offset := (page - 1) * perPage
	if err := query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&dealers).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data dealer",
		})
	}

	totalPage := int(total) / perPage
	if int(total)%perPage > 0 {
		totalPage++
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    dealers,
		"meta": fiber.Map{
			"page":       page,
			"per_page":   perPage,
			"total":      total,
			"total_page": totalPage,
		},
	})
}

// VerifyDealer verifies a dealer (admin)
func (ctrl *AdminController) VerifyDealer(c fiber.Ctx) error {
	dealerID := c.Params("id")

	var dealer models.Dealer
	if err := ctrl.DB.Where("id = ?", dealerID).First(&dealer).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Dealer tidak ditemukan",
		})
	}

	var req struct {
		Verified bool `json:"verified"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data tidak valid",
		})
	}

	ctrl.DB.Model(&dealer).Update("verified", req.Verified)

	return c.JSON(fiber.Map{
		"success": true,
		"message": map[bool]string{true: "Dealer berhasil diverifikasi", false: "Verifikasi dealer dicabut"}[req.Verified],
		"data":    dealer,
	})
}

// UpdateDealerStatus activates or deactivates a dealer (admin)
func (ctrl *AdminController) UpdateDealerStatus(c fiber.Ctx) error {
	dealerID := c.Params("id")

	var dealer models.Dealer
	if err := ctrl.DB.Where("id = ?", dealerID).First(&dealer).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Dealer tidak ditemukan",
		})
	}

	var req struct {
		IsActive bool `json:"is_active"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data tidak valid",
		})
	}

	ctrl.DB.Model(&dealer).Update("is_active", req.IsActive)

	return c.JSON(fiber.Map{
		"success": true,
		"message": map[bool]string{true: "Dealer berhasil diaktifkan", false: "Dealer dinonaktifkan"}[req.IsActive],
		"data":    dealer,
	})
}

// ListAllOffers lists all dealer offers (admin)
func (ctrl *AdminController) ListAllOffers(c fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	perPage, _ := strconv.Atoi(c.Query("per_page", "20"))
	status := c.Query("status")
	dealerID := c.Query("dealer_id")
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	query := ctrl.DB.Model(&models.DealerOffer{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if dealerID != "" {
		query = query.Where("dealer_id = ?", dealerID)
	}

	var total int64
	query.Count(&total)

	var offers []models.DealerOffer
	offset := (page - 1) * perPage
	if err := query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&offers).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data penawaran",
		})
	}

	totalPage := int(total) / perPage
	if int(total)%perPage > 0 {
		totalPage++
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    offers,
		"meta": fiber.Map{
			"page":       page,
			"per_page":   perPage,
			"total":      total,
			"total_page": totalPage,
		},
	})
}

// UpdateMarketplaceSettings updates marketplace settings (admin)
func (ctrl *AdminController) UpdateMarketplaceSettings(c fiber.Ctx) error {
	var settings models.DealerMarketplaceSetting
	if err := ctrl.DB.Where("is_active = ?", true).Order("created_at DESC").First(&settings).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			settings = models.DealerMarketplaceSetting{
				ID:                            uuid.New(),
				TokenCostPublic:               1,
				TokenCostDealerMarketplace:    2,
				TokenCostBoth:                 3,
				DefaultOfferDurationHours:     72,
				InspectionCost:                250000,
				InspectionRequiredForDealerMP: false,
				PlatformFeePercentage:         0,
				PlatformFeeEnabled:            false,
				IsActive:                      true,
			}
			ctrl.DB.Create(&settings)
		}
	}

	var req struct {
		TokenCostPublic            *int     `json:"token_cost_public"`
		TokenCostDealerMarketplace *int     `json:"token_cost_dealer_marketplace"`
		TokenCostBoth              *int     `json:"token_cost_both"`
		DefaultOfferDurationHours  *int     `json:"default_offer_duration_hours"`
		InspectionCost             *int64   `json:"inspection_cost"`
		InspectionRequired         *bool    `json:"inspection_required_for_dealer_marketplace"`
		PlatformFeePercentage      *float64 `json:"platform_fee_percentage"`
		PlatformFeeEnabled         *bool    `json:"platform_fee_enabled"`
		IsActive                   *bool    `json:"is_active"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data tidak valid",
		})
	}

	updates := map[string]interface{}{}
	if req.TokenCostPublic != nil {
		updates["token_cost_public"] = *req.TokenCostPublic
	}
	if req.TokenCostDealerMarketplace != nil {
		updates["token_cost_dealer_marketplace"] = *req.TokenCostDealerMarketplace
	}
	if req.TokenCostBoth != nil {
		updates["token_cost_both"] = *req.TokenCostBoth
	}
	if req.DefaultOfferDurationHours != nil {
		updates["default_offer_duration_hours"] = *req.DefaultOfferDurationHours
	}
	if req.InspectionCost != nil {
		updates["inspection_cost"] = *req.InspectionCost
	}
	if req.InspectionRequired != nil {
		updates["inspection_required_for_dealer_marketplace"] = *req.InspectionRequired
	}
	if req.PlatformFeePercentage != nil {
		updates["platform_fee_percentage"] = *req.PlatformFeePercentage
	}
	if req.PlatformFeeEnabled != nil {
		updates["platform_fee_enabled"] = *req.PlatformFeeEnabled
	}
	if req.IsActive != nil {
		updates["is_active"] = *req.IsActive
	}

	if len(updates) > 0 {
		ctrl.DB.Model(&settings).Updates(updates)
	}

	ctrl.DB.Where("id = ?", settings.ID).First(&settings)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Pengaturan marketplace berhasil diperbarui",
		"data":    settings,
	})
}

// suppress unused
var _ = time.Now
var _ = log.Printf
