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

// SupportController handles support ticket CRUD
type SupportController struct {
	DB *gorm.DB
}

// CreateTicket creates a new support ticket (authenticated)
func (ctrl *SupportController) CreateTicket(c fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	var req struct {
		Subject  string `json:"subject"`
		Category string `json:"category"`
		Priority string `json:"priority"`
		Message  string `json:"message"`
	}
	if err := c.Bind().JSON(&req); err != nil || req.Subject == "" || req.Message == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Subjek dan pesan wajib diisi",
		})
	}

	category := req.Category
	if category == "" {
		category = "general"
	}
	priority := req.Priority
	if priority == "" {
		priority = "normal"
	}

	ticket := models.SupportTicket{
		ID:        uuid.New(),
		UserID:    userID,
		Subject:   req.Subject,
		Category:  category,
		Priority:  priority,
		Status:    "open",
	}

	if err := ctrl.DB.Create(&ticket).Error; err != nil {
		log.Printf("Create ticket error: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membuat tiket support",
		})
	}

	// Create initial message
	msg := models.SupportTicketMessage{
		ID:        uuid.New(),
		TicketID:  ticket.ID,
		SenderID:  userID,
		IsAdmin:   false,
		Message:   req.Message,
	}
	ctrl.DB.Create(&msg)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Tiket support berhasil dibuat",
		"data":    ticket,
	})
}

// ListTickets lists user's support tickets (authenticated)
func (ctrl *SupportController) ListTickets(c fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	page, _ := strconv.Atoi(c.Query("page", "1"))
	perPage, _ := strconv.Atoi(c.Query("per_page", "20"))
	status := c.Query("status")
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	query := ctrl.DB.Where("user_id = ?", userID)
	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	query.Model(&models.SupportTicket{}).Count(&total)

	var tickets []models.SupportTicket
	offset := (page - 1) * perPage
	if err := query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&tickets).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data tiket",
		})
	}

	totalPage := int(total) / perPage
	if int(total)%perPage > 0 {
		totalPage++
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    tickets,
		"meta": fiber.Map{
			"page":       page,
			"per_page":   perPage,
			"total":      total,
			"total_page": totalPage,
		},
	})
}

// GetTicket returns a ticket with its messages (authenticated)
func (ctrl *SupportController) GetTicket(c fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	ticketID := c.Params("id")

	var ticket models.SupportTicket
	if err := ctrl.DB.Where("id = ? AND user_id = ?", ticketID, userID).First(&ticket).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"message": "Tiket tidak ditemukan",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Terjadi kesalahan pada server",
		})
	}

	var messages []models.SupportTicketMessage
	ctrl.DB.Where("ticket_id = ?", ticket.ID).Order("created_at ASC").Find(&messages)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"ticket":   ticket,
			"messages": messages,
		},
	})
}

// AddTicketMessage adds a message to a ticket (authenticated)
func (ctrl *SupportController) AddTicketMessage(c fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	ticketID := c.Params("id")

	var ticket models.SupportTicket
	if err := ctrl.DB.Where("id = ? AND user_id = ?", ticketID, userID).First(&ticket).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Tiket tidak ditemukan",
		})
	}

	// Only allow messages on open/in_progress/waiting tickets
	if ticket.Status == "resolved" || ticket.Status == "closed" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Tiket sudah ditutup dan tidak dapat menerima pesan baru",
		})
	}

	var req struct {
		Message string `json:"message"`
	}
	if err := c.Bind().JSON(&req); err != nil || req.Message == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Pesan wajib diisi",
		})
	}

	msg := models.SupportTicketMessage{
		ID:       uuid.New(),
		TicketID: ticket.ID,
		SenderID: userID,
		IsAdmin:  false,
		Message:  req.Message,
	}

	if err := ctrl.DB.Create(&msg).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengirim pesan",
		})
	}

	// Update ticket status to waiting if admin was responding
	if ticket.Status == "in_progress" {
		ctrl.DB.Model(&ticket).Update("status", "waiting")
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Pesan berhasil dikirim",
		"data":    msg,
	})
}

// AdminListTickets lists all support tickets (admin)
func (ctrl *SupportController) AdminListTickets(c fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	perPage, _ := strconv.Atoi(c.Query("per_page", "20"))
	status := c.Query("status")
	priority := c.Query("priority")
	category := c.Query("category")
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	query := ctrl.DB.Model(&models.SupportTicket{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if priority != "" {
		query = query.Where("priority = ?", priority)
	}
	if category != "" {
		query = query.Where("category = ?", category)
	}

	var total int64
	query.Count(&total)

	var tickets []models.SupportTicket
	offset := (page - 1) * perPage
	if err := query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&tickets).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data tiket",
		})
	}

	totalPage := int(total) / perPage
	if int(total)%perPage > 0 {
		totalPage++
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    tickets,
		"meta": fiber.Map{
			"page":       page,
			"per_page":   perPage,
			"total":      total,
			"total_page": totalPage,
		},
	})
}

// AdminAssignTicket assigns a ticket to an admin (admin)
func (ctrl *SupportController) AdminAssignTicket(c fiber.Ctx) error {
	ticketID := c.Params("id")

	var ticket models.SupportTicket
	if err := ctrl.DB.Where("id = ?", ticketID).First(&ticket).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Tiket tidak ditemukan",
		})
	}

	var req struct {
		AssignedTo string `json:"assigned_to"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data tidak valid",
		})
	}

	updates := map[string]interface{}{
		"status": "in_progress",
	}

	if req.AssignedTo != "" {
		uid, err := uuid.Parse(req.AssignedTo)
		if err == nil {
			updates["assigned_to"] = uid
		}
	}

	ctrl.DB.Model(&ticket).Updates(updates)
	ctrl.DB.Where("id = ?", ticketID).First(&ticket)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Tiket berhasil ditugaskan",
		"data":    ticket,
	})
}

// AdminReplyTicket adds an admin reply to a ticket (admin)
func (ctrl *SupportController) AdminReplyTicket(c fiber.Ctx) error {
	adminID := c.Locals("user_id").(uuid.UUID)
	ticketID := c.Params("id")

	var ticket models.SupportTicket
	if err := ctrl.DB.Where("id = ?", ticketID).First(&ticket).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Tiket tidak ditemukan",
		})
	}

	var req struct {
		Message string `json:"message"`
	}
	if err := c.Bind().JSON(&req); err != nil || req.Message == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Pesan wajib diisi",
		})
	}

	msg := models.SupportTicketMessage{
		ID:       uuid.New(),
		TicketID: ticket.ID,
		SenderID: adminID,
		IsAdmin:  true,
		Message:  req.Message,
	}

	if err := ctrl.DB.Create(&msg).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengirim balasan",
		})
	}

	// Update ticket status
	ctrl.DB.Model(&ticket).Updates(map[string]interface{}{
		"status":      "in_progress",
		"assigned_to": adminID,
	})

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Balasan berhasil dikirim",
		"data":    msg,
	})
}

// suppress unused
var _ = time.Now
