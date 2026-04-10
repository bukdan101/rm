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

// BannerController handles banner CRUD and click tracking
type BannerController struct {
	DB *gorm.DB
}

// ListBanners returns active banners, filterable by position (public)
func (ctrl *BannerController) ListBanners(c fiber.Ctx) error {
	position := c.Query("position")

	query := ctrl.DB.Where("is_active = ?", true)
	if position != "" {
		query = query.Where("position = ?", position)
	}

	var banners []models.Banner
	if err := query.Order("sort_order ASC, created_at DESC").Find(&banners).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data banner",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    banners,
	})
}

// TrackBannerClick increments click count for a banner (public)
func (ctrl *BannerController) TrackBannerClick(c fiber.Ctx) error {
	bannerID := c.Params("id")

	result := ctrl.DB.Model(&models.Banner{}).Where("id = ?", bannerID).
		Update("click_count", gorm.Expr("click_count + 1"))
	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Banner tidak ditemukan",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Klik banner dicatat",
	})
}

// AdminListBanners lists all banners (admin)
func (ctrl *BannerController) AdminListBanners(c fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	perPage, _ := strconv.Atoi(c.Query("per_page", "20"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	var total int64
	ctrl.DB.Model(&models.Banner{}).Count(&total)

	var banners []models.Banner
	offset := (page - 1) * perPage
	if err := ctrl.DB.Order("sort_order ASC, created_at DESC").Offset(offset).Limit(perPage).Find(&banners).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data banner",
		})
	}

	totalPage := int(total) / perPage
	if int(total)%perPage > 0 {
		totalPage++
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    banners,
		"meta": fiber.Map{
			"page":       page,
			"per_page":   perPage,
			"total":      total,
			"total_page": totalPage,
		},
	})
}

// AdminCreateBanner creates a new banner (admin)
func (ctrl *BannerController) AdminCreateBanner(c fiber.Ctx) error {
	var req struct {
		Title     string     `json:"title"`
		Subtitle  string     `json:"subtitle"`
		ImageURL  string     `json:"image_url"`
		Link      string     `json:"link"`
		Position  string     `json:"position"`
		SortOrder int        `json:"sort_order"`
		IsActive  *bool      `json:"is_active"`
		StartDate *time.Time `json:"start_date"`
		EndDate   *time.Time `json:"end_date"`
	}
	if err := c.Bind().JSON(&req); err != nil || req.Title == "" || req.ImageURL == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Judul dan gambar banner wajib diisi",
		})
	}

	position := req.Position
	if position == "" {
		position = "home"
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}

	banner := models.Banner{
		ID:        uuid.New(),
		Title:     req.Title,
		Subtitle:  req.Subtitle,
		ImageURL:  req.ImageURL,
		Link:      req.Link,
		Position:  position,
		SortOrder: req.SortOrder,
		IsActive:  isActive,
		StartDate: req.StartDate,
		EndDate:   req.EndDate,
	}

	if err := ctrl.DB.Create(&banner).Error; err != nil {
		log.Printf("Create banner error: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membuat banner",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Banner berhasil dibuat",
		"data":    banner,
	})
}

// AdminUpdateBanner updates a banner (admin)
func (ctrl *BannerController) AdminUpdateBanner(c fiber.Ctx) error {
	bannerID := c.Params("id")

	var banner models.Banner
	if err := ctrl.DB.Where("id = ?", bannerID).First(&banner).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Banner tidak ditemukan",
		})
	}

	var req struct {
		Title     string     `json:"title"`
		Subtitle  string     `json:"subtitle"`
		ImageURL  string     `json:"image_url"`
		Link      string     `json:"link"`
		Position  string     `json:"position"`
		SortOrder *int       `json:"sort_order"`
		IsActive  *bool      `json:"is_active"`
		StartDate *time.Time `json:"start_date"`
		EndDate   *time.Time `json:"end_date"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data tidak valid",
		})
	}

	updates := map[string]interface{}{}
	if req.Title != "" {
		updates["title"] = req.Title
	}
	if req.Subtitle != "" {
		updates["subtitle"] = req.Subtitle
	}
	if req.ImageURL != "" {
		updates["image_url"] = req.ImageURL
	}
	if req.Link != "" {
		updates["link"] = req.Link
	}
	if req.Position != "" {
		updates["position"] = req.Position
	}
	if req.SortOrder != nil {
		updates["sort_order"] = *req.SortOrder
	}
	if req.IsActive != nil {
		updates["is_active"] = *req.IsActive
	}
	if req.StartDate != nil {
		updates["start_date"] = req.StartDate
	}
	if req.EndDate != nil {
		updates["end_date"] = req.EndDate
	}

	if len(updates) > 0 {
		ctrl.DB.Model(&banner).Updates(updates)
	}

	ctrl.DB.Where("id = ?", bannerID).First(&banner)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Banner berhasil diperbarui",
		"data":    banner,
	})
}

// AdminDeleteBanner deletes a banner (admin)
func (ctrl *BannerController) AdminDeleteBanner(c fiber.Ctx) error {
	bannerID := c.Params("id")

	result := ctrl.DB.Where("id = ?", bannerID).Delete(&models.Banner{})
	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Banner tidak ditemukan",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Banner berhasil dihapus",
	})
}
