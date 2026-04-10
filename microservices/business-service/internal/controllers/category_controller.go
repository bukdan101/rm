package controllers

import (
	"log"
	"strings"
	"time"

	"automarket-business-service/internal/models"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CategoryController handles category CRUD
type CategoryController struct {
	DB *gorm.DB
}

// ListCategories returns all active categories (public)
func (ctrl *CategoryController) ListCategories(c fiber.Ctx) error {
	parentID := c.Query("parent_id")
	featuredOnly := c.Query("featured")

	query := ctrl.DB.Where("is_active = ?", true)
	if parentID == "null" || parentID == "" {
		query = query.Where("parent_id IS NULL")
	} else if parentID != "" {
		query = query.Where("parent_id = ?", parentID)
	}
	if featuredOnly == "true" {
		query = query.Where("is_featured = ?", true)
	}

	var categories []models.Category
	if err := query.Order("sort_order ASC, name ASC").Find(&categories).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data kategori",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    categories,
	})
}

// AdminCreateCategory creates a new category (admin)
func (ctrl *CategoryController) AdminCreateCategory(c fiber.Ctx) error {
	var req struct {
		Name        string `json:"name"`
		Slug        string `json:"slug"`
		Description string `json:"description"`
		IconURL     string `json:"icon_url"`
		ParentID    string `json:"parent_id"`
		SortOrder   int    `json:"sort_order"`
		IsActive    *bool  `json:"is_active"`
		IsFeatured  *bool  `json:"is_featured"`
	}
	if err := c.Bind().JSON(&req); err != nil || req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Nama kategori wajib diisi",
		})
	}

	slug := req.Slug
	if slug == "" {
		slug = strings.ToLower(strings.ReplaceAll(req.Name, " ", "-"))
		slug = strings.ToLower(strings.NewReplacer(" ", "-", ".", "-").Replace(slug))
	}

	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}
	isFeatured := false
	if req.IsFeatured != nil {
		isFeatured = *req.IsFeatured
	}

	category := models.Category{
		ID:          uuid.New(),
		Name:        req.Name,
		Slug:        slug,
		Description: req.Description,
		IconURL:     req.IconURL,
		SortOrder:   req.SortOrder,
		IsActive:    isActive,
		IsFeatured:  isFeatured,
	}

	if req.ParentID != "" {
		pid, err := uuid.Parse(req.ParentID)
		if err == nil {
			category.ParentID = &pid
		}
	}

	// Check slug uniqueness
	var existing models.Category
	if ctrl.DB.Where("slug = ?", slug).First(&existing).Error == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"success": false,
			"message": "Slug kategori sudah digunakan",
		})
	}

	if err := ctrl.DB.Create(&category).Error; err != nil {
		log.Printf("Create category error: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membuat kategori",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Kategori berhasil dibuat",
		"data":    category,
	})
}

// AdminUpdateCategory updates a category (admin)
func (ctrl *CategoryController) AdminUpdateCategory(c fiber.Ctx) error {
	categoryID := c.Params("id")

	var category models.Category
	if err := ctrl.DB.Where("id = ?", categoryID).First(&category).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Kategori tidak ditemukan",
		})
	}

	var req struct {
		Name        string `json:"name"`
		Slug        string `json:"slug"`
		Description string `json:"description"`
		IconURL     string `json:"icon_url"`
		ParentID    string `json:"parent_id"`
		SortOrder   *int   `json:"sort_order"`
		IsActive    *bool  `json:"is_active"`
		IsFeatured  *bool  `json:"is_featured"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data tidak valid",
		})
	}

	updates := map[string]interface{}{}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Slug != "" {
		// Check slug uniqueness (excluding current)
		var existing models.Category
		if ctrl.DB.Where("slug = ? AND id != ?", req.Slug, categoryID).First(&existing).Error == nil {
			return c.Status(fiber.StatusConflict).JSON(fiber.Map{
				"success": false,
				"message": "Slug kategori sudah digunakan",
			})
		}
		updates["slug"] = req.Slug
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.IconURL != "" {
		updates["icon_url"] = req.IconURL
	}
	if req.ParentID != "" {
		pid, err := uuid.Parse(req.ParentID)
		if err == nil {
			updates["parent_id"] = pid
		}
	}
	if req.ParentID == "null" {
		updates["parent_id"] = nil
	}
	if req.SortOrder != nil {
		updates["sort_order"] = *req.SortOrder
	}
	if req.IsActive != nil {
		updates["is_active"] = *req.IsActive
	}
	if req.IsFeatured != nil {
		updates["is_featured"] = *req.IsFeatured
	}

	if len(updates) > 0 {
		ctrl.DB.Model(&category).Updates(updates)
	}

	ctrl.DB.Where("id = ?", categoryID).First(&category)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Kategori berhasil diperbarui",
		"data":    category,
	})
}

// AdminDeleteCategory deletes a category (admin)
func (ctrl *CategoryController) AdminDeleteCategory(c fiber.Ctx) error {
	categoryID := c.Params("id")

	// Check for sub-categories
	var childCount int64
	ctrl.DB.Model(&models.Category{}).Where("parent_id = ?", categoryID).Count(&childCount)
	if childCount > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Kategori memiliki sub-kategori dan tidak dapat dihapus",
		})
	}

	result := ctrl.DB.Where("id = ?", categoryID).Delete(&models.Category{})
	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Kategori tidak ditemukan",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Kategori berhasil dihapus",
	})
}

// suppress unused
var _ = time.Now
