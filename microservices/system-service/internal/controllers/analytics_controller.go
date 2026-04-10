package controllers

import (
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"automarket-system-service/internal/models"
)

// AnalyticsController handles analytics tracking and reporting
type AnalyticsController struct {
	DB *gorm.DB
}

// NewAnalyticsController creates a new AnalyticsController
func NewAnalyticsController(db *gorm.DB) *AnalyticsController {
	return &AnalyticsController{DB: db}
}

// TrackEvent tracks an analytics event (public, no auth required)
func (c *AnalyticsController) TrackEvent(ctx *fiber.Ctx) error {
	var req struct {
		UserID      string         `json:"user_id"`
		EventType   string         `json:"event_type" validate:"required"`
		EventName   string         `json:"event_name" validate:"required"`
		Properties  map[string]any `json:"properties"`
		SessionID   string         `json:"session_id"`
		DeviceType  string         `json:"device_type"`
		Platform    string         `json:"platform"`
		AppVersion  string         `json:"app_version"`
	}

	if err := ctx.Bind().Body(&req); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	event := models.AnalyticsEvent{
		EventType:  req.EventType,
		EventName:  req.EventName,
		Properties: req.Properties,
		SessionID:  req.SessionID,
		DeviceType: req.DeviceType,
		Platform:   req.Platform,
		AppVersion: req.AppVersion,
		IPAddress:  ctx.IP(),
		UserAgent:  ctx.Get("User-Agent"),
	}

	if req.UserID != "" {
		if uid, err := uuid.Parse(req.UserID); err == nil {
			event.UserID = &uid
		}
	}

	if err := c.DB.Create(&event).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to track event"})
	}

	return ctx.Status(201).JSON(fiber.Map{"data": fiber.Map{"id": event.ID}})
}

// TrackPageView tracks a page view (public)
func (c *AnalyticsController) TrackPageView(ctx *fiber.Ctx) error {
	var req struct {
		UserID      string `json:"user_id"`
		PageType    string `json:"page_type" validate:"required"`
		PageID      string `json:"page_id"`
		PageURL     string `json:"page_url"`
		Referrer    string `json:"referrer"`
		SessionID   string `json:"session_id"`
		TimeOnPage  int    `json:"time_on_page"`
		ScrollDepth int    `json:"scroll_depth"`
	}

	if err := ctx.Bind().Body(&req); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	pageView := models.AnalyticsPageView{
		PageType:    req.PageType,
		PageURL:     req.PageURL,
		Referrer:    req.Referrer,
		SessionID:   req.SessionID,
		TimeOnPage:  req.TimeOnPage,
		ScrollDepth: req.ScrollDepth,
		IPAddress:   ctx.IP(),
		UserAgent:   ctx.Get("User-Agent"),
	}

	if req.UserID != "" {
		if uid, err := uuid.Parse(req.UserID); err == nil {
			pageView.UserID = &uid
		}
	}
	if req.PageID != "" {
		if uid, err := uuid.Parse(req.PageID); err == nil {
			pageView.PageID = &uid
		}
	}

	if err := c.DB.Create(&pageView).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to track page view"})
	}

	return ctx.Status(201).JSON(fiber.Map{"data": fiber.Map{"id": pageView.ID}})
}

// TrackClick tracks a click event (public)
func (c *AnalyticsController) TrackClick(ctx *fiber.Ctx) error {
	var req struct {
		UserID      string `json:"user_id"`
		ElementType string `json:"element_type" validate:"required"`
		ElementID   string `json:"element_id"`
		ElementText string `json:"element_text"`
		PageURL     string `json:"page_url"`
		XPosition   int    `json:"x_position"`
		YPosition   int    `json:"y_position"`
		SessionID   string `json:"session_id"`
	}

	if err := ctx.Bind().Body(&req); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	click := models.AnalyticsClick{
		ElementType: req.ElementType,
		ElementID:   req.ElementID,
		ElementText: req.ElementText,
		PageURL:     req.PageURL,
		XPosition:   req.XPosition,
		YPosition:   req.YPosition,
		SessionID:   req.SessionID,
		IPAddress:   ctx.IP(),
		UserAgent:   ctx.Get("User-Agent"),
	}

	if req.UserID != "" {
		if uid, err := uuid.Parse(req.UserID); err == nil {
			click.UserID = &uid
		}
	}

	if err := c.DB.Create(&click).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to track click"})
	}

	return ctx.Status(201).JSON(fiber.Map{"data": fiber.Map{"id": click.ID}})
}

