package routes

import (
	"automarket-listing-service/internal/controllers"

	"github.com/gofiber/fiber/v3"
)

// SetupRoutes configures all API routes for the listing service
func SetupRoutes(
	app *fiber.App,
	listingCtrl *controllers.ListingController,
	brandCtrl *controllers.BrandController,
	masterCtrl *controllers.MasterDataController,
	inspCtrl *controllers.InspectionController,
	jwtMiddleware fiber.Handler,
) {
	api := app.Group("/api")

	// ============================================
	// Health Check
	// ============================================
	api.Get("/health", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"success": true,
			"message": "Listing service is healthy",
			"service": "automarket-listing-service",
		})
	})

	// ============================================
	// Public Routes
	// ============================================

	// Listings
	listings := api.Group("/listings")
	listings.Get("/", listingCtrl.ListListings)
	listings.Get("/:id", listingCtrl.GetListing)

	// Brands
	api.Get("/brands", brandCtrl.ListBrands)
	api.Get("/brands/:id/models", brandCtrl.GetModelsByBrand)

	// Models
	api.Get("/models/:id/variants", brandCtrl.GetVariantsByModel)

	// Master Data
	api.Get("/colors", masterCtrl.ListColors)
	api.Get("/body-types", masterCtrl.ListBodyTypes)
	api.Get("/fuel-types", masterCtrl.ListFuelTypes)
	api.Get("/transmissions", masterCtrl.ListTransmissions)
	api.Get("/categories", masterCtrl.ListCategories)
	api.Get("/feature-categories", masterCtrl.ListFeatureCategories)
	api.Get("/inspection-items", masterCtrl.ListInspectionItems)

	// Inspection (public read)
	listings.Get("/:id/inspection", inspCtrl.GetInspection)
	listings.Get("/:id/reviews", listingCtrl.GetListingReviews)

	// ============================================
	// Authenticated Routes (JWT required)
	// ============================================
	listingsAuth := api.Group("/listings")
	listingsAuth.Use(jwtMiddleware)

	listingsAuth.Post("/", listingCtrl.CreateListing)
	listingsAuth.Put("/:id", listingCtrl.UpdateListing)
	listingsAuth.Delete("/:id", listingCtrl.DeleteListing)

	// Images
	listingsAuth.Post("/:id/images", listingCtrl.AddImage)
	listingsAuth.Delete("/:id/images/:imageId", listingCtrl.DeleteImage)
	listingsAuth.Put("/:id/images/:imageId/primary", listingCtrl.SetPrimaryImage)

	// Videos
	listingsAuth.Post("/:id/videos", listingCtrl.AddVideo)

	// Features & Documents
	listingsAuth.Put("/:id/features", listingCtrl.UpdateFeatures)
	listingsAuth.Put("/:id/documents", listingCtrl.UpdateDocuments)

	// Inspection (authenticated)
	listingsAuth.Post("/:id/inspection", inspCtrl.CreateInspection)

	// My Listings
	api.Get("/my/listings", listingCtrl.GetMyListings)
}
