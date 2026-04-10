package controllers

import (
	"strconv"
	"time"

	"automarket-interaction-service/internal/models"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ReviewController handles review-related operations
type ReviewController struct {
	DB *gorm.DB
}

// ReviewResponse is the review detail with images
type ReviewResponse struct {
	models.CarReview `json:",inline"`
	Images           []models.ReviewImage `json:"images,omitempty"`
	UserVote         *models.ReviewVote   `json:"user_vote,omitempty"`
}

// CreateReview creates a new review for a car listing
func (rc *ReviewController) CreateReview(c fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "User tidak terautentikasi",
		})
	}

	var req struct {
		CarListingID       string  `json:"car_listing_id"`
		OrderID            *string `json:"order_id,omitempty"`
		Rating             int     `json:"rating"`
		Title              string  `json:"title"`
		Comment            string  `json:"comment"`
		Pros               string  `json:"pros,omitempty"`
		Cons               string  `json:"cons,omitempty"`
		IsVerifiedPurchase bool    `json:"is_verified_purchase"`
		IsAnonymous        bool    `json:"is_anonymous"`
	}

	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data tidak valid",
		})
	}

	// Validate required fields
	if req.CarListingID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "car_listing_id wajib diisi",
		})
	}

	carListingID, err := uuid.Parse(req.CarListingID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format car_listing_id tidak valid",
		})
	}

	if req.Rating < 1 || req.Rating > 5 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Rating harus antara 1 dan 5",
		})
	}

	if req.Title == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Judul review wajib diisi",
		})
	}

	if req.Comment == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Komentar wajib diisi",
		})
	}

	// Check if user already reviewed this listing
	var existingReview models.CarReview
	if err := rc.DB.Where("car_listing_id = ? AND user_id = ?", carListingID, userID).First(&existingReview).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"success": false,
			"message": "Anda sudah memberikan review untuk iklan ini",
		})
	}

	// Parse optional order_id
	var orderID *uuid.UUID
	if req.OrderID != nil && *req.OrderID != "" {
		oid, err := uuid.Parse(*req.OrderID)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Format order_id tidak valid",
			})
		}
		orderID = &oid
	}

	review := models.CarReview{
		CarListingID:       carListingID,
		UserID:             userID,
		OrderID:            orderID,
		Rating:             req.Rating,
		Title:              req.Title,
		Comment:            req.Comment,
		Pros:               req.Pros,
		Cons:               req.Cons,
		IsVerifiedPurchase: req.IsVerifiedPurchase,
		IsAnonymous:        req.IsAnonymous,
		Status:             "active",
	}

	if err := rc.DB.Create(&review).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membuat review",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Review berhasil dibuat",
		"data":    review,
	})
}

// GetListingReviews returns paginated reviews for a car listing
func (rc *ReviewController) GetListingReviews(c fiber.Ctx) error {
	listingID := c.Params("id")
	if listingID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "ID iklan diperlukan",
		})
	}

	parsedID, err := uuid.Parse(listingID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format ID tidak valid",
		})
	}

	page, _ := strconv.Atoi(c.Query("page", "1"))
	perPage, _ := strconv.Atoi(c.Query("per_page", "10"))
	sortBy := c.Query("sort", "newest")

	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 50 {
		perPage = 10
	}

	var reviews []models.CarReview
	var total int64

	query := rc.DB.Where("car_listing_id = ? AND status = ?", parsedID, "active")
	query.Model(&models.CarReview{}).Count(&total)

	switch sortBy {
	case "helpful":
		query = query.Order("helpful_count DESC")
	case "highest":
		query = query.Order("rating DESC, created_at DESC")
	case "lowest":
		query = query.Order("rating ASC, created_at DESC")
	default: // newest
		query = query.Order("created_at DESC")
	}

	offset := (page - 1) * perPage
	if err := query.Offset(offset).Limit(perPage).Find(&reviews).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Terjadi kesalahan pada server",
		})
	}

	// Fetch images for these reviews
	var reviewIDs []uuid.UUID
	for _, r := range reviews {
		reviewIDs = append(reviewIDs, r.ID)
	}

	imageMap := make(map[uuid.UUID][]models.ReviewImage)
	if len(reviewIDs) > 0 {
		var images []models.ReviewImage
		rc.DB.Where("review_id IN ?", reviewIDs).Order("display_order ASC").Find(&images)
		for _, img := range images {
			imageMap[img.ReviewID] = append(imageMap[img.ReviewID], img)
		}
	}

	// Build response with images
	type ReviewWithImages struct {
		models.CarReview `json:",inline"`
		Images           []models.ReviewImage `json:"images"`
	}

	var response []ReviewWithImages
	for _, r := range reviews {
		imgs := imageMap[r.ID]
		if imgs == nil {
			imgs = []models.ReviewImage{}
		}
		response = append(response, ReviewWithImages{
			CarReview: r,
			Images:    imgs,
		})
	}

	totalPage := int(total) / perPage
	if int(total)%perPage > 0 {
		totalPage++
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    response,
		"meta": fiber.Map{
			"page":       page,
			"per_page":   perPage,
			"total":      total,
			"total_page": totalPage,
		},
	})
}

