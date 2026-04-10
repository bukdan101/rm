const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, PageNumber, PageBreak,
  BorderStyle, WidthType, ShadingType, TableOfContents, SectionType,
  NumberFormat,
} = require("docx");

// ── Palette: GO-1 Graphite Orange (Tech Proposal / PRD) ──
const P = {
  primary: "1A2330",
  body: "000000",
  secondary: "607080",
  accent: "D4875A",
  surface: "FDF8F3",
};
const c = (hex) => hex.replace("#", "");

const coverPalette = {
  bg: "1A2330",
  primary: "FFFFFF",
  accent: "D4875A",
  cover: { titleColor: "FFFFFF", subtitleColor: "B0B8C0", metaColor: "90989F", footerColor: "687078" },
  table: { headerBg: "D4875A", headerText: "FFFFFF", accentLine: "D4875A", innerLine: "DDD0C8", surface: "F8F0EB" },
};

const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

// ── Helper: heading ──
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 200 },
    children: [new TextRun({ text, bold: true, size: 32, color: c(P.primary), font: { ascii: "Calibri", eastAsia: "SimHei" } })],
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, bold: true, size: 28, color: c(P.primary), font: { ascii: "Calibri", eastAsia: "SimHei" } })],
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, size: 24, color: c(P.primary), font: { ascii: "Calibri", eastAsia: "SimHei" } })],
  });
}

function body(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
  });
}

function bodyNoIndent(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { line: 312, after: 80 },
    children: [new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
  });
}

function bullet(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { line: 312, after: 40 },
    indent: { left: 480, hanging: 240 },
    children: [new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
  });
}

function boldBody(label, text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 480 },
    spacing: { line: 312, after: 80 },
    children: [
      new TextRun({ text: label, bold: true, size: 24, color: c(P.body), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } }),
      new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } }),
    ],
  });
}

// ── Table builder ──
function makeTable(headers, rows) {
  const t = coverPalette.table;
  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: headers.map((h) =>
      new TableCell({
        shading: { type: ShadingType.CLEAR, fill: t.headerBg },
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: h, bold: true, size: 21, color: t.headerText, font: { ascii: "Calibri", eastAsia: "SimHei" } })] })],
      })
    ),
  });
  const dataRows = rows.map((row, idx) =>
    new TableRow({
      cantSplit: true,
      children: row.map((cell) =>
        new TableCell({
          shading: idx % 2 === 0 ? { type: ShadingType.CLEAR, fill: t.surface } : { type: ShadingType.CLEAR, fill: "FFFFFF" },
          margins: { top: 50, bottom: 50, left: 120, right: 120 },
          children: [new Paragraph({ spacing: { line: 280 }, children: [new TextRun({ text: String(cell), size: 20, color: c(P.body), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })] })],
        })
      ),
    })
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: t.accentLine },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: t.accentLine },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: t.innerLine },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [headerRow, ...dataRows],
  });
}

