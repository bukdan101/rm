package controllers

import (
	"fmt"
	"log"
	"time"

	"automarket-user-service/internal/models"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AuthController struct {
	DB          *gorm.DB
	JWTSecret   string
	JWTExpHrs   int
	GoogleCID   string
	GoogleCSec  string
	GoogleRedir string
}

// GoogleLogin returns the Google OAuth URL
func (ac *AuthController) GoogleLogin(c fiber.Ctx) error {
	if ac.GoogleCID == "" {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{
			"success": false,
			"message": "Google OAuth belum dikonfigurasi",
		})
	}

	redirectURL := fmt.Sprintf(
		"https://accounts.google.com/o/oauth2/v2/auth?client_id=%s&redirect_uri=%s&response_type=code&scope=openid%%20email%%20profile%%20https://www.googleapis.com/auth/userinfo.email%%20https://www.googleapis.com/auth/userinfo.profile&access_type=offline&prompt=consent",
		ac.GoogleCID, ac.GoogleRedir,
	)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"oauth_url": redirectURL,
		},
	})
}

// GoogleCallback exchanges Google OAuth code for JWT token
func (ac *AuthController) GoogleCallback(c fiber.Ctx) error {
	var req struct {
		Code string `json:"code"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Request tidak valid",
		})
	}
	if req.Code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Kode otorisasi diperlukan",
		})
	}

	// Exchange code for Google token
	googleToken, err := ac.exchangeGoogleCode(req.Code)
	if err != nil {
		log.Printf("Google token exchange error: %v", err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Gagal menukar kode Google. Silakan coba lagi.",
		})
	}

	// Get user info from Google
	googleUser, err := ac.getGoogleUserInfo(googleToken)
	if err != nil {
		log.Printf("Google user info error: %v", err)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mendapatkan informasi pengguna dari Google",
		})
	}

	// Find or create profile
	var profile models.Profile
	result := ac.DB.Where("name = ? OR phone = ?", googleUser.Email, googleUser.Email).First(&profile)

	now := time.Now()
	if result.Error == gorm.ErrRecordNotFound {
		// Create new user
		profile = models.Profile{
			ID:            uuid.New(),
			Name:          googleUser.Name,
			Phone:         googleUser.Email,
			AvatarURL:     googleUser.Picture,
			Role:          "user",
			EmailVerified: googleUser.VerifiedEmail,
			IsActive:      true,
			LastLogin:     &now,
		}
		if err := ac.DB.Create(&profile).Error; err != nil {
			log.Printf("Create profile error: %v", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": "Gagal membuat akun pengguna",
			})
		}

		// Create default settings
		settings := models.UserSettings{
			ID:                  uuid.New(),
			UserID:              profile.ID,
			EmailNotifications:  true,
			PushNotifications:   true,
			SmsNotifications:    false,
			Language:            "id",
			Currency:            "IDR",
		}
		ac.DB.Create(&settings)

		// Create token record
		userToken := models.UserToken{
			ID:             uuid.New(),
			UserID:         profile.ID,
			Balance:        0,
			TotalPurchased: 0,
			TotalUsed:      0,
			TotalBonus:     0,
		}
		ac.DB.Create(&userToken)
	} else if result.Error != nil {
		log.Printf("DB query error: %v", result.Error)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Terjadi kesalahan pada server",
		})
	} else {
		// Update last login
		ac.DB.Model(&profile).Updates(map[string]interface{}{
			"last_login":      now,
			"avatar_url":      googleUser.Picture,
			"email_verified":  true,
		})
	}

	// Generate JWT
	token, err := ac.generateJWT(profile.ID, profile.Phone, profile.Role)
	if err != nil {
		log.Printf("JWT generation error: %v", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membuat token autentikasi",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Login berhasil",
		"data": fiber.Map{
			"token": token,
			"user": fiber.Map{
				"id":            profile.ID,
				"name":          profile.Name,
				"phone":         profile.Phone,
				"avatar_url":    profile.AvatarURL,
				"role":          profile.Role,
				"email_verified": profile.EmailVerified,
			},
		},
	})
}

// GetProfile returns the current user's profile
func (ac *AuthController) GetProfile(c fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	var profile models.Profile
	if err := ac.DB.Where("id = ?", userID).First(&profile).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"success": false,
				"message": "Profil pengguna tidak ditemukan",
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

// UpdateProfile updates the current user's profile
func (ac *AuthController) UpdateProfile(c fiber.Ctx) error {
	userID := c.Locals("user_id").(uuid.UUID)

	var profile models.Profile
	if err := ac.DB.Where("id = ?", userID).First(&profile).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"success": false,
			"message": "Profil pengguna tidak ditemukan",
		})
	}

	var req struct {
		Name      string `json:"name"`
		Phone     string `json:"phone"`
		AvatarURL string `json:"avatar_url"`
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
	if req.Phone != "" {
		updates["phone"] = req.Phone
	}
	if req.AvatarURL != "" {
		updates["avatar_url"] = req.AvatarURL
	}

	if len(updates) > 0 {
		if err := ac.DB.Model(&profile).Updates(updates).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": "Gagal memperbarui profil",
			})
		}
	}

	// Re-fetch updated profile
	ac.DB.Where("id = ?", userID).First(&profile)

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Profil berhasil diperbarui",
		"data":    profile,
	})
}

// RefreshToken refreshes the JWT token
func (ac *AuthController) RefreshToken(c fiber.Ctx) error {
	var req struct {
		Token string `json:"token"`
	}
	if err := c.Bind().JSON(&req); err != nil || req.Token == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"success": false,
			"message": "Token diperlukan",
		})
	}

	// Validate existing token
	claims, err := ac.validateToken(req.Token)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Token tidak valid atau sudah expired",
		})
	}

	// Generate new token
	userIDStr, _ := (*claims)["user_id"].(string)
	email, _ := (*claims)["email"].(string)
	role, _ := (*claims)["role"].(string)

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Data token tidak valid",
		})
	}

	newToken, err := ac.generateJWT(userID, email, role)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Gagal memperbarui token",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"message": "Token berhasil diperbarui",
		"data": fiber.Map{
			"token": newToken,
		},
	})
}

// GoogleAuthResponse represents Google token exchange response
type GoogleAuthResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	ExpiresIn   int    `json:"expires_in"`
}

// GoogleUserInfo represents Google user profile
type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	Name          string `json:"name"`
	Picture       string `json:"picture"`
	VerifiedEmail bool   `json:"verified_email"`
}

func (ac *AuthController) exchangeGoogleCode(code string) (*GoogleAuthResponse, error) {
	// In production, this would make an HTTP request to Google's token endpoint
	// For now, this is a placeholder that simulates the exchange
	log.Printf("Exchanging Google code for token...")
	return &GoogleAuthResponse{
		AccessToken: "google_access_token_placeholder",
		TokenType:   "Bearer",
		ExpiresIn:   3600,
	}, nil
}

func (ac *AuthController) getGoogleUserInfo(tokenResp *GoogleAuthResponse) (*GoogleUserInfo, error) {
	// In production, this would make an HTTP request to Google's userinfo endpoint
	// For now, this is a placeholder
	log.Printf("Getting Google user info...")
	return &GoogleUserInfo{
		ID:            "google_user_id_placeholder",
		Email:         "user@example.com",
		Name:          "Google User",
		Picture:       "",
		VerifiedEmail: true,
	}, nil
}

func (ac *AuthController) generateJWT(userID uuid.UUID, email, role string) (string, error) {
	// Uses the shared JWT service approach inline
	claims := map[string]interface{}{
		"user_id": userID.String(),
		"email":   email,
		"role":    role,
		"exp":     time.Now().Add(time.Duration(ac.JWTExpHrs) * time.Hour).Unix(),
		"iat":     time.Now().Unix(),
		"iss":     "automarket-user-service",
	}

	// Use golang-jwt to create token
	token := NewJWTBuilder(ac.JWTSecret, claims)
	return token.SignedString()
}

func (ac *AuthController) validateToken(tokenString string) (*map[string]interface{}, error) {
	parser := NewJWTParser(ac.JWTSecret)
	return parser.Parse(tokenString)
}
