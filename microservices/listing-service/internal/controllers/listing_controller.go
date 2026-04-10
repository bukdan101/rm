package controllers

import (
	"strconv"
	"strings"
	"time"

	"automarket-listing-service/internal/models"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ListingController struct {
	DB *gorm.DB
}

// ListListings returns paginated, filtered active listings
func (ctrl *ListingController) ListListings(c fiber.Ctx) error {
	query := ctrl.DB.Model(&models.CarListing{})

	// Only show active listings by default (unless status filter provided)
	status := c.Query("status")
	if status == "" {
		query = query.Where("status = ?", "active")
	} else {
		query = query.Where("status = ?", status)
	}

	// Filters
	if v := c.Query("brand_id"); v != "" {
		if id, err := uuid.Parse(v); err == nil {
			query = query.Where("brand_id = ?", id)
		}
	}
	if v := c.Query("model_id"); v != "" {
		if id, err := uuid.Parse(v); err == nil {
			query = query.Where("model_id = ?", id)
		}
	}
	if v := c.Query("city"); v != "" {
		query = query.Where("city ILIKE ?", "%"+v+"%")
	}
	if v := c.Query("province"); v != "" {
		query = query.Where("province ILIKE ?", "%"+v+"%")
	}
	if v := c.Query("year_min"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			query = query.Where("year >= ?", n)
		}
	}
	if v := c.Query("year_max"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			query = query.Where("year <= ?", n)
		}
	}
	if v := c.Query("price_min"); v != "" {
		if n, err := strconv.ParseInt(v, 10, 64); err == nil {
			query = query.Where("price_cash >= ?", n)
		}
	}
	if v := c.Query("price_max"); v != "" {
		if n, err := strconv.ParseInt(v, 10, 64); err == nil {
			query = query.Where("price_cash <= ?", n)
		}
	}
	if v := c.Query("transmission"); v != "" {
		query = query.Where("transmission = ?", v)
	}
	if v := c.Query("fuel"); v != "" {
		query = query.Where("fuel = ?", v)
	}
	if v := c.Query("body_type"); v != "" {
		query = query.Where("body_type = ?", v)
	}
	if v := c.Query("condition"); v != "" {
		query = query.Where("condition = ?", v)
	}
	if v := c.Query("transaction_type"); v != "" {
		query = query.Where("transaction_type = ?", v)
	}
	if v := c.Query("search"); v != "" {
		like := "%" + v + "%"
		query = query.Where("title ILIKE ? OR description ILIKE ? OR brand_id IN (SELECT id FROM brands WHERE name ILIKE ?)", like, like, like)
	}

	// Sort
	sort := c.Query("sort", "newest")
	switch sort {
	case "price_asc":
		query = query.Order("price_cash ASC")
	case "price_desc":
		query = query.Order("price_cash DESC")
	case "mileage":
		query = query.Order("mileage ASC")
	case "popular":
		query = query.Order("view_count DESC")
	default:
		query = query.Order("created_at DESC")
	}

	// Pagination
	page, _ := strconv.Atoi(c.Query("page", "1"))
	perPage, _ := strconv.Atoi(c.Query("per_page", "20"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}
	offset := (page - 1) * perPage

	var total int64
	query.Count(&total)

	var listings []models.CarListing
	if err := query.Offset(offset).Limit(perPage).Find(&listings).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data listing",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    listings,
		"meta": fiber.Map{
			"page":       page,
			"per_page":   perPage,
			"total":      total,
			"total_pages": (total + int64(perPage) - 1) / int64(perPage),
		},
	})
}