// GetReviewDetail returns a single review with images
func (rc *ReviewController) GetReviewDetail(c fiber.Ctx) error {
	reviewID := c.Params("id")
	if reviewID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "ID review diperlukan",
		})
	}

	parsedID, err := uuid.Parse(reviewID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format ID tidak valid",
		})
	}

	var review models.CarReview
	if err := rc.DB.Where("id = ? AND status != ?", parsedID, "deleted").First(&review).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"message": "Review tidak ditemukan",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Terjadi kesalahan pada server",
		})
	}

	// Fetch images
	var images []models.ReviewImage
	rc.DB.Where("review_id = ?", parsedID).Order("display_order ASC").Find(&images)

	// Check current user's vote if authenticated
	var userVote *models.ReviewVote
	if uid, ok := c.Locals("user_id").(uuid.UUID); ok {
		var vote models.ReviewVote
		if rc.DB.Where("review_id = ? AND user_id = ?", parsedID, uid).First(&vote).Error == nil {
			userVote = &vote
		}
	}

	response := ReviewResponse{
		CarReview: review,
		Images:    images,
		UserVote:  userVote,
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    response,
	})
}

// UpdateReview updates a review (own review only)
func (rc *ReviewController) UpdateReview(c fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "User tidak terautentikasi",
		})
	}

	reviewID := c.Params("id")
	parsedID, err := uuid.Parse(reviewID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format ID tidak valid",
		})
	}

	var review models.CarReview
	if err := rc.DB.Where("id = ? AND user_id = ?", parsedID, userID).First(&review).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"message": "Review tidak ditemukan",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Terjadi kesalahan pada server",
		})
	}

	var req struct {
		Rating  *int    `json:"rating"`
		Title   *string `json:"title"`
		Comment *string `json:"comment"`
		Pros    *string `json:"pros"`
		Cons    *string `json:"cons"`
	}

	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data tidak valid",
		})
	}

	updates := map[string]interface{}{}
	if req.Rating != nil {
		if *req.Rating < 1 || *req.Rating > 5 {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Rating harus antara 1 dan 5",
			})
		}
		updates["rating"] = *req.Rating
	}
	if req.Title != nil {
		if *req.Title == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Judul tidak boleh kosong",
			})
		}
		updates["title"] = *req.Title
	}
	if req.Comment != nil {
		if *req.Comment == "" {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"success": false,
				"message": "Komentar tidak boleh kosong",
			})
		}
		updates["comment"] = *req.Comment
	}
	if req.Pros != nil {
		updates["pros"] = *req.Pros
	}
	if req.Cons != nil {
		updates["cons"] = *req.Cons
	}

	if len(updates) > 0 {
		if err := rc.DB.Model(&review).Updates(updates).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": "Gagal memperbarui review",
			})
		}
	}

	rc.DB.Where("id = ?", parsedID).First(&review)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Review berhasil diperbarui",
		"data":    review,
	})
}

// DeleteReview soft-deletes a review (own review only)
func (rc *ReviewController) DeleteReview(c fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "User tidak terautentikasi",
		})
	}

	reviewID := c.Params("id")
	parsedID, err := uuid.Parse(reviewID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format ID tidak valid",
		})
	}

	result := rc.DB.Model(&models.CarReview{}).Where("id = ? AND user_id = ?", parsedID, userID).Update("status", "deleted")
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menghapus review",
		})
	}
	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Review tidak ditemukan",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Review berhasil dihapus",
	})
}

