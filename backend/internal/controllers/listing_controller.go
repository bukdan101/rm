package controllers

import (
        "strconv"
        "time"

        "automarket/internal/models"
        "automarket/internal/utils"

        "github.com/gofiber/fiber/v3"
        "github.com/google/uuid"
        "gorm.io/gorm"
)

// GetListings returns paginated listings with search/filter
func GetListings(c fiber.Ctx) error {
        db := c.Locals("db").(*gorm.DB)

        page, _ := strconv.Atoi(c.Query("page", "1"))
        perPage, _ := strconv.Atoi(c.Query("per_page", "20"))
        if page < 1 {
                page = 1
        }
        if perPage < 1 || perPage > 100 {
                perPage = 20
        }
        offset := (page - 1) * perPage

        query := db.Model(&models.CarListing{}).Where("status = ?", "active")

        // Filters
        if brandID := c.Query("brand_id"); brandID != "" {
                query = query.Where("brand_id = ?", brandID)
        }
        if modelID := c.Query("model_id"); modelID != "" {
                query = query.Where("model_id = ?", modelID)
        }
        if city := c.Query("city"); city != "" {
                query = query.Where("city ILIKE ?", "%"+city+"%")
        }
        if province := c.Query("province"); province != "" {
                query = query.Where("province ILIKE ?", "%"+province+"%")
        }
        if yearMin := c.Query("year_min"); yearMin != "" {
                query = query.Where("year >= ?", yearMin)
        }
        if yearMax := c.Query("year_max"); yearMax != "" {
                query = query.Where("year <= ?", yearMax)
        }
        if priceMin := c.Query("price_min"); priceMin != "" {
                query = query.Where("price_cash >= ?", priceMin)
        }
        if priceMax := c.Query("price_max"); priceMax != "" {
                query = query.Where("price_cash <= ?", priceMax)
        }
        if transmission := c.Query("transmission"); transmission != "" {
                query = query.Where("transmission = ?", transmission)
        }
        if fuel := c.Query("fuel"); fuel != "" {
                query = query.Where("fuel = ?", fuel)
        }
        if bodyType := c.Query("body_type"); bodyType != "" {
                query = query.Where("body_type = ?", bodyType)
        }
        if condition := c.Query("condition"); condition != "" {
                query = query.Where("condition = ?", condition)
        }
        if txType := c.Query("transaction_type"); txType != "" {
                query = query.Where("transaction_type = ?", txType)
        }
        if search := c.Query("search"); search != "" {
                query = query.Where("title ILIKE ? OR description ILIKE ? OR plate_number ILIKE ?",
                        "%"+search+"%", "%"+search+"%", "%"+search+"%")
        }

        // Count total
        var total int64
        query.Count(&total)

        // Sort
        switch c.Query("sort", "newest") {
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

        // Preload relations
        var listings []models.CarListing
        query.Preload("Brand").Preload("Model").Preload("Images").
                Offset(offset).Limit(perPage).Find(&listings)

        return utils.PaginatedResponse(c, listings, page, perPage, total)
}

// GetListingByID returns a single listing with full details
func GetListingByID(c fiber.Ctx) error {
        db := c.Locals("db").(*gorm.DB)
        id := c.Params("id")

        var listing models.CarListing
        err := db.Preload("Brand").Preload("Model").Preload("Variant").Preload("Images").
                Preload("Features").Preload("Documents").Preload("RentalPrice").Preload("Inspection").
                Preload("User").
                Where("id = ?", id).First(&listing).Error

        if err != nil {
                return utils.ErrorMsg(c, fiber.StatusNotFound, "Listing tidak ditemukan")
        }

        // Increment view count
        db.Model(&models.CarListing{}).Where("id = ?", id).
                UpdateColumn("view_count", gorm.Expr("view_count + 1"))

        return utils.SuccessResponse(c, listing)
}

// CreateListing creates a new car listing
func CreateListing(c fiber.Ctx) error {
        db := c.Locals("db").(*gorm.DB)
        userID, ok := c.Locals("user_id").(uuid.UUID)
        if !ok {
                return utils.ErrorMsg(c, fiber.StatusUnauthorized, "User ID tidak ditemukan")
        }

        var req struct {
                BrandID         *uuid.UUID `json:"brand_id"`
                ModelID         *uuid.UUID `json:"model_id"`
                VariantID       *uuid.UUID `json:"variant_id"`
                Year            *int       `json:"year"`
                ExteriorColorID *uuid.UUID `json:"exterior_color_id"`
                InteriorColorID *uuid.UUID `json:"interior_color_id"`
                Fuel            *string    `json:"fuel"`
                Transmission    *string    `json:"transmission"`
                BodyType        *string    `json:"body_type"`
                EngineCapacity  *int       `json:"engine_capacity"`
                SeatCount       *int       `json:"seat_count"`
                Mileage         *int       `json:"mileage"`
                VINNumber       *string    `json:"vin_number"`
                PlateNumber     *string    `json:"plate_number"`
                TransactionType *string    `json:"transaction_type"`
                Condition       *string    `json:"condition"`
                PriceCash       *int64     `json:"price_cash"`
                PriceCredit     *int64     `json:"price_credit"`
                PriceNegotiable *bool      `json:"price_negotiable"`
                City            *string    `json:"city"`
                Province        *string    `json:"province"`
                Title           *string    `json:"title"`
                Description     *string    `json:"description"`
        }

        if err := c.Bind().Body(&req); err != nil {
                return utils.ErrorMsg(c, fiber.StatusBadRequest, "Request body tidak valid")
        }

        if req.BrandID == nil || req.ModelID == nil {
                return utils.ErrorMsg(c, fiber.StatusBadRequest, "Brand dan Model wajib diisi")
        }
        if req.PriceCash == nil || *req.PriceCash <= 0 {
                return utils.ErrorMsg(c, fiber.StatusBadRequest, "Harga wajib diisi")
        }

        // Auto-generate title
        title := ""
        if req.Title != nil && *req.Title != "" {
                title = *req.Title
        } else {
                var brand models.Brand
                var model models.CarModel
                db.First(&brand, "id = ?", req.BrandID)
                db.First(&model, "id = ?", req.ModelID)
                title = brand.Name + " " + model.Name
                if req.Year != nil {
                        title += " " + strconv.Itoa(*req.Year)
                }
        }

        // Generate slug
        slug := uuid.New().String()[:8]

        // Deduct 10 tokens for normal listing
        tokenCost := 10
        if req.TransactionType != nil && *req.TransactionType == "jual" {
                // Normal listing
        } else {
                tokenCost = 10
        }

        var userToken models.UserToken
        if err := db.Where("user_id = ?", userID).First(&userToken).Error; err != nil {
                return utils.ErrorMsg(c, fiber.StatusBadRequest, "Akun token tidak ditemukan")
        }
        if userToken.Balance < tokenCost {
                return utils.ErrorMsg(c, fiber.StatusBadRequest, "Token tidak cukup. Dibutuhkan "+strconv.Itoa(tokenCost)+" token.")
        }

        // Deduct tokens
        balanceBefore := userToken.Balance
        balanceAfter := balanceBefore - tokenCost
        db.Model(&userToken).Updates(map[string]interface{}{
                "balance":     balanceAfter,
                "total_used":  gorm.Expr("total_used + ?", tokenCost),
        })

        // Record transaction
        db.Create(&models.TokenTransaction{
                UserID:         &userID,
                TransactionType: &[]string{"usage"}[0],
                Amount:         tokenCost,
                BalanceBefore:  &balanceBefore,
                BalanceAfter:   &balanceAfter,
                Description:    &[]string{"Pembuatan listing: " + title}[0],
        })

        negotiable := true
        if req.PriceNegotiable != nil {
                negotiable = *req.PriceNegotiable
        }

        listing := models.CarListing{
                ID:               uuid.New(),
                UserID:           &userID,
                BrandID:          req.BrandID,
                ModelID:          req.ModelID,
                VariantID:        req.VariantID,
                Year:             req.Year,
                ExteriorColorID:  req.ExteriorColorID,
                InteriorColorID:  req.InteriorColorID,
                Fuel:             req.Fuel,
                Transmission:     req.Transmission,
                BodyType:         req.BodyType,
                EngineCapacity:   req.EngineCapacity,
                SeatCount:        req.SeatCount,
                Mileage:          req.Mileage,
                VINNumber:        req.VINNumber,
                PlateNumber:      req.PlateNumber,
                TransactionType:  req.TransactionType,
                Condition:        req.Condition,
                PriceCash:        req.PriceCash,
                PriceCredit:      req.PriceCredit,
                PriceNegotiable:  negotiable,
                City:             req.City,
                Province:         req.Province,
                Title:            &title,
                Description:      req.Description,
                Slug:             &slug,
                Status:           "active",
                PublishedAt:      &[]time.Time{time.Now()}[0],
        }

        if err := db.Create(&listing).Error; err != nil {
                // Refund tokens on failure
                db.Model(&userToken).Update("balance", balanceBefore)
                return utils.ErrorMsg(c, fiber.StatusInternalServerError, "Gagal membuat listing: "+err.Error())
        }

        return c.Status(fiber.StatusCreated).JSON(fiber.Map{
                "success": true,
                "message": "Listing berhasil dibuat",
                "data":    listing,
        })
}

// UpdateListing updates an existing listing
func UpdateListing(c fiber.Ctx) error {
        db := c.Locals("db").(*gorm.DB)
        userID, _ := c.Locals("user_id").(uuid.UUID)
        id := c.Params("id")

        var listing models.CarListing
        if err := db.Where("id = ? AND user_id = ?", id, userID).First(&listing).Error; err != nil {
                return utils.ErrorMsg(c, fiber.StatusNotFound, "Listing tidak ditemukan")
        }

        var req map[string]interface{}
        if err := c.Bind().Body(&req); err != nil {
                return utils.ErrorMsg(c, fiber.StatusBadRequest, "Request body tidak valid")
        }

        // Remove protected fields
        delete(req, "id")
        delete(req, "user_id")
        delete(req, "created_at")
        delete(req, "view_count")
        delete(req, "favorite_count")

        if err := db.Model(&listing).Updates(req).Error; err != nil {
                return utils.ErrorMsg(c, fiber.StatusInternalServerError, "Gagal update listing")
        }

        return utils.SuccessMessage(c, "Listing berhasil diupdate")
}

// DeleteListing soft-deletes a listing
func DeleteListing(c fiber.Ctx) error {
        db := c.Locals("db").(*gorm.DB)
        userID, _ := c.Locals("user_id").(uuid.UUID)
        id := c.Params("id")

        result := db.Model(&models.CarListing{}).
                Where("id = ? AND user_id = ?", id, userID).
                Update("status", "deleted")

        if result.RowsAffected == 0 {
                return utils.ErrorMsg(c, fiber.StatusNotFound, "Listing tidak ditemukan")
        }

        return utils.SuccessMessage(c, "Listing berhasil dihapus")
}
