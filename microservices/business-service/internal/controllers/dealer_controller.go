package controllers

import (
	"log"
	"strconv"
	"strings"
	"time"

	"automarket-business-service/internal/models"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// DealerController handles dealer-related endpoints
type DealerController struct {
	DB *gorm.DB
}

// ListDealers returns paginated, filterable dealer list (public)
func (ctrl *DealerController) ListDealers(c fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	perPage, _ := strconv.Atoi(c.Query("per_page", "20"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 100 {
		perPage = 20
	}

	cityID := c.Query("city_id")
	provinceID := c.Query("province_id")
	verifiedOnly := c.Query("verified")
	search := c.Query("search")

	query := ctrl.DB.Model(&models.Dealer{}).Where("is_active = ?", true)

	if cityID != "" {
		query = query.Where("city_id = ?", cityID)
	}
	if provinceID != "" {
		query = query.Where("province_id = ?", provinceID)
	}
	if verifiedOnly == "true" {
		query = query.Where("verified = ?", true)
	}
	if search != "" {
		query = query.Where("name ILIKE ? OR description ILIKE ?", "%"+search+"%", "%"+search+"%")
	}

	var total int64
	query.Count(&total)

	var dealers []models.Dealer
	offset := (page - 1) * perPage
	if err := query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&dealers).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data dealer",
		})
	}

	totalPage := int(total) / perPage
	if int(total)%perPage > 0 {
		totalPage++
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    dealers,
		"meta": fiber.Map{
			"page":       page,
			"per_page":   perPage,
			"total":      total,
			"total_page": totalPage,
		},
	})
}

// GetDealerBySlug returns a single dealer profile (public)
func (ctrl *DealerController) GetDealerBySlug(c fiber.Ctx) error {
	slug := c.Params("slug")

	var dealer models.Dealer
	if err := ctrl.DB.Where("slug = ? AND is_active = ?", slug, true).First(&dealer).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"message": "Dealer tidak ditemukan",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Terjadi kesalahan pada server",
		})
	}

	// Get branch count
	var branchCount int64
	ctrl.DB.Model(&models.DealerBranch{}).Where("dealer_id = ?", dealer.ID).Count(&branchCount)

	// Get staff count
	var staffCount int64
	ctrl.DB.Model(&models.DealerStaff{}).Where("dealer_id = ?", dealer.ID).Count(&staffCount)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"dealer":      dealer,
			"branch_count": branchCount,
			"staff_count":  staffCount,
		},
	})
}

