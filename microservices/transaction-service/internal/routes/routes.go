package routes

import (
	"automarket-transaction-service/internal/controllers"

	"github.com/gofiber/fiber/v3"
)

// SetupRoutes configures all API routes for the transaction service
func SetupRoutes(
	app *fiber.App,
	orderCtrl *controllers.OrderController,
	paymentCtrl *controllers.PaymentController,
	tokenCtrl *controllers.TokenController,
	rentalCtrl *controllers.RentalController,
	couponCtrl *controllers.CouponController,
	adminCtrl *controllers.AdminController,
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
			"message": "Transaction service is healthy",
			"service": "automarket-transaction-service",
		})
	})

	api.Get("/token-packages", tokenCtrl.GetTokenPackages)
	api.Get("/token-settings", tokenCtrl.GetTokenSettings)
	api.Get("/coupons", couponCtrl.GetActiveCoupons)

	// ============================================
	// Authenticated Routes (JWT required)
	// ============================================

	// Orders
	orders := api.Group("/orders")
	orders.Use(jwtMiddleware)
	orders.Post("/", orderCtrl.CreateOrder)
	orders.Get("/", orderCtrl.GetOrders)
	orders.Get("/:id", orderCtrl.GetOrder)
	orders.Put("/:id/cancel", orderCtrl.CancelOrder)
	orders.Put("/:id/confirm", orderCtrl.ConfirmOrder)

	// Payments
	payments := api.Group("/payments")
	payments.Use(jwtMiddleware)
	payments.Post("/", paymentCtrl.CreatePayment)
	payments.Get("/:id", paymentCtrl.GetPayment)

	// Topups
	topups := api.Group("/topups")
	topups.Use(jwtMiddleware)
	topups.Post("/", tokenCtrl.CreateTopupRequest)
	topups.Get("/", tokenCtrl.GetTopupRequests)

	// Rentals
	rentals := api.Group("/rentals")
	rentals.Use(jwtMiddleware)
	rentals.Get("/bookings", rentalCtrl.GetRentalBookings)
	rentals.Post("/bookings", rentalCtrl.CreateRentalBooking)
	rentals.Get("/bookings/:id", rentalCtrl.GetRentalBooking)
	rentals.Put("/bookings/:id/cancel", rentalCtrl.CancelRentalBooking)
	rentals.Post("/bookings/:id/review", rentalCtrl.ReviewRental)

	// Invoices
	invoices := api.Group("/invoices")
	invoices.Use(jwtMiddleware)
	invoices.Get("/:id", couponCtrl.GetInvoice)

	// Coupon validation
	api.Get("/coupons/validate/:code", couponCtrl.ValidateCoupon)

	// ============================================
	// Admin Routes (JWT + Admin required)
	// ============================================
	admin := api.Group("/admin")
	admin.Use(jwtMiddleware)
	admin.Use(adminMiddleware)

	// Admin Orders
	admin.Get("/orders", adminCtrl.GetAllOrders)
	admin.Put("/orders/:id/status", adminCtrl.UpdateOrderStatus)

	// Admin Payments
	admin.Get("/payments", adminCtrl.GetAllPayments)

	// Admin Topups
	admin.Put("/topups/:id/approve", adminCtrl.ApproveTopup)
	admin.Put("/topups/:id/reject", adminCtrl.RejectTopup)

	// Admin Refunds
	admin.Post("/refunds", adminCtrl.CreateRefund)

	// Admin Coupons
	admin.Post("/coupons", couponCtrl.CreateCoupon)
	admin.Put("/coupons/:id", couponCtrl.UpdateCoupon)
	admin.Delete("/coupons/:id", couponCtrl.DeleteCoupon)

	// Admin Escrow
	admin.Get("/escrow", adminCtrl.GetAllEscrow)
	admin.Post("/escrow/:id/release", adminCtrl.ReleaseEscrow)

	// Admin Transactions
	admin.Get("/transactions", adminCtrl.GetAllTransactions)

	// Admin Token Settings
	admin.Put("/token-settings", adminCtrl.UpdateTokenSettings)
}
