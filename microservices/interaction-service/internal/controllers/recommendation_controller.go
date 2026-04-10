package controllers

import (
	"automarket-interaction-service/internal/models"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// RecommendationController handles personalized recommendations
type RecommendationController struct {
	DB *gorm.DB
}

// GetRecommendations returns personalized recommendations for the current user
func (rc *RecommendationController) GetRecommendations(c fiber.Ctx) error {
	userID, ok := c.Locals("user_id").(uuid.UUID)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"success": false,
			"message": "User tidak terautentikasi",
		})
	}

	source := c.Query("source", "")
	limit := 20

	var recommendations []models.Recommendation

	query := rc.DB.Where("user_id = ?", userID)

	if source != "" {
		validSources := map[string]bool{
			"similar": true, "popular": true, "recently_viewed": true,
			"personalized": true, "trending": true,
		}
		if validSources[source] {
			query = query.Where("source = ?", source)
		}
	}

	if err := query.Order("score DESC").Limit(limit).Find(&recommendations).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"success": false,
			"message": "Terjadi kesalahan pada server",
		})
	}

	// If no recommendations exist, generate simplified ones from recent views
	if len(recommendations) == 0 {
		recommendations, err = rc.generateSimpleRecommendations(userID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"success": false,
				"message": "Terjadi kesalahan pada server",
			})
		}
	}

	return c.JSON(fiber.Map{
		"success": true,
		"data":    recommendations,
	})
}

// generateSimpleRecommendations creates basic recommendations from recent views
func (rc *RecommendationController) generateSimpleRecommendations(userID uuid.UUID) ([]models.Recommendation, error) {
	// Get recently viewed car listing IDs
	var recentViews []models.RecentView
	rc.DB.Where("user_id = ?", userID).
		Order("last_viewed_at DESC").
		Limit(10).
		Find(&recentViews)

	if len(recentViews) == 0 {
		return []models.Recommendation{}, nil
	}

	// For each viewed listing, create a "similar" recommendation placeholder
	// In production, this would use a recommendation engine
	var recommendations []models.Recommendation
	for _, rv := range recentViews {
		rec := models.Recommendation{
			UserID:       userID,
			CarListingID: rv.CarListingID,
			Score:        0.5,
			Reason:       "Berdasarkan riwayat penampilan Anda",
			Source:       "recently_viewed",
		}
		recommendations = append(recommendations, rec)
	}

	// Also try trending cars
	var trending []models.TrendingCar
	rc.DB.Where("period = ?", "weekly").
		Order("score DESC").
		Limit(10).
		Find(&trending)

	for _, t := range trending {
		rec := models.Recommendation{
			UserID:       userID,
			CarListingID: t.CarListingID,
			Score:        t.Score * 0.3,
			Reason:       "Sedang populer minggu ini",
			Source:       "trending",
		}
		recommendations = append(recommendations, rec)
	}

	return recommendations, nil
}
