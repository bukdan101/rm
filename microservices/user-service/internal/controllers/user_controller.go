package controllers

import (
        "strconv"

        "automarket-user-service/internal/models"

        "github.com/gofiber/fiber/v3"
        "github.com/google/uuid"
        "gorm.io/gorm"
)

type UserController struct {
        DB *gorm.DB
}

// GetUser returns a user by ID
func (uc *UserController) GetUser(c fiber.Ctx) error {
        id := c.Params("id")
        if id == "" {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                        "success": false,
                        "message": "ID pengguna diperlukan",
                })
        }

        userID, err := uuid.Parse(id)
        if err != nil {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                        "success": false,
                        "message": "Format ID tidak valid",
                })
        }

        var profile models.Profile
        if err := uc.DB.Where("id = ?", userID).First(&profile).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
                                "success": false,
                                "message": "Pengguna tidak ditemukan",
                        })
                }
                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                        "success": false,
                        "message": "Terjadi kesalahan pada server",
                })
        }

        return c.JSON(fiber.Map{
                "success": true,
                "data":    profile,
        })
}

// GetSettings returns user settings
func (uc *UserController) GetSettings(c fiber.Ctx) error {
        id := c.Params("id")
        userID, err := uuid.Parse(id)
        if err != nil {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                        "success": false,
                        "message": "Format ID tidak valid",
                })
        }

        var settings models.UserSettings
        if err := uc.DB.Where("user_id = ?", userID).First(&settings).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
                                "success": false,
                                "message": "Pengaturan pengguna tidak ditemukan",
                        })
                }
                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                        "success": false,
                        "message": "Terjadi kesalahan pada server",
                })
        }

        return c.JSON(fiber.Map{
                "success": true,
                "data":    settings,
        })
}

// UpdateSettings updates user settings
func (uc *UserController) UpdateSettings(c fiber.Ctx) error {
        id := c.Params("id")
        userID, err := uuid.Parse(id)
        if err != nil {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                        "success": false,
                        "message": "Format ID tidak valid",
                })
        }

        var settings models.UserSettings
        if err := uc.DB.Where("user_id = ?", userID).First(&settings).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        // Create default settings
                        settings = models.UserSettings{
                                ID:                  uuid.New(),
                                UserID:              userID,
                                EmailNotifications:  true,
                                PushNotifications:   true,
                                SmsNotifications:    false,
                                Language:            "id",
                                Currency:            "IDR",
                        }
                        if err := uc.DB.Create(&settings).Error; err != nil {
                                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                                        "success": false,
                                        "message": "Gagal membuat pengaturan",
                                })
                        }
                } else {
                        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                                "success": false,
                                "message": "Terjadi kesalahan pada server",
                        })
                }
        }

        var req struct {
                EmailNotifications *bool   `json:"email_notifications"`
                PushNotifications  *bool   `json:"push_notifications"`
                SmsNotifications   *bool   `json:"sms_notifications"`
                Language           *string `json:"language"`
                Currency           *string `json:"currency"`
        }
        if err := c.Bind().JSON(&req); err != nil {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                        "success": false,
                        "message": "Data tidak valid",
                })
        }

        updates := map[string]interface{}{}
        if req.EmailNotifications != nil {
                updates["email_notifications"] = *req.EmailNotifications
        }
        if req.PushNotifications != nil {
                updates["push_notifications"] = *req.PushNotifications
        }
        if req.SmsNotifications != nil {
                updates["sms_notifications"] = *req.SmsNotifications
        }
        if req.Language != nil {
                updates["language"] = *req.Language
        }
        if req.Currency != nil {
                updates["currency"] = *req.Currency
        }

        if len(updates) > 0 {
                if err := uc.DB.Model(&settings).Updates(updates).Error; err != nil {
                        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                                "success": false,
                                "message": "Gagal memperbarui pengaturan",
                        })
                }
        }

        uc.DB.Where("user_id = ?", userID).First(&settings)

        return c.JSON(fiber.Map{
                "success": true,
                "message": "Pengaturan berhasil diperbarui",
                "data":    settings,
        })
}

// GetAddresses returns all addresses for a user
func (uc *UserController) GetAddresses(c fiber.Ctx) error {
        id := c.Params("id")
        userID, err := uuid.Parse(id)
        if err != nil {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                        "success": false,
                        "message": "Format ID tidak valid",
                })
        }

        var addresses []models.UserAddress
        if err := uc.DB.Where("user_id = ?", userID).Order("is_primary DESC, created_at DESC").Find(&addresses).Error; err != nil {
                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                        "success": false,
                        "message": "Terjadi kesalahan pada server",
                })
        }

        return c.JSON(fiber.Map{
                "success": true,
                "data":    addresses,
        })
}

