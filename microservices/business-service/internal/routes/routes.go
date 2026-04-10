package routes

import (
	"automarket-business-service/internal/controllers"

	"github.com/gofiber/fiber/v3"
)

// SetupRoutes configures all API routes for the business service
func SetupRoutes(
	app *fiber.App,
	dealerCtrl *controllers.DealerController,
	offerCtrl *controllers.OfferController,
	marketplaceCtrl *controllers.MarketplaceController,
	bannerCtrl *controllers.BannerController,
	broadcastCtrl *controllers.BroadcastController,
	categoryCtrl *controllers.CategoryController,
	supportCtrl *controllers.SupportController,
	adminCtrl *controllers.AdminController,
	jwtMiddleware fiber.Handler,
	adminMiddleware fiber.Handler,
) {
	api := app.Group("/api")

	// ============================================
	// Public Routes
	// ============================================

	// Health check (handled in main.go, but add alias)
	api.Get("/health", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"success": true,
			"message": "Business service is healthy",
			"service": "automarket-business-service",
		})
	})

	// Dealers — public listing
	dealers := api.Group("/dealers")
	dealers.Get("/", dealerCtrl.ListDealers)
	dealers.Get("/:slug", dealerCtrl.GetDealerBySlug)
	dealers.Get("/:id/reviews", dealerCtrl.GetDealerReviews)

	// Banners — public
	api.Get("/banners", bannerCtrl.ListBanners)
	api.Post("/banners/:id/click", bannerCtrl.TrackBannerClick)

	// Categories — public
	api.Get("/categories", categoryCtrl.ListCategories)

	// ============================================
	// Authenticated Routes (JWT required)
	// ============================================
	auth := api.Group("")
	auth.Use(jwtMiddleware)

	// Dealers — authenticated CRUD
	auth.Post("/dealers", dealerCtrl.CreateDealer)
	auth.Put("/dealers/:id", dealerCtrl.UpdateDealer)
	auth.Post("/dealers/:id/logo", dealerCtrl.UploadLogo)
	auth.Post("/dealers/:id/cover", dealerCtrl.UploadCover)

	// Dealer branches — authenticated
	auth.Get("/dealers/:id/branches", dealerCtrl.ListBranches)
	auth.Post("/dealers/:id/branches", dealerCtrl.AddBranch)
	auth.Put("/dealers/:id/branches/:branchId", dealerCtrl.UpdateBranch)
	auth.Delete("/dealers/:id/branches/:branchId", dealerCtrl.DeleteBranch)

	// Dealer staff — authenticated
	auth.Get("/dealers/:id/staff", dealerCtrl.ListStaff)
	auth.Post("/dealers/:id/staff/invite", dealerCtrl.InviteStaff)
	auth.Delete("/dealers/:id/staff/:staffId", dealerCtrl.RemoveStaff)

	// Dealer inventory — authenticated
	auth.Get("/dealers/:id/inventory", dealerCtrl.GetDealerInventory)

	// Marketplace settings — authenticated
	auth.Get("/marketplace-settings", marketplaceCtrl.GetMarketplaceSettings)

	// B2B Offers — authenticated
	offers := api.Group("/dealer-offers")
	offers.Use(jwtMiddleware)
	offers.Post("/", offerCtrl.CreateOffer)
	offers.Get("/sent", offerCtrl.ListSentOffers)
	offers.Get("/received", offerCtrl.ListReceivedOffers)
	offers.Get("/:id", offerCtrl.GetOfferDetail)
	offers.Put("/:id/view", offerCtrl.ViewOffer)
	offers.Put("/:id/accept", offerCtrl.AcceptOffer)
	offers.Put("/:id/reject", offerCtrl.RejectOffer)
	offers.Put("/:id/counter", offerCtrl.CounterOffer)
	offers.Put("/:id/withdraw", offerCtrl.WithdrawOffer)

	// Dealer Marketplace favorites — authenticated
	marketplace := api.Group("/dealer-marketplace")
	marketplace.Use(jwtMiddleware)
	marketplace.Get("/favorites", marketplaceCtrl.GetFavorites)
	marketplace.Post("/favorites", marketplaceCtrl.AddFavorite)
	marketplace.Delete("/favorites/:id", marketplaceCtrl.RemoveFavorite)

	// Support tickets — authenticated
	tickets := api.Group("/support-tickets")
	tickets.Use(jwtMiddleware)
	tickets.Post("/", supportCtrl.CreateTicket)
	tickets.Get("/", supportCtrl.ListTickets)
	tickets.Get("/:id", supportCtrl.GetTicket)
	tickets.Post("/:id/messages", supportCtrl.AddTicketMessage)

	// ============================================
	// Admin Routes (JWT + Admin role required)
	// ============================================
	admin := api.Group("/admin")
	admin.Use(jwtMiddleware)
	admin.Use(adminMiddleware)

	// Admin — Dealers
	admin.Get("/dealers", adminCtrl.ListAllDealers)
	admin.Put("/dealers/:id/verify", adminCtrl.VerifyDealer)
	admin.Put("/deakers/:id/status", adminCtrl.UpdateDealerStatus)

	// Admin — Offers
	admin.Get("/dealer-offers", adminCtrl.ListAllOffers)

	// Admin — Marketplace settings
	admin.Put("/marketplace-settings", adminCtrl.UpdateMarketplaceSettings)

	// Admin — Banners
	admin.Post("/banners", bannerCtrl.AdminCreateBanner)
	admin.Get("/banners", bannerCtrl.AdminListBanners)
	admin.Put("/banners/:id", bannerCtrl.AdminUpdateBanner)
	admin.Delete("/banners/:id", bannerCtrl.AdminDeleteBanner)

	// Admin — Broadcasts
	admin.Post("/broadcasts", broadcastCtrl.AdminCreateBroadcast)
	admin.Get("/broadcasts", broadcastCtrl.AdminListBroadcasts)
	admin.Put("/broadcasts/:id", broadcastCtrl.AdminUpdateBroadcast)
	admin.Delete("/broadcasts/:id", broadcastCtrl.AdminDeleteBroadcast)

	// Admin — Categories
	admin.Post("/categories", categoryCtrl.AdminCreateCategory)
	admin.Put("/categories/:id", categoryCtrl.AdminUpdateCategory)
	admin.Delete("/categories/:id", categoryCtrl.AdminDeleteCategory)

	// Admin — Support tickets
	admin.Get("/support-tickets", supportCtrl.AdminListTickets)
	admin.Put("/support-tickets/:id/assign", supportCtrl.AdminAssignTicket)
	admin.Post("/support-tickets/:id/reply", supportCtrl.AdminReplyTicket)
}
