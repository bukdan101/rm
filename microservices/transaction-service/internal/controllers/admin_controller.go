package controllers

import (
	"fmt"
	"log"
	"strconv"
	"time"

	"automarket-transaction-service/internal/models"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// AdminController handles admin operations
type AdminController struct {
	DB *gorm.DB
}

// --- Admin Orders ---

// GetAllOrders returns all orders with pagination and filters
func (ctrl *AdminController) GetAllOrders(c fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	perPage, _ := strconv.Atoi(c.Query("per_page", "20"))
	status := c.Query("status")

	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}
	offset := (page - 1) * perPage

	var orders []models.Order
	var total int64

	query := ctrl.DB.Model(&models.Order{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	query.Count(&total)
	result := query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&orders)
	if result.Error != nil {
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil pesanan")
	}

	return PaginatedResponse(c, orders, page, perPage, total)
}

// UpdateOrderStatus updates an order's status (admin)
func (ctrl *AdminController) UpdateOrderStatus(c fiber.Ctx) error {
	orderID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "ID pesanan tidak valid")
	}

	var req struct {
		Status string `json:"status"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "Request tidak valid")
	}
	if req.Status == "" {
		return ErrorMsg(c, fiber.StatusBadRequest, "Status diperlukan")
	}

	var order models.Order
	if err := ctrl.DB.Where("id = ?", orderID).First(&order).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return ErrorMsg(c, fiber.StatusNotFound, "Pesanan tidak ditemukan")
		}
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil pesanan")
	}

	updates := map[string]interface{}{
		"status":     req.Status,
		"updated_at": time.Now(),
	}

	switch req.Status {
	case "confirmed":
		updates["confirmed_at"] = time.Now()
	case "processing":
		updates["processing_at"] = time.Now()
	case "completed":
		updates["completed_at"] = time.Now()
	case "cancelled":
		updates["cancelled_at"] = time.Now()
	}

	if err := ctrl.DB.Model(&order).Updates(updates).Error; err != nil {
		log.Printf("Update order status error: %v", err)
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal memperbarui status pesanan")
	}

	ctrl.DB.Where("id = ?", orderID).First(&order)
	return SuccessMsg(c, "Status pesanan berhasil diperbarui", order)
}

// --- Admin Payments ---

// GetAllPayments returns all payments with pagination and filters
func (ctrl *AdminController) GetAllPayments(c fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	perPage, _ := strconv.Atoi(c.Query("per_page", "20"))
	status := c.Query("status")

	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}
	offset := (page - 1) * perPage

	var payments []models.Payment
	var total int64

	query := ctrl.DB.Model(&models.Payment{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	query.Count(&total)
	result := query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&payments)
	if result.Error != nil {
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil pembayaran")
	}

	return PaginatedResponse(c, payments, page, perPage, total)
}

// --- Admin Topups ---

// ApproveTopup approves a topup request (admin)
func (ctrl *AdminController) ApproveTopup(c fiber.Ctx) error {
	adminID, ok := GetUserID(c)
	if !ok {
		return ErrorMsg(c, fiber.StatusUnauthorized, "Admin tidak terautentikasi")
	}

	topupID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "ID topup tidak valid")
	}

	var topup models.TopupRequest
	if err := ctrl.DB.Where("id = ?", topupID).First(&topup).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return ErrorMsg(c, fiber.StatusNotFound, "Permintaan topup tidak ditemukan")
		}
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil permintaan topup")
	}

	if topup.Status != "pending" {
		return ErrorMsg(c, fiber.StatusBadRequest, "Permintaan topup tidak dalam status pending")
	}

	now := time.Now()
	err = ctrl.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&topup).Updates(map[string]interface{}{
			"status":      "approved",
			"reviewed_by": adminID,
		}).Error; err != nil {
			return err
		}

		// Create token transaction for the topup
		txNumber := fmt.Sprintf("TTX-%s-%d", now.Format("20060102"), now.UnixNano()%100000)
		tokenTx := models.TokenTransaction{
			TransactionNumber: txNumber,
			UserID:            topup.UserID,
			DealerID:          topup.DealerID,
			TransactionType:   "topup",
			Amount:            topup.Tokens,
			BalanceBefore:     0, // In production, fetch actual balance
			BalanceAfter:      topup.Tokens,
			ReferenceType:     "topup_request",
			ReferenceID:       &topup.ID,
			Description:       fmt.Sprintf("Token topup approved: %d tokens", topup.Tokens),
		}
		return tx.Create(&tokenTx).Error
	})

	if err != nil {
		log.Printf("Approve topup error: %v", err)
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal menyetujui permintaan topup")
	}

	ctrl.DB.Where("id = ?", topupID).First(&topup)
	return SuccessMsg(c, "Permintaan topup berhasil disetujui", topup)
}

// RejectTopup rejects a topup request (admin)
func (ctrl *AdminController) RejectTopup(c fiber.Ctx) error {
	adminID, ok := GetUserID(c)
	if !ok {
		return ErrorMsg(c, fiber.StatusUnauthorized, "Admin tidak terautentikasi")
	}

	topupID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "ID topup tidak valid")
	}

	var req struct {
		Reason string `json:"reason"`
	}
	_ = c.Bind().JSON(&req)

	var topup models.TopupRequest
	if err := ctrl.DB.Where("id = ?", topupID).First(&topup).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return ErrorMsg(c, fiber.StatusNotFound, "Permintaan topup tidak ditemukan")
		}
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil permintaan topup")
	}

	if topup.Status != "pending" {
		return ErrorMsg(c, fiber.StatusBadRequest, "Permintaan topup tidak dalam status pending")
	}

	if err := ctrl.DB.Model(&topup).Updates(map[string]interface{}{
		"status":           "rejected",
		"rejection_reason": req.Reason,
		"reviewed_by":      adminID,
	}).Error; err != nil {
		log.Printf("Reject topup error: %v", err)
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal menolak permintaan topup")
	}

	ctrl.DB.Where("id = ?", topupID).First(&topup)
	return SuccessMsg(c, "Permintaan topup berhasil ditolak", topup)
}

// --- Admin Refunds ---

// CreateRefund creates a refund (admin)
func (ctrl *AdminController) CreateRefund(c fiber.Ctx) error {
	var req struct {
		OrderID   string `json:"order_id"`
		PaymentID string `json:"payment_id"`
		Amount    int64  `json:"amount"`
		Reason    string `json:"reason"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "Request tidak valid")
	}
	if req.OrderID == "" || req.Amount <= 0 {
		return ErrorMsg(c, fiber.StatusBadRequest, "order_id dan amount diperlukan")
	}

	orderID, err := uuid.Parse(req.OrderID)
	if err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "order_id tidak valid")
	}

	var paymentID *uuid.UUID
	if req.PaymentID != "" {
		pID, err := uuid.Parse(req.PaymentID)
		if err != nil {
			return ErrorMsg(c, fiber.StatusBadRequest, "payment_id tidak valid")
		}
		paymentID = &pID
	}

	refundNumber := fmt.Sprintf("REF-%s-%d", time.Now().Format("20060102"), time.Now().UnixNano()%100000)

	now := time.Now()
	refund := models.Refund{
		RefundNumber: refundNumber,
		OrderID:      orderID,
		PaymentID:    *paymentID,
		Amount:       req.Amount,
		Reason:       req.Reason,
		Status:       "pending",
		ProcessedAt:  &now,
	}

	err = ctrl.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&refund).Error; err != nil {
			return err
		}

		// Update order status
		if err := tx.Model(&models.Order{}).Where("id = ?", orderID).Updates(map[string]interface{}{
			"status": "cancelled",
			"updated_at": now,
		}).Error; err != nil {
			return err
		}

		// Create transaction record
		txNumber := fmt.Sprintf("TXN-%s-%d", now.Format("20060102"), now.UnixNano()%100000)
		transaction := models.Transaction{
			TransactionNumber: txNumber,
			OrderID:          orderID,
			PaymentID:        paymentID,
			TransactionType:  "refund",
			Amount:           req.Amount,
			Description:      fmt.Sprintf("Refund: %s", req.Reason),
		}
		return tx.Create(&transaction).Error
	})

	if err != nil {
		log.Printf("Create refund error: %v", err)
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal membuat refund")
	}

	return SuccessMsg(c, "Refund berhasil dibuat", refund)
}