// AddAddress adds a new address for a user
func (uc *UserController) AddAddress(c fiber.Ctx) error {
        id := c.Params("id")
        userID, err := uuid.Parse(id)
        if err != nil {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                        "success": false,
                        "message": "Format ID tidak valid",
                })
        }

        var req struct {
                Label      string     `json:"label"`
                Address    string     `json:"address"`
                CityID     *uuid.UUID `json:"city_id"`
                ProvinceID *uuid.UUID `json:"province_id"`
                PostalCode string     `json:"postal_code"`
                IsPrimary  bool       `json:"is_primary"`
        }
        if err := c.Bind().JSON(&req); err != nil {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                        "success": false,
                        "message": "Data tidak valid",
                })
        }

        if req.Address == "" {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                        "success": false,
                        "message": "Alamat wajib diisi",
                })
        }

        label := req.Label
        if label == "" {
                label = "Rumah"
        }

        // If this is set as primary, unset other primary addresses
        if req.IsPrimary {
                uc.DB.Model(&models.UserAddress{}).
                        Where("user_id = ? AND is_primary = ?", userID, true).
                        Update("is_primary", false)
        }

        address := models.UserAddress{
                ID:         uuid.New(),
                UserID:     userID,
                Label:      label,
                Address:    req.Address,
                CityID:     req.CityID,
                ProvinceID: req.ProvinceID,
                PostalCode: req.PostalCode,
                IsPrimary:  req.IsPrimary,
        }

        if err := uc.DB.Create(&address).Error; err != nil {
                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                        "success": false,
                        "message": "Gagal menambahkan alamat",
                })
        }

        return c.Status(fiber.StatusCreated).JSON(fiber.Map{
                "success": true,
                "message": "Alamat berhasil ditambahkan",
                "data":    address,
        })
}

// UpdateAddress updates an address
func (uc *UserController) UpdateAddress(c fiber.Ctx) error {
        id := c.Params("id")
        addressID := c.Params("addressId")
        userID, err := uuid.Parse(id)
        if err != nil {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                        "success": false,
                        "message": "Format ID pengguna tidak valid",
                })
        }
        addrUUID, err := uuid.Parse(addressID)
        if err != nil {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                        "success": false,
                        "message": "Format ID alamat tidak valid",
                })
        }

        var address models.UserAddress
        if err := uc.DB.Where("id = ? AND user_id = ?", addrUUID, userID).First(&address).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
                                "success": false,
                                "message": "Alamat tidak ditemukan",
                        })
                }
                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                        "success": false,
                        "message": "Terjadi kesalahan pada server",
                })
        }

        var req struct {
                Label      string     `json:"label"`
                Address    string     `json:"address"`
                CityID     *uuid.UUID `json:"city_id"`
                ProvinceID *uuid.UUID `json:"province_id"`
                PostalCode string     `json:"postal_code"`
                IsPrimary  *bool      `json:"is_primary"`
        }
        if err := c.Bind().JSON(&req); err != nil {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                        "success": false,
                        "message": "Data tidak valid",
                })
        }

        updates := map[string]interface{}{}
        if req.Label != "" {
                updates["label"] = req.Label
        }
        if req.Address != "" {
                updates["address"] = req.Address
        }
        if req.CityID != nil {
                updates["city_id"] = *req.CityID
        }
        if req.ProvinceID != nil {
                updates["province_id"] = *req.ProvinceID
        }
        if req.PostalCode != "" {
                updates["postal_code"] = req.PostalCode
        }
        if req.IsPrimary != nil && *req.IsPrimary {
                uc.DB.Model(&models.UserAddress{}).
                        Where("user_id = ? AND is_primary = ?", userID, true).
                        Update("is_primary", false)
                updates["is_primary"] = true
        }

        if len(updates) > 0 {
                if err := uc.DB.Model(&address).Updates(updates).Error; err != nil {
                        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                                "success": false,
                                "message": "Gagal memperbarui alamat",
                        })
                }
        }

        uc.DB.Where("id = ? AND user_id = ?", addrUUID, userID).First(&address)

        return c.JSON(fiber.Map{
                "success": true,
                "message": "Alamat berhasil diperbarui",
                "data":    address,
        })
}

// DeleteAddress deletes an address
func (uc *UserController) DeleteAddress(c fiber.Ctx) error {
        id := c.Params("id")
        addressID := c.Params("addressId")
        userID, err := uuid.Parse(id)
        if err != nil {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                        "success": false,
                        "message": "Format ID pengguna tidak valid",
                })
        }
        addrUUID, err := uuid.Parse(addressID)
        if err != nil {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                        "success": false,
                        "message": "Format ID alamat tidak valid",
                })
        }

        result := uc.DB.Where("id = ? AND user_id = ?", addrUUID, userID).Delete(&models.UserAddress{})
        if result.Error != nil {
                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                        "success": false,
                        "message": "Gagal menghapus alamat",
                })
        }
        if result.RowsAffected == 0 {
                return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
                        "success": false,
                        "message": "Alamat tidak ditemukan",
                })
        }

        return c.JSON(fiber.Map{
                "success": true,
                "message": "Alamat berhasil dihapus",
        })
}

