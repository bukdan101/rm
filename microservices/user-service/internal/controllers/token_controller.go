package controllers

import (
	"automarket-user-service/internal/models"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TokenController struct {
	DB *gorm.DB
}

// GetBalance returns the current user's token balance
func (tc *TokenController) GetBalance(c fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Token tidak valid",
		})
	}

	var userToken models.UserToken
	if err := tc.DB.Where("user_id = ?", userID).First(&userToken).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// Auto-create token record for user
			userToken = models.UserToken{
				ID:             uuid.New(),
				UserID:         userID,
				Balance:        0,
				TotalPurchased: 0,
				TotalUsed:      0,
				TotalBonus:     0,
			}
			if err := tc.DB.Create(&userToken).Error; err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"success": false,
					"message": "Gagal membuat data token",
				})
			}
		} else {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": "Terjadi kesalahan pada server",
			})
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"user_id":         userToken.UserID,
			"balance":         userToken.Balance,
			"total_purchased": userToken.TotalPurchased,
			"total_used":      userToken.TotalUsed,
			"total_bonus":     userToken.TotalBonus,
		},
	})
}

// GetTransactions returns token transaction history for the current user
// Note: Token transactions are managed by the transaction-service.
// This endpoint returns a summary from the user_tokens table.
func (tc *TokenController) GetTransactions(c fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "Token tidak valid",
		})
	}

	var userToken models.UserToken
	if err := tc.DB.Where("user_id = ?", userID).First(&userToken).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.JSON(fiber.Map{
				"success": true,
				"data":    []interface{}{},
				"message": "Belum ada riwayat transaksi",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Terjadi kesalahan pada server",
		})
	}

	// Return token summary as a pseudo-transaction list
	// Full transaction history would be fetched from transaction-service
	transactions := []fiber.Map{}

	if userToken.TotalPurchased > 0 {
		transactions = append(transactions, fiber.Map{
			"type":   "purchase",
			"amount": userToken.TotalPurchased,
			"detail": "Total pembelian token",
		})
	}

	if userToken.TotalUsed > 0 {
		transactions = append(transactions, fiber.Map{
			"type":   "usage",
			"amount": userToken.TotalUsed,
			"detail": "Total penggunaan token",
		})
	}

	if userToken.TotalBonus > 0 {
		transactions = append(transactions, fiber.Map{
			"type":   "bonus",
			"amount": userToken.TotalBonus,
			"detail": "Total bonus token",
		})
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"balance":         userToken.Balance,
			"total_purchased": userToken.TotalPurchased,
			"total_used":      userToken.TotalUsed,
			"total_bonus":     userToken.TotalBonus,
			"summary":         transactions,
		},
	})
}