// GetListing returns a single listing with images, features, documents
func (ctrl *ListingController) GetListing(c fiber.Ctx) error {
	idStr := c.Params("id")
	var listing models.CarListing

	if err := ctrl.DB.Where("id = ? OR slug = ?", idStr, idStr).First(&listing).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{
				"success": false,
				"message": "Listing tidak ditemukan",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data listing",
			"error":   err.Error(),
		})
	}

	// Increment view count
	ctrl.DB.Model(&models.CarListing{}).Where("id = ?", listing.ID).
		UpdateColumn("view_count", gorm.Expr("view_count + 1"))

	// Fetch related data
	var images []models.CarImage
	ctrl.DB.Where("car_listing_id = ?", listing.ID).Order("display_order ASC, is_primary DESC").Find(&images)

	var videos []models.CarVideo
	ctrl.DB.Where("car_listing_id = ?", listing.ID).Find(&videos)

	var features *models.CarFeatures
	ctrl.DB.Where("car_listing_id = ?", listing.ID).First(&features)

	var documents *models.CarDocument
	ctrl.DB.Where("car_listing_id = ?", listing.ID).First(&documents)

	var featureValues []models.CarFeatureValue
	ctrl.DB.Where("car_listing_id = ?", listing.ID).Find(&featureValues)

	// Fetch brand and model names
	var brandName, modelName string
	if listing.BrandID != nil {
		ctrl.DB.Model(&models.Brand{}).Where("id = ?", listing.BrandID).Select("name").Scan(&brandName)
	}
	if listing.ModelID != nil {
		ctrl.DB.Model(&models.CarModel{}).Where("id = ?", listing.ModelID).Select("name").Scan(&modelName)
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"listing":       listing,
			"images":        images,
			"videos":        videos,
			"features":      features,
			"documents":     documents,
			"feature_values": featureValues,
			"brand_name":    brandName,
			"model_name":    modelName,
		},
	})
}

// CreateListing creates a new car listing
func (ctrl *ListingController) CreateListing(c fiber.Ctx) error {
	var input struct {
		UserID          string  `json:"user_id"`
		DealerID        string  `json:"dealer_id"`
		BrandID         string  `json:"brand_id"`
		ModelID         string  `json:"model_id"`
		VariantID       string  `json:"variant_id"`
		GenerationID    string  `json:"generation_id"`
		Year            int     `json:"year"`
		ExteriorColorID string  `json:"exterior_color_id"`
		InteriorColorID string  `json:"interior_color_id"`
		Fuel            string  `json:"fuel"`
		Transmission    string  `json:"transmission"`
		BodyType        string  `json:"body_type"`
		EngineCapacity  int     `json:"engine_capacity"`
		SeatCount       int     `json:"seat_count"`
		Mileage         int     `json:"mileage"`
		VINNumber       string  `json:"vin_number"`
		PlateNumber     string  `json:"plate_number"`
		TransactionType string  `json:"transaction_type"`
		Condition       string  `json:"condition"`
		PriceCash       int64   `json:"price_cash"`
		PriceCredit     int64   `json:"price_credit"`
		PriceNegotiable bool    `json:"price_negotiable"`
		City            string  `json:"city"`
		Province        string  `json:"province"`
		CityID          string  `json:"city_id"`
		ProvinceID      string  `json:"province_id"`
		Title           string  `json:"title"`
		Description     string  `json:"description"`
		MetaTitle       string  `json:"meta_title"`
		MetaDescription string  `json:"meta_description"`
		Slug            string  `json:"slug"`
	}

	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Request body tidak valid",
			"error":   err.Error(),
		})
	}

	// Generate listing number
	listingNumber := "LS-" + time.Now().Format("20060102") + "-" + uuid.New().String()[:8]

	// Parse UUIDs
	var userID, dealerID, brandID, modelID, variantID, generationID, exteriorColorID, interiorColorID, cityID, provinceID *uuid.UUID
	if input.UserID != "" { uid, _ := uuid.Parse(input.UserID); userID = &uid }
	if input.DealerID != "" { uid, _ := uuid.Parse(input.DealerID); dealerID = &uid }
	if input.BrandID != "" { uid, _ := uuid.Parse(input.BrandID); brandID = &uid }
	if input.ModelID != "" { uid, _ := uuid.Parse(input.ModelID); modelID = &uid }
	if input.VariantID != "" { uid, _ := uuid.Parse(input.VariantID); variantID = &uid }
	if input.GenerationID != "" { uid, _ := uuid.Parse(input.GenerationID); generationID = &uid }
	if input.ExteriorColorID != "" { uid, _ := uuid.Parse(input.ExteriorColorID); exteriorColorID = &uid }
	if input.InteriorColorID != "" { uid, _ := uuid.Parse(input.InteriorColorID); interiorColorID = &uid }
	if input.CityID != "" { uid, _ := uuid.Parse(input.CityID); cityID = &uid }
	if input.ProvinceID != "" { uid, _ := uuid.Parse(input.ProvinceID); provinceID = &uid }

	slug := input.Slug
	if slug == "" {
		slug = strings.ToLower(strings.ReplaceAll(input.Title, " ", "-")) + "-" + uuid.New().String()[:8]
	}

	listing := models.CarListing{
		ListingNumber:   listingNumber,
		UserID:          userID,
		DealerID:        dealerID,
		BrandID:         brandID,
		ModelID:         modelID,
		VariantID:       variantID,
		GenerationID:    generationID,
		Year:            input.Year,
		ExteriorColorID: exteriorColorID,
		InteriorColorID: interiorColorID,
		Fuel:            input.Fuel,
		Transmission:    input.Transmission,
		BodyType:        input.BodyType,
		EngineCapacity:  input.EngineCapacity,
		SeatCount:       input.SeatCount,
		Mileage:         input.Mileage,
		VINNumber:       input.VINNumber,
		PlateNumber:     input.PlateNumber,
		TransactionType: input.TransactionType,
		Condition:       input.Condition,
		PriceCash:       input.PriceCash,
		PriceCredit:     input.PriceCredit,
		PriceNegotiable: input.PriceNegotiable,
		City:            input.City,
		Province:        input.Province,
		CityID:          cityID,
		ProvinceID:      provinceID,
		Status:          "draft",
		Title:           input.Title,
		Description:     input.Description,
		MetaTitle:       input.MetaTitle,
		MetaDescription: input.MetaDescription,
		Slug:            slug,
	}

	if err := ctrl.DB.Create(&listing).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membuat listing",
			"error":   err.Error(),
		})
	}

	// TODO: Call user-service (localhost:8001) to deduct tokens
	// For now, we just note that token deduction should happen
	_ = "token deduction should be integrated with user-service"

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Listing berhasil dibuat",
		"data":    listing,
		"note":    "Token deduction should be integrated with user-service at localhost:8001",
	})
}

