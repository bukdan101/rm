package controllers

import (
	"fmt"
	"log"
	"time"

	"automarket-transaction-service/internal/models"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// PaymentController handles payment operations
type PaymentController struct {
	DB *gorm.DB
}

// CreatePayment creates a new payment for an order
func (ctrl *PaymentController) CreatePayment(c fiber.Ctx) error {
	userID, ok := GetUserID(c)
	if !ok {
		return ErrorMsg(c, fiber.StatusUnauthorized, "User tidak terautentikasi")
	}

	var req struct {
		OrderID         string `json:"order_id"`
		PaymentMethod   string `json:"payment_method"`
		PaymentProvider string `json:"payment_provider"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "Request tidak valid")
	}
	if req.OrderID == "" || req.PaymentMethod == "" {
		return ErrorMsg(c, fiber.StatusBadRequest, "order_id dan payment_method diperlukan")
	}

	orderID, err := uuid.Parse(req.OrderID)
	if err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "order_id tidak valid")
	}

	// Fetch order
	var order models.Order
	if err := ctrl.DB.Where("id = ? AND (buyer_id = ? OR seller_id = ?)", orderID, userID, userID).First(&order).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return ErrorMsg(c, fiber.StatusNotFound, "Pesanan tidak ditemukan")
		}
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil pesanan")
	}

	if order.Status == "cancelled" || order.Status == "completed" {
		return ErrorMsg(c, fiber.StatusBadRequest, "Pesanan tidak dapat dibayar")
	}

	paymentNumber := fmt.Sprintf("PAY-%s-%d", time.Now().Format("20060102"), time.Now().UnixNano()%100000)

	payment := models.Payment{
		PaymentNumber:   paymentNumber,
		OrderID:         orderID,
		PayerID:         order.BuyerID,
		PayeeID:         order.SellerID,
		Amount:          order.TotalAmount,
		Currency:        "IDR",
		PaymentMethod:   req.PaymentMethod,
		PaymentProvider: req.PaymentProvider,
		PlatformFee:     order.PlatformFee,
		Status:          "pending",
	}

	err = ctrl.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&payment).Error; err != nil {
			return err
		}

		// Create order item if not exists
		var item models.OrderItem
		result := tx.Where("order_id = ?", orderID).First(&item)
		if result.Error == gorm.ErrRecordNotFound {
			item = models.OrderItem{
				OrderID:    orderID,
				ItemType:   "car",
				ItemID:     order.CarListingID,
				ItemName:   fmt.Sprintf("Car Listing %s", order.CarListingID.String()[:8]),
				Quantity:   1,
				UnitPrice:  order.AgreedPrice,
				TotalPrice: order.AgreedPrice,
			}
			tx.Create(&item)
		}

		// Update order status to processing
		now := time.Now()
		tx.Model(&order).Updates(map[string]interface{}{
			"status":        "processing",
			"processing_at": now,
			"updated_at":    now,
		})

		return nil
	})

	if err != nil {
		log.Printf("Create payment error: %v", err)
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal membuat pembayaran")
	}

	return SuccessMsg(c, "Pembayaran berhasil dibuat", payment)
}

// GetPayment returns payment status
func (ctrl *PaymentController) GetPayment(c fiber.Ctx) error {
	userID, ok := GetUserID(c)
	if !ok {
		return ErrorMsg(c, fiber.StatusUnauthorized, "User tidak terautentikasi")
	}

	paymentID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "ID pembayaran tidak valid")
	}

	var payment models.Payment
	if err := ctrl.DB.Where("id = ? AND (payer_id = ? OR payee_id = ?)", paymentID, userID, userID).First(&payment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return ErrorMsg(c, fiber.StatusNotFound, "Pembayaran tidak ditemukan")
		}
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil pembayaran")
	}

	return SuccessResponse(c, payment)
}