// CreateDealer registers a new dealer (authenticated)
func (ctrl *DealerController) CreateDealer(c fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	var req struct {
		Name       string `json:"name"`
		Slug       string `json:"slug"`
		Description string `json:"description"`
		Phone      string `json:"phone"`
		Email      string `json:"email"`
		Website    string `json:"website"`
		Address    string `json:"address"`
		CityID     string `json:"city_id"`
		ProvinceID string `json:"province_id"`
		PostalCode string `json:"postal_code"`
		LogoURL    string `json:"logo_url"`
		CoverURL   string `json:"cover_url"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data tidak valid",
		})
	}

	if req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Nama dealer wajib diisi",
		})
	}

	// Auto-generate slug if not provided
	slug := req.Slug
	if slug == "" {
		slug = strings.ToLower(strings.ReplaceAll(req.Name, " ", "-"))
		slug = strings.ToLower(strings.NewReplacer(" ", "-", ".", "-", "/", "-", "&", "and").Replace(slug))
	}

	// Check slug uniqueness
	var existing models.Dealer
	if ctrl.DB.Where("slug = ?", slug).First(&existing).Error == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"success": false,
			"message": "Slug dealer sudah digunakan",
		})
	}

	dealer := models.Dealer{
		ID:           uuid.New(),
		OwnerID:      &userID,
		Name:         req.Name,
		Slug:         slug,
		Description:  req.Description,
		Phone:        req.Phone,
		Email:        req.Email,
		Website:      req.Website,
		Address:      req.Address,
		PostalCode:   req.PostalCode,
		LogoURL:      req.LogoURL,
		CoverURL:     req.CoverURL,
		SubscriptionTier: "free",
		IsActive:     true,
	}

	if req.CityID != "" {
		cid, err := uuid.Parse(req.CityID)
		if err == nil {
			dealer.CityID = &cid
		}
	}
	if req.ProvinceID != "" {
		pid, err := uuid.Parse(req.ProvinceID)
		if err == nil {
			dealer.ProvinceID = &pid
		}
	}

	if err := ctrl.DB.Create(&dealer).Error; err != nil {
		log.Printf("Create dealer error: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membuat dealer",
		})
	}

	// Add owner as staff
	staff := models.DealerStaff{
		ID:        uuid.New(),
		DealerID:  dealer.ID,
		UserID:    &userID,
		Role:      "owner",
		CanEdit:   true,
		CanDelete: true,
	}
	ctrl.DB.Create(&staff)

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Dealer berhasil didaftarkan",
		"data":    dealer,
	})
}

// UpdateDealer updates a dealer profile (authenticated, owner only)
func (ctrl *DealerController) UpdateDealer(c fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	dealerID := c.Params("id")

	var dealer models.Dealer
	if err := ctrl.DB.Where("id = ?", dealerID).First(&dealer).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Dealer tidak ditemukan",
		})
	}

	// Check ownership
	if dealer.OwnerID != nil && *dealer.OwnerID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Anda tidak memiliki akses untuk mengupdate dealer ini",
		})
	}

	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Phone       string `json:"phone"`
		Email       string `json:"email"`
		Website     string `json:"website"`
		Address     string `json:"address"`
		CityID      string `json:"city_id"`
		ProvinceID  string `json:"province_id"`
		PostalCode  string `json:"postal_code"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data tidak valid",
		})
	}

	updates := map[string]interface{}{}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.Phone != "" {
		updates["phone"] = req.Phone
	}
	if req.Email != "" {
		updates["email"] = req.Email
	}
	if req.Website != "" {
		updates["website"] = req.Website
	}
	if req.Address != "" {
		updates["address"] = req.Address
	}
	if req.PostalCode != "" {
		updates["postal_code"] = req.PostalCode
	}
	if req.CityID != "" {
		cid, err := uuid.Parse(req.CityID)
		if err == nil {
			updates["city_id"] = cid
		}
	}
	if req.ProvinceID != "" {
		pid, err := uuid.Parse(req.ProvinceID)
		if err == nil {
			updates["province_id"] = pid
		}
	}

	if len(updates) > 0 {
		if err := ctrl.DB.Model(&dealer).Updates(updates).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": "Gagal memperbarui dealer",
			})
		}
	}

	ctrl.DB.Where("id = ?", dealerID).First(&dealer)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Dealer berhasil diperbarui",
		"data":    dealer,
	})
}

// UploadLogo uploads dealer logo (authenticated)
func (ctrl *DealerController) UploadLogo(c fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	dealerID := c.Params("id")

	var dealer models.Dealer
	if err := ctrl.DB.Where("id = ?", dealerID).First(&dealer).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Dealer tidak ditemukan",
		})
	}

	if dealer.OwnerID != nil && *dealer.OwnerID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Anda tidak memiliki akses",
		})
	}

	var req struct {
		LogoURL string `json:"logo_url"`
	}
	if err := c.Bind().JSON(&req); err != nil || req.LogoURL == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "URL logo wajib diisi",
		})
	}

	ctrl.DB.Model(&dealer).Update("logo_url", req.LogoURL)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Logo berhasil diperbarui",
		"data":    fiber.Map{"logo_url": req.LogoURL},
	})
}

// UploadCover uploads dealer cover image (authenticated)
func (ctrl *DealerController) UploadCover(c fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	dealerID := c.Params("id")

	var dealer models.Dealer
	if err := ctrl.DB.Where("id = ?", dealerID).First(&dealer).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Dealer tidak ditemukan",
		})
	}

	if dealer.OwnerID != nil && *dealer.OwnerID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Anda tidak memiliki akses",
		})
	}

	var req struct {
		CoverURL string `json:"cover_url"`
	}
	if err := c.Bind().JSON(&req); err != nil || req.CoverURL == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "URL cover wajib diisi",
		})
	}

	ctrl.DB.Model(&dealer).Update("cover_url", req.CoverURL)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Cover berhasil diperbarui",
		"data":    fiber.Map{"cover_url": req.CoverURL},
	})
}

// ListBranches returns dealer branches (authenticated)
func (ctrl *DealerController) ListBranches(c fiber.Ctx) error {
	dealerID := c.Params("id")

	var branches []models.DealerBranch
	if err := ctrl.DB.Where("dealer_id = ?", dealerID).Order("is_main DESC, created_at DESC").Find(&branches).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data cabang",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    branches,
	})
}