// UpdateListing updates an existing car listing
func (ctrl *ListingController) UpdateListing(c fiber.Ctx) error {
	idStr := c.Params("id")
	var listing models.CarListing

	if err := ctrl.DB.Where("id = ?", idStr).First(&listing).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{
				"success": false,
				"message": "Listing tidak ditemukan",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data listing",
		})
	}

	var input map[string]interface{}
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Request body tidak valid",
		})
	}

	// Allowed fields to update
	allowedFields := []string{
		"brand_id", "model_id", "variant_id", "generation_id", "year",
		"exterior_color_id", "interior_color_id", "fuel", "transmission",
		"body_type", "engine_capacity", "seat_count", "mileage",
		"vin_number", "plate_number", "transaction_type", "condition",
		"price_cash", "price_credit", "price_negotiable",
		"city", "province", "city_id", "province_id",
		"title", "description", "meta_title", "meta_description", "slug", "status",
	}

	updates := make(map[string]interface{})
	for _, field := range allowedFields {
		if val, ok := input[field]; ok {
			updates[field] = val
		}
	}

	if len(updates) == 0 {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Tidak ada field yang diperbarui",
		})
	}

	// Track price changes
	if _, ok := updates["price_cash"]; ok {
		if input["price_cash"] != nil {
			newPrice, _ := input["price_cash"].(float64)
			if listing.PriceCash != int64(newPrice) {
				ctrl.DB.Create(&models.CarPriceHistory{
					CarListingID:   &listing.ID,
					PriceCashOld:   listing.PriceCash,
					PriceCashNew:   int64(newPrice),
					PriceCreditOld: listing.PriceCredit,
					PriceCreditNew: listing.PriceCredit,
				})
			}
		}
	}

	if err := ctrl.DB.Model(&listing).Updates(updates).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengupdate listing",
			"error":   err.Error(),
		})
	}

	// Track status changes
	if newStatus, ok := updates["status"]; ok {
		if newStatus != listing.Status {
			ctrl.DB.Create(&models.CarStatusHistory{
				CarListingID: &listing.ID,
				StatusOld:    listing.Status,
				StatusNew:    newStatus.(string),
			})
			// Set published_at when status becomes active
			if newStatus == "active" {
				now := time.Now()
				ctrl.DB.Model(&listing).Update("published_at", &now)
			}
		}
	}

	ctrl.DB.First(&listing, listing.ID)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Listing berhasil diupdate",
		"data":    listing,
	})
}