// TrackConversion tracks a conversion event (public)
func (c *AnalyticsController) TrackConversion(ctx *fiber.Ctx) error {
	var req struct {
		UserID          string         `json:"user_id"`
		ConversionType  string         `json:"conversion_type" validate:"required"`
		ConversionValue int64          `json:"conversion_value"`
		FunnelStep      string         `json:"funnel_step"`
		FunnelComplete  bool           `json:"funnel_complete"`
		SessionID       string         `json:"session_id"`
		Attribution     map[string]any `json:"attribution"`
	}

	if err := ctx.Bind().Body(&req); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	conversion := models.AnalyticsConversion{
		ConversionType:  req.ConversionType,
		ConversionValue: req.ConversionValue,
		FunnelStep:      req.FunnelStep,
		FunnelComplete:  req.FunnelComplete,
		SessionID:       req.SessionID,
		Attribution:     req.Attribution,
		IPAddress:       ctx.IP(),
		UserAgent:       ctx.Get("User-Agent"),
	}

	if req.UserID != "" {
		if uid, err := uuid.Parse(req.UserID); err == nil {
			conversion.UserID = &uid
		}
	}

	if err := c.DB.Create(&conversion).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to track conversion"})
	}

	return ctx.Status(201).JSON(fiber.Map{"data": fiber.Map{"id": conversion.ID}})
}

// TrackSearch logs a search query (public)
func (c *AnalyticsController) TrackSearch(ctx *fiber.Ctx) error {
	var req struct {
		UserID           string         `json:"user_id"`
		Query            string         `json:"query" validate:"required"`
		Filters          map[string]any `json:"filters"`
		ResultsCount     int            `json:"results_count"`
		ClickedListingID string         `json:"clicked_listing_id"`
		SessionID        string         `json:"session_id"`
	}

	if err := ctx.Bind().Body(&req); err != nil {
		return ctx.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	searchLog := models.SearchLog{
		Query:        req.Query,
		Filters:      req.Filters,
		ResultsCount: req.ResultsCount,
		SessionID:    req.SessionID,
		IPAddress:    ctx.IP(),
		UserAgent:    ctx.Get("User-Agent"),
	}

	if req.UserID != "" {
		if uid, err := uuid.Parse(req.UserID); err == nil {
			searchLog.UserID = &uid
		}
	}
	if req.ClickedListingID != "" {
		if uid, err := uuid.Parse(req.ClickedListingID); err == nil {
			searchLog.ClickedListingID = &uid
		}
	}

	if err := c.DB.Create(&searchLog).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to log search"})
	}

	return ctx.Status(201).JSON(fiber.Map{"data": fiber.Map{"id": searchLog.ID}})
}

// GetDashboard returns dashboard analytics stats (admin)
func (c *AnalyticsController) GetDashboard(ctx *fiber.Ctx) error {
	period := ctx.Query("period", "7d")
	now := time.Now()

	var startDate time.Time
	switch period {
	case "24h":
		startDate = now.Add(-24 * time.Hour)
	case "7d":
		startDate = now.Add(-7 * 24 * time.Hour)
	case "30d":
		startDate = now.Add(-30 * 24 * time.Hour)
	case "90d":
		startDate = now.Add(-90 * 24 * time.Hour)
	default:
		startDate = now.Add(-7 * 24 * time.Hour)
	}

	type DashboardStat struct {
		TotalUsers       int64   `json:"total_users"`
		TotalEvents      int64   `json:"total_events"`
		TotalPageViews   int64   `json:"total_page_views"`
		TotalConversions int64   `json:"total_conversions"`
		TotalSearches    int64   `json:"total_searches"`
		ConversionRate   float64 `json:"conversion_rate"`
		AvgTimeOnPage    float64 `json:"avg_time_on_page"`
	}

	stats := DashboardStat{}

	c.DB.Model(&models.AnalyticsEvent{}).Where("created_at >= ?", startDate).Count(&stats.TotalEvents)
	c.DB.Model(&models.AnalyticsPageView{}).Where("created_at >= ?", startDate).Count(&stats.TotalPageViews)
	c.DB.Model(&models.AnalyticsConversion{}).Where("created_at >= ?", startDate).Count(&stats.TotalConversions)
	c.DB.Model(&models.SearchLog{}).Where("created_at >= ?", startDate).Count(&stats.TotalSearches)

	if stats.TotalPageViews > 0 {
		stats.ConversionRate = float64(stats.TotalConversions) / float64(stats.TotalPageViews) * 100
	}

	// Average time on page
	var avgTime struct {
		Avg float64
	}
	c.DB.Model(&models.AnalyticsPageView{}).
		Select("AVG(time_on_page) as avg").
		Where("created_at >= ?", startDate).
		Scan(&avgTime)
	stats.AvgTimeOnPage = avgTime.Avg

	// Top events
	type TopEvent struct {
		EventName string `json:"event_name"`
		Count     int64  `json:"count"`
	}
	var topEvents []TopEvent
	c.DB.Model(&models.AnalyticsEvent{}).
		Select("event_name, COUNT(*) as count").
		Where("created_at >= ?", startDate).
		Group("event_name").
		Order("count DESC").
		Limit(10).
		Scan(&topEvents)

	// Top search queries
	type TopSearch struct {
		Query string `json:"query"`
		Count int64  `json:"count"`
	}
	var topSearches []TopSearch
	c.DB.Model(&models.SearchLog{}).
		Select("query, COUNT(*) as count").
		Where("created_at >= ?", startDate).
		Group("query").
		Order("count DESC").
		Limit(10).
		Scan(&topSearches)

	// Device distribution
	type DeviceStat struct {
		DeviceType string `json:"device_type"`
		Count      int64  `json:"count"`
	}
	var deviceStats []DeviceStat
	c.DB.Model(&models.AnalyticsEvent{}).
		Select("device_type, COUNT(*) as count").
		Where("created_at >= ? AND device_type != ''", startDate).
		Group("device_type").
		Order("count DESC").
		Scan(&deviceStats)

	return ctx.JSON(fiber.Map{
		"data": fiber.Map{
			"period":       period,
			"stats":        stats,
			"top_events":   topEvents,
			"top_searches": topSearches,
			"devices":      deviceStats,
		},
	})
}