// --- Admin Escrow ---

// GetAllEscrow returns all escrow accounts
func (ctrl *AdminController) GetAllEscrow(c fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	perPage, _ := strconv.Atoi(c.Query("per_page", "20"))
	status := c.Query("status")

	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}
	offset := (page - 1) * perPage

	var escrows []models.EscrowAccount
	var total int64

	query := ctrl.DB.Model(&models.EscrowAccount{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	query.Count(&total)
	result := query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&escrows)
	if result.Error != nil {
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil escrow")
	}

	return PaginatedResponse(c, escrows, page, perPage, total)
}

// ReleaseEscrow releases an escrow (admin)
func (ctrl *AdminController) ReleaseEscrow(c fiber.Ctx) error {
	escrowID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "ID escrow tidak valid")
	}

	var escrow models.EscrowAccount
	if err := ctrl.DB.Where("id = ?", escrowID).First(&escrow).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return ErrorMsg(c, fiber.StatusNotFound, "Escrow tidak ditemukan")
		}
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil escrow")
	}

	if escrow.Status != "held" && escrow.Status != "pending" {
		return ErrorMsg(c, fiber.StatusBadRequest, "Escrow tidak dapat direlease. Status harus 'held' atau 'pending'.")
	}

	now := time.Now()
	err = ctrl.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Model(&escrow).Updates(map[string]interface{}{
			"status":      "released",
			"released_at": now,
		}).Error; err != nil {
			return err
		}

		// Update order escrow status
		tx.Model(&models.Order{}).Where("escrow_id = ?", escrowID).Update("escrow_status", "released")

		// Create transaction record
		txNumber := fmt.Sprintf("TXN-%s-%d", now.Format("20060102"), now.UnixNano()%100000)
		transaction := models.Transaction{
			TransactionNumber: txNumber,
			OrderID:          escrow.OrderID,
			TransactionType:  "release",
			Amount:           escrow.AmountHeld,
			ToAccount:        &escrow.SellerID,
			Description:      fmt.Sprintf("Escrow release for order %s", escrow.OrderID),
		}
		return tx.Create(&transaction).Error
	})

	if err != nil {
		log.Printf("Release escrow error: %v", err)
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal melepaskan escrow")
	}

	ctrl.DB.Where("id = ?", escrowID).First(&escrow)
	return SuccessMsg(c, "Escrow berhasil dilepaskan", escrow)
}

