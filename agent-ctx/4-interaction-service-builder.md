---
Task ID: 4
Agent: Interaction Service Builder
Task: Build complete interaction-service microservice (Golang Fiber v3 + GORM + PostgreSQL)

### Work Summary
Created all 15 files for the interaction-service microservice at `/home/z/my-project/microservices/interaction-service/`.

### Files Created (15 files)

**Configuration & Build:**
1. `go.mod` — Module `automarket-interaction-service`, Go 1.24, Fiber v3 + GORM + JWT + UUID + godotenv
2. `.env` — Service config (PORT 8003, DB_SCHEMA=interaction_schema, JWT_SECRET)
3. `Dockerfile` — Multi-stage build (golang:1.24-alpine → alpine:latest), exposes PORT 8003

**Models (5 files, 7 tables, NO foreign keys):**
4. `internal/models/review.go` — CarReview, ReviewImage, ReviewVote (UUID PKs, check constraints for enums/rating)
5. `internal/models/favorite.go` — CarFavorite (user_id + car_listing_id indexes)
6. `internal/models/recent_view.go` — RecentView (view_count default 1, auto-increment on re-view)
7. `internal/models/recommendation.go` — Recommendation (score numeric, source check constraint)
8. `internal/models/trending.go` — TrendingCar (period check constraint daily/weekly/monthly, rank field)

**Controllers (5 files):**
9. `internal/controllers/review_controller.go` — Full review CRUD, listing reviews (paginated+sorted), review detail with images, add/delete review images (max 10), vote toggle (helpful/not_helpful), seller response (seller/dealer/admin only), admin status update, admin force delete, admin list with filters
10. `internal/controllers/favorite_controller.go` — Add/remove/list favorites with duplicate prevention, paginated listing
11. `internal/controllers/recent_view_controller.go` — Track view (create or increment count), get recent views (limit 50)
12. `internal/controllers/recommendation_controller.go` — Get personalized recommendations by source, auto-generate from recent views + trending if none exist
13. `internal/controllers/trending_controller.go` — Get trending cars by period (daily/weekly/monthly), configurable limit

**Routes & Entry Point:**
14. `internal/routes/routes.go` — All 18 API endpoints organized into public/authenticated/admin groups
15. `cmd/server/main.go` — Fiber app, DB connection with retry (10 attempts), interaction_schema auto-create, UUID extensions, auto-migrate 7 tables, JWT middleware with HMAC validation, admin middleware

### API Endpoints (18 total)

**Public (5):**
- GET /api/health — Health check
- GET /api/listings/:id/reviews — Paginated listing reviews (sort: newest/helpful/highest/lowest)
- GET /api/reviews/:id — Review detail with images and user vote
- GET /api/trending — Trending cars by period

**Authenticated (10):**
- POST /api/reviews — Create review (no duplicates per user per listing)
- PUT /api/reviews/:id — Update own review
- DELETE /api/reviews/:id — Soft delete own review (status → deleted)
- POST /api/reviews/:id/images — Add image (max 10 per review)
- DELETE /api/reviews/:id/images/:imageId — Delete image
- POST /api/reviews/:id/vote — Toggle vote (helpful/not_helpful, cannot vote own)
- PUT /api/reviews/:id/response — Seller response (seller/dealer/admin only)
- POST /api/favorites — Add favorite (no duplicates)
- DELETE /api/favorites/:id — Remove favorite
- GET /api/favorites — List favorites (paginated)
- POST /api/recent-views — Track/increment view
- GET /api/recent-views — Get recent views (limit 50)
- GET /api/recommendations — Personalized recommendations

**Admin (3):**
- GET /api/admin/reviews — List all reviews (filter by status, listing, rating)
- PUT /api/admin/reviews/:id/status — Update status (active/hidden)
- DELETE /api/admin/reviews/:id — Force delete with cascade

### Architecture Rules Followed
- ✅ NO foreign keys — all cross-table references use UUID string fields only
- ✅ Schema isolation — `search_path=interaction_schema,public` in DSN
- ✅ Golang Fiber v3 — `github.com/gofiber/fiber/v3`
- ✅ GORM — `gorm.io/gorm` with `gorm.io/driver/postgres`
- ✅ PKs use `gorm:"type:uuid;primaryKey;default:gen_random_uuid()"`
- ✅ Indexed UUID fields for user_id, car_listing_id, review_id
- ✅ Check constraints for enums (status, vote_type, period, source, rating 1-5)

### Business Logic Implemented
- Review: duplicate prevention (one review per user per listing), rating validation 1-5
- Vote: toggle behavior (same vote removes, different vote switches), cannot vote own review, count tracking
- Favorite: duplicate prevention (user_id + car_listing_id check)
- Recent view: auto-increment view_count on re-view, update last_viewed_at
- Recommendations: fallback generation from recent_views + trending when no stored recommendations
- Seller response: role check (seller/dealer/admin only)
- Admin: status update (active/hidden), force delete with cascade (images + votes)
- Image upload: max 10 images per review, ownership verification

### Status
- All 15 files created successfully
- Ready for `go mod tidy` and testing
- Work record written to agent-ctx
