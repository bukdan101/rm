package controllers

import (
	"log"

	"automarket-transaction-service/internal/models"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CouponController handles coupon operations
type CouponController struct {
	DB *gorm.DB
}

// GetActiveCoupons returns all active coupons
func (ctrl *CouponController) GetActiveCoupons(c fiber.Ctx) error {
	var coupons []models.Coupon
	result := ctrl.DB.Where("is_active = ?", true).Order("created_at DESC").Find(&coupons)
	if result.Error != nil {
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil kupon")
	}
	return SuccessResponse(c, coupons)
}

// ValidateCoupon validates a coupon code
func (ctrl *CouponController) ValidateCoupon(c fiber.Ctx) error {
	code := c.Params("code")
	if code == "" {
		return ErrorMsg(c, fiber.StatusBadRequest, "Kode kupon diperlukan")
	}

	var coupon models.Coupon
	if err := ctrl.DB.Where("code = ? AND is_active = ?", code, true).First(&coupon).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return ErrorMsg(c, fiber.StatusNotFound, "Kupon tidak ditemukan atau tidak aktif")
		}
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengvalidasi kupon")
	}

	// Check usage limit
	if coupon.UsageLimit > 0 && coupon.UsedCount >= coupon.UsageLimit {
		return ErrorMsg(c, fiber.StatusBadRequest, "Kupon sudah habis digunakan")
	}

	return SuccessMsg(c, "Kupon valid", fiber.Map{
		"id":               coupon.ID,
		"code":             coupon.Code,
		"name":             coupon.Name,
		"discount_type":    coupon.DiscountType,
		"discount_value":   coupon.DiscountValue,
		"remaining_uses":   coupon.UsageLimit - coupon.UsedCount,
		"usage_limit":      coupon.UsageLimit,
	})
}

// GetInvoice returns an invoice by ID
func (ctrl *CouponController) GetInvoice(c fiber.Ctx) error {
	userID, ok := GetUserID(c)
	if !ok {
		return ErrorMsg(c, fiber.StatusUnauthorized, "User tidak terautentikasi")
	}

	invoiceID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "ID invoice tidak valid")
	}

	var invoice models.Invoice
	if err := ctrl.DB.Where("id = ? AND user_id = ?", invoiceID, userID).First(&invoice).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return ErrorMsg(c, fiber.StatusNotFound, "Invoice tidak ditemukan")
		}
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil invoice")
	}

	return SuccessResponse(c, invoice)
}

// --- Admin Coupon CRUD ---

// CreateCoupon creates a new coupon (admin)
func (ctrl *CouponController) CreateCoupon(c fiber.Ctx) error {
	var req struct {
		Code          string  `json:"code"`
		Name          string  `json:"name"`
		Description   string  `json:"description"`
		DiscountType  string  `json:"discount_type"`
		DiscountValue float64 `json:"discount_value"`
		UsageLimit    int     `json:"usage_limit"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "Request tidak valid")
	}
	if req.Code == "" || req.Name == "" || req.DiscountType == "" || req.DiscountValue <= 0 {
		return ErrorMsg(c, fiber.StatusBadRequest, "code, name, discount_type, dan discount_value diperlukan")
	}

	coupon := models.Coupon{
		Code:          req.Code,
		Name:          req.Name,
		Description:   req.Description,
		DiscountType:  req.DiscountType,
		DiscountValue: req.DiscountValue,
		UsageLimit:    req.UsageLimit,
		UsedCount:     0,
		IsActive:      true,
	}

	if err := ctrl.DB.Create(&coupon).Error; err != nil {
		log.Printf("Create coupon error: %v", err)
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal membuat kupon")
	}

	return SuccessMsg(c, "Kupon berhasil dibuat", coupon)
}

// UpdateCoupon updates a coupon (admin)
func (ctrl *CouponController) UpdateCoupon(c fiber.Ctx) error {
	couponID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "ID kupon tidak valid")
	}

	var coupon models.Coupon
	if err := ctrl.DB.Where("id = ?", couponID).First(&coupon).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return ErrorMsg(c, fiber.StatusNotFound, "Kupon tidak ditemukan")
		}
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil kupon")
	}

	var req struct {
		Name          *string  `json:"name"`
		Description   *string  `json:"description"`
		DiscountType  *string  `json:"discount_type"`
		DiscountValue *float64 `json:"discount_value"`
		UsageLimit    *int     `json:"usage_limit"`
		IsActive      *bool    `json:"is_active"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "Request tidak valid")
	}

	updates := map[string]interface{}{}
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.DiscountType != nil {
		updates["discount_type"] = *req.DiscountType
	}
	if req.DiscountValue != nil {
		updates["discount_value"] = *req.DiscountValue
	}
	if req.UsageLimit != nil {
		updates["usage_limit"] = *req.UsageLimit
	}
	if req.IsActive != nil {
		updates["is_active"] = *req.IsActive
	}

	if len(updates) > 0 {
		if err := ctrl.DB.Model(&coupon).Updates(updates).Error; err != nil {
			log.Printf("Update coupon error: %v", err)
			return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal memperbarui kupon")
		}
	}

	ctrl.DB.Where("id = ?", couponID).First(&coupon)
	return SuccessMsg(c, "Kupon berhasil diperbarui", coupon)
}

// DeleteCoupon deletes a coupon (admin)
func (ctrl *CouponController) DeleteCoupon(c fiber.Ctx) error {
	couponID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "ID kupon tidak valid")
	}

	result := ctrl.DB.Where("id = ?", couponID).Delete(&models.Coupon{})
	if result.Error != nil {
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal menghapus kupon")
	}
	if result.RowsAffected == 0 {
		return ErrorMsg(c, fiber.StatusNotFound, "Kupon tidak ditemukan")
	}

	return SuccessMsg(c, "Kupon berhasil dihapus", nil)
}
