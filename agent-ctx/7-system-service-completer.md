# Task ID: 7 - System Service Completer

## Work Record

### Files Created (2)
1. `/microservices/system-service/internal/routes/routes.go` — All route definitions
2. `/microservices/system-service/cmd/server/main.go` — Server entry point

### Analysis Performed
- Read all 5 model files to extract 14 model struct names for AutoMigrate
- Read all 5 controller files to map handler function signatures
- Read ws_handler.go to understand WebSocket hub interface and `HandleWebSocket(jwtSecret)` signature
- Read user-service cmd/server/main.go for reference pattern
- Read go.mod for module name (`automarket-system-service`) and dependencies
- Read .env for default config values

### Key Decisions
- **Module**: `automarket-system-service` (from go.mod)
- **Port**: 8006 (from .env PORT var, fallback "8006")
- **DB Schema**: `system_schema` (from .env DB_SCHEMA var)
- **JWT Middleware**: Inline implementation using `golang-jwt/jwt/v5` directly (no shared pkg)
- **Rate Limiter**: Sliding window, 100 req/min
- **WebSocket**: Uses `github.com/gofiber/contrib/websocket` (in go.mod deps)
- **Banner**: ASCII art service banner on startup

### Route Structure
- **Public**: Analytics tracking (5 endpoints), system settings (1 endpoint)
- **WebSocket**: /ws/chat with upgrade middleware
- **Auth (JWT)**: Conversations (7 endpoints), Notifications (4 endpoints)
- **Admin (JWT + role)**: Analytics (6 endpoints), Activity logs (1), Notifications (4), Settings (3)

### Models Migrated (14)
Conversation, Message, MessageAttachment, Notification, UserNotification, NotificationTemplate, NotificationLog, AnalyticsEvent, AnalyticsPageView, AnalyticsClick, AnalyticsConversion, SearchLog, ActivityLog, SystemSetting
