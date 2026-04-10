package routes

import (
	"automarket-system-service/internal/controllers"
	"automarket-system-service/internal/handlers"

	"github.com/gofiber/contrib/websocket"
	"github.com/gofiber/fiber/v3"
)

// SetupRoutes configures all API routes for the system service
func SetupRoutes(
	app *fiber.App,
	chatCtrl *controllers.ChatController,
	notifCtrl *controllers.NotificationController,
	analyticsCtrl *controllers.AnalyticsController,
	activityCtrl *controllers.ActivityController,
	settingsCtrl *controllers.SettingsController,
	jwtMiddleware fiber.Handler,
	adminMiddleware fiber.Handler,
	wsHub *handlers.WSHub,
	jwtSecret string,
) {
	api := app.Group("/api")

	// ============================================
	// Health Check
	// ============================================
	api.Get("/health", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"success": true,
			"message": "System service is healthy",
			"service": "automarket-system-service",
		})
	})

	// ============================================
	// Public Routes (no auth required)
	// ============================================

	// Analytics tracking (public)
	analytics := api.Group("/analytics")
	analytics.Post("/events", analyticsCtrl.TrackEvent)
	analytics.Post("/page-view", analyticsCtrl.TrackPageView)
	analytics.Post("/click", analyticsCtrl.TrackClick)
	analytics.Post("/conversion", analyticsCtrl.TrackConversion)
	analytics.Post("/search", analyticsCtrl.TrackSearch)

	// Public system settings (optional group/key filter)
	api.Get("/system-settings", settingsCtrl.GetPublicSettings)

	// ============================================
	// WebSocket Routes
	// ============================================
	// WebSocket upgrade middleware for /ws path
	app.Use("/ws", func(c fiber.Ctx) error {
		if websocket.IsWebSocketUpgrade(c) {
			return c.Next()
		}
		return fiber.ErrUpgradeRequired
	})
	app.Get("/ws/chat", websocket.New(wsHub.HandleWebSocket(jwtSecret)))

	// ============================================
	// Authenticated Routes (JWT required)
	// ============================================

	// Conversations
	conversations := api.Group("/conversations")
	conversations.Use(jwtMiddleware)
	conversations.Get("/", chatCtrl.ListConversations)
	conversations.Post("/", chatCtrl.CreateConversation)
	conversations.Get("/:id", chatCtrl.GetConversation)
	conversations.Get("/:id/messages", chatCtrl.GetMessages)
	conversations.Post("/:id/messages", chatCtrl.SendMessage)
	conversations.Put("/:id/read", chatCtrl.MarkAsRead)
	conversations.Put("/:id/close", chatCtrl.CloseConversation)

	// Notifications
	notifications := api.Group("/notifications")
	notifications.Use(jwtMiddleware)
	notifications.Get("/", notifCtrl.ListNotifications)
	notifications.Put("/:id/read", notifCtrl.MarkNotificationRead)
	notifications.Put("/read-all", notifCtrl.MarkAllRead)
	notifications.Get("/unread-count", notifCtrl.UnreadCount)

	// ============================================
	// Admin Routes (JWT + admin role required)
	// ============================================
	admin := api.Group("/admin")
	admin.Use(jwtMiddleware)
	admin.Use(adminMiddleware)

	// Admin Analytics
	adminAnalytics := admin.Group("/analytics")
	adminAnalytics.Get("/dashboard", analyticsCtrl.GetDashboard)
	adminAnalytics.Get("/events", analyticsCtrl.ListEvents)
	adminAnalytics.Get("/page-views", analyticsCtrl.GetPageViews)
	adminAnalytics.Get("/conversions", analyticsCtrl.GetConversions)
	adminAnalytics.Get("/search", analyticsCtrl.GetSearchAnalytics)
	adminAnalytics.Get("/report", analyticsCtrl.GetReportSummary)

	// Admin Activity Logs
	admin.Get("/activity-logs", activityCtrl.ListActivityLogs)

	// Admin Notifications
	adminNotifications := admin.Group("/notifications")
	adminNotifications.Get("/templates", notifCtrl.ListTemplates)
	adminNotifications.Post("/templates", notifCtrl.CreateTemplate)
	adminNotifications.Put("/templates/:id", notifCtrl.UpdateTemplate)
	adminNotifications.Post("/broadcast", notifCtrl.Broadcast)

	// Admin System Settings
	adminSettings := admin.Group("/system-settings")
	adminSettings.Get("/", settingsCtrl.GetAllSettings)
	adminSettings.Put("/", settingsCtrl.UpdateSetting)
	adminSettings.Put("/:key", settingsCtrl.SetSetting)
}
