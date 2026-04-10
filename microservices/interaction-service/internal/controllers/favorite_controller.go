package controllers

import (
	"strconv"

	"automarket-interaction-service/internal/models"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// FavoriteController handles favorite-related operations
type FavoriteController struct {
	DB *gorm.DB
}

// AddFavorite adds a car listing to favorites
func (fc *FavoriteController) AddFavorite(c fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "User tidak terautentikasi",
		})
	}

	var req struct {
		CarListingID string `json:"car_listing_id"`
		Notes        string `json:"notes,omitempty"`
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

	// Check for duplicate
	var existing models.CarFavorite
	if err := fc.DB.Where("user_id = ? AND car_listing_id = ?", userID, carListingID).First(&existing).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"success": false,
			"message": "Iklan sudah ada di favorit",
			"data":    existing,
		})
	}

	favorite := models.CarFavorite{
		UserID:       userID,
		CarListingID: carListingID,
		Notes:        req.Notes,
	}

	if err := fc.DB.Create(&favorite).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menambahkan ke favorit",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Berhasil ditambahkan ke favorit",
		"data":    favorite,
	})
}

// RemoveFavorite removes a car listing from favorites
func (fc *FavoriteController) RemoveFavorite(c fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "User tidak terautentikasi",
		})
	}

	favoriteID := c.Params("id")
	parsedID, err := uuid.Parse(favoriteID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format ID tidak valid",
		})
	}

	result := fc.DB.Where("id = ? AND user_id = ?", parsedID, userID).Delete(&models.CarFavorite{})
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menghapus favorit",
		})
	}
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

// GetFavorites returns paginated favorites for the current user
func (fc *FavoriteController) GetFavorites(c fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "User tidak terautentikasi",
		})
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	perPage, _ := strconv.Atoi(c.Query("per_page", "20"))

	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	var favorites []models.CarFavorite
	var total int64

	query := fc.DB.Where("user_id = ?", userID)
	query.Model(&models.CarFavorite{}).Count(&total)

	offset := (page - 1) * perPage
	if err := query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&favorites).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Terjadi kesalahan pada server",
		})
	}

	totalPage := int(total) / perPage
	if int(total)%perPage > 0 {
		totalPage++
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    favorites,
		"meta": fiber.Map{
			"page":       page,
			"per_page":   perPage,
			"total":      total,
			"total_page": totalPage,
		},
	})
}