// AddReviewImage adds an image to a review
func (rc *ReviewController) AddReviewImage(c fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "User tidak terautentikasi",
		})
	}

	reviewID := c.Params("id")
	parsedReviewID, err := uuid.Parse(reviewID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format ID review tidak valid",
		})
	}

	// Verify ownership
	var review models.CarReview
	if err := rc.DB.Where("id = ? AND user_id = ?", parsedReviewID, userID).First(&review).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"message": "Review tidak ditemukan",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Terjadi kesalahan pada server",
		})
	}

	var req struct {
		ImageURL     string `json:"image_url"`
		ThumbnailURL string `json:"thumbnail_url,omitempty"`
		Caption      string `json:"caption,omitempty"`
		DisplayOrder int    `json:"display_order"`
	}

	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data tidak valid",
		})
	}

	if req.ImageURL == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "image_url wajib diisi",
		})
	}

	// Count existing images (limit to 10)
	var imgCount int64
	rc.DB.Model(&models.ReviewImage{}).Where("review_id = ?", parsedReviewID).Count(&imgCount)
	if imgCount >= 10 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Maksimal 10 gambar per review",
		})
	}

	image := models.ReviewImage{
		ReviewID:     parsedReviewID,
		ImageURL:     req.ImageURL,
		ThumbnailURL: req.ThumbnailURL,
		Caption:      req.Caption,
		DisplayOrder: req.DisplayOrder,
	}

	if err := rc.DB.Create(&image).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menambahkan gambar",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Gambar berhasil ditambahkan",
		"data":    image,
	})
}

// DeleteReviewImage deletes a review image
func (rc *ReviewController) DeleteReviewImage(c fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "User tidak terautentikasi",
		})
	}

	imageID := c.Params("imageId")
	parsedImageID, err := uuid.Parse(imageID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format ID gambar tidak valid",
		})
	}

	// Verify through review ownership
	var image models.ReviewImage
	if err := rc.DB.Where("id = ?", parsedImageID).First(&image).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"message": "Gambar tidak ditemukan",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Terjadi kesalahan pada server",
		})
	}

	// Check review ownership
	var review models.CarReview
	if err := rc.DB.Where("id = ? AND user_id = ?", image.ReviewID, userID).First(&review).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Review tidak ditemukan",
		})
	}

	if err := rc.DB.Delete(&image).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menghapus gambar",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Gambar berhasil dihapus",
	})
}

// VoteReview votes on a review (helpful/not_helpful, toggle vote)
func (rc *ReviewController) VoteReview(c fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "User tidak terautentikasi",
		})
	}

	reviewID := c.Params("id")
	parsedReviewID, err := uuid.Parse(reviewID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format ID tidak valid",
		})
	}

	var req struct {
		VoteType string `json:"vote_type"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data tidak valid",
		})
	}

	if req.VoteType != "helpful" && req.VoteType != "not_helpful" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "vote_type harus 'helpful' atau 'not_helpful'",
		})
	}

	// Check review exists and is active
	var review models.CarReview
	if err := rc.DB.Where("id = ? AND status = ?", parsedReviewID, "active").First(&review).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Review tidak ditemukan",
		})
	}

	// Cannot vote on own review
	if review.UserID == userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Tidak bisa vote pada review sendiri",
		})
	}

	// Check existing vote
	var existingVote models.ReviewVote
	err = rc.DB.Where("review_id = ? AND user_id = ?", parsedReviewID, userID).First(&existingVote).Error

	if err == gorm.ErrRecordNotFound {
		// New vote
		newVote := models.ReviewVote{
			ReviewID: parsedReviewID,
			UserID:   userID,
			VoteType: req.VoteType,
		}
		if err := rc.DB.Create(&newVote).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": "Gagal memberikan vote",
			})
		}

		// Update counts
		if req.VoteType == "helpful" {
			rc.DB.Model(&review).UpdateColumn("helpful_count", gorm.Expr("helpful_count + 1"))
		} else {
			rc.DB.Model(&review).UpdateColumn("not_helpful_count", gorm.Expr("not_helpful_count + 1"))
		}

		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"success": true,
			"message": "Vote berhasil dicatat",
			"data":    newVote,
		})
	}

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Terjadi kesalahan pada server",
		})
	}

	// Toggle: if same vote type, remove vote; otherwise change vote type
	if existingVote.VoteType == req.VoteType {
		// Remove vote
		rc.DB.Delete(&existingVote)
		if req.VoteType == "helpful" {
			rc.DB.Model(&review).UpdateColumn("helpful_count", gorm.Expr("GREATEST(helpful_count - 1, 0)"))
		} else {
			rc.DB.Model(&review).UpdateColumn("not_helpful_count", gorm.Expr("GREATEST(not_helpful_count - 1, 0)"))
		}

		return c.JSON(fiber.Map{
			"success": true,
			"message": "Vote berhasil dihapus",
		})
	}

	// Change vote type: decrement old, increment new
	oldType := existingVote.VoteType
	rc.DB.Model(&existingVote).Update("vote_type", req.VoteType)

	if oldType == "helpful" {
		rc.DB.Model(&review).UpdateColumn("helpful_count", gorm.Expr("GREATEST(helpful_count - 1, 0)"))
	} else {
		rc.DB.Model(&review).UpdateColumn("not_helpful_count", gorm.Expr("GREATEST(not_helpful_count - 1, 0)"))
	}

	if req.VoteType == "helpful" {
		rc.DB.Model(&review).UpdateColumn("helpful_count", gorm.Expr("helpful_count + 1"))
	} else {
		rc.DB.Model(&review).UpdateColumn("not_helpful_count", gorm.Expr("not_helpful_count + 1"))
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Vote berhasil diubah",
	})
}

// SellerResponse adds a seller response to a review (seller only)
func (rc *ReviewController) SellerResponse(c fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "User tidak terautentikasi",
		})
	}

	reviewID := c.Params("id")
	parsedReviewID, err := uuid.Parse(reviewID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format ID tidak valid",
		})
	}

	var req struct {
		Response string `json:"response"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data tidak valid",
		})
	}

	if req.Response == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Respons wajib diisi",
		})
	}

	var review models.CarReview
	if err := rc.DB.Where("id = ? AND status = ?", parsedReviewID, "active").First(&review).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Review tidak ditemukan",
		})
	}

	// In production, you would verify that the current user is the seller of the car_listing.
	// For now we allow any authenticated user to respond as seller role check.
	role, _ := c.Locals("user_role").(string)
	if role != "seller" && role != "dealer" && role != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Hanya penjual yang bisa memberikan respons",
		})
	}

	now := time.Now()
	if err := rc.DB.Model(&review).Updates(map[string]interface{}{
		"seller_response":    req.Response,
		"seller_responded_at": now,
	}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menambahkan respons",
		})
	}

	rc.DB.Where("id = ?", parsedReviewID).First(&review)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Respons berhasil ditambahkan",
		"data":    review,
	})
}

