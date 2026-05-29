# 📋 PRODUCT REQUIREMENTS DOCUMENT (PRD)
## AutoMarket — Marketplace Mobil Bekas Terpercaya Indonesia

> **Versi:** 2.0 — Comprehensive Edition  
> **Tanggal:** Maret 2026  
> **Platform:** Web Application (Mobile-First Responsive)  
> **Tech Stack:** Next.js 16 · TypeScript · Tailwind CSS 4 · shadcn/ui · Supabase · Prisma  
> **Database:** 90 tabel PostgreSQL (Supabase) + 62 model Prisma (SQLite dev)  

---

## DAFTAR ISI

1. [Executive Summary](#1-executive-summary)
2. [User Personas](#2-user-personas)
3. [Product Architecture](#3-product-architecture)
4. [Database Schema](#4-database-schema)
5. [Feature Specifications](#5-feature-specifications)
6. [Business Rules & Logic](#6-business-rules--logic)
7. [API Specifications](#7-api-specifications)
8. [UI/UX Specifications](#8-uiux-specifications)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Status & Known Issues](#10-status--known-issues)
11. [Roadmap](#11-roadmap)
12. [Glossary](#12-glossary)

---

## 1. EXECUTIVE SUMMARY

### 1.1 Visi Produk
AutoMarket adalah platform marketplace jual-beli mobil bekas terpercaya di Indonesia yang menggabungkan **sistem inspeksi 160 titik**, **AI Price Prediction berbasis VLM**, dan **Dual Marketplace (C2C + B2B)** untuk menciptakan ekosistem otomotif yang transparan, aman, dan efisien.

### 1.2 Masalah yang Dipecahkan
| # | Masalah | Solusi AutoMarket |
|---|---------|-------------------|
| 1 | **Informasi mobil tidak transparan** — Pembeli tidak tahu kondisi aktual mobil | Inspeksi 160 titik dengan grading A+ s/d E |
| 2 | **Harga tidak pasti** — Sulit menentukan harga wajar | AI Price Prediction dengan analisis foto VLM |
| 3 | **Transaksi tidak aman** — Risiko penipuan tinggi | Escrow system + KYC verification |
| 4 | **Dealer kesulitan cari stok** — Proses akuisisi mobil manual | Dealer Marketplace dengan sistem penawaran |
| 5 | **Proses jual mobil ribet** — Harus negosiasi satu-satu | Dual marketplace + counter-offer system |

### 1.3 Proposisi Nilai Unik
- 🔍 **Inspeksi 160 Titik** — Grading objektif A+ (Istimewa) sampai E (Perlu Perbaikan)
- 🤖 **AI Price Prediction** — VLM menganalisis 5 foto kendaraan + data pasar
- 🏪 **Dual Marketplace** — Public (C2C, 30 hari) + Dealer (B2B, 7 hari)
- 🔐 **KYC + Escrow** — Verifikasi KTP & selfie, dana ditahan sampai deal
- 💰 **Token Economy** — 1 token = Rp 10.000, paket mulai 50 token
- 🇮🇩 **100% Bahasa Indonesia** — UI, error messages, format mata uang IDR

---

## 2. USER PERSONAS

### 👤 Persona 1: "Andi si Pemula Jual Mobil"

| Atribut | Detail |
|---------|--------|
| **Nama** | Andi Wijaya |
| **Usia** | 28 tahun |
| **Pekerjaan** | Karyawan Swasta di Jakarta |
| **Penghasilan** | Rp 8.000.000/bulan |
| **Teknologi** | Android user, aktif Instagram & Tokopedia |
| **Kendaraan** | Toyota Avanza 2018, mau dijual untuk upgrade |

**Kebutuhan:**
- ❓ "Berapa harga wajar Avanza 2018 saya?"
- ❓ "Bagaimana cara jual mobil agar cepat laku?"
- ❓ "Takut ditipu pembeli, gimana caranya aman?"

**Frustrasi:**
- Tidak tahu harga pasar mobilnya
- Bingung negosiasi dengan pembeli/calon
- Khawatir proses transaksi tidak aman
- Tidak punya waktu untuk handle proses jual yang ribet

**User Journey di AutoMarket:**
```
1. Buka AutoMarket → Lihat "AI Prediction" → Masukkan data Avanza
2. Upload 5 foto → Isi form 160 titik → Dapat prediksi: Rp 125-140 juta
3. "Oke, saya mau jual!" → Daftar akun (Google OAuth)
4. KYC Verification → Upload KTP + Selfie → Menunggu approval (1x24 jam)
5. Buat Listing → Pilih "Marketplace Umum" (3 token = Rp 30.000)
6. Listing aktif 30 hari → Dapat 5 penawaran dari pembeli
7. Terima penawaran terbaik → Transaksi via Escrow → Mobil terjual!
```

**Fitur yang Paling Dipakai:**
- 🏠 Landing Page (browse kategori brand)
- 🤖 AI Price Prediction (cek harga dulu)
- 📝 Create Listing (jual mobil)
- 📊 Dashboard (monitor penawaran)
- 💬 Chat (negosiasi dengan pembeli)

---

### 👤 Persona 2: "Sari si Pembeli Cerdas"

| Atribut | Detail |
|---------|--------|
| **Nama** | Sari Putri |
| **Usia** | 32 tahun |
| **Pekerjaan** | Manager Marketing di Bandung |
| **Penghasilan** | Rp 15.000.000/bulan |
| **Teknologi** | iPhone user, aktif OLX & Instagram |
| **Kebutuhan** | Cari mobil keluarga yang terjamin kualitasnya |

**Kebutuhan:**
- ❓ "Mau beli mobil bekas tapi takut mendapat bodi jelek"
- ❓ "Bagaimana yakin kondisi mobil sesuai iklan?"
- ❓ "Butuh mobil yang inspeksinya lengkap dan transparan"

**Frustrasi:**
- Sering melihat iklan mobil yang foto tidak sesuai aktual
- Tidak bisa percaya kata penjual tanpa bukti inspeksi
- Proses cek mobil harus ke bengkel sendiri, ribet
- Harga penjual sering di atas pasar

**User Journey di AutoMarket:**
```
1. Buka AutoMarket → Cari "SUV" → Filter brand Toyota, harga <200jt
2. Lihat listing dengan badge "Inspeksi A" → Klik detail
3. Baca laporan 160 titik → Semua "Baik" → Confidence tinggi
4. Favoritkan 3 mobil → Bandingkan side-by-side (Compare)
5. Chat penjual → Tanya service record → Negosiasi harga
6. Setuju harga → Proses order via Escrow → Bayar → Mobil diterima!
```

**Fitur yang Paling Dipakai:**
- 🔍 Search & Filter (cari mobil spesifik)
- 📋 Inspection Report (baca laporan inspeksi)
- ⚖️ Compare (bandingkan 4 mobil)
- ❤️ Favorites (simpan mobil potensial)
- 💬 Chat (tanya penjual)

---

### 👤 Persona 3: "Pak Budi si Dealer Profesional"

| Atribut | Detail |
|---------|--------|
| **Nama** | Budi Santoso |
| **Usia** | 45 tahun |
| **Pekerjaan** | Pemilik Showroom "Budi Motor" di Surabaya |
| **Penghasilan** | Rp 50.000.000/bulan (turnover showroom) |
| **Teknologi** | Laptop + Android, pakai Excel untuk inventory |
| **Inventori** | 30 mobil di showroom, butuh 10 mobil/bulan |

**Kebutuhan:**
- ❓ "Butuh stok mobil bekas berkualitas untuk showroom"
- ❓ "Mau beli langsung dari pemilik, tanpa perantara"
- ❓ "Perlu analitik penjualan showroom"

**Frustrasi:**
- Susah cari mobil bekas berkualitas dari pemilik langsung
- Proses akuisisi mobil lama (datang satu-satu, tawar-menawar)
- Tidak ada dashboard yang tracking performa showroom
- Kompetisi dengan dealer lain yang lebih cepat akuisisi

**User Journey di AutoMarket:**
```
1. Daftar Dealer → Submit dokumen (NPWP, NIB, SIUP, KTP) → Menunggu approval
2. Login → Dashboard Dealer → Lihat inventori & stats
3. Buka Dealer Marketplace → Filter mobil dengan inspeksi A/B
4. Temukan 5 mobil cocok → Buat penawaran pada masing-masing
5. Seller terima penawaran → Bayar via Escrow → Mobil dikirim ke showroom
6. Listing mobil di Public Marketplace → Terjual ke end-buyer
7. Lihat analitik: 12 mobil terjual bulan ini, revenue Rp 180jt
```

**Fitur yang Paling Dipakai:**
- 🏪 Dealer Marketplace (cari stok mobil)
- 💰 Dealer Offers (buat/terima penawaran)
- 📊 Dealer Stats & Analytics (monitor performa)
- 📦 Dealer Inventory (kelola stok)
- 👥 Team Management (kelola staf showroom)
- ⭐ Reviews (reputation management)

---

### 👤 Persona 4: "Rina si Admin Platform"

| Atribut | Detail |
|---------|--------|
| **Nama** | Rina Kusuma |
| **Usia** | 30 tahun |
| **Pekerjaan** | Operations Manager AutoMarket |
| **Penghasilan** | Rp 12.000.000/bulan |
| **Teknologi** | Desktop, pakai CRM & analytics tools |
| **Tanggung Jawab** | Moderasi platform, review KYC, kelola user |

**Kebutuhan:**
- ❓ "Harus bisa review KYC dengan cepat dan akurat"
- ❓ "Perlu monitoring listing yang melanggar aturan"
- ❓ "Butuh data analytics untuk report ke management"

**Frustrasi:**
- Banyak listing spam/fraud yang harus di-moderasi manual
- Proses KYC review lama karena tidak terautomasi
- Sulit tracking revenue dan growth tanpa dashboard yang proper

**User Journey di AutoMarket:**
```
1. Login → Admin Dashboard → 8 stat cards (users, listings, revenue, dll)
2. Review KYC → 10 pengajuan menunggu → Approve/Reject dengan alasan
3. Review Dealer Registration → Cek dokumen → Approve/Reject
4. Moderasi Listings → Ban listing yang melanggar → Beri alasan
5. Cek Revenue → Chart pendapatan bulanan → Export report
6. Kelola Token Settings → Update harga token
7. Broadcast → Kirim notifikasi ke semua user
```

**Fitur yang Paling Dipakai:**
- 📊 Admin Dashboard (overview stats)
- ✅ KYC Review (verifikasi user)
- 🏪 Dealer Approval (approve/reject dealer)
- 📝 Listings Moderation (ban/feature listing)
- 💰 Revenue & Analytics (monitor pendapatan)
- ⚙️ Settings (konfigurasi platform)

---

### 👤 Persona 5: "Dimas si Inspector"

| Atribut | Detail |
|---------|--------|
| **Nama** | Dimas Pratama |
| **Usia** | 35 tahun |
| **Pekerjaan** | Mekanik Profesional / Inspector |
| **Penghasilan** | Rp 7.000.000/bulan + fee inspeksi |
| **Teknologi** | Android, aktif WhatsApp |
| **Spesialis** | Inspeksi 160 titik, grading kendaraan |

**Kebutuhan:**
- ❓ "Mau kerja sebagai inspector freelance"
- ❓ "Butuh jadwal inspeksi yang terorganisir"
- ❓ "Ingin hasil inspeksi saya terdokumentasi rapi"

**User Journey di AutoMarket:**
```
1. Daftar akun → Role: Inspector
2. Terima booking inspeksi → Lihat jadwal → Datang ke lokasi
3. Isi form 160 titik → Upload foto → Submit
4. AI menganalisis → Grade: B+ → Estimasi harga: Rp 130-145jt
5. Seller beli sertifikat → Sertifikat terbit → Inspector dapat fee
```

---

## 3. PRODUCT ARCHITECTURE

### 3.1 System Architecture
```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js 16)                      │
│                                                               │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐   │
│  │ Landing  │ │Marketplace│ │Dashboard │ │  Admin Panel   │   │
│  │  Page    │ │  & Search │ │  (User)  │ │  (Management)  │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └───────┬────────┘   │
│       │            │            │                │             │
│  ┌────▼────────────▼────────────▼────────────────▼─────────┐  │
│  │              API Routes (80+ endpoints)                  │  │
│  │  Listings │ Marketplace │ Credits │ Inspections │ Admin  │  │
│  └──────────────────────┬──────────────────────────────────┘  │
│                         │                                     │
│  ┌──────────────────────▼──────────────────────────────────┐  │
│  │              Business Logic Layer                         │  │
│  │  api-auth │ api-utils │ token-service │ dealer-offer-svc │  │
│  └──────────────────────┬──────────────────────────────────┘  │
│                         │                                     │
│  ┌──────────────────────▼──────────────────────────────────┐  │
│  │              Data Layer                                   │  │
│  │  Supabase Client (PostgreSQL) │ Prisma (SQLite dev)      │  │
│  │  90 Tables │ Auth │ Storage │ Realtime                   │  │
│  └─────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Tech Stack
| Komponen | Teknologi | Versi |
|----------|-----------|-------|
| Framework | Next.js (App Router) | 16.x |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS + shadcn/ui | 4.x |
| Database | Supabase (PostgreSQL) | - |
| ORM (Dev) | Prisma (SQLite) | 6.x |
| Auth | Supabase Auth (Google OAuth) | - |
| Charts | Recharts | 2.x |
| Animation | Framer Motion | 12.x |
| State | React hooks + Zustand | 5.x |
| Forms | React Hook Form + Zod | 7.x / 4.x |
| AI | z-ai-web-dev-sdk (VLM, LLM) | 0.0.18 |

---

## 4. DATABASE SCHEMA

### 4.1 Overview — 90 Tabel dalam 18 Modul

| # | Modul | Jumlah Tabel | Tabel Utama |
|---|-------|-------------|-------------|
| 1 | **User System** | 7 | profiles, user_addresses, user_documents, user_verifications, user_sessions, user_notifications, user_settings |
| 2 | **Dealer System** | 7 | dealers, dealer_branches, dealer_staff, dealer_documents, dealer_reviews, dealer_inventory, dealer_registrations |
| 3 | **Car Master Data** | 8 | brands, car_models, car_variants, car_generations, car_colors, car_body_types, car_fuel_types, car_transmissions |
| 4 | **Car Features** | 4 | feature_categories, feature_groups, feature_items, car_feature_values |
| 5 | **Listing System** | 10 | car_listings ⭐, car_images, car_videos, car_documents, car_features, car_price_history, car_status_history, car_views, car_favorites, car_compares |
| 6 | **Inspection System** | 12 | inspection_categories, inspection_items, car_inspections, inspection_results, inspection_photos, inspection_certificates, inspection_pricing, inspection_bookings, ai_price_analysis, certificate_purchases, inspector_profiles, inspection_item_comments |
| 7 | **Rental System** | 6 | car_rental_prices, rental_bookings, rental_availability, rental_payments, rental_reviews, rental_insurance |
| 8 | **Transaction System** | 8 | orders, order_items, payments, payment_methods, escrow_accounts, transactions, refunds, invoices |
| 9 | **Chat System** | 3 | conversations, messages, message_attachments |
| 10 | **Review & Rating** | 3 | car_reviews, review_votes, review_images |
| 11 | **Search & Discovery** | 4 | search_logs, recommendations, recent_views, trending_cars |
| 12 | **Analytics** | 4 | analytics_events, analytics_page_views, analytics_clicks, analytics_conversions |
| 13 | **Notifications** | 3 | notifications, notification_templates, notification_logs |
| 14 | **Location** | 5 | countries, provinces, cities, districts, villages |
| 15 | **Credit & Token** | 13 | credit_packages, user_credits, credit_transactions, payments, boost_features, listing_boosts, registration_bonus_tracker, credit_usage_log, token_settings, token_packages, user_tokens, token_transactions, token_usage_logs |
| 16 | **AI Prediction** | 8 | ai_predictions, prediction_photos, prediction_factors, dealer_offer_settings, dealer_offers, market_price_history, prediction_market_data, ai_prediction_templates |
| 17 | **Dealer Marketplace** | 5 | dealer_marketplace_settings, dealer_offers, dealer_offer_histories, dealer_marketplace_favorites, dealer_marketplace_views |
| 18 | **Admin System** | 14 | kyc_verifications, withdrawals, topup_requests, reports, support_tickets, support_ticket_messages, banners, coupons, broadcasts, activity_logs, categories, boost_settings, system_settings, fee_settings |

### 4.2 Central Table: `car_listings`
Tabel `car_listings` adalah tabel pusat yang terhubung ke hampir semua modul:

```
car_listings
├── FK → brands (brand_id)
├── FK → car_models (model_id)
├── FK → car_variants (variant_id)
├── FK → car_colors (exterior_color_id, interior_color_id)
├── FK → profiles (user_id = seller)
├── FK → dealers (dealer_id)
├── 1:N → car_images, car_videos, car_documents, car_features
├── 1:N → car_favorites, car_views, car_price_history
├── 1:N → car_inspections, inspection_bookings
├── 1:N → orders, conversations, car_reviews
├── 1:N → dealer_offers
├── 1:1 → car_rental_prices
└── Fields: visibility, marketplace_type, tokens_used, status, dll.
```

### 4.3 Prisma Schema
Untuk development lokal, digunakan Prisma dengan SQLite yang mencakup **62 model** dari tabel-tabel yang paling sering diakses API. File: `/prisma/schema.prisma`

### 4.4 Enum Types (9 PostgreSQL Enums)
| Enum | Values |
|------|--------|
| `fuel_type` | bensin, diesel, electric, hybrid, petrol_hybrid |
| `transmission_type` | automatic, manual |
| `body_type` | sedan, suv, mpv, hatchback, pickup, van, coupe, convertible, wagon |
| `vehicle_transaction_type` | jual, beli, rental |
| `vehicle_condition` | baru, bekas, sedang, istimewa |
| `inspection_status` | baik, sedang, perlu_perbaikan, istimewa |
| `order_status` | pending, confirmed, processing, completed, cancelled, refunded |
| `payment_status` | pending, paid, failed, refunded |
| `booking_status` | pending, confirmed, active, completed, cancelled |

---

## 5. FEATURE SPECIFICATIONS

### 5.1 LANDING PAGE (`/`)

| Fitur | Deskripsi | Persona |
|-------|-----------|---------|
| Hero Banner Iklan | Banner 2/3 + 1/3 layout dengan AdBanner | Semua |
| Statistik Platform | 10K+ mobil, 8.5K+ inspeksi, 6.2K+ transaksi, 500+ dealer | Sari, Andi |
| Kategori Brand | 31 brand mobil dengan logo + model sub-kategori | Andi, Sari |
| Filter Body Type | 11 tipe body dengan ikon SVG custom | Sari |
| Premium Listings | Listing yang di-boost dengan gradient ring | Sari, Pak Budi |
| Flash Sale | Featured listing dengan badge Premium | Sari |
| Auction Section | Lelang dengan countdown timer real-time | Sari, Pak Budi |
| Listing Terbaru | Grid listing terbaru + skeleton loading | Sari |
| Listing Populer | Listing populer minggu ini | Sari |
| Sponsor Logos | Grid 31 logo brand sponsor | - |
| CTA Section | "Mulai jualan di AutoMarket sekarang!" | Andi |
| Listing Detail | Detail listing inline via `?id=` | Sari, Andi |

### 5.2 AUTHENTICATION (`/auth`)

| Fitur | Deskripsi | Persona |
|-------|-----------|---------|
| Google OAuth | Login via Google Sign-In (Supabase Auth) | Semua |
| Auto Profile | Otomatis buat profil saat pertama login | Andi |
| Role System | buyer → seller → dealer → admin | Semua |
| Redirect | `?redirect=` parameter setelah login | Andi |

### 5.3 MARKETPLACE

#### Public Marketplace (`/marketplace`)
| Fitur | Deskripsi | Persona |
|-------|-----------|---------|
| Search & Filter | Search + 9 filter dimensions | Sari |
| Filter Panel | Desktop sidebar + mobile sheet | Sari |
| Sort | Terbaru, harga, mileage, tahun | Sari |
| Grid/List View | Toggle tampilan | Sari |
| Compare | Bandingkan hingga 4 mobil | Sari |

#### Dealer Marketplace (`/dealer-marketplace`)
| Fitur | Deskripsi | Persona |
|-------|-----------|---------|
| Workflow Info | 4-tab info lengkap | Pak Budi |
| 3 Selling Modes | Bidding, Best Offer, Direct Deal | Pak Budi |
| Token Cost | Perbandingan biota Dealer vs Public | Pak Budi |

#### Listing Detail (`/?id=`)
| Fitur | Deskripsi | Persona |
|-------|-----------|---------|
| Image Gallery | Carousel + thumbnail navigation | Sari |
| Specs | Harga, dokumen, inspeksi, lokasi, penjual | Sari |
| Inspection Report | 160 titik per kategori | Sari |
| Contact Info | Privacy-aware (WA untuk publik, offer untuk dealer) | Sari, Pak Budi |
| Favorite | Tambah/hapus favorit | Sari |
| Dealer Offer Modal | Submit penawaran + financing & pickup | Pak Budi |
| Social Share | Share ke social media | Andi |

### 5.4 CREATE LISTING (`/listing/create`)

**Flow:** Auth → KYC Gate → Credit Check → 5-Step Form → Submit

| Step | Fitur | Persona |
|------|-------|---------|
| Gate 1 | Auth Check (redirect login) | Andi |
| Gate 2 | KYC Verification (wajib verified) | Andi |
| Gate 3 | Credit Balance (1 credit/listing) | Andi |
| Step 1 | Basic Info: Brand, Model, Tahun, Judul, Kondisi, Harga | Andi |
| Step 2 | Details: BBM, Transmisi, Mileage, Warna, Lokasi | Andi |
| Step 3 | Marketplace: Umum (3 token) / Dealer (5 token) / Both (8 token) | Andi, Pak Budi |
| Step 4 | Photos: Upload foto kendaraan | Andi |
| Step 5 | Review & Submit | Andi |

### 5.5 DASHBOARD USER (`/dashboard`)

| Halaman | Fitur Utama | Persona |
|---------|-------------|---------|
| **Home** | 4 stats, quick actions, charts, recent activity | Andi |
| **Notifications** | Filter all/unread, mark read, 30s polling | Andi, Sari |
| **Predictions** | History AI prediksi, confidence score, grade | Andi |
| **Prediction Wizard** | 5-step: data → foto → inspeksi → harga → AI | Andi |
| **Wallet** | Saldo, transaksi, top-up, withdraw | Andi, Pak Budi |
| **Tokens** | 5 paket (50-1000), usage table, riwayat | Andi |
| **Credits** | 5 paket, registration bonus 500 | Andi |
| **Inspeksi** | 3-step wizard, 160 titik, hasil AI | Andi, Dimas |
| **Offers** | 3-tab, accept/reject/counter-offer | Andi, Pak Budi |
| **Messages** | Chat, conversation list, unread | Andi, Sari |
| **My Listings** | Filter status, edit/boost/delete | Andi, Pak Budi |
| **Favorites** | Grid favorit, view/message/remove | Sari |
| **KYC** | Upload KTP + selfie, 4 states | Andi, Pak Budi |
| **Settings** | Theme, notif, bahasa, mata uang | Semua |
| **Profile** | Edit nama, telepon, avatar | Semua |
| **Orders** | 4 stats, filter buyer/seller | Andi, Sari |
| **Withdraw** | Tarik ke rekening bank (6 bank) | Andi, Pak Budi |
| **Coupons** | Kupon promo aktif/expired | Andi |
| **Support** | FAQ + form kontak | Semua |

### 5.6 DEALER SECTION (`/dealer`)

| Halaman | Fitur Utama | Persona |
|---------|-------------|---------|
| **Dashboard** | Stat penjualan, marketplace comparison, monthly chart | Pak Budi |
| **Inventory** | Search, filter, grid/list, boost/edit/delete | Pak Budi |
| **Dealer Marketplace** | Browse & make offers, dealer-only | Pak Budi |
| **Stats** | Analitik, time range, charts, conversion rate | Pak Budi |
| **Profile** | Cover, logo, jam operasional, verifikasi | Pak Budi |
| **Offers** | Kelola penawaran masuk/keluar | Pak Budi |
| **Reviews** | Review & rating dealer | Pak Budi |
| **Team** | Kelola tim, roles, permissions | Pak Budi |

### 5.7 ADMIN PANEL (`/admin`)

| Halaman | Fitur Utama | Persona |
|---------|-------------|---------|
| **Dashboard** | 8 stats, charts, quick actions | Rina |
| **Users** | Manajemen pengguna, ban/roles | Rina |
| **Dealer Approval** | Approve/reject pendaftaran | Rina |
| **KYC Review** | Review dokumen, approve/reject | Rina |
| **All Listings** | Moderasi, ban/feature | Rina |
| **Token Packages** | Konfigurasi paket | Rina |
| **Boost Features** | Manajemen boost | Rina |
| **Categories** | CRUD kategori | Rina |
| **Banners** | CRUD banner iklan | Rina |
| **Payments** | Verifikasi pembayaran | Rina |
| **Revenue** | Laporan pendapatan | Rina |
| **Analytics** | Analitik detail | Rina |
| **Coupons** | Manajemen kupon | Rina |
| **Orders** | Manajemen order | Rina |
| **Withdrawals** | Proses penarikan | Rina |
| **Tickets** | Tiket support | Rina |
| **Settings** | Pengaturan platform | Rina |
| **Inspection Pricing** | Harga inspeksi | Rina |
| **Activity Logs** | Log aktivitas | Rina |
| **Broadcast** | Kirim notifikasi | Rina |

### 5.8 AI PRICE PREDICTION

**Flow untuk Andi:**
```
Data Kendaraan → Upload 5 Foto → Self-Inspection 160 Titik → Harga Beli → Hasil AI
```

| Komponen | Detail | Cost |
|----------|--------|------|
| VLM Analysis | 5 foto dianalisis menggunakan z-ai-web-dev-sdk | - |
| Market Data | Fetch listing serupa dari database | - |
| Seller Trust | Score berdasarkan verifikasi & history | - |
| Calculation | Condition × depreciation × market × trust | 5 tokens |
| Output | Price range, confidence, grade, risk level | - |
| Follow-up | Buat iklan / Inspeksi / Lihat detail | - |

### 5.9 INSPECTION SYSTEM

| Aspek | Detail |
|-------|--------|
| Total Points | 160 titik |
| Categories | Eksterior, Interior, Mesin, Rangka, Kelistrikan, dll |
| Status Per Item | Istimewa (100), Baik (80), Sedang (60), Perlu Perbaikan (40) |
| Grading | A+ (95-100) → E (<60) |
| Risk Level | Low / Medium / High |
| Type | Self (gratis) vs Professional (berbayar) |
| Certificate | 25 tokens |
| AI Analysis | Score, grade, estimasi harga, risk level |

### 5.10 TOKEN/CREDIT ECONOMY

#### Token Cost Table
| Aksi | Biaya | Durasi | Persona |
|------|-------|--------|---------|
| Marketplace Umum | 3 tokens | 30 hari | Andi |
| Dealer Marketplace | 5 tokens | 7 hari | Pak Budi |
| Kedua Marketplace | 8 tokens | 7+30 hari | Pak Budi |
| Chat Platform | 4 tokens | - | Andi |
| Inspeksi 160 Titik | 10 tokens | - | Dimas |
| Featured 7 Hari | 5 tokens | 7 hari | Andi |
| Perpanjang Listing | 2 tokens | 30 hari | Andi |
| AI Prediction | 5 tokens | - | Andi |
| Sertifikat Inspeksi | 25 tokens | - | Andi |
| **Nilai Token** | **1 token = Rp 10.000** | - | - |

#### Token Packages
| Paket | Token | Bonus | Harga | Persona |
|-------|-------|-------|-------|---------|
| Starter | 50 | 0 | Rp 500.000 | Andi |
| Basic | 100 | 10 | Rp 1.000.000 | Andi |
| Popular | 250 | 50 | Rp 2.500.000 | Pak Budi |
| Business | 500 | 150 | Rp 5.000.000 | Pak Budi |
| Enterprise | 1000 | 500 | Rp 10.000.000 | Pak Budi |

### 5.11 DEALER OFFER SYSTEM

**Offer Lifecycle:**
```
pending → viewed → negotiating → accepted/rejected/expired/withdrawn
```

| Fitur | Deskripsi | Persona |
|-------|-----------|---------|
| Create Offer | Dealer buat penawaran pada listing | Pak Budi |
| Counter-Offer | Seller tawar balik dengan harga & pesan | Andi |
| Accept/Reject | Seller terima/tolak penawaran | Andi |
| Auto-Reject | Auto reject jika listing dijual/dihapus | Sistem |
| 7-Day Expiry | Penawaran expired setelah 7 hari | Sistem |
| Notification | Real-time notifikasi untuk setiap aksi | Andi, Pak Budi |
| Fee Calculation | Platform fee dihitung saat accept | Pak Budi |

### 5.12 LOCATION SYSTEM

| Level | Deskripsi | API |
|-------|-----------|-----|
| Provinces | 34 provinsi Indonesia | `/api/locations/provinces` |
| Cities | Kota/kabupaten per provinsi | `/api/locations/cities?province_id=` |
| Districts | Kecamatan per kota | `/api/locations/districts?city_id=` |
| Villages | Kelurahan + kode pos | `/api/locations/villages?district_id=` |

---

## 6. BUSINESS RULES & LOGIC

### 6.1 Listing Rules
| Rule | Detail |
|------|--------|
| Durasi Umum | 30 hari |
| Durasi Dealer | 7 hari |
| KYC Required | Ya, untuk semua listing |
| Status Flow | draft → pending → active → sold/expired/suspended → deleted |
| Visibility | public / dealer_marketplace / both |
| Soft Delete | Set deleted_at + status=deleted |
| Auto-Reject Offers | Jika listing dijual/dihapus, semua pending offer auto-reject |

### 6.2 Credit/Token Rules
| Rule | Detail |
|------|--------|
| Nilai Token | 1 token = Rp 10.000 |
| Registration Bonus | 500 credits (first 500 users) |
| Refund | Proportional jika cancel boost >50% remaining |
| Deduction | Atomic: cek saldo → deduct → record transaksi |
| No Expiry | Token tidak kadaluarsa |

### 6.3 Dealer Offer Rules
| Rule | Detail |
|------|--------|
| Expiry | 7 hari |
| Auto-Reject | Saat listing sold/deleted/inactive |
| Counter-Offer | Tracked dalam counter_history |
| Platform Fee | Berdasarkan dealer_offer_settings (default 5%) |
| Exclusive Accept | Accept satu → auto-reject lainnya |

### 6.4 KYC Rules
| Rule | Detail |
|------|--------|
| Required for Listing | Ya |
| Required for Dealer | Ya + business docs |
| Documents | KTP + Selfie + data diri |
| Admin Review | Manual |
| Re-submission | Bisa jika rejected |

### 6.5 Inspection Rules
| Rule | Detail |
|------|--------|
| Scoring | Istimewa=100, Baik=80, Sedang=60, Perlu Perbaikan=40 |
| Grading | Weighted average → A+ s/d E |
| Self Inspection | Gratis |
| Professional | Berbayar |
| Certificate | 25 tokens, opsional |
| AI Analysis | Otomatis setelah submit |

---

## 7. API SPECIFICATIONS

### 7.1 API Route Summary (80+ Endpoints)

| Kategori | Jumlah | Key Endpoints |
|----------|--------|---------------|
| Listings | 6 | CRUD + view + create with tokens |
| Marketplace | 7 | Search, compare, rentals, brands, models, colors |
| Dealer | 7 | CRUD, registration, stats, reviews, team, offers |
| Dealer Marketplace | 6 | Listings, offers, favorites, settings |
| Inspections | 7 | CRUD, items, submit, bookings, pricing, certificate |
| Credits/Tokens | 14 | Balance, deduct, transactions, packages, purchase, boosts |
| Wallet | 3 | Balance, transactions, add/deduct |
| Orders | 3 | CRUD + status update |
| User | 7 | Profile, settings, listings, favorites, predictions |
| Admin | 30+ | Full CRUD semua modul |
| Location | 5 | Provinces, cities, districts, villages |
| Other | 10 | Auth, conversations, notifications, KYC, banners |
| Seed/Setup | 15 | Seed data, check-db, run-schema |

### 7.2 API Auth Levels
| Level | Endpoints | Auth Required |
|-------|-----------|---------------|
| **Public** | GET listings, brands, models, colors, locations, search | ❌ |
| **Authenticated** | POST/PUT/DELETE listings, credits, wallet, favorites, chat | ✅ |
| **Admin Only** | ALL /api/admin/* | ✅ + role=admin |
| **Dealer Only** | /api/dealer-marketplace/*, /api/dealer/* | ✅ + role=dealer |

### 7.3 API Response Format
```json
{
  "data": { ... },
  "error": null,
  "pagination": { "page": 1, "limit": 20, "total": 100, "totalPages": 5 }
}
```

---

## 8. UI/UX SPECIFICATIONS

### 8.1 Design System
| Aspek | Spesifikasi |
|-------|-------------|
| Brand Colors | Purple #6A0DAD + Blue #0033A0 + Light Blue #0099FF |
| Gradient | `linear-gradient(135deg, #6A0DAD, #0033A0)` |
| Dark Mode | Full support via next-themes |
| Typography | Geist Sans + Geist Mono |
| Locale | Bahasa Indonesia (id-ID) |
| Currency | IDR dengan Intl.NumberFormat |

### 8.2 Responsive Grid
| Breakpoint | Columns | Use Case |
|------------|---------|----------|
| Mobile | 2 | Default |
| SM (640px) | 3 | Small tablet |
| MD (768px) | 4 | Tablet |
| LG (1024px) | 5 | Desktop |

### 8.3 Component Library
- **40+ shadcn/ui components**
- **3 custom UI** — Logo, GradientHeading, StatsCard
- **11 SVG body type icons**
- **Framer Motion** animations
- **Skeleton** loading states

---

## 9. NON-FUNCTIONAL REQUIREMENTS

| Kategori | Target |
|----------|--------|
| First Contentful Paint | < 2 detik |
| Time to Interactive | < 3 detik |
| Lighthouse Score | > 90 |
| API Response | < 500ms (95th percentile) |
| Uptime | 99.9% |
| Concurrent Users | 1.000+ |
| Database | 90 tabel, designed for 100K+ listings |
| Security | RLS + auth middleware + KYC |

---

## 10. STATUS & KNOWN ISSUES

### ✅ Completed
- [x] Landing page semua section
- [x] Authentication (Google OAuth)
- [x] Marketplace public + dealer
- [x] Listing CRUD dengan token deduction
- [x] Dashboard user (18 sub-pages)
- [x] Dashboard dealer (8 sub-pages)
- [x] Admin panel (25+ sub-pages)
- [x] AI Price Prediction dengan VLM
- [x] 160-point Inspection system
- [x] Token/Credit economy
- [x] Dealer Offer lifecycle
- [x] KYC verification
- [x] Location system (4-level cascade)
- [x] Chat messaging (basic)
- [x] Ad banner system
- [x] Prisma schema (62 models)
- [x] Admin auth middleware
- [x] API upload endpoint
- [x] API auth utilities

### ⚠️ Partially Implemented
| Fitur | Issue |
|-------|-------|
| Chat/Messaging | Bot response masih mock, belum WebSocket |
| Coupons | Data hardcoded |
| Withdraw | Mock API |
| Payment Gateway | BNI VA placeholder |

### ❌ Not Implemented
| Fitur | Priority |
|-------|----------|
| Real-time Chat (WebSocket) | High |
| Push Notifications | Medium |
| Email Notifications | Medium |
| PDF Certificate Generation | Medium |
| Image Optimization (Sharp) | Low |
| Rate Limiting | High |
| Search Recommendations | Low |

### 🔧 Bugs Fixed in This Session
| # | Bug | Fix |
|---|-----|-----|
| 1 | Prisma schema hanya User+Post | Updated ke 62 models |
| 2 | No `/api/upload` endpoint | Created with Supabase Storage |
| 3 | Admin routes tanpa auth | Added api-auth middleware |
| 4 | Admin/Dealer layout tanpa auth guard | Added redirect logic |
| 5 | `getSupabaseAdmin()` module-scope crash | Moved inside handlers |
| 6 | `?admin=true` bypass auth on listings | Replaced with proper auth |
| 7 | No auth on listings/create | Added user verification |
| 8 | Type inconsistencies marketplace.ts | Aligned with Supabase |
| 9 | CarCard wrong transaction keys | Fixed to Indonesian values |
| 10 | useListings wrong API keys | Fixed data.listings |
| 11 | 36+ API routes using client supabase | Migrated to server client |
| 12 | Wrong column names (is_banned, car_listing_id) | Fixed |
| 13 | supabase.ts crash on missing env vars | Safe fallback |
| 14 | No consistent API error handling | Created api-utils.ts |

---

## 11. ROADMAP

### Phase 1 — Stabilization (Week 1-2) ✅ Done
- [x] Fix Prisma schema
- [x] Fix admin auth middleware
- [x] Fix critical code issues
- [x] Fix API route consistency

### Phase 2 — Real-time & Payment (Week 3-4)
- [ ] WebSocket chat with socket.io
- [ ] Payment gateway (Midtrans/Xendit)
- [ ] Real withdraw functionality
- [ ] Push notification support

### Phase 3 — Polish (Week 5-6)
- [ ] Image optimization pipeline
- [ ] PDF certificate generation
- [ ] Email notifications
- [ ] Rate limiting

### Phase 4 — Growth (Week 7-8)
- [ ] Recommendation engine
- [ ] Price alert system
- [ ] PWA support
- [ ] Advanced analytics

---

## 12. GLOSSARY

| Istilah | Definisi |
|---------|----------|
| **160 Titik** | Sistem inspeksi 160 pemeriksaan pada kendaraan |
| **KYC** | Know Your Customer — verifikasi identitas (KTP + Selfie) |
| **VLM** | Vision Language Model — AI untuk analisis gambar kendaraan |
| **Escrow** | Sistem pembayaran dimana dana ditahan sampai transaksi selesai |
| **Token** | Mata uang digital platform (1 token = Rp 10.000) |
| **Credit** | Satuan kredit untuk akses fitur (alias token) |
| **Dealer Marketplace** | Marketplace khusus dealer (B2B) |
| **Public Marketplace** | Marketplace umum (C2C) |
| **Boost** | Fitur meningkatkan visibilitas listing |
| **Counter-Offer** | Penawaran balik dari seller ke dealer |
| **Grade** | Nilai inspeksi (A+ s/d E) berdasarkan 160 titik |
| **Body Type** | Tipe bodi kendaraan (SUV, MPV, Sedan, dll) |
| **RLS** | Row Level Security — keamanan database per baris |
| **Visibility** | Tingkat visibilitas listing: public/dealer_marketplace/both |

---

*Dokumen ini di-generate dari analisis lengkap seluruh codebase AutoMarket — 300+ file, 90 database tables, 80+ API routes, 60+ components, 11 hooks, 62 Prisma models. Semua bug yang ditemukan telah diperbaiki.*