// DeleteListing soft-deletes a listing
func (ctrl *ListingController) DeleteListing(c fiber.Ctx) error {
	idStr := c.Params("id")
	var listing models.CarListing

	if err := ctrl.DB.Where("id = ?", idStr).First(&listing).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{
				"success": false,
				"message": "Listing tidak ditemukan",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data listing",
		})
	}

	if err := ctrl.DB.Delete(&listing).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menghapus listing",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Listing berhasil dihapus",
	})
}

// AddImage adds an image to a listing
func (ctrl *ListingController) AddImage(c fiber.Ctx) error {
	idStr := c.Params("id")
	var listing models.CarListing
	if err := ctrl.DB.Where("id = ?", idStr).First(&listing).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"message": "Listing tidak ditemukan",
		})
	}

	var input struct {
		ImageURL     string `json:"image_url"`
		ThumbnailURL string `json:"thumbnail_url"`
		Caption      string `json:"caption"`
		IsPrimary    bool   `json:"is_primary"`
		DisplayOrder int    `json:"display_order"`
	}
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Request body tidak valid",
		})
	}

	// If this is primary, unset other primary images
	if input.IsPrimary {
		ctrl.DB.Model(&models.CarImage{}).
			Where("car_listing_id = ? AND is_primary = ?", listing.ID, true).
			Update("is_primary", false)
	}

	image := models.CarImage{
		CarListingID: &listing.ID,
		ImageURL:     input.ImageURL,
		ThumbnailURL: input.ThumbnailURL,
		Caption:      input.Caption,
		IsPrimary:    input.IsPrimary,
		DisplayOrder: input.DisplayOrder,
	}

	if err := ctrl.DB.Create(&image).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menambah gambar",
			"error":   err.Error(),
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Gambar berhasil ditambahkan",
		"data":    image,
	})
}

// DeleteImage removes an image from a listing
func (ctrl *ListingController) DeleteImage(c fiber.Ctx) error {
	imageID := c.Params("imageId")
	var image models.CarImage
	if err := ctrl.DB.Where("id = ?", imageID).First(&image).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"message": "Gambar tidak ditemukan",
		})
	}

	if err := ctrl.DB.Delete(&image).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menghapus gambar",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Gambar berhasil dihapus",
	})
}

// SetPrimaryImage sets an image as the primary image for a listing
func (ctrl *ListingController) SetPrimaryImage(c fiber.Ctx) error {
	imageID := c.Params("imageId")
	var image models.CarImage
	if err := ctrl.DB.Where("id = ?", imageID).First(&image).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"message": "Gambar tidak ditemukan",
		})
	}

	// Unset all primary images for this listing
	ctrl.DB.Model(&models.CarImage{}).
		Where("car_listing_id = ? AND is_primary = ?", image.CarListingID, true).
		Update("is_primary", false)

	// Set this image as primary
	ctrl.DB.Model(&image).Update("is_primary", true)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Gambar utama berhasil diubah",
	})
}

