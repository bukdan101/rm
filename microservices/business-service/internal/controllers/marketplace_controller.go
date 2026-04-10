package controllers

import (
	"log"
	"strconv"

	"automarket-business-service/internal/models"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// MarketplaceController handles dealer marketplace settings and favorites
type MarketplaceController struct {
	DB *gorm.DB
}

// GetFavorites returns dealer's favorited car listings (authenticated)
func (ctrl *MarketplaceController) GetFavorites(c fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	dealerIDStr := c.Query("dealer_id")

	dealerID := userID // Default: use authenticated user's ID
	if dealerIDStr != "" {
		if did, err := uuid.Parse(dealerIDStr); err == nil {
			dealerID = did
		}
	}

	var favorites []models.DealerMarketplaceFavorite
	if err := ctrl.DB.Where("dealer_id = ?", dealerID).Order("created_at DESC").Find(&favorites).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data favorit",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    favorites,
	})
}

// AddFavorite adds a car listing to dealer's favorites (authenticated)
func (ctrl *MarketplaceController) AddFavorite(c fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	var req struct {
		DealerID     string `json:"dealer_id"`
		CarListingID string `json:"car_listing_id"`
		StaffID      string `json:"staff_id"`
		Notes        string `json:"notes"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data tidak valid",
		})
	}

	carListingID, err := uuid.Parse(req.CarListingID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "car_listing_id tidak valid",
		})
	}

	dealerID := userID
	if req.DealerID != "" {
		if did, err := uuid.Parse(req.DealerID); err == nil {
			dealerID = did
		}
	}

	// Check for existing favorite
	var existing models.DealerMarketplaceFavorite
	if ctrl.DB.Where("dealer_id = ? AND car_listing_id = ?", dealerID, carListingID).First(&existing).Error == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"success": false,
			"message": "Listing sudah ada di favorit",
		})
	}

	favorite := models.DealerMarketplaceFavorite{
		ID:           uuid.New(),
		DealerID:     dealerID,
		CarListingID: carListingID,
		Notes:        req.Notes,
	}

	if req.StaffID != "" {
		sid, err := uuid.Parse(req.StaffID)
		if err == nil {
			favorite.StaffID = &sid
		}
	}

	if err := ctrl.DB.Create(&favorite).Error; err != nil {
		log.Printf("Add favorite error: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menambah favorit",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Berhasil ditambahkan ke favorit",
		"data":    favorite,
	})
}

// RemoveFavorite removes a car listing from dealer's favorites (authenticated)
func (ctrl *MarketplaceController) RemoveFavorite(c fiber.Ctx) error {
	favoriteID := c.Params("id")

	result := ctrl.DB.Where("id = ?", favoriteID).Delete(&models.DealerMarketplaceFavorite{})
	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Favorit tidak ditemukan",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Favorit berhasil dihapus",
	})
}

// GetMarketplaceSettings returns active marketplace settings (authenticated)
func (ctrl *MarketplaceController) GetMarketplaceSettings(c fiber.Ctx) error {
	var settings models.DealerMarketplaceSetting
	if err := ctrl.DB.Where("is_active = ?", true).Order("created_at DESC").First(&settings).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Return defaults
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
		} else {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": "Gagal mengambil pengaturan marketplace",
			})
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    settings,
	})
}

// suppress unused import warning
var _ = strconv.Atoi
var _ = log.Printf
