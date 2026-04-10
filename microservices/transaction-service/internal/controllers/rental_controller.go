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

// RentalController handles rental booking operations
type RentalController struct {
	DB *gorm.DB
}

// GetRentalBookings returns user's rental bookings
func (ctrl *RentalController) GetRentalBookings(c fiber.Ctx) error {
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

	var bookings []models.RentalBooking
	var total int64

	ctrl.DB.Model(&models.RentalBooking{}).Where("renter_id = ? OR owner_id = ?", userID, userID).Count(&total)
	result := ctrl.DB.Where("renter_id = ? OR owner_id = ?", userID, userID).
		Order("created_at DESC").
		Offset(offset).Limit(perPage).
		Find(&bookings)
	if result.Error != nil {
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil booking rental")
	}

	return PaginatedResponse(c, bookings, page, perPage, total)
}

// CreateRentalBooking creates a new rental booking
func (ctrl *RentalController) CreateRentalBooking(c fiber.Ctx) error {
	userID, ok := GetUserID(c)
	if !ok {
		return ErrorMsg(c, fiber.StatusUnauthorized, "User tidak terautentikasi")
	}

	var req struct {
		CarListingID    string  `json:"car_listing_id"`
		OwnerID         string  `json:"owner_id"`
		PickupDate      string  `json:"pickup_date"`
		ReturnDate      string  `json:"return_date"`
		PickupLocation  string  `json:"pickup_location"`
		ReturnLocation  string  `json:"return_location"`
		DepositAmount   int64   `json:"deposit_amount"`
		Notes           string  `json:"notes"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "Request tidak valid")
	}
	if req.CarListingID == "" || req.OwnerID == "" || req.PickupDate == "" || req.ReturnDate == "" {
		return ErrorMsg(c, fiber.StatusBadRequest, "car_listing_id, owner_id, pickup_date, dan return_date diperlukan")
	}

	ownerID, err := uuid.Parse(req.OwnerID)
	if err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "owner_id tidak valid")
	}
	carListingID, err := uuid.Parse(req.CarListingID)
	if err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "car_listing_id tidak valid")
	}

	pickupDate, err := time.Parse(time.RFC3339, req.PickupDate)
	if err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "Format pickup_date tidak valid")
	}
	returnDate, err := time.Parse(time.RFC3339, req.ReturnDate)
	if err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "Format return_date tidak valid")
	}

	if returnDate.Before(pickupDate) {
		return ErrorMsg(c, fiber.StatusBadRequest, "return_date harus setelah pickup_date")
	}

	// Calculate total days and amount
	totalDays := int(returnDate.Sub(pickupDate).Hours() / 24)
	if totalDays < 1 {
		totalDays = 1
	}

	// Use a daily rate of 500000 IDR as default (in production, fetch from listing)
	dailyRate := int64(500000)
	baseAmount := dailyRate * int64(totalDays)
	totalAmount := baseAmount

	bookingNumber := fmt.Sprintf("REN-%s-%d", time.Now().Format("20060102"), time.Now().UnixNano()%100000)

	booking := models.RentalBooking{
		BookingNumber:  bookingNumber,
		CarListingID:   carListingID,
		RenterID:       userID,
		OwnerID:        ownerID,
		PickupDate:     &pickupDate,
		ReturnDate:     &returnDate,
		PickupLocation: req.PickupLocation,
		ReturnLocation: req.ReturnLocation,
		DailyRate:      dailyRate,
		TotalDays:      totalDays,
		BaseAmount:     baseAmount,
		TotalAmount:    totalAmount,
		DepositAmount:  req.DepositAmount,
		Notes:          req.Notes,
		Status:         "pending",
	}

	if err := ctrl.DB.Create(&booking).Error; err != nil {
		log.Printf("Create rental booking error: %v", err)
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal membuat booking rental")
	}

	return SuccessMsg(c, "Booking rental berhasil dibuat", booking)
}

// GetRentalBooking returns a single rental booking detail
func (ctrl *RentalController) GetRentalBooking(c fiber.Ctx) error {
	userID, ok := GetUserID(c)
	if !ok {
		return ErrorMsg(c, fiber.StatusUnauthorized, "User tidak terautentikasi")
	}

	bookingID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "ID booking tidak valid")
	}

	var booking models.RentalBooking
	if err := ctrl.DB.Where("id = ? AND (renter_id = ? OR owner_id = ?)", bookingID, userID, userID).First(&booking).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return ErrorMsg(c, fiber.StatusNotFound, "Booking rental tidak ditemukan")
		}
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil booking rental")
	}

	// Fetch payments
	var payments []models.RentalPayment
	ctrl.DB.Where("booking_id = ?", booking.ID).Find(&payments)

	// Fetch reviews
	var reviews []models.RentalReview
	ctrl.DB.Where("booking_id = ?", booking.ID).Find(&reviews)

	return SuccessResponse(c, fiber.Map{
		"booking":  booking,
		"payments": payments,
		"reviews":  reviews,
	})
}

// CancelRentalBooking cancels a rental booking
func (ctrl *RentalController) CancelRentalBooking(c fiber.Ctx) error {
	userID, ok := GetUserID(c)
	if !ok {
		return ErrorMsg(c, fiber.StatusUnauthorized, "User tidak terautentikasi")
	}

	bookingID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "ID booking tidak valid")
	}

	var req struct {
		Reason string `json:"reason"`
	}
	_ = c.Bind().JSON(&req)

	var booking models.RentalBooking
	if err := ctrl.DB.Where("id = ? AND (renter_id = ? OR owner_id = ?)", bookingID, userID, userID).First(&booking).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return ErrorMsg(c, fiber.StatusNotFound, "Booking rental tidak ditemukan")
		}
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil booking rental")
	}

	if booking.Status == "completed" || booking.Status == "cancelled" {
		return ErrorMsg(c, fiber.StatusBadRequest, "Booking tidak dapat dibatalkan")
	}

	now := time.Now()
	err = ctrl.DB.Model(&booking).Updates(map[string]interface{}{
		"status":             "cancelled",
		"cancelled_at":       now,
		"cancellation_reason": req.Reason,
		"updated_at":         now,
	}).Error

	if err != nil {
		log.Printf("Cancel rental booking error: %v", err)
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal membatalkan booking rental")
	}

	ctrl.DB.Where("id = ?", bookingID).First(&booking)
	return SuccessMsg(c, "Booking rental berhasil dibatalkan", booking)
}

// ReviewRental creates a review for a rental booking
func (ctrl *RentalController) ReviewRental(c fiber.Ctx) error {
	userID, ok := GetUserID(c)
	if !ok {
		return ErrorMsg(c, fiber.StatusUnauthorized, "User tidak terautentikasi")
	}

	bookingID, err := uuid.Parse(c.Params("id"))
	if err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "ID booking tidak valid")
	}

	var booking models.RentalBooking
	if err := ctrl.DB.Where("id = ? AND (renter_id = ? OR owner_id = ?)", bookingID, userID, userID).First(&booking).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return ErrorMsg(c, fiber.StatusNotFound, "Booking rental tidak ditemukan")
		}
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal mengambil booking rental")
	}

	if booking.Status != "completed" {
		return ErrorMsg(c, fiber.StatusBadRequest, "Review hanya dapat dibuat untuk booking yang sudah selesai")
	}

	// Check if review already exists
	var existingReview models.RentalReview
	if ctrl.DB.Where("booking_id = ? AND reviewer_id = ?", bookingID, userID).First(&existingReview).Error == nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "Review sudah pernah dibuat")
	}

	var req struct {
		Rating  int    `json:"rating"`
		Comment string `json:"comment"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return ErrorMsg(c, fiber.StatusBadRequest, "Request tidak valid")
	}
	if req.Rating < 1 || req.Rating > 5 {
		return ErrorMsg(c, fiber.StatusBadRequest, "Rating harus antara 1-5")
	}

	// Determine reviewee: if reviewer is renter, reviewee is owner and vice versa
	var revieweeID uuid.UUID
	if userID == booking.RenterID {
		revieweeID = booking.OwnerID
	} else {
		revieweeID = booking.RenterID
	}

	review := models.RentalReview{
		BookingID:  bookingID,
		ReviewerID: userID,
		RevieweeID: revieweeID,
		Rating:     req.Rating,
		Comment:    req.Comment,
	}

	if err := ctrl.DB.Create(&review).Error; err != nil {
		log.Printf("Create rental review error: %v", err)
		return ErrorMsg(c, fiber.StatusInternalServerError, "Gagal membuat review")
	}

	return SuccessMsg(c, "Review berhasil dibuat", review)
}
