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

// OrderController handles order operations
type OrderController struct {
	DB *gorm.DB
}

// APIResponse is the standard response format
type APIResponse struct {
	Success bool        `json:"success"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
	Meta    interface{} `json:"meta,omitempty"`
}

// SuccessResponse sends a success JSON response
func SuccessResponse(c fiber.Ctx, data interface{}) error {
	return c.JSON(APIResponse{
		Success: true,
		Message: "Success",
		Data:    data,
	})
}

// SuccessMsg sends a success JSON response with a custom message
func SuccessMsg(c fiber.Ctx, msg string, data interface{}) error {
	return c.JSON(APIResponse{
		Success: true,
		Message: msg,
		Data:    data,
	})
}

// ErrorMsg sends an error JSON response
func ErrorMsg(c fiber.Ctx, code int, msg string) error {
	return c.Status(code).JSON(APIResponse{
		Success: false,
		Message: msg,
	})
}

// PaginatedResponse sends a paginated JSON response
func PaginatedResponse(c fiber.Ctx, data interface{}, page, perPage int, total int64) error {
	return c.JSON(APIResponse{
		Success: true,
		Message: "Success",
		Data:    data,
		Meta: fiber.Map{
			"page":       page,
			"per_page":   perPage,
			"total":      total,
			"total_pages": (total + int64(perPage) - 1) / int64(perPage),
		},
	})
}

// CreateOrder creates a new order
func (ctrl *OrderController) CreateOrder(c fiber.Ctx) error {
	userID, ok := GetUserID(c)
	if !ok {
		return ErrorMsg(c, fiber.StatusUnauthorized, "User tidak terautentikasi")
	}

	var req struct {
		SellerID     string `json:"seller_id"`
		CarListingID string `json:"car_listing_id"`
		AgreedPrice  int64  `json:"agreed_price"`
		Notes        string `json:"notes"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "Request tidak valid")
	}
	if req.SellerID == "" || req.CarListingID == "" || req.AgreedPrice <= 0 {
		return ErrorMsg(c, fiber.StatusBadRequest, "seller_id, car_listing_id, dan agreed_price diperlukan")
	}

	sellerID, err := uuid.Parse(req.SellerID)
	if err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "seller_id tidak valid")
	}
	carListingID, err := uuid.Parse(req.CarListingID)
	if err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "car_listing_id tidak valid")
	}

	// Calculate fees (platform 2%, seller 1%, buyer 0%)
	platformFee := req.AgreedPrice * 2 / 100
	sellerFee := req.AgreedPrice * 1 / 100
	totalAmount := req.AgreedPrice + platformFee + sellerFee

	orderNumber := fmt.Sprintf("ORD-%s-%d", time.Now().Format("20060102"), time.Now().UnixNano()%100000)

	order := models.Order{
		OrderNumber:  orderNumber,
		BuyerID:      userID,
		SellerID:     sellerID,
		CarListingID: carListingID,
		AgreedPrice:  req.AgreedPrice,
		PlatformFee:  platformFee,
		SellerFee:    sellerFee,
		BuyerFee:     0,
		TotalAmount:  totalAmount,
		EscrowStatus: "none",
		Status:       "pending",
		Notes:        req.Notes,
	}

	if err := ctrl.DB.Create(&order).Error; err != nil {
		log.Printf("Create order error: %v", err)
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal membuat pesanan")
	}

	return SuccessMsg(c, "Pesanan berhasil dibuat", order)
}

// GetOrders returns user's orders (paginated)
func (ctrl *OrderController) GetOrders(c fiber.Ctx) error {
	userID, ok := GetUserID(c)
	if !ok {
		return ErrorMsg(c, fiber.StatusUnauthorized, "User tidak terautentikasi")
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	perPage, _ := strconv.Atoi(c.Query("per_page", "20"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}
	offset := (page - 1) * perPage

	var orders []models.Order
	var total int64

	ctrl.DB.Model(&models.Order{}).Where("buyer_id = ? OR seller_id = ?", userID, userID).Count(&total)
	result := ctrl.DB.Where("buyer_id = ? OR seller_id = ?", userID, userID).
		Order("created_at DESC").
		Offset(offset).Limit(perPage).
		Find(&orders)
	if result.Error != nil {
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil pesanan")
	}

	return PaginatedResponse(c, orders, page, perPage, total)
}

// GetOrder returns a single order detail
func (ctrl *OrderController) GetOrder(c fiber.Ctx) error {
	userID, ok := GetUserID(c)
	if !ok {
		return ErrorMsg(c, fiber.StatusUnauthorized, "User tidak terautentikasi")
	}

	orderID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "ID pesanan tidak valid")
	}

	var order models.Order
	if err := ctrl.DB.Where("id = ? AND (buyer_id = ? OR seller_id = ?)", orderID, userID, userID).First(&order).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return ErrorMsg(c, fiber.StatusNotFound, "Pesanan tidak ditemukan")
		}
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil pesanan")
	}

	// Fetch order items
	var items []models.OrderItem
	ctrl.DB.Where("order_id = ?", order.ID).Find(&items)

	return SuccessResponse(c, fiber.Map{
		"order": order,
		"items": items,
	})
}

