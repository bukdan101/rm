package controllers

import (
	"time"

	"automarket-user-service/internal/models"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type KycController struct {
	DB *gorm.DB
}

// SubmitKYC submits a KYC verification for a user
func (kc *KycController) SubmitKYC(c fiber.Ctx) error {
	id := c.Params("id")
	userID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format ID tidak valid",
		})
	}

	var req struct {
		FullName       string     `json:"full_name"`
		Nik            string     `json:"nik"`
		BirthPlace     string     `json:"birth_place"`
		BirthDate      string     `json:"birth_date"`
		Gender         string     `json:"gender"`
		Address        string     `json:"address"`
		ProvinceID     *uuid.UUID `json:"province_id"`
		CityID         *uuid.UUID `json:"city_id"`
		DistrictID     *uuid.UUID `json:"district_id"`
		VillageID      *uuid.UUID `json:"village_id"`
		KtpPhotoURL    string     `json:"ktp_photo_url"`
		SelfiePhotoURL string     `json:"selfie_photo_url"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data tidak valid",
		})
	}

	// Validate required fields
	if req.FullName == "" || req.Nik == "" || req.BirthPlace == "" || req.BirthDate == "" || req.Gender == "" || req.Address == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Semua field wajib harus diisi (nama lengkap, NIK, tempat lahir, tanggal lahir, jenis kelamin, alamat)",
		})
	}

	// Validate NIK length
	if len(req.Nik) != 16 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "NIK harus terdiri dari 16 digit",
		})
	}

	// Parse birth date
	birthDate, err := time.Parse("2006-01-02", req.BirthDate)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format tanggal lahir tidak valid. Gunakan format YYYY-MM-DD",
		})
	}

	// Validate gender
	validGenders := map[string]bool{"Laki-laki": true, "Perempuan": true, "laki-laki": true, "perempuan": true}
	if !validGenders[req.Gender] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Jenis kelamin tidak valid. Pilihan: Laki-laki, Perempuan",
		})
	}

	// Check if KYC already exists
	var existing models.KycVerification
	result := kc.DB.Where("user_id = ?", userID).First(&existing)

	if result.Error == gorm.ErrRecordNotFound {
		// Create new KYC
		kyc := models.KycVerification{
			ID:             uuid.New(),
			UserID:         userID,
			FullName:       req.FullName,
			Nik:            req.Nik,
			BirthPlace:     req.BirthPlace,
			BirthDate:      birthDate,
			Gender:         req.Gender,
			Address:        req.Address,
			ProvinceID:     req.ProvinceID,
			CityID:         req.CityID,
			DistrictID:     req.DistrictID,
			VillageID:      req.VillageID,
			KtpPhotoURL:    req.KtpPhotoURL,
			SelfiePhotoURL: req.SelfiePhotoURL,
			Status:         "pending",
		}

		if err := kc.DB.Create(&kyc).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": "Gagal mengajukan verifikasi KYC",
			})
		}

		return c.Status(fiber.StatusCreated).JSON(fiber.Map{
			"success": true,
			"message": "Verifikasi KYC berhasil diajukan",
			"data":    kyc,
		})
	} else if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Terjadi kesalahan pada server",
		})
	}

	// Check status - can only resubmit if rejected or not_submitted
	if existing.Status == "pending" {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"success": false,
			"message": "Verifikasi KYC Anda sedang dalam proses review",
		})
	}
	if existing.Status == "approved" {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"success": false,
			"message": "Akun Anda sudah terverifikasi",
		})
	}

	// Update existing KYC (rejected or not_submitted)
	updates := map[string]interface{}{
		"full_name":        req.FullName,
		"nik":              req.Nik,
		"birth_place":      req.BirthPlace,
		"birth_date":       birthDate,
		"gender":           req.Gender,
		"address":          req.Address,
		"province_id":      req.ProvinceID,
		"city_id":          req.CityID,
		"district_id":      req.DistrictID,
		"village_id":       req.VillageID,
		"ktp_photo_url":    req.KtpPhotoURL,
		"selfie_photo_url": req.SelfiePhotoURL,
		"status":           "pending",
		"rejection_reason": "",
		"verified_by":      nil,
		"verified_at":      nil,
	}

	if err := kc.DB.Model(&existing).Updates(updates).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal memperbarui verifikasi KYC",
		})
	}

	kc.DB.Where("user_id = ?", userID).First(&existing)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Verifikasi KYC berhasil diperbarui dan diajukan ulang",
		"data":    existing,
	})
}

// GetKYC returns KYC status for a user
func (kc *KycController) GetKYC(c fiber.Ctx) error {
	id := c.Params("id")
	userID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format ID tidak valid",
		})
	}

	var kyc models.KycVerification
	if err := kc.DB.Where("user_id = ?", userID).First(&kyc).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"message": "Data KYC tidak ditemukan",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Terjadi kesalahan pada server",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    kyc,
	})
}

// UpdateKYCStatus updates KYC status (admin only)
func (kc *KycController) UpdateKYCStatus(c fiber.Ctx) error {
	id := c.Params("id")
	status := c.Params("status")

	validStatuses := map[string]bool{"approved": true, "rejected": true}
	if !validStatuses[status] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Status tidak valid. Pilihan: approved, rejected",
		})
	}

	userID, err := uuid.Parse(id)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format ID tidak valid",
		})
	}

	var req struct {
		RejectionReason string `json:"rejection_reason"`
	}
	_ = c.Bind().JSON(&req)

	var kyc models.KycVerification
	if err := kc.DB.Where("user_id = ?", userID).First(&kyc).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"message": "Data KYC tidak ditemukan",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Terjadi kesalahan pada server",
		})
	}

	if kyc.Status != "pending" {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"success": false,
			"message": "KYC hanya bisa di-review ketika status pending",
		})
	}

	adminID, _ := c.Locals("user_id").(uuid.UUID)
	now := time.Now()

	updates := map[string]interface{}{
		"status":      status,
		"verified_by": adminID,
		"verified_at": now,
	}

	if status == "rejected" && req.RejectionReason != "" {
		updates["rejection_reason"] = req.RejectionReason
	}

	if err := kc.DB.Model(&kyc).Updates(updates).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal memperbarui status KYC",
		})
	}

	// Update profile email_verified if approved
	if status == "approved" {
		kc.DB.Model(&models.Profile{}).Where("id = ?", userID).Update("email_verified", true)
	}

	kc.DB.Where("user_id = ?", userID).First(&kyc)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Status KYC berhasil diperbarui",
		"data":    kyc,
	})
}

// ReviewKYC reviews a specific KYC by its own ID (admin only)
func (kc *KycController) ReviewKYC(c fiber.Ctx) error {
	kycID := c.Params("id")

	var req struct {
		Status          string `json:"status"`
		RejectionReason string `json:"rejection_reason"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Data tidak valid",
		})
	}

	validStatuses := map[string]bool{"approved": true, "rejected": true}
	if !validStatuses[req.Status] {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Status tidak valid. Pilihan: approved, rejected",
		})
	}

	kycUUID, err := uuid.Parse(kycID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Format ID tidak valid",
		})
	}

	var kyc models.KycVerification
	if err := kc.DB.Where("id = ?", kycUUID).First(&kyc).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"message": "Data KYC tidak ditemukan",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Terjadi kesalahan pada server",
		})
	}

	if kyc.Status != "pending" {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"success": false,
			"message": "KYC hanya bisa di-review ketika status pending",
		})
	}

	adminID, _ := c.Locals("user_id").(uuid.UUID)
	now := time.Now()

	updates := map[string]interface{}{
		"status":      req.Status,
		"verified_by": adminID,
		"verified_at": now,
	}

	if req.Status == "rejected" && req.RejectionReason != "" {
		updates["rejection_reason"] = req.RejectionReason
	}

	if err := kc.DB.Model(&kyc).Updates(updates).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal memperbarui status KYC",
		})
	}

	// Update profile if approved
	if req.Status == "approved" {
		kc.DB.Model(&models.Profile{}).Where("id = ?", kyc.UserID).Update("email_verified", true)
	}

	kc.DB.Where("id = ?", kycUUID).First(&kyc)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Review KYC berhasil",
		"data":    kyc,
	})
}

// ListPendingKYC lists all pending KYC verifications (admin only)
func (kc *KycController) ListPendingKYC(c fiber.Ctx) error {
	var kyces []models.KycVerification
	if err := kc.DB.Where("status = ?", "pending").Order("created_at ASC").Find(&kyces).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Terjadi kesalahan pada server",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    kyces,
	})
}
