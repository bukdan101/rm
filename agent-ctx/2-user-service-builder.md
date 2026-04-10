# Task ID: 2 - User Service Builder

## Work Record

### Files Created (17 files)

#### Project Setup
- `go.mod` — Module `automarket-user-service`, Go 1.24, Fiber v3 + GORM + JWT
- `Dockerfile` — Multi-stage Go build (golang:1.24-alpine → alpine)
- `.env` — Default environment variables for local dev

#### Entry Point
- `cmd/server/main.go` — Fiber app setup, DB connection with retry, auto-migrate, JWT middleware, admin middleware, config from env, health check endpoint

#### Models (8 files — NO foreign keys)
1. `internal/models/profile.go` — Profile model (uuid PK, name, phone, avatar, role, verified flags, active, last_login)
2. `internal/models/user_settings.go` — UserSettings (uuid PK, user_id index, notifications, language, currency)
3. `internal/models/user_session.go` — UserSession (uuid PK, user_id index, token, ip, user_agent, expires_at)
4. `internal/models/user_token.go` — UserToken (uuid PK, user_id uniqueIndex, balance, totals)
5. `internal/models/kyc.go` — KycVerification (uuid PK, user_id uniqueIndex, full KYC fields, location UUIDs, status, review fields)
6. `internal/models/user_verification.go` — UserVerification (uuid PK, user_id index, verification_type, code, verified, expires_at)
7. `internal/models/user_address.go` — UserAddress (uuid PK, user_id index, label, address, city/province UUIDs, is_primary)
8. `internal/models/user_document.go` — UserDocument (uuid PK, user_id index, document_type, document_number, document_url, verified)

#### Controllers (4 files)
- `internal/controllers/auth_controller.go` — GoogleLogin, GoogleCallback (with user auto-create), GetProfile, UpdateProfile, RefreshToken
- `internal/controllers/user_controller.go` — GetUser, GetSettings, UpdateSettings, GetAddresses, AddAddress, UpdateAddress, DeleteAddress, GetDocuments, UploadDocument, ListUsers (paginated), UpdateUserRole
- `internal/controllers/kyc_controller.go` — SubmitKYC (create/update with validation), GetKYC, UpdateKYCStatus, ReviewKYC (admin), ListPendingKYC
- `internal/controllers/token_controller.go` — GetBalance (auto-create), GetTransactions (summary)
- `internal/controllers/jwt_helpers.go` — JWTBuilder and JWTParser (signing and parsing tokens)

#### Routes
- `internal/routes/routes.go` — All 24 API endpoints organized into Public, Authenticated, and Admin groups

### Architecture Decisions
- **NO Foreign Keys**: All cross-table references use plain `*uuid.UUID` fields with `gorm:"type:uuid;index"` — no `gorm:"foreignKey"` annotations
- **Schema Isolation**: All tables use `user_schema` via `search_path` in PostgreSQL DSN
- **JWT Middleware**: Implemented inline in main.go (compatible with shared pkg pattern)
- **Admin Middleware**: Checks `user_role` from JWT claims
- **Error Messages**: All in Bahasa Indonesia
- **Response Format**: Consistent `{"success": true/false, "message": "...", "data": {...}}`
- **Time**: `time.Time` for created_at/updated_at (not pointers), `*time.Time` for nullable timestamps

### API Endpoints Summary
**Public (3):**
- POST /api/auth/google, POST /api/auth/google/callback, POST /api/auth/refresh

**Authenticated JWT (16):**
- GET /api/auth/me, PUT /api/auth/profile
- GET /api/users/:id, GET/PUT /api/users/:id/settings
- GET/POST /api/users/:id/kyc, PUT /api/users/:id/kyc/:status
- GET/POST /api/users/:id/addresses, PUT/DELETE /api/users/:id/addresses/:addressId
- GET/POST /api/users/:id/documents
- GET /api/tokens/balance, GET /api/tokens/transactions

**Admin (4):**
- GET /api/admin/users, PUT /api/admin/users/:id/role
- PUT /api/admin/kyc/:id/review, GET /api/admin/kyc/pending

**Utility (1):**
- GET /health

### Note
- Go is not installed in this environment, so `go mod tidy && go build ./...` could not be verified
- The `exchangeGoogleCode` and `getGoogleUserInfo` methods are placeholder implementations that need real HTTP calls to Google endpoints in production
