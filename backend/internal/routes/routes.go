package routes

import (
	"automarket/internal/config"
	"automarket/internal/controllers"
	"automarket/internal/middleware"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func SetupRoutes(app *fiber.App, db *gorm.DB, cfg *config.Config) {
	// Store db and config in app locals for controllers
	app.Use(func(c fiber.Ctx) error {
		c.Locals("db", db)
		c.Locals("config", cfg)
		return c.Next()
	})

	// 404 handler
	app.Use(controllers.NotFoundHandler)

	// ========================================
	// PUBLIC ROUTES (no auth required)
	// ========================================
	public := app.Group("/api")

	// Health
	public.Get("/health", controllers.HealthCheck)

	// Auth
	public.Post("/auth/google", controllers.GoogleLogin)
	public.Post("/auth/google/callback", controllers.GoogleCallback)

	// Listings (read-only)
	public.Get("/listings", controllers.GetListings)
	public.Get("/listings/:id", controllers.GetListingByID)

	// Master Data
	public.Get("/brands", controllers.GetBrands)
	public.Get("/brands/:id/models", controllers.GetModelsByBrand)
	public.Get("/models/:id/variants", controllers.GetVariantsByModel)
	public.Get("/colors", controllers.GetColors)

	// Locations
	public.Get("/locations/provinces", controllers.GetProvinces)
	public.Get("/locations/cities", controllers.GetCities)
	public.Get("/locations/districts", controllers.GetDistricts)

	// Dealers (read-only)
	public.Get("/dealers", controllers.GetDealers)
	public.Get("/dealers/:slug", controllers.GetDealerBySlug)

	// Inspection items (read-only)
	public.Get("/inspection-items", controllers.GetInspectionItems)

	// Token packages (read-only)
	public.Get("/token-packages", controllers.GetTokenPackages)

	// ========================================
	// AUTHENTICATED ROUTES (JWT required)
	// ========================================
	auth := public.Group("/", middleware.JWTMiddleware(cfg.JWTSecret))

	// Auth
	auth.Get("/auth/me", controllers.GetProfile)
	auth.Put("/auth/profile", controllers.UpdateProfile)
	auth.Post("/auth/refresh", controllers.RefreshToken)

	// Listings (write)
	auth.Post("/listings", controllers.CreateListing)
	auth.Put("/listings/:id", controllers.UpdateListing)
	auth.Delete("/listings/:id", controllers.DeleteListing)

	// Tokens
	auth.Get("/tokens/balance", controllers.GetTokenBalance)
	auth.Get("/tokens/transactions", controllers.GetTokenTransactions)

	// ========================================
	// ADMIN ROUTES (JWT + admin role required)
	// ========================================
	_ = auth.Group("/admin", middleware.RequireRole("admin"))
	// Admin endpoints will be added here
}
