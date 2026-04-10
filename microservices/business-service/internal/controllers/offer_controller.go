package controllers

import (
	"fmt"
	"log"
	"strconv"
	"time"

	"automarket-business-service/internal/models"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// OfferController handles B2B offer system endpoints
type OfferController struct {
	DB *gorm.DB
}

// generateOfferNumber creates a unique offer number like OFR-20260101-XXXX
func generateOfferNumber() string {
	now := time.Now()
	suffix := uuid.New().String()[:8]
	return fmt.Sprintf("OFR-%s-%s", now.Format("20060102"), suffix)
}

// CreateOffer creates a new B2B offer from dealer to seller (authenticated)
func (ctrl *OfferController) CreateOffer(c fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	var req struct {
		DealerID            string `json:"dealer_id"`
		CarListingID        string `json:"car_listing_id"`
		UserID              string `json:"user_id"`
		OfferPrice          int64  `json:"offer_price"`
		OriginalPrice       *int64 `json:"original_price"`
		Message             string `json:"message"`
		FinancingAvailable  bool   `json:"financing_available"`
		FinancingNotes      string `json:"financing_notes"`
		InspectionIncluded  bool   `json:"inspection_included"`
		PickupService       bool   `json:"pickup_service"`
		PickupLocation      string `json:"pickup_location"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data tidak valid",
		})
	}

	if req.OfferPrice <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Harga penawaran wajib diisi dan harus lebih dari 0",
		})
	}

	dealerID, err := uuid.Parse(req.DealerID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "dealer_id tidak valid",
		})
	}
	carListingID, err := uuid.Parse(req.CarListingID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "car_listing_id tidak valid",
		})
	}
	sellerID, err := uuid.Parse(req.UserID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "user_id (seller) tidak valid",
		})
	}

	// Get default offer duration from marketplace settings
	var settings models.DealerMarketplaceSetting
	durationHours := 72
	if err := ctrl.DB.Where("is_active = ?", true).First(&settings).Error; err == nil {
		durationHours = settings.DefaultOfferDurationHours
	}

	now := time.Now()
	expiresAt := now.Add(time.Duration(durationHours) * time.Hour)

	offer := models.DealerOffer{
		ID:                 uuid.New(),
		OfferNumber:        generateOfferNumber(),
		DealerID:           dealerID,
		CarListingID:       carListingID,
		UserID:             sellerID,
		OfferPrice:         req.OfferPrice,
		OriginalPrice:      req.OriginalPrice,
		Message:            req.Message,
		FinancingAvailable: req.FinancingAvailable,
		FinancingNotes:     req.FinancingNotes,
		InspectionIncluded: req.InspectionIncluded,
		PickupService:      req.PickupService,
		PickupLocation:     req.PickupLocation,
		Status:             "pending",
		ExpiresAt:          &expiresAt,
	}

	if err := ctrl.DB.Create(&offer).Error; err != nil {
		log.Printf("Create offer error: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membuat penawaran",
		})
	}

	// Create history entry
	history := models.DealerOfferHistory{
		ID:        uuid.New(),
		OfferID:   offer.ID,
		Action:    "created",
		NewPrice:  &offer.OfferPrice,
		ActorID:   userID,
		ActorType: "dealer",
		Message:   req.Message,
	}
	ctrl.DB.Create(&history)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Penawaran berhasil dibuat",
		"data":    offer,
	})
}

// ListSentOffers lists offers sent by the authenticated dealer (authenticated)
func (ctrl *OfferController) ListSentOffers(c fiber.Ctx) error {
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

	query := ctrl.DB.Where("dealer_id = ?", userID)
	if status != "" {
		query = query.Where("status = ?", status)
	}

	var total int64
	query.Model(&models.DealerOffer{}).Count(&total)

	var offers []models.DealerOffer
	offset := (page - 1) * perPage
	if err := query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&offers).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data penawaran",
		})
	}

	totalPage := int(total) / perPage
	if int(total)%perPage > 0 {
		totalPage++
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    offers,
		"meta": fiber.Map{
			"page":       page,
			"per_page":   perPage,
			"total":      total,
			"total_page": totalPage,
		},
	})
}

// ListReceivedOffers lists offers received by the authenticated seller (authenticated)
func (ctrl *OfferController) ListReceivedOffers(c fiber.Ctx) error {
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
	query.Model(&models.DealerOffer{}).Count(&total)

	var offers []models.DealerOffer
	offset := (page - 1) * perPage
	if err := query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&offers).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data penawaran",
		})
	}

	totalPage := int(total) / perPage
	if int(total)%perPage > 0 {
		totalPage++
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    offers,
		"meta": fiber.Map{
			"page":       page,
			"per_page":   perPage,
			"total":      total,
			"total_page": totalPage,
		},
	})
}

// GetOfferDetail returns a single offer with its history (authenticated)
func (ctrl *OfferController) GetOfferDetail(c fiber.Ctx) error {
	offerID := c.Params("id")

	var offer models.DealerOffer
	if err := ctrl.DB.Where("id = ?", offerID).First(&offer).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"message": "Penawaran tidak ditemukan",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Terjadi kesalahan pada server",
		})
	}

	// Get offer history
	var history []models.DealerOfferHistory
	ctrl.DB.Where("offer_id = ?", offer.ID).Order("created_at ASC").Find(&history)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"offer":   offer,
			"history": history,
		},
	})
}

// ViewOffer marks an offer as viewed by the seller (authenticated)
func (ctrl *OfferController) ViewOffer(c fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	offerID := c.Params("id")

	var offer models.DealerOffer
	if err := ctrl.DB.Where("id = ?", offerID).First(&offer).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Penawaran tidak ditemukan",
		})
	}

	// Only the seller (user_id) can mark as viewed
	if offer.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Hanya penjual yang dapat menandai penawaran sebagai dilihat",
		})
	}

	if offer.Status != "pending" && offer.Status != "viewed" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Penawaran tidak dapat ditandai sebagai dilihat dalam status saat ini",
		})
	}

	now := time.Now()
	ctrl.DB.Model(&offer).Updates(map[string]interface{}{
		"status":    "viewed",
		"viewed_at": now,
	})

	// Create history
	history := models.DealerOfferHistory{
		ID:        uuid.New(),
		OfferID:   offer.ID,
		Action:    "viewed",
		ActorID:   userID,
		ActorType: "user",
	}
	ctrl.DB.Create(&history)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Penawaran ditandai sebagai dilihat",
	})
}

// AcceptOffer accepts an offer (authenticated — seller)
func (ctrl *OfferController) AcceptOffer(c fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	offerID := c.Params("id")

	var offer models.DealerOffer
	if err := ctrl.DB.Where("id = ?", offerID).First(&offer).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Penawaran tidak ditemukan",
		})
	}

	if offer.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Hanya penjual yang dapat menerima penawaran",
		})
	}

	if offer.Status != "pending" && offer.Status != "viewed" && offer.Status != "negotiating" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Penawaran tidak dapat diterima dalam status saat ini",
		})
	}

	now := time.Now()
	ctrl.DB.Model(&offer).Updates(map[string]interface{}{
		"status":      "accepted",
		"accepted_at": now,
		"responded_at": now,
	})

	// Create history
	history := models.DealerOfferHistory{
		ID:        uuid.New(),
		OfferID:   offer.ID,
		Action:    "accepted",
		NewPrice:  &offer.OfferPrice,
		ActorID:   userID,
		ActorType: "user",
	}
	ctrl.DB.Create(&history)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Penawaran diterima",
	})
}

// RejectOffer rejects an offer (authenticated — seller)
func (ctrl *OfferController) RejectOffer(c fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	offerID := c.Params("id")

	var req struct {
		Reason string `json:"reason"`
	}
	_ = c.Bind().JSON(&req)

	var offer models.DealerOffer
	if err := ctrl.DB.Where("id = ?", offerID).First(&offer).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Penawaran tidak ditemukan",
		})
	}

	if offer.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Hanya penjual yang dapat menolak penawaran",
		})
	}

	if offer.Status != "pending" && offer.Status != "viewed" && offer.Status != "negotiating" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Penawaran tidak dapat ditolak dalam status saat ini",
		})
	}

	now := time.Now()
	ctrl.DB.Model(&offer).Updates(map[string]interface{}{
		"status":           "rejected",
		"rejected_at":      now,
		"responded_at":     now,
		"rejection_reason": req.Reason,
	})

	history := models.DealerOfferHistory{
		ID:        uuid.New(),
		OfferID:   offer.ID,
		Action:    "rejected",
		ActorID:   userID,
		ActorType: "user",
		Message:   req.Reason,
	}
	ctrl.DB.Create(&history)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Penawaran ditolak",
	})
}

// CounterOffer creates a counter-offer (seller or dealer) (authenticated)
func (ctrl *OfferController) CounterOffer(c fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	offerID := c.Params("id")

	var req struct {
		CounterPrice int64  `json:"counter_price"`
		Message      string `json:"message"`
	}
	if err := c.Bind().JSON(&req); err != nil || req.CounterPrice <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Harga counter wajib diisi dan harus lebih dari 0",
		})
	}

	var offer models.DealerOffer
	if err := ctrl.DB.Where("id = ?", offerID).First(&offer).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Penawaran tidak ditemukan",
		})
	}

	// Determine who is countering
	actorType := "user" // default: seller
	var previousPrice *int64

	if offer.UserID == userID {
		// Seller is countering
		actorType = "user"
		previousPrice = &offer.OfferPrice
		// Seller's counter goes to counter_offer_price
		ctrl.DB.Model(&offer).Updates(map[string]interface{}{
			"status":               "negotiating",
			"counter_offer_price":  req.CounterPrice,
			"counter_offer_by":     userID,
			"counter_offer_message": req.Message,
			"counter_offer_at":     time.Now(),
		})
	} else if offer.DealerID == userID {
		// Dealer is countering back
		actorType = "dealer"
		previousPrice = offer.CounterOfferPrice
		// Dealer's counter updates offer_price, clears counter_offer fields
		ctrl.DB.Model(&offer).Updates(map[string]interface{}{
			"status":               "negotiating",
			"offer_price":          req.CounterPrice,
			"counter_offer_price":  nil,
			"counter_offer_by":     userID,
			"counter_offer_message": req.Message,
			"counter_offer_at":     time.Now(),
		})
	} else {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Anda tidak berwenang memberikan counter pada penawaran ini",
		})
	}

	// Reload to get latest values
	ctrl.DB.Where("id = ?", offerID).First(&offer)

	// Create history
	history := models.DealerOfferHistory{
		ID:            uuid.New(),
		OfferID:       offer.ID,
		Action:        "counter_offered",
		PreviousPrice: previousPrice,
		NewPrice:      &req.CounterPrice,
		ActorID:       userID,
		ActorType:     actorType,
		Message:       req.Message,
	}
	ctrl.DB.Create(&history)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Counter penawaran berhasil dikirim",
		"data":    offer,
	})
}

// WithdrawOffer withdraws an offer (authenticated — dealer)
func (ctrl *OfferController) WithdrawOffer(c fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	offerID := c.Params("id")

	var offer models.DealerOffer
	if err := ctrl.DB.Where("id = ?", offerID).First(&offer).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Penawaran tidak ditemukan",
		})
	}

	if offer.DealerID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Hanya dealer yang dapat menarik penawaran",
		})
	}

	if offer.Status == "accepted" || offer.Status == "rejected" || offer.Status == "withdrawn" || offer.Status == "expired" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Penawaran tidak dapat ditarik dalam status saat ini",
		})
	}

	now := time.Now()
	ctrl.DB.Model(&offer).Update("status", "withdrawn")
	ctrl.DB.Model(&offer).Update("withdrawn_at", now)

	history := models.DealerOfferHistory{
		ID:        uuid.New(),
		OfferID:   offer.ID,
		Action:    "withdrawn",
		ActorID:   userID,
		ActorType: "dealer",
	}
	ctrl.DB.Create(&history)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Penawaran berhasil ditarik",
	})
}
