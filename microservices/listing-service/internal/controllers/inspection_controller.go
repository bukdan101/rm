package controllers

import (
	"fmt"
	"strconv"
	"time"

	"automarket-listing-service/internal/models"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type InspectionController struct {
	DB *gorm.DB
}

// GetInspection returns inspection for a specific listing
func (ctrl *InspectionController) GetInspection(c fiber.Ctx) error {
	listingID := c.Params("id")
	var inspection models.CarInspection

	if err := ctrl.DB.Where("car_listing_id = ?", listingID).
		Order("created_at DESC").
		First(&inspection).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(404).JSON(fiber.Map{
				"success": false,
				"message": "Inspeksi tidak ditemukan",
			})
		}
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal mengambil data inspeksi",
			"error":   err.Error(),
		})
	}

	// Fetch results
	var results []models.InspectionResult
	ctrl.DB.Where("inspection_id = ?", inspection.ID).Find(&results)

	// Fetch photos
	var photos []models.InspectionPhoto
	ctrl.DB.Where("inspection_id = ?", inspection.ID).Order("display_order ASC").Find(&photos)

	// Fetch certificates
	var certificates []models.InspectionCertificate
	ctrl.DB.Where("inspection_id = ?", inspection.ID).Find(&certificates)

	return c.JSON(fiber.Map{
		"success": true,
		"data": fiber.Map{
			"inspection":  inspection,
			"results":     results,
			"photos":      photos,
			"certificates": certificates,
		},
	})
}

