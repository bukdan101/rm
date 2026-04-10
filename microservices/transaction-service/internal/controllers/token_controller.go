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

// TokenController handles token package, settings, and topup operations
type TokenController struct {
	DB *gorm.DB
}

// GetTokenPackages returns active token packages
func (ctrl *TokenController) GetTokenPackages(c fiber.Ctx) error {
	var packages []models.TokenPackage
	result := ctrl.DB.Where("is_active = ?", true).Order("display_order ASC, price ASC").Find(&packages)
	if result.Error != nil {
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil paket token")
	}
	return SuccessResponse(c, packages)
}

// GetTokenSettings returns current token settings
func (ctrl *TokenController) GetTokenSettings(c fiber.Ctx) error {
	var settings models.TokenSetting
	if err := ctrl.DB.Where("is_active = ?", true).Order("created_at DESC").First(&settings).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Return defaults
			return SuccessResponse(c, models.TokenSetting{
				ID:                  uuid.New(),
				TokenPriceBase:      1000,
				AIPredictionTokens:  5,
				ListingNormalTokens: 10,
				ListingDealerTokens: 20,
				DealerContactTokens: 5,
				BoostTokens:         3,
				IsActive:            true,
			})
		}
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil pengaturan token")
	}
	return SuccessResponse(c, settings)
}

// CreateTopupRequest creates a new token topup request
func (ctrl *TokenController) CreateTopupRequest(c fiber.Ctx) error {
	userID, ok := GetUserID(c)
	if !ok {
		return ErrorMsg(c, fiber.StatusUnauthorized, "User tidak terautentikasi")
	}

	var req struct {
		DealerID        string  `json:"dealer_id"`
		Amount          float64 `json:"amount"`
		Tokens          int     `json:"tokens"`
		PaymentProofURL string  `json:"payment_proof_url"`
		PaymentMethod   string  `json:"payment_method"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "Request tidak valid")
	}
	if req.Amount <= 0 || req.Tokens <= 0 {
		return ErrorMsg(c, fiber.StatusBadRequest, "amount dan tokens harus lebih dari 0")
	}

	topupNumber := fmt.Sprintf("TOP-%s-%d", time.Now().Format("20060102"), time.Now().UnixNano()%100000)

	topup := models.TopupRequest{
		TopupNumber:     topupNumber,
		UserID:          userID,
		Amount:          req.Amount,
		Tokens:          req.Tokens,
		PaymentProofURL: req.PaymentProofURL,
		PaymentMethod:   req.PaymentMethod,
		Status:          "pending",
	}

	if req.DealerID != "" {
		dealerID, err := uuid.Parse(req.DealerID)
		if err != nil {
			return ErrorMsg(c, fiber.StatusBadRequest, "dealer_id tidak valid")
		}
		topup.DealerID = &dealerID
	}

	if err := ctrl.DB.Create(&topup).Error; err != nil {
		log.Printf("Create topup request error: %v", err)
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal membuat permintaan topup")
	}

	return SuccessMsg(c, "Permintaan topup berhasil dibuat", topup)
}

// GetTopupRequests returns user's topup requests
func (ctrl *TokenController) GetTopupRequests(c fiber.Ctx) error {
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

	var topups []models.TopupRequest
	var total int64

	ctrl.DB.Model(&models.TopupRequest{}).Where("user_id = ?", userID).Count(&total)
	result := ctrl.DB.Where("user_id = ?", userID).
		Order("created_at DESC").
		Offset(offset).Limit(perPage).
		Find(&topups)
	if result.Error != nil {
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil permintaan topup")
	}

	return PaginatedResponse(c, topups, page, perPage, total)
}
