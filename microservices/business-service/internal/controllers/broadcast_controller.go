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

// BroadcastController handles broadcast CRUD
type BroadcastController struct {
	DB *gorm.DB
}

// AdminListBroadcasts lists all broadcasts (admin)
func (ctrl *BroadcastController) AdminListBroadcasts(c fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	perPage, _ := strconv.Atoi(c.Query("per_page", "20"))
	status := c.Query("status")
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	query := ctrl.DB.Model(&models.Broadcast{})
	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	query.Count(&total)

	var broadcasts []models.Broadcast
	offset := (page - 1) * perPage
	if err := query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&broadcasts).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data broadcast",
		})
	}

	totalPage := int(total) / perPage
	if int(total)%perPage > 0 {
		totalPage++
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    broadcasts,
		"meta": fiber.Map{
			"page":       page,
			"per_page":   perPage,
			"total":      total,
			"total_page": totalPage,
		},
	})
}

// AdminCreateBroadcast creates a new broadcast (admin)
func (ctrl *BroadcastController) AdminCreateBroadcast(c fiber.Ctx) error {
	var req struct {
		Title       string     `json:"title"`
		Body        string     `json:"body"`
		ImageURL    string     `json:"image_url"`
		Link        string     `json:"link"`
		Segment     string     `json:"segment"`
		ScheduledAt *time.Time `json:"scheduled_at"`
	}
	if err := c.Bind().JSON(&req); err != nil || req.Title == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Judul broadcast wajib diisi",
		})
	}

	segment := req.Segment
	if segment == "" {
		segment = "all"
	}

	broadcastStatus := "draft"
	if req.ScheduledAt != nil {
		broadcastStatus = "scheduled"
	}

	broadcast := models.Broadcast{
		ID:          uuid.New(),
		Title:       req.Title,
		Body:        req.Body,
		ImageURL:    req.ImageURL,
		Link:        req.Link,
		Segment:     segment,
		ScheduledAt: req.ScheduledAt,
		Status:      broadcastStatus,
	}

	if err := ctrl.DB.Create(&broadcast).Error; err != nil {
		log.Printf("Create broadcast error: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membuat broadcast",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Broadcast berhasil dibuat",
		"data":    broadcast,
	})
}

// AdminUpdateBroadcast updates a broadcast (admin)
func (ctrl *BroadcastController) AdminUpdateBroadcast(c fiber.Ctx) error {
	broadcastID := c.Params("id")

	var broadcast models.Broadcast
	if err := ctrl.DB.Where("id = ?", broadcastID).First(&broadcast).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Broadcast tidak ditemukan",
		})
	}

	var req struct {
		Title       string     `json:"title"`
		Body        string     `json:"body"`
		ImageURL    string     `json:"image_url"`
		Link        string     `json:"link"`
		Segment     string     `json:"segment"`
		ScheduledAt *time.Time `json:"scheduled_at"`
		Status      string     `json:"status"`
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
	if req.Body != "" {
		updates["body"] = req.Body
	}
	if req.ImageURL != "" {
		updates["image_url"] = req.ImageURL
	}
	if req.Link != "" {
		updates["link"] = req.Link
	}
	if req.Segment != "" {
		updates["segment"] = req.Segment
	}
	if req.ScheduledAt != nil {
		updates["scheduled_at"] = req.ScheduledAt
	}
	if req.Status != "" {
		updates["status"] = req.Status
		if req.Status == "sent" {
			now := time.Now()
			updates["sent_at"] = now
		}
	}

	if len(updates) > 0 {
		ctrl.DB.Model(&broadcast).Updates(updates)
	}

	ctrl.DB.Where("id = ?", broadcastID).First(&broadcast)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Broadcast berhasil diperbarui",
		"data":    broadcast,
	})
}

// AdminDeleteBroadcast deletes a broadcast (admin)
func (ctrl *BroadcastController) AdminDeleteBroadcast(c fiber.Ctx) error {
	broadcastID := c.Params("id")

	result := ctrl.DB.Where("id = ?", broadcastID).Delete(&models.Broadcast{})
	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Broadcast tidak ditemukan",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Broadcast berhasil dihapus",
	})
}

// suppress unused
var _ = gorm.Expr