// AddVideo adds a video to a listing
func (ctrl *ListingController) AddVideo(c fiber.Ctx) error {
	idStr := c.Params("id")
	var listing models.CarListing
	if err := ctrl.DB.Where("id = ?", idStr).First(&listing).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"message": "Listing tidak ditemukan",
		})
	}

	var input struct {
		VideoURL     string `json:"video_url"`
		ThumbnailURL string `json:"thumbnail_url"`
		Title        string `json:"title"`
		Duration     int    `json:"duration"`
		IsPrimary    bool   `json:"is_primary"`
	}
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Request body tidak valid",
		})
	}

	if input.IsPrimary {
		ctrl.DB.Model(&models.CarVideo{}).
			Where("car_listing_id = ? AND is_primary = ?", listing.ID, true).
			Update("is_primary", false)
	}

	video := models.CarVideo{
		CarListingID: &listing.ID,
		VideoURL:     input.VideoURL,
		ThumbnailURL: input.ThumbnailURL,
		Title:        input.Title,
		Duration:     input.Duration,
		IsPrimary:    input.IsPrimary,
	}

	if err := ctrl.DB.Create(&video).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menambah video",
			"error":   err.Error(),
		})
	}

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Video berhasil ditambahkan",
		"data":    video,
	})
}

// UpdateFeatures updates features for a listing
func (ctrl *ListingController) UpdateFeatures(c fiber.Ctx) error {
	idStr := c.Params("id")
	var listing models.CarListing
	if err := ctrl.DB.Where("id = ?", idStr).First(&listing).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"message": "Listing tidak ditemukan",
		})
	}

	var input models.CarFeatures
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Request body tidak valid",
		})
	}

	// Upsert features
	var existing models.CarFeatures
	result := ctrl.DB.Where("car_listing_id = ?", listing.ID).First(&existing)
	if result.Error == gorm.ErrRecordNotFound {
		input.CarListingID = &listing.ID
		ctrl.DB.Create(&input)
	} else if result.Error == nil {
		ctrl.DB.Model(&existing).Updates(input)
		input.ID = existing.ID
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Fitur berhasil diupdate",
		"data":    input,
	})
}

// UpdateDocuments updates documents for a listing
func (ctrl *ListingController) UpdateDocuments(c fiber.Ctx) error {
	idStr := c.Params("id")
	var listing models.CarListing
	if err := ctrl.DB.Where("id = ?", idStr).First(&listing).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"message": "Listing tidak ditemukan",
		})
	}

	var input models.CarDocument
	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Request body tidak valid",
		})
	}

	// Upsert documents
	var existing models.CarDocument
	result := ctrl.DB.Where("car_listing_id = ?", listing.ID).First(&existing)
	if result.Error == gorm.ErrRecordNotFound {
		input.CarListingID = &listing.ID
		ctrl.DB.Create(&input)
	} else if result.Error == nil {
		ctrl.DB.Model(&existing).Updates(input)
		input.ID = existing.ID
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Dokumen berhasil diupdate",
		"data":    input,
	})
}

// GetMyListings returns listings for the authenticated user
func (ctrl *ListingController) GetMyListings(c fiber.Ctx) error {
	userID := c.Locals("user_id")
	if userID == nil {
		return c.Status(401).JSON(fiber.Map{
			"success": false,
			"message": "User ID tidak ditemukan",
		})
	}

	status := c.Query("status")
	query := ctrl.DB.Model(&models.CarListing{}).Where("user_id = ?", userID)
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query = query.Order("created_at DESC")

	page, _ := strconv.Atoi(c.Query("page", "1"))
	perPage, _ := strconv.Atoi(c.Query("per_page", "20"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	var total int64
	query.Count(&total)

	var listings []models.CarListing
	if err := query.Offset((page - 1) * perPage).Limit(perPage).Find(&listings).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data listing",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    listings,
		"meta": fiber.Map{
			"page":        page,
			"per_page":    perPage,
			"total":       total,
			"total_pages": (total + int64(perPage) - 1) / int64(perPage),
		},
	})
}

// GetListingReviews returns reviews for a listing (placeholder)
func (ctrl *ListingController) GetListingReviews(c fiber.Ctx) error {
	_ = c.Params("id")
	// Reviews are managed by a separate service
	return c.JSON(fiber.Map{
		"success": true,
		"data":    []interface{}{},
		"message": "Reviews service is managed separately",
	})
}
