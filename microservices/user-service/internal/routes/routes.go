package routes

import (
	"automarket-user-service/internal/controllers"

	"github.com/gofiber/fiber/v3"
)

// SetupRoutes configures all API routes
func SetupRoutes(app *fiber.App, authCtrl *controllers.AuthController, userCtrl *controllers.UserController, kycCtrl *controllers.KycController, tokenCtrl *controllers.TokenController, jwtMiddleware fiber.Handler, adminMiddleware fiber.Handler) {
	api := app.Group("/api")

	// ============================================
	// Public Routes
	// ============================================
	auth := api.Group("/auth")
	auth.Post("/google", authCtrl.GoogleLogin)
	auth.Post("/google/callback", authCtrl.GoogleCallback)
	auth.Post("/refresh", authCtrl.RefreshToken)

	// ============================================
	// Authenticated Routes (JWT required)
	// ============================================
	authProtected := api.Group("/auth")
	authProtected.Use(jwtMiddleware)
	authProtected.Get("/me", authCtrl.GetProfile)
	authProtected.Put("/profile", authCtrl.UpdateProfile)

	// Users
	users := api.Group("/users")
	users.Use(jwtMiddleware)
	users.Get("/:id", userCtrl.GetUser)
	users.Get("/:id/settings", userCtrl.GetSettings)
	users.Put("/:id/settings", userCtrl.UpdateSettings)
	users.Get("/:id/kyc", kycCtrl.GetKYC)
	users.Post("/:id/kyc", kycCtrl.SubmitKYC)
	users.Put("/:id/kyc/:status", kycCtrl.UpdateKYCStatus)
	users.Get("/:id/addresses", userCtrl.GetAddresses)
	users.Post("/:id/addresses", userCtrl.AddAddress)
	users.Put("/:id/addresses/:addressId", userCtrl.UpdateAddress)
	users.Delete("/:id/addresses/:addressId", userCtrl.DeleteAddress)
	users.Get("/:id/documents", userCtrl.GetDocuments)
	users.Post("/:id/documents", userCtrl.UploadDocument)

	// Tokens
	tokens := api.Group("/tokens")
	tokens.Use(jwtMiddleware)
	tokens.Get("/balance", tokenCtrl.GetBalance)
	tokens.Get("/transactions", tokenCtrl.GetTransactions)

	// ============================================
	// Admin Routes
	// ============================================
	admin := api.Group("/admin")
	admin.Use(jwtMiddleware)
	admin.Use(adminMiddleware)
	admin.Get("/users", userCtrl.ListUsers)
	admin.Put("/users/:id/role", userCtrl.UpdateUserRole)
	admin.Put("/kyc/:id/review", kycCtrl.ReviewKYC)
	admin.Get("/kyc/pending", kycCtrl.ListPendingKYC)
}
