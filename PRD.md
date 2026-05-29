# 📋 PRODUCT REQUIREMENTS DOCUMENT (PRD)
## AutoMarket — Marketplace Mobil Terpercaya Indonesia

> **Versi:** 1.0  
> **Tanggal:** Maret 2026  
> **Platform:** Web Application (Mobile-First Responsive)  
> **Tech Stack:** Next.js 16 · TypeScript · Tailwind CSS 4 · shadcn/ui · Supabase · Prisma  

---

## 1. EXECUTIVE SUMMARY

### 1.1 Visi Produk
AutoMarket adalah platform marketplace jual-beli mobil bekas terpercaya di Indonesia yang menggabungkan **sistem inspeksi 160 titik**, **AI Price Prediction**, dan **Dealer Marketplace** untuk menciptakan ekosistem otomotif yang transparan, aman, dan efisien.

### 1.2 Proposisi Nilai Utama
- 🔍 **Inspeksi 160 Titik** — Sistem pemeriksaan kendaraan komprehensif dengan grading A+ sampai E
- 🤖 **AI Price Prediction** — Prediksi harga berbasis AI menggunakan VLM (Vision Language Model) untuk analisis foto kendaraan
- 🏪 **Dual Marketplace** — Marketplace Umum (C2C) + Dealer Marketplace (B2B) dengan sistem penawaran
- 🔐 **Escrow & KYC** — Transaksi aman dengan escrow dan verifikasi identitas KTP
- 💰 **Token Economy** — Sistem kredit/token untuk akses fitur premium

### 1.3 Target Pengguna
| Segmen | Deskripsi | Kebutuhan Utama |
|--------|-----------|-----------------|
| **Seller (Pemilik Mobil)** | Individu yang ingin menjual mobil bekas | Inspeksi transparan, harga wajar, jangkauan pembeli luas |
| **Buyer (Pembeli)** | Individu yang ingin membeli mobil bekas | Kualitas terjamin, inspeksi lengkap, harga pasar |
| **Dealer** | Showroom/dealer mobil profesional | Inventori, penawaran B2B, analitik penjualan |
| **Admin** | Operator platform | Moderasi, manajemen pengguna, pengaturan sistem |

---

## 2. PRODUCT ARCHITECTURE