// GetDocuments returns user documents
func (uc *UserController) GetDocuments(c fiber.Ctx) error {
        id := c.Params("id")
        userID, err := uuid.Parse(id)
        if err != nil {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                        "success": false,
                        "message": "Format ID tidak valid",
                })
        }

        var documents []models.UserDocument
        if err := uc.DB.Where("user_id = ?", userID).Order("created_at DESC").Find(&documents).Error; err != nil {
                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                        "success": false,
                        "message": "Terjadi kesalahan pada server",
                })
        }

        return c.JSON(fiber.Map{
                "success": true,
                "data":    documents,
        })
}

// UploadDocument uploads a user document
func (uc *UserController) UploadDocument(c fiber.Ctx) error {
        id := c.Params("id")
        userID, err := uuid.Parse(id)
        if err != nil {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                        "success": false,
                        "message": "Format ID tidak valid",
                })
        }

        var req struct {
                DocumentType   string `json:"document_type"`
                DocumentNumber string `json:"document_number"`
                DocumentURL    string `json:"document_url"`
        }
        if err := c.Bind().JSON(&req); err != nil {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                        "success": false,
                        "message": "Data tidak valid",
                })
        }

        if req.DocumentType == "" || req.DocumentNumber == "" || req.DocumentURL == "" {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                        "success": false,
                        "message": "Jenis dokumen, nomor dokumen, dan URL dokumen wajib diisi",
                })
        }

        validTypes := map[string]bool{"ktp": true, "sim": true, "npwp": true, "kk": true}
        if !validTypes[req.DocumentType] {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                        "success": false,
                        "message": "Jenis dokumen tidak valid. Pilihan: ktp, sim, npwp, kk",
                })
        }

        doc := models.UserDocument{
                ID:             uuid.New(),
                UserID:         userID,
                DocumentType:   req.DocumentType,
                DocumentNumber: req.DocumentNumber,
                DocumentURL:    req.DocumentURL,
                Verified:       false,
        }

        if err := uc.DB.Create(&doc).Error; err != nil {
                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                        "success": false,
                        "message": "Gagal mengunggah dokumen",
                })
        }

        return c.Status(fiber.StatusCreated).JSON(fiber.Map{
                "success": true,
                "message": "Dokumen berhasil diunggah",
                "data":    doc,
        })
}

// ListUsers lists all users with pagination (admin only)
func (uc *UserController) ListUsers(c fiber.Ctx) error {
        page, _ := strconv.Atoi(c.Query("page", "1"))
        perPage, _ := strconv.Atoi(c.Query("per_page", "20"))
        if page < 1 {
                page = 1
        }
        if perPage < 1 || perPage > 100 {
                perPage = 20
        }

        var profiles []models.Profile
        var total int64

        uc.DB.Model(&models.Profile{}).Count(&total)
        offset := (page - 1) * perPage
        if err := uc.DB.Order("created_at DESC").Offset(offset).Limit(perPage).Find(&profiles).Error; err != nil {
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
                "data":    profiles,
                "meta": fiber.Map{
                        "page":       page,
                        "per_page":   perPage,
                        "total":      total,
                        "total_page": totalPage,
                },
        })
}

// UpdateUserRole updates a user's role (admin only)
func (uc *UserController) UpdateUserRole(c fiber.Ctx) error {
        id := c.Params("id")
        userID, err := uuid.Parse(id)
        if err != nil {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                        "success": false,
                        "message": "Format ID tidak valid",
                })
        }

        var req struct {
                Role string `json:"role"`
        }
        if err := c.Bind().JSON(&req); err != nil {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                        "success": false,
                        "message": "Data tidak valid",
                })
        }

        validRoles := map[string]bool{"user": true, "dealer": true, "admin": true, "inspector": true}
        if !validRoles[req.Role] {
                return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                        "success": false,
                        "message": "Role tidak valid. Pilihan: user, dealer, admin, inspector",
                })
        }

        var profile models.Profile
        if err := uc.DB.Where("id = ?", userID).First(&profile).Error; err != nil {
                if err == gorm.ErrRecordNotFound {
                        return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
                                "success": false,
                                "message": "Pengguna tidak ditemukan",
                        })
                }
                return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
                        "success": false,
                        "message": "Terjadi kesalahan pada server",
                })
        }

        uc.DB.Model(&profile).Update("role", req.Role)
        profile.Role = req.Role

        return c.JSON(fiber.Map{
                "success": true,
                "message": "Role pengguna berhasil diperbarui",
                "data":    profile,
        })
}