// CreateInspection submits a new inspection for a listing
func (ctrl *InspectionController) CreateInspection(c fiber.Ctx) error {
	listingID := c.Params("id")

	// Verify listing exists
	var listing models.CarListing
	if err := ctrl.DB.Where("id = ?", listingID).First(&listing).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{
			"success": false,
			"message": "Listing tidak ditemukan",
		})
	}

	var input struct {
		InspectorID         string  `json:"inspector_id"`
		InspectorName       string  `json:"inspector_name"`
		InspectionPlace     string  `json:"inspection_place"`
		InspectionDate      string  `json:"inspection_date"`
		TotalPoints         int     `json:"total_points"`
		AccidentFree        bool    `json:"accident_free"`
		FloodFree           bool    `json:"flood_free"`
		FireFree            bool    `json:"fire_free"`
		OdometerTampered    bool    `json:"odometer_tampered"`
		Results             []struct {
			ItemID             int    `json:"item_id"`
			Status             string `json:"status"`
			Notes              string `json:"notes"`
			ImageURL           string `json:"image_url"`
			Severity           string `json:"severity"`
			RepairCostEstimate int64  `json:"repair_cost_estimate"`
		} `json:"results"`
		Photos []struct {
			InspectionResultID string `json:"inspection_result_id"`
			ImageURL           string `json:"image_url"`
			Caption            string `json:"caption"`
			Position           string `json:"position"`
			DisplayOrder       int    `json:"display_order"`
		} `json:"photos"`
	}

	if err := c.Bind().JSON(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"success": false,
			"message": "Request body tidak valid",
			"error":   err.Error(),
		})
	}

	// Calculate score and grade
	passedPoints := 0
	failedPoints := 0
	totalPoints := input.TotalPoints
	if totalPoints <= 0 {
		totalPoints = 160
	}

	// Count passed/failed from results
	for _, r := range input.Results {
		switch r.Status {
		case "istimewa", "baik":
			passedPoints++
		case "sedang", "perlu_perbaikan":
			failedPoints++
		}
	}

	if passedPoints+failedPoints > 0 && len(input.Results) > 0 {
		// Scale to total points
		ratio := float64(totalPoints) / float64(len(input.Results))
		passedPoints = int(float64(passedPoints) * ratio)
		failedPoints = totalPoints - passedPoints
	}

	inspectionScore := 0.0
	if totalPoints > 0 {
		inspectionScore = float64(passedPoints) / float64(totalPoints) * 100
	}

	overallGrade := calculateGrade(inspectionScore)
	riskLevel := calculateRiskLevel(input.AccidentFree, input.FloodFree, input.FireFree, input.OdometerTampered, inspectionScore)

	// Parse inspector ID
	var inspectorID *uuid.UUID
	if input.InspectorID != "" {
		if uid, err := uuid.Parse(input.InspectorID); err == nil {
			inspectorID = &uid
		}
	}

	// Parse inspection date
	var inspectionDate *time.Time
	if input.InspectionDate != "" {
		if t, err := time.Parse("2006-01-02", input.InspectionDate); err == nil {
			inspectionDate = &t
		}
	}

	// Generate certificate number
	certNumber := fmt.Sprintf("INS-%s-%s", time.Now().Format("2006"), strconv.Itoa(int(time.Now().UnixNano()%100000)))

	// Determine status
	status := "completed"
	if inspectionScore < 50 {
		status = "completed"
	}

	inspection := models.CarInspection{
		CarListingID:        &listing.ID,
		InspectorID:         inspectorID,
		InspectorName:       input.InspectorName,
		InspectionPlace:     input.InspectionPlace,
		InspectionDate:      inspectionDate,
		TotalPoints:         totalPoints,
		PassedPoints:        passedPoints,
		FailedPoints:        failedPoints,
		InspectionScore:     inspectionScore,
		AccidentFree:        input.AccidentFree,
		FloodFree:           input.FloodFree,
		FireFree:            input.FireFree,
		OdometerTampered:    input.OdometerTampered,
		RiskLevel:           riskLevel,
		OverallGrade:        overallGrade,
		Recommended:         inspectionScore >= 70 && !input.AccidentFree && !input.FloodFree && !input.FireFree,
		CertificateNumber:   certNumber,
		Status:              status,
	}

	// Start transaction
	tx := ctrl.DB.Begin()

	if err := tx.Create(&inspection).Error; err != nil {
		tx.Rollback()
		return c.Status(500).JSON(fiber.Map{
			"success": false,
			"message": "Gagal membuat inspeksi",
			"error":   err.Error(),
		})
	}

	// Create results
	for _, r := range input.Results {
		result := models.InspectionResult{
			InspectionID:       &inspection.ID,
			ItemID:             r.ItemID,
			Status:             r.Status,
			Notes:              r.Notes,
			ImageURL:           r.ImageURL,
			Severity:           r.Severity,
			RepairCostEstimate: r.RepairCostEstimate,
		}
		if err := tx.Create(&result).Error; err != nil {
			tx.Rollback()
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"message": "Gagal menyimpan hasil inspeksi",
				"error":   err.Error(),
			})
		}
	}

	// Create photos
	for _, p := range input.Photos {
		var resultID *uuid.UUID
		if p.InspectionResultID != "" {
			if uid, err := uuid.Parse(p.InspectionResultID); err == nil {
				resultID = &uid
			}
		}
		photo := models.InspectionPhoto{
			InspectionID:       &inspection.ID,
			InspectionResultID: resultID,
			ImageURL:           p.ImageURL,
			Caption:            p.Caption,
			Position:           p.Position,
			DisplayOrder:       p.DisplayOrder,
		}
		if err := tx.Create(&photo).Error; err != nil {
			tx.Rollback()
			return c.Status(500).JSON(fiber.Map{
				"success": false,
				"message": "Gagal menyimpan foto inspeksi",
				"error":   err.Error(),
			})
		}
	}

	tx.Commit()

	return c.Status(201).JSON(fiber.Map{
		"success": true,
		"message": "Inspeksi berhasil disubmit",
		"data":    inspection,
	})
}

func calculateGrade(score float64) string {
	switch {
	case score >= 95:
		return "A+"
	case score >= 85:
		return "A"
	case score >= 75:
		return "B+"
	case score >= 65:
		return "B"
	case score >= 50:
		return "C"
	case score >= 35:
		return "D"
	default:
		return "E"
	}
}

func calculateRiskLevel(accidentFree, floodFree, fireFree bool, odometerTampered bool, score float64) string {
	if !accidentFree || !floodFree || !fireFree || odometerTampered {
		return "high"
	}
	if score < 60 {
		return "medium"
	}
	if score < 80 {
		return "low"
	}
	return "low"
}