### 2.1 System Architecture Overview
```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16)                      │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐  │
│  │ Landing  │ │Marketplace│ │Dashboard │ │  Admin Panel   │  │
│  │  Page    │ │  & Search │ │  (User)  │ │  (Management)  │  │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───────┬────────┘  │
│       │            │            │                │            │
│  ┌────▼────────────▼────────────▼────────────────▼────────┐  │
│  │              API Routes (80+ endpoints)                  │  │
│  │  Listings │ Marketplace │ Credits │ Inspections │ Admin │  │
│  └──────────────────────┬──────────────────────────────────┘  │
│                         │                                     │
│  ┌──────────────────────▼──────────────────────────────────┐  │
│  │              Business Logic Layer                         │  │
│  │  token-service │ dealer-offer-service │ landing-data     │  │
│  └──────────────────────┬──────────────────────────────────┘  │
│                         │                                     │
│  ┌──────────────────────▼──────────────────────────────────┐  │
│  │              Data Layer (Supabase + Prisma)               │  │
│  │  72 Tables │ Auth │ Storage │ Realtime                   │  │
│  └─────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Database Schema (72 Tables)
Project menggunakan **72 tabel** yang mencakup:

| Modul | Tabel Utama | Jumlah |
|-------|-------------|--------|
| **User & Auth** | profiles, user_addresses, user_documents, user_verifications, user_notifications, user_credits, user_tokens, credit_transactions, token_transactions, token_balances | 10 |
| **Dealer** | dealers, dealer_branches, dealer_staff, dealer_reviews, dealer_offer_settings, dealer_registrations | 6 |
| **Kendaraan** | brands, car_models, car_variants, car_generations, car_colors | 5 |
| **Listing** | car_listings, car_images, car_videos, car_documents, car_features, car_rental_prices, car_favorites, car_price_histories, listing_boosts | 9 |
| **Inspeksi** | inspection_categories, inspection_items, car_inspections, inspection_results, inspection_bookings, inspection_pricing, certificate_purchases, ai_price_analysis | 8 |
| **Transaksi** | orders, payments, wallet_transactions | 3 |
| **Marketplace** | dealer_marketplace_listings, dealer_marketplace_offers, dealer_marketplace_offer_history, dealer_marketplace_favorites, dealer_marketplace_settings | 5 |
| **Chat** | conversations, messages, message_attachments | 3 |
| **Review** | car_reviews, review_images | 2 |
| **Lokasi** | countries, provinces, cities, districts, villages | 5 |
| **KYC** | kyc_verifications | 1 |
| **Admin** | admin_settings, admin_activity_logs, token_settings, fee_settings, boost_features, credit_packages, banners, coupons | 8 |
| **Lainnya** | (tabel pendukung lainnya) | 7 |

### 2.3 Tech Stack Detail
| Komponen | Teknologi | Versi |
|----------|-----------|-------|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS + shadcn/ui | 4.x |
| Database | Supabase (PostgreSQL) + Prisma (SQLite dev) | - |
| Auth | Supabase Auth (Google OAuth) | - |
| Charts | Recharts | 2.x |
| Animation | Framer Motion | 12.x |
| State | React hooks + Zustand | 5.x |
| Forms | React Hook Form + Zod | 7.x / 4.x |
| AI | z-ai-web-dev-sdk (VLM, LLM) | 0.0.18 |

---

## 3. FEATURE SPECIFICATIONS

### 3.1 LANDING PAGE (`/`)
**Prioritas:** P0 — Core

| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| Hero Banner Iklan | Banner iklan 2/3 + 1/3 layout dengan AdBanner | ✅ |
| Statistik Platform | 10K+ mobil, 8.5K+ inspeksi, 6.2K+ transaksi, 500+ dealer | ✅ |
| Kategori Brand | 31 brand mobil dengan logo dan model sub-kategori | ✅ |
| Filter Body Type | 11 tipe body (SUV, MPV, Sedan, dll) dengan ikon SVG custom | ✅ |
| Premium Listings | Section khusus listing yang di-boost | ✅ |
| Flash Sale | Listing featured dengan badge Premium | ✅ |
| Auction Section | Lelang mobil dengan countdown timer real-time | ✅ |
| Listing Terbaru | Grid listing terbaru dengan skeleton loading | ✅ |
| Listing Populer | Listing populer minggu ini | ✅ |
| Sponsor Logos | Grid 31 logo brand sponsor | ✅ |
| CTA Section | Call-to-action "Mulai jualan di AutoMarket" | ✅ |
| Listing Detail View | Detail listing inline via `?id=` parameter | ✅ |

### 3.2 AUTHENTICATION (`/auth`)
**Prioritas:** P0 — Core

| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| Google OAuth | Login/register via Google Sign-In (Supabase Auth) | ✅ |
| Auto Profile Creation | Otomatis buat profil saat pertama kali login | ✅ |
| Redirect Support | `?redirect=` parameter untuk redirect setelah login | ✅ |
| Role System | 4 role: admin > dealer > seller > buyer | ✅ |
| Info Page | Benefits grid (inspeksi, escrow, free listing, 500+ dealer) | ✅ |

### 3.3 MARKETPLACE
**Prioritas:** P0 — Core

#### 3.3.1 Public Marketplace (`/marketplace`)
| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| Search & Filter | Search bar + 9 filter dimensions | ✅ |
| Filter Panel | Desktop sidebar + mobile sheet | ✅ |
| Brand & Body Type | Filter berdasarkan 31 brand & 11 body type | ✅ |
| Sort Options | Terbaru, termurah, termahal, mileage, tahun | ✅ |
| Grid/List View | Toggle tampilan grid dan list | ✅ |
| Featured Section | Listing featured di atas | ✅ |
| Pagination | Paginasi halaman listing | ✅ |

#### 3.3.2 Dealer Marketplace (`/dealer-marketplace`)
| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| Workflow Info | 4-tab info (Workflow, Modes, Tokens, Settings) | ✅ |
| 3 Selling Modes | Bidding, Best Offer, Direct Deal | ✅ |
| Token Cost Comparison | Perbandingan biaya token Dealer vs Public | ✅ |
| Commission Info | Info komisi (free selama promo) | ✅ |

#### 3.3.3 Listing Detail (`/?id=` atau `/listing/[slug]`)
| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| Image Gallery | Carousel foto dengan thumbnail navigation | ✅ |
| Spesifikasi Kendaraan | Harga, dokumen, inspeksi, lokasi, penjual | ✅ |
| Inspection Report | Laporan inspeksi 160 titik per kategori | ✅ |
| Contact Info | Privacy-aware (WA/Phone untuk publik, offer untuk dealer) | ✅ |
| Favorite Toggle | Tambah/hapus favorit | ✅ |
| Dealer Offer Modal | Submit penawaran dengan opsi financing & pickup | ✅ |
| Social Share | Share ke social media | ✅ |
| Related Products | Listing terkait | ✅ |
| Compare | Bandingkan hingga 4 mobil | ✅ |

### 3.4 CREATE LISTING (`/listing/create`)
**Prioritas:** P0 — Core

**Flow:** Auth Check → KYC Gate → Credit Check → Multi-Step Form → Submit

| Step | Fitur | Deskripsi |
|------|-------|-----------|
| **Gate** | Auth Check | Redirect ke login jika belum auth |
| **Gate** | KYC Verification | Tampilkan form KYC jika belum verified |
| **Gate** | Credit Balance | Tampilkan saldo kredit (1 kredit/listing) |
| **Step 1** | Basic Info | Brand, Model, Tahun, Judul, Kondisi, Harga |
| **Step 2** | Details | BBM, Transmisi, Mileage, Warna, Lokasi |
| **Step 3** | Marketplace | Pilih visibility: Umum (3 token) / Dealer (5 token) / Both (8 token) |
| **Step 4** | Photos | Upload foto kendaraan (multiple) |
| **Step 5** | Review | Review & submit listing |

### 3.5 DASHBOARD USER (`/dashboard`)
**Prioritas:** P0 — Core

#### 3.5.1 Dashboard Home (`/dashboard`)
| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| Stats Cards | 4 kartu: saldo wallet, credits, listing aktif, orders | ✅ |
| Admin Access | Cepat akses admin panel jika role=admin | ✅ |
| Quick Actions | Jual mobil, beli kredit, AI prediction, pesan | ✅ |
| Notifications | 5 notifikasi terbaru | ✅ |
| Analytics Charts | 3 tab: Overview, Token Usage, Listings | ✅ |
| Recent Transactions | Transaksi kredit terbaru | ✅ |
| Recent Orders | Order terbaru | ✅ |
| Recent Listings | Listing terbaru | ✅ |

#### 3.5.2 Dashboard Sub-Pages

| Halaman | Fitur Utama |
|---------|-------------|
| **Notifications** | Filter all/unread, mark read (single/bulk), 30s polling |
| **Predictions** | History prediksi AI, harga prediksi, confidence score, grade |
| **Prediction Wizard** | 5-step: data kendaraan → foto → inspeksi → harga beli → hasil AI |
| **Wallet** | Saldo, transaksi, top-up, transfer, withdraw |
| **Tokens** | Beli token, 5 paket (50-1000), usage table, riwayat transaksi |
| **Credits** | Sistem kredit alternatif, 5 paket, registration bonus 500 |
| **Inspeksi** | 3-step wizard: pilih tipe → form 160 titik → hasil AI |
| **Offers** | 3-tab (aktif/diterima/riwayat), accept/reject/counter-offer |
| **Messages** | Chat real-time, conversation list, unread badges |
| **My Listings** | Filter status, edit/preview/boost/reactivate/delete |
| **Favorites** | Grid mobil favorit, view/message/remove |
| **KYC** | Upload KTP + selfie, 4 state (not_submitted/pending/approved/rejected) |
| **Settings** | Theme, notifikasi, bahasa (ID/EN), mata uang (IDR/USD) |
| **Profile** | Edit nama, telepon, kota, avatar |
| **Orders** | 4 stat cards, filter buyer/seller, status badges |
| **Withdraw** | Tarik dana ke rekening bank (6 bank Indonesia) |
| **Coupons** | Kupon promo aktif/expired |
| **Support** | FAQ + form kontak + info kontak |

### 3.6 DEALER SECTION (`/dealer`)
**Prioritas:** P1 — Important

| Halaman | Fitur Utama |
|---------|-------------|
| **Dealer Dashboard** | Stat penjualan, marketplace comparison, monthly chart, inquiries |
| **Inventory** | Kelola inventori, search, filter, grid/list view, boost/edit/delete |
| **Dealer Marketplace** | Browse & make offers pada listing, dealer-only access |
| **Stats** | Analitik detail, time range filter, charts, top cars, conversion rate |
| **Profile** | Edit profil dealer, cover photo, logo, jam operasional, verifikasi |
| **Offers** | Kelola penawaran masuk/keluar |
| **Reviews** | Review & rating dealer |
| **Team** | Kelola tim (owner/manager/sales/inspector), permissions |
| **Tokens** | Beli token dengan harga dealer |

### 3.7 ADMIN PANEL (`/admin`)
**Prioritas:** P1 — Important

| Halaman | Fitur Utama |
|---------|-------------|
| **Dashboard** | 8 stat cards, charts (revenue, user growth, token usage), quick actions |
| **Users** | Manajemen pengguna, ban/roles |
| **Dealer Approval** | Approve/reject pendaftaran dealer |
| **KYC Review** | Review dokumen KYC, approve/reject |
| **All Listings** | Moderasi listing, ban/feature |
| **Dealer Marketplace** | Pengaturan marketplace dealer |
| **Token Packages** | Konfigurasi paket token |
| **Duration Pricing** | Pricing durasi listing |
| **Boost Features** | Manajemen fitur boost |
| **Categories** | CRUD kategori mobil |
| **Banners & Ads** | CRUD banner iklan |
| **Payments** | Verifikasi pembayaran |
| **Revenue** | Laporan pendapatan |
| **Reports** | Laporan platform |
| **Analytics** | Analitik detail |
| **Top-up** | Manual top-up kredit untuk user |
| **Credits** | Manajemen sistem kredit |
| **Coupons** | Manajemen kupon |
| **Orders** | Manajemen order |
| **Withdrawals** | Proses penarikan dana |
| **Tickets** | Tiket support |
| **Settings** | Pengaturan platform |
| **Inspection Pricing** | Konfigurasi harga inspeksi |
| **Activity** | Monitor aktivitas |
| **Activity Logs** | Log aktivitas detail |
| **Broadcast** | Kirim notifikasi broadcast |

### 3.8 AI PRICE PREDICTION
**Prioritas:** P1 — Important

**Flow:** Vehicle Data → Photo Upload (5 foto) → Self-Inspection → AI Analysis → Result

| Komponen | Deskripsi |
|----------|-----------|
| **Input** | Brand, Model, Tahun, Transmisi, Mileage + 5 foto (exterior, interior, mesin, odometer) |
| **VLM Analysis** | Setiap foto dianalisis menggunakan z-ai-web-dev-sdk VLM |
| **Self-Inspection** | Form 160 titik dengan quick-fill "Semua Baik" |
| **AI Calculation** | Condition multiplier + depreciation rate + market data + seller trust score |
| **Output** | Price range, confidence score, inspection grade (A+ s/d E), risk level |
| **Cost** | 5 tokens per prediksi |
| **Follow-up** | Buat iklan, request inspeksi, lihat detail |

### 3.9 INSPECTION SYSTEM
**Prioritas:** P0 — Core

| Aspek | Detail |
|-------|--------|
| **Total Points** | 160 titik pemeriksaan |
| **Categories** | Grup per kategori (Eksterior, Interior, Mesin, dll) |
| **Status Per Item** | Istimewa (100), Baik (80), Sedang (60), Perlu Perbaikan (40) |
| **Grading** | A+ (95-100), A (90-94), B+ (85-89), B (80-84), C+ (75-79), C (70-74), D (60-69), E (<60) |
| **Risk Level** | Low, Medium, High |
| **Type** | Self-Inspection (gratis) vs Professional (berbayar) |
| **Certificate** | Pembelian sertifikat (25 tokens) |
| **AI Analysis** | Skor, grade, estimasi harga, risk level, profit margin |
| **Booking** | Booking inspeksi profesional dengan nomor booking |
| **Pricing Tiers** | Konfigurasi harga per tipe inspeksi |

### 3.10 TOKEN/CREDIT ECONOMY
**Prioritas:** P0 — Core

#### Token Cost Table
| Aksi | Biaya Token | Durasi |
|------|-------------|--------|
| Marketplace Umum (listing) | 3 tokens | 30 hari |
| Dealer Marketplace (listing) | 5 tokens | 7 hari |
| Kedua Marketplace | 8 tokens | 7+30 hari |
| Chat Platform | 4 tokens | - |
| Inspeksi 160 Titik | 10 tokens | - |
| Featured 7 Hari | 5 tokens | 7 hari |
| Perpanjang Listing | 2 tokens | 30 hari |
| Perpanjang Dealer | 2 tokens | 7 hari |
| AI Prediction | 5 tokens | - |
| Sertifikat Inspeksi | 25 tokens | - |
| Nilai Token | Rp 10.000/token | - |

#### Token Packages
| Paket | Token | Bonus | Harga |
|-------|-------|-------|-------|
| Starter | 50 | 0 | Rp 500.000 |
| Basic | 100 | 10 | Rp 1.000.000 |
| Popular | 250 | 50 | Rp 2.500.000 |
| Business | 500 | 150 | Rp 5.000.000 |
| Enterprise | 1000 | 500 | Rp 10.000.000 |

#### Credit System
- 1 credit per listing (basic)
- Registration bonus: 500 credits (first 500 users)
- Boost features: deductible credits with auto-renew
- Refund: proportional refund jika cancel boost (>50% remaining)

### 3.11 DEALER OFFER SYSTEM
**Prioritas:** P1 — Important

**Offer Lifecycle:**
```
pending → viewed → negotiating → accepted/rejected/expired/withdrawn
```

| Fitur | Deskripsi |
|-------|-----------|
| **Create Offer** | Dealer membuat penawaran pada listing |
| **Counter-Offer** | Seller bisa menawar balik dengan harga & pesan |
| **Accept/Reject** | Seller menerima atau menolak penawaran |
| **Auto-Reject** | Penawaran otomatis ditolak jika listing dijual/dihapus |
| **Inspection Request** | Dealer bisa request inspeksi sebelum deal |
| **7-Day Expiry** | Penawaran otomatis expired setelah 7 hari |
| **Notification** | Notifikasi real-time untuk setiap aksi |
| **Fee Calculation** | Platform fee dihitung saat accept |

### 3.12 LOCATION SYSTEM
**Prioritas:** P1 — Important

| Level | Deskripsi | API |
|-------|-----------|-----|
| **Provinces** | 34 provinsi Indonesia | `/api/locations/provinces` |
| **Cities/Kabupaten** | Kota/kabupaten per provinsi | `/api/locations/cities?province_id=` |
| **Districts/Kecamatan** | Kecamatan per kota | `/api/locations/districts?city_id=` |
| **Villages/Kelurahan** | Kelurahan/desa + kode pos | `/api/locations/villages?district_id=` |

Cascading picker: Province → City → District → Village

### 3.13 CHAT/MESSAGING
**Prioritas:** P2 — Nice to Have

| Fitur | Deskripsi | Status |
|-------|-----------|--------|
| Conversation List | Daftar percakapan dengan unread count | ✅ |
| Message Bubbles | Chat bubbles dengan timestamp | ✅ |
| Auto-Scroll | Scroll otomatis ke pesan terbaru | ✅ |
| Mark as Read | Otomatis mark read saat buka conversation | ✅ |
| Bot Response | Simulated bot response (demo) | ⚠️ Mock |
| Real-time | Belum ada WebSocket real-time | ❌ Todo |

### 3.14 ADVERTISING SYSTEM
**Prioritas:** P2 — Nice to Have

| Position | Lokasi | Deskripsi |
|----------|--------|-----------|
| `home-center` | Landing page top | Banner utama 2/3 lebar |
| `home-center-sidebar` | Landing page top | Sidebar 1/3 lebar |
| `home-inline` | Landing page middle | Banner tengah 2/3 lebar |
| `home-inline-sidebar` | Landing page middle | Sidebar tengah 1/3 lebar |

Fitur: Impression tracking, click tracking, CRUD via admin panel

### 3.15 KYC VERIFICATION
**Prioritas:** P0 — Core

| State | Deskripsi |
|-------|-----------|
| `not_submitted` | Belum mengirim dokumen → tampilkan form |
| `pending` | Menunggu review → tampilkan waiting screen |
| `approved` | Disetujui → badge verified |
| `rejected` | Ditolak → tampilkan form dengan alasan |

Dokumen: KTP (foto) + Selfie (foto) + data diri (nama, NIK, alamat, telepon)

---

## 4. API SPECIFICATIONS

### 4.1 API Route Summary (80+ Endpoints)

| Kategori | Jumlah | Endpoints Key |
|----------|--------|---------------|
| **Listings** | 6 | CRUD + view counter + create with tokens |
| **Marketplace** | 7 | Search, compare, rentals, brands, models, colors, marketplace-listings |
| **Dealer** | 7 | Dealers list/detail, registration, stats, reviews, team, offers |
| **Dealer Marketplace** | 6 | Listings, offers (CRUD), favorites, settings, check-db, offer count |
| **Inspections** | 7 | CRUD, items, submit, bookings, pricing, certificate, export PDF |
| **Credits/Tokens** | 14 | Balance, deduct, transactions, packages, purchase, payments, boosts, settings, costs, registration bonus |
| **Wallet** | 3 | Balance, transactions, add/deduct |
| **Orders** | 3 | CRUD + status update |
| **User** | 7 | Profile, settings, my-listings, my-favorites, my-predictions, user-tokens, user/[id] |
| **Admin** | 30+ | Stats, analytics, users, dealers, listings, KYC, tokens, credits, banners, coupons, orders, payments, revenue, reports, tickets, settings, categories, withdrawals, activity, topup, boost, broadcast |
| **Locations** | 5 | Provinces, cities, districts, villages, unified |
| **Other** | 10 | Auth check-role, conversations, messages, notifications, favorites, predictions, KYC, stats, banners |
| **Seed/Setup** | 15 | Seed data, check-db, run-schema, setup tables |

### 4.2 Key API Patterns

**Authentication:** Semua API yang memerlukan auth menggunakan Supabase session cookies.

**Response Format:**
```json
{
  "data": { ... },
  "error": null,
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

**Error Format:**
```json
{
  "error": "Error message in Bahasa Indonesia",
  "code": "ERROR_CODE"
}
```

---

## 5. BUSINESS RULES

### 5.1 Listing Rules
| Rule | Detail |
|------|--------|
| Durasi Listing Umum | 30 hari |
| Durasi Listing Dealer | 7 hari |
| Max Listing (tanpa verifikasi) | Tidak bisa listing tanpa KYC |
| Listing Status | draft, pending, active, suspended, sold, expired, deleted |
| Visibility | public, dealer_marketplace, both |
| Soft Delete | Listing dihapus → set deleted_at + status=deleted |
| View Counter | Increment setiap kali listing dilihat |

### 5.2 Credit/Token Rules
| Rule | Detail |
|------|--------|
| Nilai Token | 1 token = Rp 10.000 |
| Registration Bonus | 500 credits (first 500 users) |
| Refund Policy | Boost refund proporsional jika >50% remaining |
| Credit Deduction | Atomic: cek saldo → deduct → record transaksi |
| Token Expiry | Tidak ada expiry |

### 5.3 Dealer Offer Rules
| Rule | Detail |
|------|--------|
| Offer Expiry | 7 hari |
| Auto-Reject | Jika listing sold/deleted/inactive, semua pending offer auto-reject |
| Counter-Offer | Tracked dalam counter_history array |
| Platform Fee | Berdasarkan dealer_offer_settings, dihitung saat accept |
| Exclusive Accept | Accept satu offer → auto-reject offer lain pada listing yang sama |

### 5.4 KYC Rules
| Rule | Detail |
|------|--------|
| Required for Listing | Ya, seller harus KYC verified |
| Required for Dealer | Ya, dealer harus verified + business docs |
| Documents | KTP + Selfie + data diri |
| Admin Review | Manual review oleh admin |
| Re-submission | Bisa re-submit jika rejected |

### 5.5 Inspection Rules
| Rule | Detail |
|------|--------|
| Scoring | Istimewa=100, Baik=80, Sedang=60, Perlu Perbaikan=40 |
| Grading | Weighted average → A+ s/d E |
| Self Inspection | Gratis, menggunakan form sendiri |
| Professional | Berbayar, menggunakan inspector |
| Certificate | Opsional, 25 tokens |
| AI Analysis | Otomatis setelah submit inspeksi |

---

## 6. UI/UX SPECIFICATIONS

### 6.1 Design System
| Aspek | Spesifikasi |
|-------|-------------|
| **Brand Colors** | Primary: Purple #6A0DAD, Secondary: Blue #0033A0, Accent: Light Blue #0099FF |
| **Brand Gradient** | `linear-gradient(135deg, #6A0DAD 0%, #0033A0 100%)` |
| **Dark Mode** | Full support dengan next-themes |
| **Typography** | Geist Sans (body) + Geist Mono (code) |
| **Border Radius** | 0.625rem base (--radius) |
| **Locale** | Bahasa Indonesia (id-ID) |
| **Currency** | IDR (Rupiah) dengan Intl.NumberFormat |

### 6.2 Responsive Breakpoints
| Breakpoint | Grid Columns | Keterangan |
|------------|--------------|------------|
| Mobile | 2 columns | Default |
| SM (640px) | 3 columns | Small tablet |
| MD (768px) | 4 columns | Tablet |
| LG (1024px) | 5 columns | Desktop |
| XL (1280px) | Full layout | Large desktop |

### 6.3 Component Library
- **40+ shadcn/ui components** — Button, Card, Dialog, Tabs, Form, Table, etc.
- **3 custom UI components** — Logo, GradientHeading, StatsCard
- **11 SVG body type icons** — Custom icon per tipe body kendaraan
- **Framer Motion animations** — Hover effects, page transitions
- **Skeleton loading** — Loading states di semua section

---

## 7. NON-FUNCTIONAL REQUIREMENTS

### 7.1 Performance
| Metrik | Target |
|--------|--------|
| First Contentful Paint | < 2 detik |
| Time to Interactive | < 3 detik |
| Lighthouse Score | > 90 |
| API Response Time | < 500ms (95th percentile) |

### 7.2 Security
| Aspek | Implementasi |
|-------|-------------|
| Authentication | Supabase Auth + Google OAuth |
| Authorization | Role-based (admin/dealer/seller/buyer) |
| KYC Verification | Required untuk listing & dealer |
| Data Privacy | Privacy-aware contact info display |
| SQL Injection | Supabase parameterized queries |

### 7.3 Scalability
| Aspek | Kapasitas |
|-------|-----------|
| Database | 72 tabel, designed for 100K+ listings |
| API | 80+ REST endpoints |
| Caching | Token settings cached globally |
| Pagination | Semua list API menggunakan pagination |

---

## 8. CURRENT STATUS & KNOWN ISSUES

### 8.1 Completed ✅
- Landing page dengan semua section
- Authentication (Google OAuth)
- Marketplace public + dealer
- Listing CRUD dengan token deduction
- Dashboard user (18 sub-pages)
- Dashboard dealer (8 sub-pages)
- Admin panel (25+ sub-pages)
- AI Price Prediction dengan VLM
- 160-point Inspection system
- Token/Credit economy
- Dealer Offer lifecycle
- KYC verification
- Location system (4-level cascade)
- Chat messaging (basic)
- Ad banner system

### 8.2 Partially Implemented ⚠️
| Fitur | Issue |
|-------|-------|
| Chat/Messaging | Bot response masih mock, belum real-time |
| Coupons | Data hardcoded, belum API-driven |
| Withdraw | Mock API (setTimeout), belum integrasi payment gateway |
| Payment Gateway | Hanya BNI VA placeholder, belum live |

### 8.3 Not Implemented ❌
| Fitur | Keterangan |
|-------|-----------|
| Real-time Chat (WebSocket) | Belum ada socket.io integration |
| Push Notifications | Belum ada service worker / push API |
| Email Notifications | Hook ada, implementasi belum |
| PDF Generation | API ada tapi belum fully functional |
| Image Optimization | Sharp terinstall tapi belum di-integrate |
| Rate Limiting | Tidak ada rate limiting pada API |
| Admin Auth Middleware | Admin routes tidak verify admin role |
| Prisma Schema Sync | Prisma schema masih basic (User+Post), Supabase digunakan langsung |
| Unit/Integration Tests | Tidak ada test code |

---

## 9. ROADMAP RECOMMENDATIONS

### Phase 1 — Critical Fixes (Week 1-2)
1. Sync Prisma schema dengan 72 tabel Supabase
2. Add admin auth middleware ke semua admin API routes
3. Implement rate limiting pada API endpoints
4. Fix chat system → WebSocket dengan socket.io

### Phase 2 — Payment & Security (Week 3-4)
1. Integrate payment gateway (Midtrans/Xendit)
2. Implement real withdraw functionality
3. Add push notification support
4. Email notification implementation

### Phase 3 — Polish & Performance (Week 5-6)
1. Image optimization pipeline
2. PDF certificate generation
3. Caching strategy (Redis)
4. SEO optimization

### Phase 4 — Growth Features (Week 7-8)
1. Recommendation engine
2. Price alert system
3. Mobile app consideration (PWA)
4. Analytics dashboard enhancement

---

## 10. GLOSSARY

| Istilah | Definisi |
|---------|----------|
| **160 Titik** | Sistem inspeksi 160 pemeriksaan pada kendaraan |
| **KYC** | Know Your Customer — verifikasi identitas (KTP + Selfie) |
| **VLM** | Vision Language Model — AI untuk analisis gambar |
| **Escrow** | Sistem pembayaran dimana dana ditahan sampai transaksi selesai |
| **Token** | Mata uang digital platform (1 token = Rp 10.000) |
| **Credit** | Satuan kredit untuk akses fitur (naming alias untuk token) |
| **Dealer Marketplace** | Marketplace khusus dealer (B2B) |
| **Public Marketplace** | Marketplace umum (C2C) |
| **Boost** | Fitur untuk meningkatkan visibilitas listing |
| **Counter-Offer** | Penawaran balik dari seller ke dealer |
| **Body Type** | Tipe bodi kendaraan (SUV, MPV, Sedan, dll) |
| **Grade** | Nilai inspeksi (A+ s/d E) berdasarkan skor 160 titik |

---

*Dokumen ini di-generate dari analisis seluruh codebase AutoMarket — 300+ file, 80+ API routes, 72 database tables, 60+ components, 11 hooks.*