// --- Admin Transactions ---

// GetAllTransactions returns all financial transactions
func (ctrl *AdminController) GetAllTransactions(c fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	perPage, _ := strconv.Atoi(c.Query("per_page", "20"))
	txType := c.Query("type")

	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}
	offset := (page - 1) * perPage

	var transactions []models.Transaction
	var total int64

	query := ctrl.DB.Model(&models.Transaction{})
	if txType != "" {
		query = query.Where("transaction_type = ?", txType)
	}
	query.Count(&total)
	result := query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&transactions)
	if result.Error != nil {
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil transaksi")
	}

	return PaginatedResponse(c, transactions, page, perPage, total)
}

// --- Admin Token Settings ---

// UpdateTokenSettings updates token system settings (admin)
func (ctrl *AdminController) UpdateTokenSettings(c fiber.Ctx) error {
	var req struct {
		TokenPriceBase      *int `json:"token_price_base"`
		AIPredictionTokens  *int `json:"ai_prediction_tokens"`
		ListingNormalTokens *int `json:"listing_normal_tokens"`
		ListingDealerTokens *int `json:"listing_dealer_tokens"`
		DealerContactTokens *int `json:"dealer_contact_tokens"`
		BoostTokens         *int `json:"boost_tokens"`
		IsActive            *bool `json:"is_active"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "Request tidak valid")
	}

	// Get current settings or create new
	var settings models.TokenSetting
	err := ctrl.DB.Where("is_active = ?", true).Order("created_at DESC").First(&settings).Error
	if err != nil && err != gorm.ErrRecordNotFound {
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil pengaturan token")
	}

	if err == gorm.ErrRecordNotFound {
		// Create default settings first
		settings = models.TokenSetting{
			TokenPriceBase:      1000,
			AIPredictionTokens:  5,
			ListingNormalTokens: 10,
			ListingDealerTokens: 20,
			DealerContactTokens: 5,
			BoostTokens:         3,
			IsActive:            true,
		}
		ctrl.DB.Create(&settings)
	}

	updates := map[string]interface{}{}
	if req.TokenPriceBase != nil {
		updates["token_price_base"] = *req.TokenPriceBase
	}
	if req.AIPredictionTokens != nil {
		updates["ai_prediction_tokens"] = *req.AIPredictionTokens
	}
	if req.ListingNormalTokens != nil {
		updates["listing_normal_tokens"] = *req.ListingNormalTokens
	}
	if req.ListingDealerTokens != nil {
		updates["listing_dealer_tokens"] = *req.ListingDealerTokens
	}
	if req.DealerContactTokens != nil {
		updates["dealer_contact_tokens"] = *req.DealerContactTokens
	}
	if req.BoostTokens != nil {
		updates["boost_tokens"] = *req.BoostTokens
	}
	if req.IsActive != nil {
		updates["is_active"] = *req.IsActive
	}

	if len(updates) > 0 {
		if err := ctrl.DB.Model(&settings).Updates(updates).Error; err != nil {
			log.Printf("Update token settings error: %v", err)
			return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal memperbarui pengaturan token")
		}
	}

	ctrl.DB.Where("id = ?", settings.ID).First(&settings)
	return SuccessMsg(c, "Pengaturan token berhasil diperbarui", settings)
}