// AddBranch adds a new branch to a dealer (authenticated)
func (ctrl *DealerController) AddBranch(c fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	dealerID := c.Params("id")

	// Check dealer ownership
	var dealer models.Dealer
	if err := ctrl.DB.Where("id = ?", dealerID).First(&dealer).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Dealer tidak ditemukan",
		})
	}
	if dealer.OwnerID != nil && *dealer.OwnerID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Anda tidak memiliki akses",
		})
	}

	var req struct {
		Name           string                 `json:"name"`
		Address        string                 `json:"address"`
		CityID         string                 `json:"city_id"`
		Phone          string                 `json:"phone"`
		OperatingHours map[string]interface{} `json:"operating_hours"`
		IsMain         bool                   `json:"is_main"`
	}
	if err := c.Bind().JSON(&req); err != nil || req.Name == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Nama cabang wajib diisi",
		})
	}

	branch := models.DealerBranch{
		ID:             uuid.New(),
		DealerID:       dealer.ID,
		Name:           req.Name,
		Address:        req.Address,
		Phone:          req.Phone,
		IsMain:         req.IsMain,
	}

	if req.CityID != "" {
		cid, err := uuid.Parse(req.CityID)
		if err == nil {
			branch.CityID = &cid
		}
	}
	if req.OperatingHours != nil {
		branch.OperatingHours = req.OperatingHours
	}

	if err := ctrl.DB.Create(&branch).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menambah cabang",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Cabang berhasil ditambahkan",
		"data":    branch,
	})
}

// UpdateBranch updates a dealer branch (authenticated)
func (ctrl *DealerController) UpdateBranch(c fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	dealerID := c.Params("id")
	branchID := c.Params("branchId")

	var dealer models.Dealer
	if err := ctrl.DB.Where("id = ?", dealerID).First(&dealer).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Dealer tidak ditemukan",
		})
	}
	if dealer.OwnerID != nil && *dealer.OwnerID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Anda tidak memiliki akses",
		})
	}

	var branch models.DealerBranch
	if err := ctrl.DB.Where("id = ? AND dealer_id = ?", branchID, dealerID).First(&branch).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Cabang tidak ditemukan",
		})
	}

	var req struct {
		Name           string                 `json:"name"`
		Address        string                 `json:"address"`
		CityID         string                 `json:"city_id"`
		Phone          string                 `json:"phone"`
		OperatingHours map[string]interface{} `json:"operating_hours"`
		IsMain         *bool                  `json:"is_main"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data tidak valid",
		})
	}

	updates := map[string]interface{}{}
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Address != "" {
		updates["address"] = req.Address
	}
	if req.Phone != "" {
		updates["phone"] = req.Phone
	}
	if req.CityID != "" {
		cid, err := uuid.Parse(req.CityID)
		if err == nil {
			updates["city_id"] = cid
		}
	}
	if req.OperatingHours != nil {
		updates["operating_hours"] = req.OperatingHours
	}
	if req.IsMain != nil {
		updates["is_main"] = *req.IsMain
	}

	if len(updates) > 0 {
		ctrl.DB.Model(&branch).Updates(updates)
	}

	ctrl.DB.Where("id = ?", branchID).First(&branch)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Cabang berhasil diperbarui",
		"data":    branch,
	})
}

// DeleteBranch deletes a dealer branch (authenticated)
func (ctrl *DealerController) DeleteBranch(c fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	dealerID := c.Params("id")
	branchID := c.Params("branchId")

	var dealer models.Dealer
	if err := ctrl.DB.Where("id = ?", dealerID).First(&dealer).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Dealer tidak ditemukan",
		})
	}
	if dealer.OwnerID != nil && *dealer.OwnerID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Anda tidak memiliki akses",
		})
	}

	result := ctrl.DB.Where("id = ? AND dealer_id = ?", branchID, dealerID).Delete(&models.DealerBranch{})
	if result.RowsAffected == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Cabang tidak ditemukan",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Cabang berhasil dihapus",
	})
}

// ListStaff returns dealer staff list (authenticated)
func (ctrl *DealerController) ListStaff(c fiber.Ctx) error {
	dealerID := c.Params("id")

	var staff []models.DealerStaff
	if err := ctrl.DB.Where("dealer_id = ?", dealerID).Order("created_at ASC").Find(&staff).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data staf",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    staff,
	})
}

// InviteStaff invites a staff member (authenticated)
func (ctrl *DealerController) InviteStaff(c fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	dealerID := c.Params("id")

	var dealer models.Dealer
	if err := ctrl.DB.Where("id = ?", dealerID).First(&dealer).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Dealer tidak ditemukan",
		})
	}
	if dealer.OwnerID != nil && *dealer.OwnerID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Anda tidak memiliki akses",
		})
	}

	var req struct {
		UserID   string `json:"user_id"`
		Role     string `json:"role"`
		CanEdit  bool   `json:"can_edit"`
		CanDelete bool  `json:"can_delete"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data tidak valid",
		})
	}

	role := req.Role
	if role == "" {
		role = "sales"
	}

	staff := models.DealerStaff{
		ID:        uuid.New(),
		DealerID:  dealer.ID,
		Role:      role,
		CanEdit:   req.CanEdit,
		CanDelete: req.CanDelete,
	}

	if req.UserID != "" {
		uid, err := uuid.Parse(req.UserID)
		if err == nil {
			staff.UserID = &uid
		}
	}

	if err := ctrl.DB.Create(&staff).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menambah staf",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"success": true,
		"message": "Staf berhasil diundang",
		"data":    staff,
	})
}