// ListEvents returns analytics events (admin)
func (c *AnalyticsController) ListEvents(ctx *fiber.Ctx) error {
	page := ctx.QueryInt("page", 1)
	limit := ctx.QueryInt("limit", 50)
	eventType := ctx.Query("event_type")
	startDate := ctx.Query("start_date")
	endDate := ctx.Query("end_date")

	offset := (page - 1) * limit

	query := c.DB.Model(&models.AnalyticsEvent{})

	if eventType != "" {
		query = query.Where("event_type = ?", eventType)
	}
	if startDate != "" {
		query = query.Where("created_at >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("created_at <= ?", endDate)
	}

	var events []models.AnalyticsEvent
	var total int64
	query.Count(&total)

	if err := query.Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&events).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to fetch events"})
	}

	return ctx.JSON(fiber.Map{
		"data": events,
		"pagination": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// GetPageViews returns page view analytics (admin)
func (c *AnalyticsController) GetPageViews(ctx *fiber.Ctx) error {
	page := ctx.QueryInt("page", 1)
	limit := ctx.QueryInt("limit", 50)
	pageType := ctx.Query("page_type")

	offset := (page - 1) * limit

	query := c.DB.Model(&models.AnalyticsPageView{})
	if pageType != "" {
		query = query.Where("page_type = ?", pageType)
	}

	var pageViews []models.AnalyticsPageView
	var total int64
	query.Count(&total)

	if err := query.Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&pageViews).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to fetch page views"})
	}

	return ctx.JSON(fiber.Map{
		"data": pageViews,
		"pagination": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// GetConversions returns conversion analytics (admin)
func (c *AnalyticsController) GetConversions(ctx *fiber.Ctx) error {
	page := ctx.QueryInt("page", 1)
	limit := ctx.QueryInt("limit", 50)
	conversionType := ctx.Query("conversion_type")

	offset := (page - 1) * limit

	query := c.DB.Model(&models.AnalyticsConversion{})
	if conversionType != "" {
		query = query.Where("conversion_type = ?", conversionType)
	}

	var conversions []models.AnalyticsConversion
	var total int64
	query.Count(&total)

	if err := query.Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&conversions).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to fetch conversions"})
	}

	// Summary stats
	type ConversionSummary struct {
		ConversionType  string  `json:"conversion_type"`
		TotalCount      int64   `json:"total_count"`
		TotalValue      int64   `json:"total_value"`
		AvgValue        float64 `json:"avg_value"`
		CompletedCount  int64   `json:"completed_count"`
	}
	var summaries []ConversionSummary
	c.DB.Model(&models.AnalyticsConversion{}).
		Select("conversion_type, COUNT(*) as total_count, SUM(conversion_value) as total_value, AVG(conversion_value) as avg_value, SUM(CASE WHEN funnel_complete THEN 1 ELSE 0 END) as completed_count").
		Group("conversion_type").
		Scan(&summaries)

	return ctx.JSON(fiber.Map{
		"data":      conversions,
		"summaries": summaries,
		"pagination": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// GetSearchAnalytics returns search analytics (admin)
func (c *AnalyticsController) GetSearchAnalytics(ctx *fiber.Ctx) error {
	page := ctx.QueryInt("page", 1)
	limit := ctx.QueryInt("limit", 50)

	offset := (page - 1) * limit

	var searchLogs []models.SearchLog
	var total int64
	c.DB.Model(&models.SearchLog{}).Count(&total)

	if err := c.DB.Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&searchLogs).Error; err != nil {
		return ctx.Status(500).JSON(fiber.Map{"error": "Failed to fetch search logs"})
	}

	// Top queries
	type TopQuery struct {
		Query   string `json:"query"`
		Count   int64  `json:"count"`
		AvgResults float64 `json:"avg_results"`
	}
	var topQueries []TopQuery
	c.DB.Model(&models.SearchLog{}).
		Select("query, COUNT(*) as count, AVG(results_count) as avg_results").
		Group("query").
		Order("count DESC").
		Limit(20).
		Scan(&topQueries)

	return ctx.JSON(fiber.Map{
		"data":        searchLogs,
		"top_queries": topQueries,
		"pagination": fiber.Map{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// GetReportSummary returns a summary report (admin)
func (c *AnalyticsController) GetReportSummary(ctx *fiber.Ctx) error {
	now := time.Now()
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	thisWeekStart := todayStart.AddDate(0, 0, -int(now.Weekday()))
	thisMonthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())

	type PeriodStats struct {
		Events      int64 `json:"events"`
		PageViews   int64 `json:"page_views"`
		Conversions int64 `json:"conversions"`
		Searches    int64 `json:"searches"`
		Messages    int64 `json:"messages"`
	}

	today := PeriodStats{}
	thisWeek := PeriodStats{}
	thisMonth := PeriodStats{}

	// Today stats
	c.DB.Model(&models.AnalyticsEvent{}).Where("created_at >= ?", todayStart).Count(&today.Events)
	c.DB.Model(&models.AnalyticsPageView{}).Where("created_at >= ?", todayStart).Count(&today.PageViews)
	c.DB.Model(&models.AnalyticsConversion{}).Where("created_at >= ?", todayStart).Count(&today.Conversions)
	c.DB.Model(&models.SearchLog{}).Where("created_at >= ?", todayStart).Count(&today.Searches)
	c.DB.Model(&models.Message{}).Where("created_at >= ?", todayStart).Count(&today.Messages)

	// This week stats
	c.DB.Model(&models.AnalyticsEvent{}).Where("created_at >= ?", thisWeekStart).Count(&thisWeek.Events)
	c.DB.Model(&models.AnalyticsPageView{}).Where("created_at >= ?", thisWeekStart).Count(&thisWeek.PageViews)
	c.DB.Model(&models.AnalyticsConversion{}).Where("created_at >= ?", thisWeekStart).Count(&thisWeek.Conversions)
	c.DB.Model(&models.SearchLog{}).Where("created_at >= ?", thisWeekStart).Count(&thisWeek.Searches)
	c.DB.Model(&models.Message{}).Where("created_at >= ?", thisWeekStart).Count(&thisWeek.Messages)

	// This month stats
	c.DB.Model(&models.AnalyticsEvent{}).Where("created_at >= ?", thisMonthStart).Count(&thisMonth.Events)
	c.DB.Model(&models.AnalyticsPageView{}).Where("created_at >= ?", thisMonthStart).Count(&thisMonth.PageViews)
	c.DB.Model(&models.AnalyticsConversion{}).Where("created_at >= ?", thisMonthStart).Count(&thisMonth.Conversions)
	c.DB.Model(&models.SearchLog{}).Where("created_at >= ?", thisMonthStart).Count(&thisMonth.Searches)
	c.DB.Model(&models.Message{}).Where("created_at >= ?", thisMonthStart).Count(&thisMonth.Messages)

	// Active conversations
	var activeConversations int64
	c.DB.Model(&models.Conversation{}).Where("status = ?", "active").Count(&activeConversations)

	// Total notifications
	var totalNotifications int64
	c.DB.Model(&models.Notification{}).Count(&totalNotifications)

	return ctx.JSON(fiber.Map{
		"data": fiber.Map{
			"today":                today,
			"this_week":            thisWeek,
			"this_month":           thisMonth,
			"active_conversations": activeConversations,
			"total_notifications":  totalNotifications,
			"generated_at":         now.Format("2006-01-02T15:04:05Z07:00"),
		},
	})
}