// CancelOrder cancels an order
func (ctrl *OrderController) CancelOrder(c fiber.Ctx) error {
	userID, ok := GetUserID(c)
	if !ok {
		return ErrorMsg(c, fiber.StatusUnauthorized, "User tidak terautentikasi")
	}

	orderID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "ID pesanan tidak valid")
	}

	var req struct {
		Reason string `json:"reason"`
	}
	_ = c.Bind().JSON(&req)

	var order models.Order
	if err := ctrl.DB.Where("id = ? AND (buyer_id = ? OR seller_id = ?)", orderID, userID, userID).First(&order).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return ErrorMsg(c, fiber.StatusNotFound, "Pesanan tidak ditemukan")
		}
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil pesanan")
	}

	if order.Status == "completed" || order.Status == "cancelled" {
		return ErrorMsg(c, fiber.StatusBadRequest, "Pesanan tidak dapat dibatalkan")
	}

	now := time.Now()
	err = ctrl.DB.Transaction(func(tx *gorm.DB) error {
		updates := map[string]interface{}{
			"status":             "cancelled",
			"cancelled_at":       now,
			"cancelled_by":       userID,
			"cancellation_reason": req.Reason,
			"updated_at":         now,
		}
		if err := tx.Model(&order).Updates(updates).Error; err != nil {
			return err
		}

		// Update escrow status if exists
		if order.EscrowID != nil {
			tx.Model(&models.EscrowAccount{}).Where("id = ?", order.EscrowID).Updates(map[string]interface{}{
				"status":      "refunded",
				"refunded_at": now,
			})
			tx.Model(&order).Update("escrow_status", "refunded")
		}

		return nil
	})

	if err != nil {
		log.Printf("Cancel order error: %v", err)
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal membatalkan pesanan")
	}

	ctrl.DB.Where("id = ?", orderID).First(&order)
	return SuccessMsg(c, "Pesanan berhasil dibatalkan", order)
}

// ConfirmOrder confirms order received by buyer
func (ctrl *OrderController) ConfirmOrder(c fiber.Ctx) error {
	userID, ok := GetUserID(c)
	if !ok {
		return ErrorMsg(c, fiber.StatusUnauthorized, "User tidak terautentikasi")
	}

	orderID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "ID pesanan tidak valid")
	}

	var order models.Order
	if err := ctrl.DB.Where("id = ? AND buyer_id = ?", orderID, userID).First(&order).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return ErrorMsg(c, fiber.StatusNotFound, "Pesanan tidak ditemukan")
		}
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil pesanan")
	}

	if order.Status != "processing" {
		return ErrorMsg(c, fiber.StatusBadRequest, "Pesanan tidak dapat dikonfirmasi. Status harus 'processing'.")
	}

	now := time.Now()
	err = ctrl.DB.Transaction(func(tx *gorm.DB) error {
		updates := map[string]interface{}{
			"status":       "completed",
			"confirmed_at": now,
			"completed_at": now,
			"updated_at":   now,
		}
		if err := tx.Model(&order).Updates(updates).Error; err != nil {
			return err
		}

		// Release escrow
		if order.EscrowID != nil {
			tx.Model(&models.EscrowAccount{}).Where("id = ?", order.EscrowID).Updates(map[string]interface{}{
				"status":      "released",
				"released_at": now,
			})
			tx.Model(&order).Update("escrow_status", "released")
		}

		return nil
	})

	if err != nil {
		log.Printf("Confirm order error: %v", err)
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengkonfirmasi pesanan")
	}

	ctrl.DB.Where("id = ?", orderID).First(&order)
	return SuccessMsg(c, "Pesanan berhasil dikonfirmasi", order)
}