// RemoveStaff removes a staff member (authenticated)
func (ctrl *DealerController) RemoveStaff(c fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)
	dealerID := c.Params("id")
	staffID := c.Params("staffId")

	var dealer models.Dealer
	if err := ctrl.DB.Where("id = ?", dealerID).First(&dealer).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Dealer tidak ditemukan",
		})
	}
	if dealer.OwnerID != nil && *dealer.OwnerID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"success": false,
			"message": "Anda tidak memiliki akses",
		})
	}

	// Don't allow removing owner
	var staff models.DealerStaff
	if err := ctrl.DB.Where("id = ? AND dealer_id = ?", staffID, dealerID).First(&staff).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Staf tidak ditemukan",
		})
	}
	if staff.Role == "owner" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Pemilik dealer tidak dapat dihapus",
		})
	}

	ctrl.DB.Where("id = ?", staffID).Delete(&models.DealerStaff{})

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Staf berhasil dihapus",
	})
}

// GetDealerInventory returns dealer inventory (authenticated)
func (ctrl *DealerController) GetDealerInventory(c fiber.Ctx) error {
	dealerID := c.Params("id")
	status := c.Query("status")

	query := ctrl.DB.Where("dealer_id = ?", dealerID)
	if status != "" {
		query = query.Where("stock_status = ?", status)
	}

	var inventory []models.DealerInventory
	if err := query.Order("created_at DESC").Find(&inventory).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data inventaris",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    inventory,
	})
}

// GetDealerReviews returns paginated dealer reviews (public)
func (ctrl *DealerController) GetDealerReviews(c fiber.Ctx) error {
	dealerID := c.Params("id")

	page, _ := strconv.Atoi(c.Query("page", "1"))
	perPage, _ := strconv.Atoi(c.Query("per_page", "10"))
	if page < 1 {
		page = 1
	}
	if perPage < 1 || perPage > 50 {
		perPage = 10
	}

	query := ctrl.DB.Where("dealer_id = ?", dealerID)
	var total int64
	query.Model(&models.DealerReview{}).Count(&total)

	var reviews []models.DealerReview
	offset := (page - 1) * perPage
	if err := query.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&reviews).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data ulasan",
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

// GetMarketplaceSettings returns current marketplace settings (authenticated)
func (ctrl *DealerController) GetMarketplaceSettings(c fiber.Ctx) error {
	var settings models.DealerMarketplaceSetting
	if err := ctrl.DB.Where("is_active = ?", true).Order("created_at DESC").First(&settings).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create default settings
			settings = models.DealerMarketplaceSetting{
				ID:                            uuid.New(),
				TokenCostPublic:               1,
				TokenCostDealerMarketplace:    2,
				TokenCostBoth:                 3,
				DefaultOfferDurationHours:     72,
				InspectionCost:                250000,
				InspectionRequiredForDealerMP: false,
				PlatformFeePercentage:         0,
				PlatformFeeEnabled:            false,
				IsActive:                      true,
			}
			ctrl.DB.Create(&settings)
		} else {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": "Gagal mengambil pengaturan marketplace",
			})
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    settings,
	})
}

// Ensure dealer_branches table has jsonb column type — used by operating_hours
// This is handled via GORM auto-migrate + the jsonb type in model
var _ = time.Now // suppress unused import