// ── Cover (R4 Top Color Block variant) ──
function buildCover() {
  const title = "AutoMarket Indonesia";
  const subtitle = "Microservice Architecture Blueprint";
  const metaLines = [
    "Version 2.0 | June 2025",
    "6 Microservices | No Foreign Key | Schema Isolation",
    "Technology: Golang Fiber v3 | PostgreSQL | GORM",
    "Deployment: Google Cloud Run",
  ];

  const rows = [];
  // Color block area
  rows.push(
    new TableRow({
      height: { value: 400, rule: "exact" },
      children: [new TableCell({
        borders: allNoBorders,
        shading: { type: ShadingType.CLEAR, fill: coverPalette.accent },
        children: [new Paragraph({ children: [] })],
      })],
    })
  );

  // Spacer
  rows.push(
    new TableRow({
      height: { value: 2200, rule: "exact" },
      children: [new TableCell({
        borders: allNoBorders,
        shading: { type: ShadingType.CLEAR, fill: coverPalette.bg },
        children: [new Paragraph({ children: [] })],
      })],
    })
  );

  // Title
  rows.push(
    new TableRow({
      height: { value: 1200, rule: "exact" },
      children: [new TableCell({
        borders: allNoBorders,
        shading: { type: ShadingType.CLEAR, fill: coverPalette.bg },
        margins: { left: 1200, right: 1200 },
        verticalAlign: "top",
        children: [
          new Paragraph({
            spacing: { line: 920, lineRule: "atLeast" },
            children: [new TextRun({ text: title, bold: true, size: 56, color: coverPalette.cover.titleColor, font: { ascii: "Calibri", eastAsia: "SimHei" } })],
          }),
          new Paragraph({
            spacing: { before: 120 },
            children: [new TextRun({ text: subtitle, size: 28, color: coverPalette.cover.subtitleColor, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
          }),
        ],
      })],
    })
  );

  // Spacer
  rows.push(
    new TableRow({
      height: { value: 800, rule: "exact" },
      children: [new TableCell({
        borders: allNoBorders,
        shading: { type: ShadingType.CLEAR, fill: coverPalette.bg },
        children: [new Paragraph({ children: [] })],
      })],
    })
  );

  // Meta lines
  const metaParas = metaLines.map(
    (line) =>
      new Paragraph({
        spacing: { line: 360, after: 60 },
        children: [new TextRun({ text: line, size: 20, color: coverPalette.cover.metaColor, font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
      })
  );
  rows.push(
    new TableRow({
      height: { value: 1600, rule: "exact" },
      children: [new TableCell({
        borders: allNoBorders,
        shading: { type: ShadingType.CLEAR, fill: coverPalette.bg },
        margins: { left: 1200, right: 1200 },
        verticalAlign: "top",
        children: metaParas,
      })],
    })
  );

  // Bottom spacer
  rows.push(
    new TableRow({
      height: { value: 1000, rule: "exact" },
      children: [new TableCell({
        borders: allNoBorders,
        shading: { type: ShadingType.CLEAR, fill: coverPalette.bg },
        children: [new Paragraph({ children: [] })],
      })],
    })
  );

  // Bottom accent bar
  rows.push(
    new TableRow({
      height: { value: 200, rule: "exact" },
      children: [new TableCell({
        borders: allNoBorders,
        shading: { type: ShadingType.CLEAR, fill: coverPalette.accent },
        children: [new Paragraph({ children: [] })],
      })],
    })
  );

  return new Table({
    width: { size: 11906, type: WidthType.DXA },
    borders: allNoBorders,
    rows,
  });
}

// ══════════════════════════════════════════════════════════
// DOCUMENT CONTENT
// ══════════════════════════════════════════════════════════

const content = [];

// ── 1. EXECUTIVE SUMMARY ──
content.push(h1("1. Executive Summary"));
content.push(body("AutoMarket Indonesia is a comprehensive automotive marketplace platform designed for the Indonesian market. This document presents the complete microservice architecture blueprint for restructuring the existing monolithic backend into 6 independent microservices, each with its own domain, database schema, and deployment pipeline."));
content.push(body("The architecture decisions outlined in this document are based on extensive analysis of 101+ database models, 14 module files, and 25 existing REST API endpoints. The platform covers 9 core features: Marketplace, Inspection, Interaction, Transaction, Dealer Management, Chat, Notification, Analytics, and AI capabilities."));
content.push(h3("Key Architecture Decisions"));
content.push(bullet("6 independent microservices from day one (user-service, listing-service, interaction-service, transaction-service, business-service, system-service)"));
content.push(bullet("No Foreign Key constraints \u2014 all references use UUID strings for maximum decoupling"));
content.push(bullet("6 PostgreSQL schemas for data isolation (user_schema, listing_schema, interaction_schema, transaction_schema, business_schema, system_schema)"));
content.push(bullet("REST API first, GraphQL Gateway layer added later as unified entry point"));
content.push(bullet("All 101+ tables preserved, with 27 additional tables from PRD analysis"));
content.push(bullet("Google Cloud Run deployment \u2014 1 service = 1 container, auto-scaling"));
content.push(bullet("Google OAuth + JWT authentication with RBAC middleware"));
content.push(bullet("Target performance: <300ms cached, <1s non-cached, 10,000+ concurrent users"));

// ── 2. CURRENT STATE ANALYSIS ──
content.push(h1("2. Current State Analysis"));
content.push(h2("2.1 Existing Monolith Structure"));
content.push(body("The current backend is a Golang Fiber v3 monolithic application located at /backend/. It uses GORM as ORM with PostgreSQL, JWT for authentication, and Google OAuth integration. The application currently has 14 model files containing 101+ struct definitions and 25 REST API endpoints."));

content.push(makeTable(
  ["Module", "File", "Model Count", "Key Tables"],
  [
    ["Auth & Users", "user.go", "7", "User, Profile, UserSettings, UserSession, UserVerification, UserDocument, UserAddress"],
    ["Location", "location.go", "4", "Country, Province, City, District"],
    ["Vehicle Master", "vehicle.go", "12", "Brand, CarModel, CarVariant, CarGeneration, CarColor, CarBodyType, FeatureCategory, FeatureGroup, FeatureItem, Category"],
    ["Listing", "listing.go", "14", "CarListing, CarImage, CarVideo, CarDocument, CarFeatures, CarFeatureValue, CarRentalPrice, CarPriceHistory, CarStatusHistory, CarView, CarCompare, CarFavorite, RecentView, TrendingCar"],
    ["Inspection", "inspection.go", "6", "InspectionCategory, InspectionItem, CarInspection, InspectionResult, InspectionPhoto, InspectionCertificate"],
    ["Dealer", "dealer.go", "11", "Dealer, DealerBranch, DealerStaff, DealerDocument, DealerInventory, DealerReview, DealerOffer, DealerOfferHistory, DealerMarketplaceSetting, DealerMarketplaceFavorite, DealerMarketplaceView"],
    ["Payment", "payment.go", "11", "Payment, PaymentMethod, Transaction, Invoice, Order, OrderItem, EscrowAccount, Refund, Withdrawal, FeeSetting, Coupon"],
    ["Rental", "rental.go", "5", "RentalBooking, RentalAvailability, RentalPayment, RentalInsurance, RentalReview"],
    ["Review", "rental.go", "3", "CarReview, ReviewImage, ReviewVote"],
    ["Chat", "chat.go", "3", "Conversation, Message, MessageAttachment"],
    ["Notification", "notification.go", "5", "Notification, UserNotification, NotificationTemplate, NotificationLog, Broadcast"],
    ["Analytics", "analytics.go", "7", "AnalyticsEvent, AnalyticsPageView, AnalyticsClick, AnalyticsConversion, SearchLog, Recommendation, Favorites"],
    ["Token", "token.go", "6", "TokenPackage, TokenSetting, TokenTransaction, UserToken, TopupRequest, BoostSetting"],
    ["Admin", "admin.go", "7", "ActivityLog, Banner, SystemSetting, SupportTicket, SupportTicketMessage, Report, KycVerification"],
  ]
));

content.push(h2("2.2 Known Issues"));
content.push(bullet("Duplicate CarReview/ReviewImage/ReviewVote in review.go and rental.go \u2014 resolved by keeping rental.go version (full: with order_id, pros/cons, anonymous, seller_response)"));
content.push(bullet("Duplicate Favorites in analytics.go vs CarFavorite in listing.go \u2014 merged into single interaction_schema table"));
content.push(bullet("All GORM models contain ForeignKey relations that must be removed per No-FK principle"));
content.push(bullet("Cross-service dependencies exist (e.g., listing needs user info) requiring inter-service communication"));

content.push(h2("2.3 Technology Stack"));
content.push(makeTable(
  ["Component", "Technology", "Version"],
  [
    ["Backend Framework", "Golang Fiber", "v3"],
    ["ORM", "GORM", "Latest"],
    ["Database", "PostgreSQL", "15+"],
    ["Cache", "Redis (Memorystore)", "7+"],
    ["Authentication", "Google OAuth + JWT", "\u2014"],
    ["File Storage", "Google Cloud Storage", "\u2014"],
    ["Deployment", "Google Cloud Run", "\u2014"],
    ["Container", "Docker", "Latest"],
    ["API Protocol", "REST (now) / GraphQL (later)", "\u2014"],
  ]
));

// ── 3. ARCHITECTURE DECISIONS ──
content.push(h1("3. Architecture Decisions"));
content.push(h2("3.1 REST First, GraphQL Later"));
content.push(body("The initial implementation uses REST APIs for all 6 microservices. This allows rapid development and testing of each service independently. Once the 6 services are stable, a GraphQL Gateway layer will be added as a unified entry point that aggregates data from multiple services, resolving the N+1 query problem with DataLoader pattern."));
content.push(body("REST endpoints are organized per service domain. Inter-service communication uses synchronous HTTP calls. The GraphQL gateway will be implemented in a later phase using Apollo Federation or similar framework."));

content.push(h2("3.2 No Foreign Key Principle"));
content.push(body("All database relations use UUID string references instead of database-level Foreign Key constraints. This design maximizes service decoupling, allowing each microservice to manage its own data independently without being blocked by cross-service referential integrity."));
content.push(h3("Benefits:"));
content.push(bullet("Independent schema migrations per service \u2014 no cascading DDL locks"));
content.push(bullet("Each service owns its data completely \u2014 no cross-service JOIN needed at DB level"));
content.push(bullet("Easier data sharding and partitioning in the future"));
content.push(bullet("Simplified disaster recovery \u2014 restore one schema without FK violations"));
content.push(bullet("Better performance for bulk inserts and batch operations"));

content.push(h3("Trade-offs:"));
content.push(bullet("Application-level integrity checks required (e.g., verify referenced UUID exists before insert)"));
content.push(bullet("Orphan records possible if application logic fails \u2014 need periodic cleanup jobs"));
content.push(bullet("Manual cascade delete logic in application layer"));
content.push(bullet("More complex JOIN operations across schemas (handled by GraphQL gateway later)"));

content.push(h2("3.3 Schema Isolation Strategy"));
content.push(body("PostgreSQL schemas provide a lightweight form of multi-tenancy at the database level. Each microservice connects to the same PostgreSQL instance but only accesses its own schema. This approach balances operational simplicity (single database server) with data isolation (separate namespaces)."));

content.push(makeTable(
  ["PostgreSQL Schema", "Microservice", "Table Count", "Data Scope"],
  [
    ["user_schema", "user-service", "8", "Users, profiles, settings, sessions, KYC, documents, addresses"],
    ["listing_schema", "listing-service", "22", "Car listings, images, videos, documents, features, brands, models, inspections"],
    ["interaction_schema", "interaction-service", "10", "Reviews, favorites, views, comparisons, trending, recommendations"],
    ["transaction_schema", "transaction-service", "16", "Orders, payments, transactions, invoices, escrow, refunds, rentals, tokens"],
    ["business_schema", "business-service", "17", "Dealers, staff, branches, inventory, offers, coupons, support tickets"],
    ["system_schema", "system-service", "15", "Messages, notifications, analytics, broadcasts, banners, settings, reports"],
  ]
));

content.push(h2("3.4 Six Microservices from Day One"));
content.push(body("Based on the decision to build all 6 services from the start, each service follows a clean architecture pattern with the following internal structure:"));

content.push(makeTable(
  ["Directory", "Purpose"],
  [
    ["cmd/service-name/", "Entry point (main.go)"],
    ["internal/domain/", "GORM model structs (No FK)"],
    ["internal/repository/", "Database access layer"],
    ["internal/usecase/", "Business logic layer"],
    ["internal/handler/", "HTTP handlers (Fiber)"],
    ["internal/dto/", "Request/Response DTOs"],
    ["internal/middleware/", "JWT, RBAC, rate limiting"],
    ["internal/config/", "Configuration and environment"],
    ["pkg/database/", "Database connection setup"],
    ["pkg/utils/", "Shared utilities"],
    [" migrations/", "SQL migration files"],
    ["Dockerfile", "Container definition"],
    [".env.example", "Environment template"],
  ]
));

// ── 4. SERVICE DESIGN ──
content.push(h1("4. Service Design"));

// 4.1 User Service
content.push(h2("4.1 User Service"));
content.push(body("The User Service manages all user-related data and authentication. It handles Google OAuth, JWT token management, user profiles, KYC verification, and user settings. This is the most critical service as all other services depend on user identity for authorization."));
content.push(h3("Database Schema: user_schema"));
content.push(makeTable(
  ["Table", "Description", "Key Columns"],
  [
    ["users", "Core user accounts", "id, name, email, phone, role, avatar_url"],
    ["profiles", "Extended user profiles", "id, user_id, name, phone, avatar_url, role, email_verified, is_active"],
    ["user_settings", "Notification & language preferences", "id, user_id, email_notifications, push_notifications, language, currency"],
    ["user_sessions", "Active login sessions", "id, user_id, token, ip_address, user_agent, expires_at"],
    ["user_tokens", "JWT refresh tokens", "id, user_id, token_type, token, expires_at, is_revoked"],
    ["kyc_verifications", "KYC identity verification", "id, user_id, full_name, nik, ktp_photo_url, selfie_url, status"],
    ["user_documents", "KTP, SIM, NPWP documents", "id, user_id, document_type, document_number, document_url, verified"],
    ["user_addresses", "User shipping/service addresses", "id, user_id, label, address, city_id, province_id, postal_code, is_primary"],
  ]
));
content.push(h3("API Endpoints"));
content.push(makeTable(
  ["Method", "Path", "Auth", "Description"],
  [
    ["POST", "/api/auth/google", "No", "Initiate Google OAuth login"],
    ["POST", "/api/auth/google/callback", "No", "OAuth callback, returns JWT"],
    ["POST", "/api/auth/refresh", "Yes", "Refresh JWT token"],
    ["GET", "/api/users/me", "Yes", "Get current user profile"],
    ["PUT", "/api/users/me", "Yes", "Update user profile"],
    ["POST", "/api/users/kyc", "Yes", "Submit KYC verification"],
    ["GET", "/api/users/kyc", "Yes", "Get KYC status"],
    ["GET", "/api/users/settings", "Yes", "Get user settings"],
    ["PUT", "/api/users/settings", "Yes", "Update user settings"],
    ["GET", "/api/users/:id", "Public", "Get user public profile"],
    ["POST", "/api/users/addresses", "Yes", "Add user address"],
    ["PUT", "/api/users/addresses/:id", "Yes", "Update user address"],
  ]
));

// 4.2 Listing Service
content.push(h2("4.2 Listing Service"));
content.push(body("The Listing Service is the core of the marketplace. It manages car listings, vehicle master data (brands, models, variants), listing media (images, videos), vehicle features, inspection data, and rental pricing. This service handles the most complex data model with 22 tables across the listing_schema."));
content.push(h3("Database Schema: listing_schema"));
content.push(makeTable(
  ["Table", "Description", "Key Columns"],
  [
    ["car_listings", "Main listing table (45+ columns)", "id, user_id, dealer_id, brand_id, model_id, year, price_cash, status, slug"],
    ["car_images", "Listing photos", "id, car_listing_id, image_url, is_primary, display_order"],
    ["car_videos", "Listing videos", "id, car_listing_id, video_url, title, duration"],
    ["car_documents", "STNK, BPKB info", "id, car_listing_id, license_plate, stnk_status, bpkb_status"],
    ["car_features", "Boolean feature flags (19 fields)", "id, car_listing_id, sunroof, cruise_control, airbag, abs"],
    ["car_feature_values", "Dynamic feature key-values", "id, car_listing_id, feature_item_id, value, notes"],
    ["car_rental_prices", "Rental pricing per listing", "id, car_listing_id, price_per_day, price_per_week, price_per_month"],
    ["car_price_history", "Price change audit trail", "id, car_listing_id, price_cash_old, price_cash_new, changed_by"],
    ["car_status_history", "Status change audit trail", "id, car_listing_id, status_old, status_new, changed_by"],
    ["brands", "Vehicle brands (Toyota, Honda...)", "id, name, slug, logo_url, country, is_popular"],
    ["car_models", "Vehicle models per brand", "id, brand_id, name, slug, body_type, is_popular"],
    ["car_variants", "Model variants with specs", "id, model_id, name, engine_capacity, transmission, price_new"],
    ["car_generations", "Model generation years", "id, model_id, name, year_start, year_end"],
    ["car_colors", "Vehicle color catalog", "id, name, hex_code, is_metallic"],
    ["car_body_types", "Body type catalog", "id, name, description, icon_url"],
    ["car_fuel_types", "Fuel type catalog", "id, name, description"],
    ["car_transmissions", "Transmission catalog", "id, name, description"],
    ["feature_categories", "Feature category hierarchy", "id, name, icon, display_order"],
    ["feature_groups", "Feature group within category", "id, category_id, name, display_order"],
    ["feature_items", "Individual feature items", "id, group_id, name, description, icon"],
    ["car_views", "Detailed view tracking", "id, car_listing_id, viewer_id, ip_address, view_duration"],
    ["car_compares", "Comparison sessions", "id, user_id, car_listing_ids[]"],
  ]
));
content.push(h3("API Endpoints"));
content.push(makeTable(
  ["Method", "Path", "Auth", "Description"],
  [
    ["GET", "/api/listings", "Public", "Search & filter listings"],
    ["GET", "/api/listings/:id", "Public", "Get listing detail"],
    ["GET", "/api/listings/:id/related", "Public", "Get related listings"],
    ["POST", "/api/listings", "Yes", "Create new listing"],
    ["PUT", "/api/listings/:id", "Owner", "Update listing"],
    ["DELETE", "/api/listings/:id", "Owner", "Delete listing"],
    ["GET", "/api/brands", "Public", "List all brands"],
    ["GET", "/api/brands/:id/models", "Public", "Get models by brand"],
    ["GET", "/api/models/:id/variants", "Public", "Get variants by model"],
    ["GET", "/api/colors", "Public", "List car colors"],
    ["GET", "/api/body-types", "Public", "List body types"],
    ["GET", "/api/fuel-types", "Public", "List fuel types"],
    ["GET", "/api/transmissions", "Public", "List transmissions"],
  ]
));

// 4.3 Interaction Service
content.push(h2("4.3 Interaction Service"));
content.push(body("The Interaction Service manages all user-to-listing interactions including reviews, favorites, views, comparisons, trending algorithms, and personalized recommendations. This service is read-heavy and benefits significantly from Redis caching."));
content.push(h3("Database Schema: interaction_schema"));
content.push(makeTable(
  ["Table", "Description", "Key Columns"],
  [
    ["car_reviews", "User reviews for listings", "id, car_listing_id, user_id, order_id, rating, pros, cons, seller_response"],
    ["review_images", "Review photo attachments", "id, review_id, image_url, caption, display_order"],
    ["review_votes", "Helpful/not helpful votes", "id, review_id, user_id, vote_type"],
    ["car_favorites", "User saved listings", "id, user_id, car_listing_id, notes"],
    ["recent_views", "User recently viewed", "id, user_id, car_listing_id, view_count, last_viewed_at"],
    ["trending_cars", "Trending algorithm results", "id, car_listing_id, period, view_count, score, rank"],
    ["recommendations", "Personalized recommendations", "id, user_id, car_listing_id, score, reason, source"],
    ["car_views", "View analytics per listing", "id, car_listing_id, viewer_id, ip_address, user_agent"],
    ["car_compares", "User comparison sessions", "id, user_id, car_listing_ids[]"],
    ["listing_reports", "User reports for listings", "id, reporter_id, entity_type, entity_id, reason, status"],
  ]
));

// 4.4 Transaction Service
content.push(h2("4.4 Transaction Service"));
content.push(body("The Transaction Service handles all financial operations including orders, payments, escrow management, invoices, refunds, withdrawals, rental bookings, and the token/credit system. This is the most sensitive service requiring strict data integrity and audit trails."));
content.push(h3("Database Schema: transaction_schema"));
content.push(makeTable(
  ["Table", "Description", "Key Columns"],
  [
    ["orders", "Purchase orders", "id, buyer_id, seller_id, car_listing_id, agreed_price, escrow_status"],
    ["order_items", "Order line items", "id, order_id, item_type, item_id, unit_price, total_price"],
    ["payments", "Payment records", "id, payment_number, order_id, payer_id, amount, payment_method, status"],
    ["payment_methods", "Saved payment methods", "id, user_id, method_type, provider, account_number, is_default"],
    ["transactions", "Transaction ledger", "id, transaction_number, order_id, type, amount, from_account, to_account"],
    ["invoices", "Invoice records", "id, invoice_number, order_id, items (JSONB), subtotal, taxes, total, status"],
    ["escrow_accounts", "Escrow hold/release", "id, order_id, buyer_id, seller_id, amount_held, status, release_conditions"],
    ["refunds", "Refund records", "id, refund_number, order_id, payment_id, amount, reason, status"],
    ["withdrawals", "Seller withdrawal requests", "id, user_id, amount, bank_name, bank_account_number, status"],
    ["fee_settings", "Platform fee configuration", "id, platform_fee_percent, transaction_fee, withdrawal_fee, min_withdrawal"],
    ["coupons", "Discount coupons", "id, code, name, discount_type, discount_value, usage_limit, used_count"],
    ["rental_bookings", "Rental reservations", "id, booking_number, car_listing_id, renter_id, pickup_date, return_date, total_amount"],
    ["rental_payments", "Rental payment records", "id, booking_id, payment_type, amount, payment_method, paid_at"],
    ["rental_availability", "Calendar availability", "id, car_listing_id, date, is_available, booking_id"],
    ["rental_insurance", "Rental insurance policies", "id, booking_id, insurance_provider, coverage_type, coverage_amount"],
    ["token_packages", "Token purchase packages", "id, name, tokens, price, discount_percentage, bonus_tokens"],
    ["token_transactions", "Token credit/debit ledger", "id, user_id, transaction_type, amount, balance_before, balance_after"],
    ["user_tokens", "User token balances", "id, user_id, balance, total_purchased, total_used"],
    ["topup_requests", "Token top-up requests", "id, user_id, amount, tokens, payment_proof_url, status"],
    ["boost_settings", "Listing boost configuration", "id, boost_type, name, price_tokens, duration_days"],
  ]
));

// 4.5 Business Service
content.push(h2("4.5 Business Service"));
content.push(body("The Business Service manages all dealer-related operations including dealer profiles, branches, staff management, dealer inventory, the B2B offer/negotiation system, marketplace settings, categories, and support ticket system."));
content.push(h3("Database Schema: business_schema"));
content.push(makeTable(
  ["Table", "Description", "Key Columns"],
  [
    ["dealers", "Dealer company profiles", "id, owner_id, name, slug, logo_url, phone, email, rating, verified"],
    ["dealer_branches", "Dealer branch offices", "id, dealer_id, name, address, city_id, phone, is_main"],
    ["dealer_staff", "Dealer team members", "id, dealer_id, user_id, role, can_edit, can_delete"],
    ["dealer_documents", "Business documents (NPWP, SIUP)", "id, dealer_id, document_type, document_url, verified"],
    ["dealer_inventory", "Dealer vehicle inventory", "id, dealer_id, car_listing_id, location, stock_status"],
    ["dealer_reviews", "Dealer reviews", "id, dealer_id, user_id, rating, title, comment, helpful_count"],
    ["dealer_offers", "B2B offer/negotiation", "id, dealer_id, car_listing_id, offer_price, status, counter_offer_price"],
    ["dealer_offer_histories", "Offer action history", "id, offer_id, action, previous_price, new_price, actor_id"],
    ["dealer_marketplace_settings", "Marketplace config", "id, token_cost_public, token_cost_dealer, default_offer_duration"],
    ["dealer_marketplace_favorites", "Dealer saved listings", "id, dealer_id, car_listing_id, staff_id"],
    ["dealer_marketplace_views", "Dealer view tracking", "id, dealer_id, car_listing_id, staff_id, view_duration"],
    ["banners", "Promotional banners", "id, title, image_url, link, position, is_active, start_date, end_date"],
    ["broadcasts", "Admin broadcast messages", "id, title, body, segment, scheduled_at, status"],
    ["categories", "Listing categories", "id, name, slug, icon_url, parent_id, is_featured"],
    ["coupons", "Discount coupons", "id, code, name, discount_type, discount_value, usage_limit"],
    ["support_tickets", "Support ticket system", "id, user_id, subject, category, priority, status, assigned_to"],
    ["support_ticket_messages", "Ticket conversation", "id, ticket_id, sender_id, is_admin, message"],
  ]
));

// 4.6 System Service
content.push(h2("4.6 System Service"));
content.push(body("The System Service handles all cross-cutting concerns including real-time chat/messaging, push/email/SMS notifications, analytics tracking, search logging, activity audit logs, system settings, and reports. This service supports WebSocket connections for real-time chat."));
content.push(h3("Database Schema: system_schema"));
content.push(makeTable(
  ["Table", "Description", "Key Columns"],
  [
    ["conversations", "Chat conversations", "id, car_listing_id, buyer_id, seller_id, last_message, status"],
    ["messages", "Chat messages", "id, conversation_id, sender_id, message, message_type, is_read"],
    ["message_attachments", "File attachments", "id, message_id, file_name, file_url, file_type, file_size"],
    ["notifications", "Notification content templates", "id, type, title, body, data (JSON), link"],
    ["user_notifications", "User notification status", "id, user_id, notification_id, is_read, clicked"],
    ["notification_templates", "Reusable templates", "id, type, name, subject, body, channels, is_active"],
    ["notification_logs", "Delivery tracking", "id, template_id, user_id, channel, status, error_message"],
    ["analytics_events", "Generic event tracking", "id, user_id, event_type, event_name, properties (JSONB)"],
    ["analytics_page_views", "Page view tracking", "id, user_id, page_type, page_id, page_url, time_on_page"],
    ["analytics_clicks", "Click tracking", "id, user_id, element_type, element_id, page_url, x_position"],
    ["analytics_conversions", "Conversion funnel", "id, user_id, conversion_type, funnel_step, funnel_complete"],
    ["search_logs", "Search query tracking", "id, user_id, query, filters (JSONB), results_count"],
    ["activity_logs", "System audit log", "id, user_id, action, entity_type, entity_id, old_data (JSON)"],
    ["system_settings", "Platform configuration", "id, key, value, type, group"],
    ["reports", "User-generated reports", "id, reporter_id, entity_type, entity_id, reason, status"],
  ]
));

// ── 5. INTER-SERVICE COMMUNICATION ──
content.push(h1("5. Inter-Service Communication"));
content.push(body("Since there are no Foreign Keys across schemas, data that spans multiple services requires inter-service communication. The current phase uses synchronous REST calls between services. Future phases will migrate to an event-driven architecture with Pub/Sub messaging."));

content.push(h2("5.1 REST Communication Pattern"));
content.push(body("Each service exposes internal REST endpoints that other services can call. Service discovery uses environment variables with service URLs. A shared middleware handles authentication token forwarding so that services can verify user identity from JWT tokens."));

content.push(makeTable(
  ["Scenario", "Source Service", "Target Service", "Data Needed"],
  [
    ["Listing detail page", "listing-service", "user-service", "Seller profile name, avatar, phone"],
    ["Listing detail page", "listing-service", "interaction-service", "Review count, average rating"],
    ["Dealer profile page", "business-service", "listing-service", "Dealer listing count, avg price"],
    ["Order creation", "transaction-service", "listing-service", "Listing price, status, seller_id"],
    ["Order creation", "transaction-service", "user-service", "Buyer/seller profile verification"],
    ["Chat creation", "system-service", "user-service", "Buyer/seller profile for display"],
    ["Notification send", "system-service", "user-service", "User settings (email/push preferences)"],
    ["Review creation", "interaction-service", "transaction-service", "Verify order exists (verified purchase)"],
    ["Recommendations", "interaction-service", "listing-service", "Available listings for scoring"],
  ]
));

content.push(h2("5.2 Event-Driven (Future Phase 3)"));
content.push(body("Phase 3 will introduce Google Cloud Pub/Sub for asynchronous event-driven communication. Events will be published when key actions occur:"));
content.push(bullet("listing.created \u2014 triggers recommendation update, analytics event"));
content.push(bullet("listing.sold \u2014 triggers payment release, notification to buyer/seller"));
content.push(bullet("order.completed \u2014 triggers review prompt, analytics conversion"));
content.push(bullet("user.kyc_approved \u2014 triggers notification, enables selling privileges"));
content.push(bullet("dealer_offer.accepted \u2014 triggers order creation, notification"));
content.push(bullet("payment.received \u2014 triggers escrow hold, notification"));

// ── 6. AUTHENTICATION & AUTHORIZATION ──
content.push(h1("6. Authentication & Authorization"));
content.push(h2("6.1 Google OAuth Flow"));
content.push(body("All authentication flows through the User Service. The frontend initiates Google OAuth login by redirecting to Google's consent screen. After successful authentication, Google returns an authorization code which the User Service exchanges for user tokens. The User Service then creates/updates the user record and issues a JWT access token (15-minute expiry) and a refresh token (7-day expiry)."));

content.push(h2("6.2 JWT Structure"));
content.push(body("The JWT payload contains: user ID (UUID), email, role (user/dealer/admin/inspector), and token expiry. The JWT is signed with HS256 using a server-side secret. Each microservice validates the JWT independently using the shared secret."));

content.push(h2("6.3 Role-Based Access Control (RBAC)"));
content.push(makeTable(
  ["Role", "Access Level", "Capabilities"],
  [
    ["buyer", "Basic user", "Browse listings, create favorites, send messages, submit KYC, make purchases"],
    ["seller", "Verified buyer", "All buyer + Create/edit listings, receive payments, manage orders"],
    ["dealer", "Business account", "All seller + Dealer management, staff, B2B offers, marketplace analytics"],
    ["admin", "Platform admin", "All dealer + Approve/reject KYC, manage users, platform settings, reports"],
    ["inspector", "Inspection staff", "View assigned inspections, create/update inspection results"],
  ]
));

// ── 7. PERFORMANCE & SCALABILITY ──
content.push(h1("7. Performance & Scalability"));
content.push(h2("7.1 Performance Targets"));
content.push(makeTable(
  ["Metric", "Target", "Strategy"],
  [
    ["Cached API Response", "< 300ms", "Redis caching for hot data (listings, brands, categories)"],
    ["Non-Cached API Response", "< 1s", "Database query optimization, connection pooling, indexing"],
    ["Concurrent Users", "10,000+", "Cloud Run auto-scaling, connection pooling (PgBouncer)"],
    ["Listing Search", "< 500ms", "PostgreSQL full-text search, GIN indexes on JSONB fields"],
    ["Chat Message Delivery", "< 200ms", "WebSocket (Socket.IO) for real-time, Redis pub/sub"],
    ["Image Upload", "< 2s", "Direct upload to Google Cloud Storage, CDN delivery"],
  ]
));

content.push(h2("7.2 Caching Strategy"));
content.push(body("Redis (Google Cloud Memorystore) provides caching at multiple levels:"));
content.push(bullet("L1 \u2014 Application-level in-memory cache for configuration and hot data (TTL: 5 min)"));
content.push(bullet("L2 \u2014 Redis cache for listing search results, brand/model catalogs, user profiles (TTL: 15-60 min)"));
content.push(bullet("L3 \u2014 CDN cache for static assets (images, videos, documents) via Google Cloud CDN"));
content.push(body("Cache invalidation follows a write-through pattern: when data is updated, the cache is invalidated immediately and the next read repopulates it."));

content.push(h2("7.3 Database Optimization"));
content.push(bullet("Connection pooling via PgBouncer (max 100 connections per service)"));
content.push(bullet("Strategic indexing on all foreign key UUID columns, status columns, and search fields"));
content.push(bullet("GIN indexes on JSONB columns for feature search and analytics properties"));
content.push(bullet("Partitioning for high-volume tables (analytics_events, car_views) by month"));
content.push(bullet("Read replicas for reporting and analytics queries (future)"));

content.push(h2("7.4 Cloud Run Deployment"));
content.push(body("Each microservice is deployed as a separate Cloud Run service. Google Cloud Run provides automatic scaling based on request volume, with the following configuration:"));
content.push(bullet("Min instances: 1 (always warm for critical services: user, listing)"));
content.push(bullet("Max instances: 100 (auto-scale based on CPU/memory utilization)"));
content.push(bullet("CPU: 2 vCPU, Memory: 4GB per instance (configurable per service)"));
content.push(bullet("Concurrency: 80 requests per instance"));
content.push(bullet("Timeout: 300 seconds (5 minutes)"));
content.push(bullet("Health check: /api/health endpoint on each service"));

// ── 8. IMPLEMENTATION ROADMAP ──
content.push(h1("8. Implementation Roadmap"));
content.push(body("The implementation follows a phased approach, building all 6 services simultaneously but prioritizing the critical path services first."));

content.push(h2("8.1 Phase 1: Foundation (Weeks 1-2)"));
content.push(bullet("Set up 6 service project structures with clean architecture templates"));
content.push(bullet("Create shared packages: database connection, JWT middleware, error handling, response helpers"));
content.push(bullet("Define all GORM models with No-FK UUID references per service"));
content.push(bullet("Set up PostgreSQL with 6 schemas and run initial migrations"));
content.push(bullet("Configure Docker Compose for local development with all 6 services + PostgreSQL + Redis"));
content.push(bullet("Set up CI/CD pipeline for automated testing and deployment"));

content.push(h2("8.2 Phase 2: Core Services (Weeks 3-4)"));
content.push(bullet("User Service: Google OAuth, JWT, profile CRUD, KYC submission"));
content.push(bullet("Listing Service: Car listing CRUD, brand/model/variant catalogs, image upload"));
content.push(bullet("Basic inter-service communication (listing detail with user info)"));
content.push(bullet("Integration tests for auth flow and listing creation flow"));

content.push(h2("8.3 Phase 3: Transaction & Business (Weeks 5-6)"));
content.push(bullet("Transaction Service: Order creation, payment processing, escrow management"));
content.push(bullet("Business Service: Dealer registration, staff management, inventory"));
content.push(bullet("Token System: Package purchase, balance management, listing fee deduction"));
content.push(bullet("B2B Offer System: Dealer marketplace offers, counter-offers, negotiation"));

content.push(h2("8.4 Phase 4: Interaction & System (Weeks 7-8)"));
content.push(bullet("Interaction Service: Reviews, favorites, trending, recommendations"));
content.push(bullet("System Service: Real-time chat (WebSocket), notifications, analytics"));
content.push(bullet("Inspection System: 160-point inspection form, PDF certificate generation"));
content.push(bullet("Rental System: Booking, availability calendar, payment"));

content.push(h2("8.5 Phase 5: GraphQL Gateway (Weeks 9-10)"));
content.push(bullet("GraphQL Gateway as unified API entry point"));
content.push(bullet("Federation schema linking all 6 services"));
content.push(bullet("DataLoader for N+1 query optimization"));
content.push(bullet("Subscription support for real-time updates"));
content.push(bullet("Rate limiting and query complexity analysis"));

content.push(h2("8.6 Phase 6: Production Hardening (Weeks 11-12)"));
content.push(bullet("Load testing (10,000+ concurrent users)"));
content.push(bullet("Security audit (OWASP top 10)"));
content.push(bullet("Monitoring setup (Cloud Monitoring, error reporting, alerting)"));
content.push(bullet("Disaster recovery plan and backup procedures"));
content.push(bullet("Documentation and runbooks"));

// ── 9. COMPLETE TABLE INVENTORY ──
content.push(h1("9. Complete Table Inventory"));
content.push(body("The following table provides the complete inventory of all 88 tables across the 6 PostgreSQL schemas, including the 27 additional tables identified during PRD analysis that were not in the original monolith."));

content.push(makeTable(
  ["#", "Schema", "Table", "Source", "Status"],
  [
    ["1", "user_schema", "users", "Original", "Keep"],
    ["2", "user_schema", "profiles", "Original", "Keep"],
    ["3", "user_schema", "user_settings", "Original", "Keep"],
    ["4", "user_schema", "user_sessions", "Original", "Keep"],
    ["5", "user_schema", "user_tokens", "Original", "Keep"],
    ["6", "user_schema", "kyc_verifications", "Original", "Keep"],
    ["7", "user_schema", "user_documents", "Original", "Keep"],
    ["8", "user_schema", "user_addresses", "Original", "Keep"],
    ["9", "listing_schema", "car_listings", "Original", "Keep"],
    ["10", "listing_schema", "car_images", "Original", "Keep"],
    ["11", "listing_schema", "car_videos", "Original", "Keep"],
    ["12", "listing_schema", "car_documents", "Original", "Keep"],
    ["13", "listing_schema", "car_features", "Original", "Keep"],
    ["14", "listing_schema", "car_feature_values", "Original", "Keep"],
    ["15", "listing_schema", "car_rental_prices", "Original", "Keep"],
    ["16", "listing_schema", "car_price_history", "Extra (PRD)", "New"],
    ["17", "listing_schema", "car_status_history", "Extra (PRD)", "New"],
    ["18", "listing_schema", "car_views", "Original", "Keep"],
    ["19", "listing_schema", "car_compares", "Original", "Keep"],
    ["20", "listing_schema", "brands", "Original", "Keep"],
    ["21", "listing_schema", "car_models", "Original", "Keep"],
    ["22", "listing_schema", "car_variants", "Original", "Keep"],
    ["23", "listing_schema", "car_generations", "Original", "Keep"],
    ["24", "listing_schema", "car_colors", "Original", "Keep"],
    ["25", "listing_schema", "car_body_types", "Original", "Keep"],
    ["26", "listing_schema", "car_fuel_types", "Original", "Keep"],
    ["27", "listing_schema", "car_transmissions", "Original", "Keep"],
    ["28", "listing_schema", "feature_categories", "Original", "Keep"],
    ["29", "listing_schema", "feature_groups", "Original", "Keep"],
    ["30", "listing_schema", "feature_items", "Original", "Keep"],
    ["31", "listing_schema", "inspection_categories", "Original", "Keep"],
    ["32", "listing_schema", "inspection_items", "Original", "Keep"],
    ["33", "listing_schema", "car_inspections", "Original", "Keep"],
    ["34", "listing_schema", "inspection_results", "Original", "Keep"],
    ["35", "listing_schema", "inspection_photos", "Extra (PRD)", "New"],
    ["36", "listing_schema", "inspection_certificates", "Extra (PRD)", "New"],
    ["37", "interaction_schema", "car_reviews", "rental.go", "Keep (full version)"],
    ["38", "interaction_schema", "review_images", "rental.go", "Keep (full version)"],
    ["39", "interaction_schema", "review_votes", "rental.go", "Keep (full version)"],
    ["40", "interaction_schema", "car_favorites", "Merged", "Keep (merge from analytics)"],
    ["41", "interaction_schema", "recent_views", "Original", "Keep"],
    ["42", "interaction_schema", "trending_cars", "Original", "Keep"],
    ["43", "interaction_schema", "recommendations", "Original", "Keep"],
    ["44", "interaction_schema", "listing_reports", "Extra (PRD)", "New"],
    ["45", "transaction_schema", "orders", "Original", "Keep"],
    ["46", "transaction_schema", "order_items", "Original", "Keep"],
    ["47", "transaction_schema", "payments", "Original", "Keep"],
    ["48", "transaction_schema", "payment_methods", "Extra (PRD)", "New"],
    ["49", "transaction_schema", "transactions", "Original", "Keep"],
    ["50", "transaction_schema", "invoices", "Original", "Keep"],
    ["51", "transaction_schema", "escrow_accounts", "Original", "Keep"],
    ["52", "transaction_schema", "refunds", "Original", "Keep"],
    ["53", "transaction_schema", "withdrawals", "Extra (PRD)", "New"],
    ["54", "transaction_schema", "fee_settings", "Extra (PRD)", "New"],
    ["55", "transaction_schema", "coupons", "Original", "Keep"],
    ["56", "transaction_schema", "rental_bookings", "Original", "Keep"],
    ["57", "transaction_schema", "rental_payments", "Original", "Keep"],
    ["58", "transaction_schema", "rental_availability", "Extra (PRD)", "New"],
    ["59", "transaction_schema", "rental_insurance", "Original", "Keep"],
    ["60", "transaction_schema", "token_packages", "Original", "Keep"],
    ["61", "transaction_schema", "token_transactions", "Original", "Keep"],
    ["62", "transaction_schema", "user_tokens", "Original", "Keep"],
    ["63", "transaction_schema", "topup_requests", "Original", "Keep"],
    ["64", "transaction_schema", "boost_settings", "Original", "Keep"],
    ["65", "business_schema", "dealers", "Original", "Keep"],
    ["66", "business_schema", "dealer_branches", "Original", "Keep"],
    ["67", "business_schema", "dealer_staff", "Original", "Keep"],
    ["68", "business_schema", "dealer_documents", "Original", "Keep"],
    ["69", "business_schema", "dealer_inventory", "Original", "Keep"],
    ["70", "business_schema", "dealer_reviews", "Original", "Keep"],
    ["71", "business_schema", "dealer_offers", "Original", "Keep"],
    ["72", "business_schema", "dealer_offer_histories", "Original", "Keep"],
    ["73", "business_schema", "dealer_marketplace_settings", "Extra (PRD)", "New"],
    ["74", "business_schema", "dealer_marketplace_favorites", "Original", "Keep"],
    ["75", "business_schema", "dealer_marketplace_views", "Original", "Keep"],
    ["76", "business_schema", "banners", "Original", "Keep"],
    ["77", "business_schema", "broadcasts", "Original", "Keep"],
    ["78", "business_schema", "categories", "Original", "Keep"],
    ["79", "business_schema", "coupons (biz)", "Shared", "Keep"],
    ["80", "business_schema", "support_tickets", "Original", "Keep"],
    ["81", "business_schema", "support_ticket_messages", "Original", "Keep"],
    ["82", "system_schema", "conversations", "Original", "Keep"],
    ["83", "system_schema", "messages", "Original", "Keep"],
    ["84", "system_schema", "message_attachments", "Original", "Keep"],
    ["85", "system_schema", "notifications", "Original", "Keep"],
    ["86", "system_schema", "user_notifications", "Original", "Keep"],
    ["87", "system_schema", "notification_templates", "Original", "Keep"],
    ["88", "system_schema", "notification_logs", "Original", "Keep"],
    ["89", "system_schema", "analytics_events", "Original", "Keep"],
    ["90", "system_schema", "analytics_page_views", "Original", "Keep"],
    ["91", "system_schema", "analytics_clicks", "Original", "Keep"],
    ["92", "system_schema", "analytics_conversions", "Original", "Keep"],
    ["93", "system_schema", "search_logs", "Original", "Keep"],
    ["94", "system_schema", "activity_logs", "Original", "Keep"],
    ["95", "system_schema", "system_settings", "Original", "Keep"],
    ["96", "system_schema", "reports", "Original", "Keep"],
  ]
));

// ── 10. SUMMARY ──
content.push(h1("10. Summary"));
content.push(body("This blueprint defines a comprehensive microservice architecture for AutoMarket Indonesia, restructured from the existing monolithic backend into 6 independent services. The architecture prioritizes service autonomy through the No Foreign Key principle, data isolation through PostgreSQL schemas, and scalable deployment through Google Cloud Run."));
content.push(body("The 6 services (User, Listing, Interaction, Transaction, Business, and System) collectively manage 96 database tables across 6 PostgreSQL schemas, covering 9 core platform features. The implementation roadmap spans 12 weeks across 6 phases, from foundation setup to production hardening."));
content.push(body("Key architectural strengths include: independent deployability of each service, clear domain boundaries enabling parallel development, performance optimization through strategic caching and indexing, and a clear path from REST APIs to a unified GraphQL gateway in the final phase."));

// ══════════════════════════════════════════════════════════
// ASSEMBLE DOCUMENT
// ══════════════════════════════════════════════════════════

const doc = new Document({
  creator: "AutoMarket Indonesia",
  title: "AutoMarket Indonesia - Microservice Architecture Blueprint",
  description: "Comprehensive architecture document for 6-microservice restructuring",
  styles: {
    default: {
      document: {
        run: { font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 24, color: c(P.body) },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 32, bold: true, color: c(P.primary) },
        paragraph: { spacing: { before: 480, after: 200 } },
      },
      heading2: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 28, bold: true, color: c(P.primary) },
        paragraph: { spacing: { before: 360, after: 160 } },
      },
      heading3: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 24, bold: true, color: c(P.primary) },
        paragraph: { spacing: { before: 240, after: 120 } },
      },
    },
  },
  sections: [
    // Section 1: Cover
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838, orientation: "portrait" },
          margin: { top: 0, bottom: 0, left: 0, right: 0 },
        },
      },
      children: [buildCover()],
    },
    // Section 2: TOC
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
        },
        page: { pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN } },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: "AutoMarket Indonesia | Microservice Architecture Blueprint", size: 16, color: "808080", font: { ascii: "Calibri" } })],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "PAGE \\* ROMAN \\* MERGEFORMAT", size: 18, color: "808080", font: { ascii: "Calibri" } }),
              ],
            }),
          ],
        }),
      },
      children: [
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "Table of Contents", bold: true, size: 32, color: c(P.primary), font: { ascii: "Calibri", eastAsia: "SimHei" } })],
        }),
        new TableOfContents("TOC", {
          hyperlink: true,
          headingStyleRange: "1-3",
        }),
        new Paragraph({ children: [new PageBreak()] }),
      ],
    },
    // Section 3: Body
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1440, bottom: 1440, left: 1701, right: 1417 },
        },
        page: { pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL } },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: "AutoMarket Indonesia | Microservice Architecture Blueprint", size: 16, color: "808080", font: { ascii: "Calibri" } })],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "PAGE \\* arabic \\* MERGEFORMAT", size: 18, color: "808080", font: { ascii: "Calibri" } }),
              ],
            }),
          ],
        }),
      },
      children: content,
    },
  ],
});

// ── Generate DOCX ──
const OUTPUT = "/home/z/my-project/docs/AutoMarket_Microservice_Architecture_Blueprint.docx";
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUTPUT, buf);
  console.log("Document generated: " + OUTPUT);
});