// AdminUpdateReviewStatus updates review status (admin only)
func (rc *ReviewController) AdminUpdateReviewStatus(c fiber.Ctx) error {
	reviewID := c.Params("id")
	parsedID, err := uuid.Parse(reviewID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format ID tidak valid",
		})
	}

	var req struct {
		Status string `json:"status"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data tidak valid",
		})
	}

	validStatuses := map[string]bool{"active": true, "hidden": true}
	if !validStatuses[req.Status] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Status tidak valid. Pilihan: active, hidden",
		})
	}

	result := rc.DB.Model(&models.CarReview{}).Where("id = ?", parsedID).Update("status", req.Status)
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengubah status review",
		})
	}
	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Review tidak ditemukan",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Status review berhasil diubah",
	})
}

// AdminDeleteReview force-deletes a review (admin only)
func (rc *ReviewController) AdminDeleteReview(c fiber.Ctx) error {
	reviewID := c.Params("id")
	parsedID, err := uuid.Parse(reviewID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format ID tidak valid",
		})
	}

	// Delete images first
	rc.DB.Where("review_id = ?", parsedID).Delete(&models.ReviewImage{})
	// Delete votes
	rc.DB.Where("review_id = ?", parsedID).Delete(&models.ReviewVote{})
	// Delete review
	result := rc.DB.Where("id = ?", parsedID).Delete(&models.CarReview{})
	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menghapus review",
		})
	}
	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Review tidak ditemukan",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Review berhasil dihapus permanen",
	})
}

// AdminListReviews lists all reviews with filters (admin only)
func (rc *ReviewController) AdminListReviews(c fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	perPage, _ := strconv.Atoi(c.Query("per_page", "20"))
	status := c.Query("status", "")
	carListingID := c.Query("car_listing_id", "")
	ratingFilter := c.Query("rating", "")

	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	query := rc.DB.Model(&models.CarReview{})

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if carListingID != "" {
		parsedListingID, err := uuid.Parse(carListingID)
		if err == nil {
			query = query.Where("car_listing_id = ?", parsedListingID)
		}
	}
	if ratingFilter != "" {
		rating, err := strconv.Atoi(ratingFilter)
		if err == nil && rating >= 1 && rating <= 5 {
			query = query.Where("rating = ?", rating)
		}
	}

	var total int64
	query.Count(&total)

	var reviews []models.CarReview
	offset := (page - 1) * perPage
	if err := query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&reviews).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Terjadi kesalahan pada server",
		})
	}

	totalPage := int(total) / perPage
	if int(total)%perPage > 0 {
		totalPage++
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    reviews,
		"meta": fiber.Map{
			"page":       page,
			"per_page":   perPage,
			"total":      total,
			"total_page": totalPage,
		},
	})
}
