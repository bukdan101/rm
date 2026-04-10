package routes

import (
	"automarket-interaction-service/internal/controllers"

	"github.com/gofiber/fiber/v3"
)

// SetupRoutes configures all API routes for the interaction service
func SetupRoutes(
	app *fiber.App,
	reviewCtrl *controllers.ReviewController,
	favoriteCtrl *controllers.FavoriteController,
	recentViewCtrl *controllers.RecentViewController,
	recommendationCtrl *controllers.RecommendationController,
	trendingCtrl *controllers.TrendingController,
	jwtMiddleware fiber.Handler,
	adminMiddleware fiber.Handler,
) {
	api := app.Group("/api")

	// ============================================
	// Public Routes
	// ============================================
	api.Get("/health", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"success": true,
			"message": "Interaction service is healthy",
			"service": "automarket-interaction-service",
		})
	})

	// Public review endpoints
	listings := api.Group("/listings")
	listings.Get("/:id/reviews", reviewCtrl.GetListingReviews)
	listings.Get("/:id/reviews/detail", reviewCtrl.GetReviewDetail)

	reviews := api.Group("/reviews")
	reviews.Get("/:id", reviewCtrl.GetReviewDetail)

	// Trending (public read)
	api.Get("/trending", trendingCtrl.GetTrending)

	// ============================================
	// Authenticated Routes (JWT required)
	// ============================================
	authReviews := api.Group("/reviews")
	authReviews.Use(jwtMiddleware)
	authReviews.Post("/", reviewCtrl.CreateReview)
	authReviews.Put("/:id", reviewCtrl.UpdateReview)
	authReviews.Delete("/:id", reviewCtrl.DeleteReview)
	authReviews.Post("/:id/images", reviewCtrl.AddReviewImage)
	authReviews.Delete("/:id/images/:imageId", reviewCtrl.DeleteReviewImage)
	authReviews.Post("/:id/vote", reviewCtrl.VoteReview)
	authReviews.Put("/:id/response", reviewCtrl.SellerResponse)

	// Favorites
	favorites := api.Group("/favorites")
	favorites.Use(jwtMiddleware)
	favorites.Post("/", favoriteCtrl.AddFavorite)
	favorites.Delete("/:id", favoriteCtrl.RemoveFavorite)
	favorites.Get("/", favoriteCtrl.GetFavorites)

	// Recent Views
	recentViews := api.Group("/recent-views")
	recentViews.Use(jwtMiddleware)
	recentViews.Post("/", recentViewCtrl.TrackView)
	recentViews.Get("/", recentViewCtrl.GetRecentViews)

	// Recommendations
	recommendations := api.Group("/recommendations")
	recommendations.Use(jwtMiddleware)
	recommendations.Get("/", recommendationCtrl.GetRecommendations)

	// ============================================
	// Admin Routes (JWT + Admin required)
	// ============================================
	admin := api.Group("/admin")
	admin.Use(jwtMiddleware)
	admin.Use(adminMiddleware)

	adminReviews := admin.Group("/reviews")
	adminReviews.Get("/", reviewCtrl.AdminListReviews)
	adminReviews.Put("/:id/status", reviewCtrl.AdminUpdateReviewStatus)
	adminReviews.Delete("/:id", reviewCtrl.AdminDeleteReview)
}
