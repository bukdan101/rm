package controllers

import (
        "automarket/internal/config"
        "automarket/internal/models"
        "automarket/internal/services"
        "automarket/internal/utils"

        "github.com/gofiber/fiber/v3"
        "github.com/google/uuid"
        "gorm.io/gorm"
)

// GoogleLogin returns the Google OAuth URL
func GoogleLogin(c fiber.Ctx) error {
        cfg := c.Locals("config").(*config.Config)
        if cfg.GoogleClientID == "" {
                return utils.ErrorMsg(c, fiber.StatusServiceUnavailable, "Google OAuth belum dikonfigurasi")
        }

        oauthService := services.NewGoogleOAuthService(
                cfg.GoogleClientID,
                cfg.GoogleClientSecret,
                cfg.GoogleRedirectURL,
        )

        state := uuid.New().String()
        authURL := oauthService.GetAuthURL(state)

        return c.JSON(fiber.Map{
                "success": true,
                "data": fiber.Map{
                        "auth_url": authURL,
                        "state":    state,
                },
        })
}

// GoogleCallback handles the OAuth callback
func GoogleCallback(c fiber.Ctx) error {
        cfg := c.Locals("config").(*config.Config)
        db := c.Locals("db").(*gorm.DB)

        var req struct {
                Code  string `json:"code"`
                State string `json:"state"`
        }
        if err := c.Bind().Body(&req); err != nil {
                return utils.ErrorMsg(c, fiber.StatusBadRequest, "Request body tidak valid")
        }

        if req.Code == "" {
                return utils.ErrorMsg(c, fiber.StatusBadRequest, "Authorization code diperlukan")
        }

        oauthService := services.NewGoogleOAuthService(
                cfg.GoogleClientID,
                cfg.GoogleClientSecret,
                cfg.GoogleRedirectURL,
        )

        googleUser, err := oauthService.ExchangeCode(req.Code)
        if err != nil {
                return utils.ErrorMsg(c, fiber.StatusUnauthorized, "Gagal mendapatkan data Google: "+err.Error())
        }

        // Find or create user
        var user models.User
        result := db.Where("email = ?", googleUser.Email).First(&user)

        if result.Error != nil {
                // Create new user
                user = models.User{
                        ID:    uuid.New(),
                        Name:  &googleUser.Name,
                        Email: &googleUser.Email,
                        Role:  "user",
                }
                if err := db.Create(&user).Error; err != nil {
                        return utils.ErrorMsg(c, fiber.StatusInternalServerError, "Gagal membuat user: "+err.Error())
                }

                // Create profile
                profile := models.Profile{
                        ID:        user.ID,
                        Name:      &googleUser.Name,
                        AvatarURL: &googleUser.Picture,
                        Role:      "user",
                        IsActive:  true,
                }
                db.Create(&profile)

                // Create user tokens with 500 bonus
                userToken := models.UserToken{
                        ID:          uuid.New(),
                        UserID:      &user.ID,
                        Balance:     500,
                        TotalBonus:  500,
                }
                db.Create(&userToken)
        }

        // Update last login
        db.Model(&models.User{}).Where("id = ?", user.ID).Update("name", googleUser.Name)
        db.Model(&models.Profile{}).Where("id = ?", user.ID).Updates(map[string]interface{}{
                "last_login": gorm.Expr("NOW()"),
        })

        // Generate JWT
        jwtService := services.NewJWTService(cfg.JWTSecret)
        token, err := jwtService.GenerateToken(user.ID, *user.Email, user.Role)
        if err != nil {
                return utils.ErrorMsg(c, fiber.StatusInternalServerError, "Gagal generate token")
        }

        return c.JSON(fiber.Map{
                "success": true,
                "message": "Login berhasil",
                "data": fiber.Map{
                        "token": token,
                        "user": fiber.Map{
                                "id":    user.ID,
                                "name":  user.Name,
                                "email": user.Email,
                                "role":  user.Role,
                        },
                },
        })
}

// GetProfile returns the authenticated user's profile
func GetProfile(c fiber.Ctx) error {
        db := c.Locals("db").(*gorm.DB)
        userID, ok := c.Locals("user_id").(uuid.UUID)
        if !ok {
                return utils.ErrorMsg(c, fiber.StatusUnauthorized, "User ID tidak ditemukan")
        }

        var profile models.Profile
        if err := db.Where("id = ?", userID).First(&profile).Error; err != nil {
                return utils.ErrorMsg(c, fiber.StatusNotFound, "Profile tidak ditemukan")
        }

        return utils.SuccessResponse(c, profile)
}

// UpdateProfile updates the authenticated user's profile
func UpdateProfile(c fiber.Ctx) error {
        db := c.Locals("db").(*gorm.DB)
        userID, ok := c.Locals("user_id").(uuid.UUID)
        if !ok {
                return utils.ErrorMsg(c, fiber.StatusUnauthorized, "User ID tidak ditemukan")
        }

        var req struct {
                Name  *string `json:"name"`
                Phone *string `json:"phone"`
        }
        if err := c.Bind().Body(&req); err != nil {
                return utils.ErrorMsg(c, fiber.StatusBadRequest, "Request body tidak valid")
        }

        updates := map[string]interface{}{}
        if req.Name != nil {
                updates["name"] = *req.Name
        }
        if req.Phone != nil {
                updates["phone"] = *req.Phone
        }

        if len(updates) > 0 {
                if err := db.Model(&models.Profile{}).Where("id = ?", userID).Updates(updates).Error; err != nil {
                        return utils.ErrorMsg(c, fiber.StatusInternalServerError, "Gagal update profile")
                }
                // Also update users table
                if req.Name != nil {
                        db.Model(&models.User{}).Where("id = ?", userID).Update("name", *req.Name)
                }
        }

        return utils.SuccessMessage(c, "Profile berhasil diupdate")
}

// RefreshToken refreshes the JWT token
func RefreshToken(c fiber.Ctx) error {
        cfg := c.Locals("config").(*config.Config)
        var req struct {
                Token string `json:"token"`
        }
        if err := c.Bind().Body(&req); err != nil || req.Token == "" {
                return utils.ErrorMsg(c, fiber.StatusBadRequest, "Token diperlukan")
        }

        jwtService := services.NewJWTService(cfg.JWTSecret)
        newToken, err := jwtService.RefreshToken(req.Token)
        if err != nil {
                return utils.ErrorMsg(c, fiber.StatusUnauthorized, "Token tidak valid: "+err.Error())
        }

        return c.JSON(fiber.Map{
                "success": true,
                "data": fiber.Map{
                        "token": newToken,
                },
        })
}
