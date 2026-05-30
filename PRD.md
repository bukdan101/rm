# 🚗 AutoMarket — Product Requirements Document (PRD)
## Versi 2.0 | 4 Maret 2026

---

## DAFTAR ISI

1. [Visi & Misi Produk](#1-visi--misi-produk)
2. [User Roles & Personas](#2-user-roles--personas)
3. [Arsitektur Sistem](#3-arsitektur-sistem)
4. [User Flow — Lengkap](#4-user-flow--lengkap)
5. [Feature Matrix — Per Role](#5-feature-matrix--per-role)
6. [Detail Fitur Per Modul](#6-detail-fitur-per-modul)
7. [Gap Analysis vs Kompetitor](#7-gap-analysis-vs-kompetitor)
8. [Status Implementasi](#8-status-implementasi)
9. [Roadmap](#9-roadmap)

---

## 1. Visi & Misi Produk

### Visi
Menjadi marketplace otomotif #1 di Indonesia yang menghubungkan pembeli, penjual, dan dealer dalam satu ekosistem terpadu — dari listing, inspeksi, pembiayaan (kredit), hingga pembayaran via AstraPay.

### Misi
- Memberikan pengalaman jual-beli mobil yang aman dan transparan: listing → inspeksi → negosiasi → transaksi
- Menyediakan alat kredit/pembiayaan berbasis AstraPay dengan kalkulasi bunga flat dan jadwal cicilan
- Memberdayakan dealer dengan dashboard khusus, inventory management, dan dealer marketplace
- Membangun ekonomi token: 1 token = Rp 10.000 untuk akses fitur marketplace
- Mengintegrasikan AI (VLM) untuk prediksi harga dan analisis kondisi kendaraan

### Referensi Kompetitor
| Platform | URL | Model Bisnis |
|----------|-----|-------------|
| Mobil123 | mobil123.com | Listing gratis + premium, dealer subscription |
| Carmudi | carmudi.co.id | Listing fee, lead generation, dealer portal |
| OLX Autos | olxautos.co.id | C2C marketplace, inspeksi, buyback guarantee |
| Rotogravure | roto.com | Inspeksi mobil, sertifikasi, guarantee |
| Carsome | carsome.id | B2C auction, inspeksi, dealer bidding |

---

## 2. User Roles & Personas

### 2.1 Role Hierarchy

```
ADMIN
  └── (full platform access)
BUYER (public register)
  └── bisa upgrade → SELLER (via KYC)
        └── bisa upgrade → DEALER (via dealer registration + admin approval)
              └── DEALER_STAFF (created by DEALER)
INSPECTOR (assigned by system/admin)
```

### 2.2 Persona Detail

| Role | Deskripsi | Akses Utama | Login Via |
|------|-----------|-------------|-----------|
| **ADMIN** | Platform owner, mengelola seluruh sistem, approve KYC & dealer | `/admin` — Semua menu | NextAuth / Supabase |
| **BUYER** | Pengguna umum yang mencari & membeli mobil | `/` — Marketplace + `/dashboard` (terbatas) | NextAuth / Google |
| **SELLER** | Pemilik mobil yang ingin menjual (wajib KYC) | `/dashboard` — Listing, inspeksi, pesan | NextAuth / Google |
| **DEALER** | Showroom/dealer resmi dengan banyak inventory | `/dealer` — Dealer dashboard + marketplace | NextAuth / Google |
| **DEALER_STAFF** | Staf dealer yang membantu operasional | `/dealer` — Menu terbatas sesuai permission | NextAuth / Google |
| **INSPECTOR** | Pihak ketiga yang melakukan inspeksi kendaraan | `/dashboard/inspeksi` — Input hasil inspeksi | NextAuth / Google |

### 2.3 Perbandingan Dashboard

| Aspek | ADMIN | DEALER | SELLER | BUYER |
|-------|-------|--------|--------|-------|
| **Dashboard** | Platform-wide KPIs: total listings, revenue, users | Dealer-scope: inventory, offers, team | My listings, views, inquiries | My favorites, orders, predictions |
| **Listings** | Semua listing di platform | Hanya listing dealer sendiri | Hanya listing milik sendiri | Browse & search saja |
| **Keuangan** | Semua transaksi, fee, withdrawal | Pendapatan dealer, saldo, withdrawal | Penjualan, saldo | Pembayaran, kredit |
| **Dealer** | Approve/reject dealer, set fee | Edit profil, kelola tim | Tidak ada akses | Lihat profil dealer |
| **Inspeksi** | Semua inspeksi, kategori, pricing | Inspeksi listing dealer | Inspeksi listing sendiri | Lihat hasil inspeksi |
| **Settings** | Fee, AstraPay, token, sistem | Pengaturan dealer marketplace | Pengaturan profil | Pengaturan profil |

---

## 3. Arsitektur Sistem

### 3.1 Infrastructure

```
┌─────────────────────────────────────────────────────┐
│                  Next.js 16 (App Router)             │
│                  Port: 3000                          │
│                                                      │
│  ┌──────────────────┐    ┌──────────────────────┐   │
│  │  Frontend (SSR)  │    │  API Routes (127)     │   │
│  │  React 19        │    │  /api/*               │   │
│  │  shadcn/ui       │    │  NextAuth + RBAC      │   │
│  └────────┬─────────┘    └───────────┬───────────┘   │
│           │                          │               │
│           ▼                          ▼               │
│  ┌──────────────────┐    ┌──────────────────────┐   │
│  │  Zustand         │    │  Prisma ORM           │   │
│  │  TanStack Query  │    │  SQLite (dev)         │   │
│  │  (Client State)  │    │  67 Models            │   │
│  └──────────────────┘    └──────────────────────┘   │
│                                                      │
│  ┌──────────────────┐    ┌──────────────────────┐   │
│  │  Supabase        │    │  AstraPay API         │   │
│  │  (Legacy/Auth)   │    │  OAuth2 + Payment     │   │
│  └──────────────────┘    │  + Paylater + KYC     │   │
│                          └──────────────────────┘   │
│  ┌──────────────────┐    ┌──────────────────────┐   │
│  │  z-ai-web-dev-sdk│    │  Local Filesystem     │   │
│  │  (VLM, LLM)      │    │  (images, documents)  │   │
│  └──────────────────┘    └──────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 3.2 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Framework** | Next.js 16, React 19, TypeScript 5 |
| **Styling** | Tailwind CSS 4, shadcn/ui (New York style), Framer Motion |
| **Database** | Prisma ORM + SQLite (dev), Supabase (auth/legacy) |
| **Payment** | AstraPay SNAP API (VA, QRIS, e-wallet, paylater, direct debit) |
| **Auth** | NextAuth.js v4 + Supabase Auth + Google OAuth |
| **State** | Zustand (client) + TanStack Query (server) |
| **AI** | z-ai-web-dev-sdk (VLM untuk analisis gambar, LLM untuk prediksi harga) |
| **Forms** | React Hook Form + Zod validation |
| **Charts** | Recharts |
| **i18n** | next-intl (Bahasa Indonesia) |
| **Runtime** | Bun |

### 3.3 Database — 67 Models (20 Modul)

| # | Model | Modul | Fungsi |
|---|-------|-------|--------|
| 1 | `Profile` | USER | Semua user (5 role), soft-delete, last_login |
| 2 | `Dealer` | DEALER | Profil dealer, slug, rating, subscription_tier, verified |
| 3 | `DealerStaff` | DEALER | Staf→Dealer assignment dengan permission (can_edit, can_delete) |
| 4 | `DealerReview` | DEALER | Review & rating dealer dari buyer |
| 5 | `DealerRegistration` | DEALER | Pendaftaran dealer baru (KTP, NPWP, NIB, SIUP, dokumen) |
| 6 | `Brand` | CAR MASTER | Merk mobil (logo, country, is_popular) |
| 7 | `CarModel` | CAR MASTER | Model mobil per brand (body_type) |
| 8 | `CarVariant` | CAR MASTER | Varian per model (year, transmission, fuel, engine, price) |
| 9 | `CarColor` | CAR MASTER | Warna mobil (hex_code, is_metallic) |
| 10 | `CarListing` | LISTING | Listing mobil utama (30+ field, slug, status, marketplace_type) |
| 11 | `CarImage` | LISTING | Gambar listing (is_primary, display_order) |
| 12 | `CarVideo` | LISTING | Video listing |
| 13 | `CarDocument` | LISTING | Dokumen (STNK, BPKB, faktur, verified) |
| 14 | `CarFeature` | LISTING | 20 fitur boolean (sunroof, cruise_control, airbag, dll.) |
| 15 | `CarFavorite` | LISTING | Favorit user (unique user+listing) |
| 16 | `CarRentalPrice` | LISTING | Harga sewa (per jam/hari/minggu/bulan + deposit) |
| 17 | `InspectionCategory` | INSPECTION | Kategori inspeksi (icon, order_index) |
| 18 | `InspectionItem` | INSPECTION | Item inspeksi per kategori (is_critical) |
| 19 | `CarInspection` | INSPECTION | Hasil inspeksi (160 poin, grade, sertifikat, AI price) |
| 20 | `InspectionResult` | INSPECTION | Detail hasil per item (status, foto, severity) |
| 21 | `InspectionBooking` | INSPECTION | Booking jadwal inspeksi |
| 22 | `InspectionPricing` | INSPECTION | Paket harga inspeksi |
| 23 | `CertificatePurchase` | INSPECTION | Pembelian sertifikat inspeksi |
| 24 | `KycVerification` | KYC | Verifikasi identitas (KTP, selfie, alamat) |
| 25 | `UserCredit` | CREDIT | Saldo kredit user (balance, total_earned, total_spent) |
| 26 | `CreditTransaction` | CREDIT | Riwayat transaksi kredit |
| 27 | `CreditPackage` | CREDIT | Paket kredit yang bisa dibeli |
| 28 | `CreditUsageLog` | CREDIT | Log penggunaan kredit |
| 29 | `RegistrationBonusTracker` | CREDIT | Bonus registrasi |
| 30 | `TokenSetting` | TOKEN | Setting token per aksi (key, tokens, category) |
| 31 | `TokenPackage` | TOKEN | Paket token yang bisa dibeli |
| 32 | `TokenTransaction` | TOKEN | Riwayat transaksi token |
| 33 | `TokenBalance` | TOKEN | Saldo token user |
| 34 | `UserToken` | TOKEN | Saldo token user (alternate) |
| 35 | `Payment` | PAYMENT | Pembayaran (credits_awarded, proof_url, va_number) |
| 36 | `ListingBoost` | PAYMENT | Boost listing (featured, urgent, dll.) |
| 37 | `BoostFeature` | PAYMENT | Jenis boost yang tersedia |
| 38 | `Conversation` | CHAT | Percakapan buyer↔seller per listing |
| 39 | `Message` | CHAT | Pesan dalam percakapan (text, is_read) |
| 40 | `Order` | ORDER | Transaksi jual-beli (escrow, fee breakdown) |
| 41 | `Notification` | NOTIFICATION | Notifikasi user (type, action_url) |
| 42 | `DealerOffer` | DEALER MKT | Penawaran dealer ke listing (counter-offer, financing) |
| 43 | `DealerOfferHistory` | DEALER MKT | Riwayat negosiasi offer |
| 44 | `DealerMarketplaceFavorite` | DEALER MKT | Favorit dealer di marketplace |
| 45 | `DealerMarketplaceSettings` | DEALER MKT | Setting marketplace (offer_duration, max_counter) |
| 46 | `DealerOfferSettings` | DEALER MKT | Setting offer (key-value) |
| 47 | `DealerMarketplaceView` | DEALER MKT | Log view listing oleh dealer |
| 48 | `AiPrediction` | AI | Prediksi harga AI (VLM analysis, market data, confidence) |
| 49 | `PredictionPhoto` | AI | Foto untuk prediksi (VLM analyzed) |
| 50 | `PredictionFactor` | AI | Faktor yang mempengaruhi prediksi (impact, weight) |
| 51 | `AiPriceAnalysis` | AI | Analisis harga dari inspeksi |
| 52 | `Country` | LOCATION | Data negara |
| 53 | `Province` | LOCATION | Data provinsi Indonesia |
| 54 | `City` | LOCATION | Data kota/kabupaten |
| 55 | `District` | LOCATION | Data kecamatan |
| 56 | `Village` | LOCATION | Data kelurahan/desa |
| 57 | `Banner` | BANNER | Banner promosi (position, impressions, clicks) |
| 58 | `UserSetting` | SETTINGS | Pengaturan user (theme, language, notifications) |
| 59 | `AnalyticsPageView` | ANALYTICS | Page view tracking |
| 60 | `CarView` | ANALYTICS | Listing view tracking |
| 61 | `Wallet` | WALLET | Saldo dompet user |
| 62 | `AstraPayConfig` | ASTRAPAY | Konfigurasi AstraPay (client_id, keys, sandbox) |
| 63 | `AstraPayToken` | ASTRAPAY | Audit trail OAuth token AstraPay |
| 64 | `AstraPayAccountLink` | ASTRAPAY | User yang sudah link akun AstraPay |
| 65 | `AstraPayTransaction` | ASTRAPAY | Transaksi pembayaran AstraPay (full lifecycle) |
| 66 | `CreditApplication` | CREDIT/FIN | Aplikasi kredit kendaraan (bunga flat, tenor 1-84 bulan) |
| 67 | `CreditPayment` | CREDIT/FIN | Jadwal cicilan bulanan (principal + interest + late fee) |

---

## 4. User Flow — Lengkap

### 4.1 🟢 ADMIN Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      ADMIN USER FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Login ──► Dashboard (Platform KPIs)                            │
│                │                                                 │
│    ┌───────────┼───────────────┬──────────────┐                  │
│    ▼           ▼               ▼              ▼                  │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐         │
│  │ Users   │ │ Listings │ │  Dealers  │ │  Orders   │         │
│  │Manage   │ │All+Ban   │ │Approve/   │ │  All      │         │
│  │Roles    │ │Featured  │ │Reject     │ │Filter     │         │
│  └─────────┘ └──────────┘ └───────────┘ └───────────┘         │
│    ┌───────────┼───────────────┬──────────────┐                  │
│    ▼           ▼               ▼              ▼                  │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐         │
│  │ KYC     │ │Payments  │ │ Credits   │ │  Tokens   │         │
│  │Review   │ │Verify    │ │Packages   │ │Settings   │         │
│  │Approve/ │ │Proof     │ │Manage     │ │Pricing    │         │
│  │Reject   │ │          │ │           │ │           │         │
│  └─────────┘ └──────────┘ └───────────┘ └───────────┘         │
│    ┌───────────┼───────────────┬──────────────┐                  │
│    ▼           ▼               ▼              ▼                  │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐         │
│  │Analytics│ │ Revenue  │ │  Banners  │ │  Coupons  │         │
│  │Charts   │ │Reports   │ │  CRUD     │ │  CRUD     │         │
│  │Advanced │ │Export    │ │           │ │           │         │
│  └─────────┘ └──────────┘ └───────────┘ └───────────┘         │
│    ┌───────────┼───────────────┬──────────────┐                  │
│    ▼           ▼               ▼              ▼                  │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐         │
│  │Settings │ │ Activity │ │Withdrawals│ │  Boost    │         │
│  │Fee/AP/  │ │  Logs    │ │Approve/   │ │  Features │         │
│  │General  │ │Filterable│ │Reject     │ │  Manage   │         │
│  └─────────┘ └──────────┘ └───────────┘ └───────────┘         │
│    ┌───────────┼───────────────┐                                │
│    ▼           ▼               ▼                                 │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐                        │
│  │  Topup  │ │Inspection│ │  Dealer   │                        │
│  │ Manual  │ │Categories│ │Marketplace│                        │
│  │         │ │Pricing   │ │ Settings  │                        │
│  └─────────┘ └──────────┘ └───────────┘                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 🔵 DEALER Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                       DEALER USER FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Login ──► Dealer Dashboard (Inventory KPIs)                    │
│                │                                                 │
│    ┌───────────┼───────────────┬──────────────┐                  │
│    ▼           ▼               ▼              ▼                  │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐         │
│  │Inventory│ │  Offers  │ │ Profile   │ │  Team     │         │
│  │(Mine)   │ │Received/ │ │Edit+Logo  │ │Staff CRUD │         │
│  │CRUD     │ │Sent      │ │+Cover     │ │Permission │         │
│  └─────────┘ └──────────┘ └───────────┘ └───────────┘         │
│                                                                  │
│  ── MARKETPLACE ──────────────────────────────────────────────  │
│    ┌───────────┼───────────────┬──────────────┐                  │
│    ▼           ▼               ▼              ▼                  │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐         │
│  │Browse   │ │  Make    │ │ Favorites │ │ Settings  │         │
│  │Listings │ │  Offer   │ │Save Cars  │ │Offer Dur. │         │
│  │Filter   │ │Counter   │ │           │ │Auto-Reject│         │
│  └─────────┘ └──────────┘ └───────────┘ └───────────┘         │
│                                                                  │
│  ── KEUANGAN ─────────────────────────────────────────────────  │
│    ┌───────────┼───────────────┐                                │
│    ▼           ▼               ▼                                 │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐                        │
│  │ Revenue │ │Withdraw  │ │  Stats    │                        │
│  │My Sales │ │Request   │ │Dealer     │                        │
│  │Charts   │ │History   │ │Analytics │                        │
│  └─────────┘ └──────────┘ └───────────┘                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 🟠 SELLER Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                       SELLER USER FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  1. REGISTER & KYC                                    │       │
│  │  Sign Up → Upload KTP + Selfie → Admin Review         │       │
│  │  └─► Status: not_submitted → pending → verified       │       │
│  └──────────────────────┬───────────────────────────────┘       │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  2. BUAT LISTING                                      │       │
│  │  Pilih Brand → Model → Varian → Isi detail            │       │
│  │  └─► Upload foto (maks 20) + video                    │       │
│  │  └─► Pilih fitur (20 checkbox)                        │       │
│  │  └─► Set harga cash / kredit / negotiable             │       │
│  │  └─► Pilih marketplace type (token-based)             │       │
│  │  └─► 5-step wizard: Basic → Details → Photos →        │       │
│  │       Marketplace → Review                            │       │
│  └──────────────────────┬───────────────────────────────┘       │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  3. PASARKAN LISTING                                  │       │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐              │       │
│  │  │ Boost    │ │ Dealer   │ │ Inspeksi │              │       │
│  │  │ Featured │ │Market-   │ │ (Opsional│              │       │
│  │  │ Urgent   │ │place     │ │  160 poin│              │       │
│  │  └──────────┘ └──────────┘ └──────────┘              │       │
│  └──────────────────────┬───────────────────────────────┘       │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  4. NEGOSIASI & TRANSAKSI                             │       │
│  │  Chat dengan buyer → Terima tawaran → Buat Order      │       │
│  │  └─► Atau: Dealer offer → Counter → Accept/Reject     │       │
│  │  └─► Escrow system (platform_fee + seller_fee)         │       │
│  └──────────────────────┬───────────────────────────────┘       │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  5. CAIRKAN DANA                                      │       │
│  │  Saldo → Withdraw Request → Admin Approve → Transfer  │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                  │
│  ── AKUN SAYA ────────────────────────────────────────────────  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │My Listings│ │Messages  │ │Favorites │ │Predictions│         │
│  │CRUD+Stats │ │Chat      │ │Saved Cars│ │AI Price  │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 🟣 BUYER Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                       BUYER USER FLOW                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  1. CARI MOBIL                                        │       │
│  │  Landing Page (/) → Search + Filter                   │       │
│  │  └─► Filter: brand, model, harga, tahun, lokasi      │       │
│  │  └─► Bandingkan mobil (compare panel)                 │       │
│  └──────────────────────┬───────────────────────────────┘       │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  2. LIHAT DETAIL                                      │       │
│  │  Gallery foto/video + Spesifikasi + Fitur             │       │
│  │  └─► Hasil inspeksi (jika ada) + Sertifikat          │       │
│  │  └─► AI Price Prediction + Market Analysis            │       │
│  │  └─► Profil seller / dealer                           │       │
│  └──────────────────────┬───────────────────────────────┘       │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  3. HUBUNGI / NEGOSIASI                               │       │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐              │       │
│  │  │  Chat    │ │  Dealer  │ │  Favorite │              │       │
│  │  │  Seller  │ │  Offer   │ │  Save     │              │       │
│  │  │(Watsapp) │ │ (B2B)    │ │           │              │       │
│  │  └──────────┘ └──────────┘ └──────────┘              │       │
│  └──────────────────────┬───────────────────────────────┘       │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  4. PEMBELIAN CASH / KREDIT                           │       │
│  │  ┌────────────────────┐  ┌────────────────────┐      │       │
│  │  │ CASH               │  │ KREDIT (AstraPay)  │      │       │
│  │  │ Buat Order →       │  │ Kalkulator Kredit  │      │       │
│  │  │ Escrow → Bayar     │  │ DP + Tenor + Bunga │      │       │
│  │  │ Verifikasi → Done  │  │ Apply → AstraPay   │      │       │
│  │  └────────────────────┘  │ Paylater/Linking   │      │       │
│  │                           │ Cicilan Bulanan    │      │       │
│  │                           └────────────────────┘      │       │
│  └──────────────────────┬───────────────────────────────┘       │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  5. PEMBAYARAN (ASTRAPAY)                             │       │
│  │  Pilih metode:                                        │       │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │       │
│  │  │ Payment  │ │  Push    │ │ Direct   │ │Paylater │ │       │
│  │  │ w/ Link  │ │Payment   │ │ Debit    │ │(Cicilan)│ │       │
│  │  └──────────┘ └──────────┘ └──────────┘ └─────────┘ │       │
│  │  └─► Redirect ke AstraPay → Callback → Confirmed     │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                  │
│  ── AKUN SAYA ────────────────────────────────────────────────  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │My Orders │ │My Credits│ │My Tokens │ │ Settings │         │
│  │History   │ │Financing │ │Balance   │ │Profile   │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.5 🔴 INSPECTOR Flow

```
┌──────────────────────────────────────────────────┐
│              INSPECTOR FLOW                       │
├──────────────────────────────────────────────────┤
│                                                   │
│  Login ──► Dashboard Inspeksi                    │
│                │                                  │
│    ┌───────────┼───────────────┐                  │
│    ▼           ▼               ▼                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │  BOOKING │ │ INSPECT  │ │  INPUT   │         │
│  │  ──────  │ │  ──────  │ │  ──────  │         │
│  │  Jadwal  │ │  160     │ │  Hasil   │         │
│  │  inspeksi│ │  poin    │ │  per item│         │
│  │          │ │  per     │ │          │         │
│  │  Status: │ │  kategori│ │  Status: │         │
│  │  Pending │ │          │ │  Baik/   │         │
│  │  → Done  │ │  Foto    │ │  Rusak/  │         │
│  └──────────┘ │  per item│ │  Warning │         │
│               └──────────┘ └──────────┘         │
│    ┌───────────┼───────────────┐                  │
│    ▼           ▼               ▼                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │CERTIFICATE│ │ PRICING  │ │ AI PRICE │         │
│  │ ──────── │ │  ──────  │ │  ──────  │         │
│  │ Generate │ │  Paket   │ │ Analisis │         │
│  │ Sertifikat│ │  harga   │ │ harga    │         │
│  │ + Grade  │ │  inspeksi│ │ otomatis │         │
│  └──────────┘ └──────────┘ └──────────┘         │
│                                                   │
└──────────────────────────────────────────────────┘
```

### 4.6 💰 Financial Flow (Pembayaran → Pencairan)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FINANCIAL FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BUYER PAYS                     PLATFORM RECEIVES               │
│  ──────────                      ──────────────                 │
│  Rp 200.000.000                Rp 200.000.000                   │
│  (Mobil Avanza)                     │                           │
│       │                             ▼                           │
│       │                   ┌─────────────────┐                   │
│       │                   │  Full Breakdown  │                   │
│       │                   │  ──────────────  │                   │
│       │                   │  Agreed Price200M│                   │
│       │                   │  Platform Fee 1% │ ← Ke platform    │
│       │                   │    = 2M          │                   │
│       │                   │  Seller Fee  0%  │ ← Gratis seller  │
│       │                   │  Buyer Fee   0%  │ ← Gratis buyer   │
│       │                   │  ──────────────  │                   │
│       │                   │  Net to Seller198M│ ← Ke seller     │
│       │                   └─────────────────┘                   │
│       │                              │                          │
│       │                              ▼                          │
│       │                   ┌───────────────┐                     │
│       │                   │ Escrow System │                     │
│       │                   │ Status: held  │                     │
│       │                   └───────┬───────┘                     │
│       │                           │                             │
│       │              ┌────────────┼────────────┐                │
│       │              ▼                         ▼                │
│       │     ┌───────────────┐      ┌────────────────┐          │
│       │     │ CONFIRMED     │      │ CANCELLED      │          │
│       │     │ Release funds │      │ Refund buyer   │          │
│       │     │ → Seller      │      │ → Full refund  │          │
│       │     └───────────────┘      └────────────────┘          │
│       │                                                          │
│       ▼                                                          │
│  ┌───────────┐                                                  │
│  │ AstraPay  │ ◄── Payment Gateway (Linking, Push, DD, Paylater)│
│  │ SNAP API  │                                                  │
│  └───────────┘                                                  │
│                                                                  │
│  ── KREDIT FLOW ─────────────────────────────────────────────── │
│                                                                  │
│  Rp 200.000.000 (Harga Mobil)                                   │
│  - DP 30% = Rp 60.000.000                                       │
│  = Pinjaman Rp 140.000.000                                      │
│  + Bunga Flat 5% x 3 tahun = Rp 21.000.000                     │
│  = Total Cicilan Rp 161.000.000                                 │
│  = Per bulan Rp 4.472.222 (x36 bulan)                           │
│                                                                  │
│  Pembayaran cicilan via AstraPay:                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                        │
│  │Pay w/    │ │Push      │ │Paylater  │                        │
│  │Linking   │ │Payment   │ │(Auto-    │                        │
│  │(Akun AP) │ │(No link) │ │ debit)   │                        │
│  └──────────┘ └──────────┘ └──────────┘                        │
│                                                                  │
│  Late Fee: 0.1% per hari dari amount_due                        │
│  Reminder: UPCOMING / OVERDUE / FINAL_NOTICE via AstraPay API   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.7 🔄 Listing Lifecycle

```
                    ┌──────────┐
                    │  DRAFT   │ ◄── CreateListing
                    └────┬─────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │PUBLISHED │  │ REJECTED │  │ EXPIRED  │
    │(Active)  │  │(Admin)   │  │(Auto/    │
    │          │  │          │  │ Timer)   │
    └────┬─────┘  └──────────┘  └──────────┘
         │
    ┌────┼──────────────┐
    ▼    ▼              ▼
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │  SOLD    │  │ BANNED   │  │ FEATURED │
  │(Buyer    │  │(Admin    │  │(Boost    │
  │ found)   │  │ action)  │  │ active)  │
  └──────────┘  └──────────┘  └──────────┘

    Marketplace Visibility:
    - Token required untuk publish ke marketplace
    - Boost = Featured position (tokens/hari)
    - Dealer Marketplace = B2B channel terpisah
```

### 4.8 🚗 Credit Application Lifecycle

```
    ┌──────────┐     Submit Application     ┌───────────┐
    │  DRAFT   │ ──────────────────────────►│ SUBMITTED │
    └──────────┘                            └─────┬─────┘
                                                  │
                                   ┌──────────────┼──────────────┐
                                   ▼              ▼              ▼
                             ┌───────────┐ ┌───────────┐ ┌───────────┐
                             │ APPROVED  │ │ REJECTED  │ │ DEFAULTED │
                             │(Admin)    │ │(Admin)    │ │(Late pay) │
                             └─────┬─────┘ └───────────┘ └───────────┘
                                   │
                                   ▼
                             ┌───────────┐
                             │ DISBURSED │ ◄── Dana cair
                             └─────┬─────┘
                                   │
                          ┌────────┼────────┐
                          ▼                 ▼
                    ┌───────────┐    ┌───────────┐
                    │  PAYING   │    │ OVERDUE   │
                    │(Cicilan   │    │(Late fee  │
                    │ bulanan)  │    │ 0.1%/hari)│
                    └─────┬─────┘    └─────┬─────┘
                          │                 │
                          ▼                 │
                    ┌───────────┐           │
                    │ COMPLETED │ ◄─────────┘
                    │(Lunas)    │   (Catch up)
                    └───────────┘

    Bunga Flat: (Pinjaman × rate × tenor) / tenor bulan
    Min DP: 10%, Max Tenor: 84 bulan
    Payment via: AstraPay (Linking / Push / Direct Debit / Paylater)
```

---

## 5. Feature Matrix — Per Role

### 5.1 Core Features

| Feature | ADMIN | DEALER | SELLER | BUYER | INSPECTOR |
|---------|:-----:|:------:|:------:|:-----:|:---------:|
| **Dashboard** | ✅ Platform-wide | ✅ Dealer-scope | ✅ My Listings | ✅ My Activity | ✅ Inspections |
| **Listings** | ✅ All + Ban | ✅ My Inventory | ✅ My Listings | 👁️ Browse | 👁️ View |
| **Create Listing** | - | ✅ Dealer Token | ✅ Token-based | - | - |
| **Car Detail** | ✅ All | 👁️ View | ✅ Own | 👁️ View | 👁️ View |
| **Search & Filter** | ✅ Advanced | ✅ Marketplace | ✅ Basic | ✅ Full | - |
| **Compare Cars** | - | ✅ | ✅ | ✅ | - |
| **Favorites** | - | ✅ Marketplace | ✅ My Cars | ✅ My Cars | - |
| **Inspection** | ✅ All | ✅ My Cars | ✅ My Cars | 👁️ View | ✅ Create |
| **AI Prediction** | ✅ All | ✅ | ✅ | ✅ | - |

### 5.2 Marketplace & Transaction Features

| Feature | ADMIN | DEALER | SELLER | BUYER | INSPECTOR |
|---------|:-----:|:------:|:------:|:-----:|:---------:|
| **Dealer Marketplace** | ✅ Settings | ✅ Browse + Offer | ✅ Publish to DM | - | - |
| **Dealer Offers** | ✅ View All | ✅ Make/Receive | ✅ Accept/Reject | - | - |
| **Counter Offer** | - | ✅ | ✅ | - | - |
| **Chat/Messaging** | - | ✅ | ✅ | ✅ | - |
| **Order System** | ✅ All Orders | ✅ Dealer Orders | ✅ My Orders | ✅ My Orders | - |
| **Escrow** | ✅ Manage | - | ✅ Receive | ✅ Pay | - |
| **Credit/Financing** | ✅ Approve/Reject | - | - | ✅ Apply | - |
| **AstraPay Payment** | - | - | - | ✅ Pay | - |

### 5.3 Financial Features

| Feature | ADMIN | DEALER | SELLER | BUYER | INSPECTOR |
|---------|:-----:|:------:|:------:|:-----:|:---------:|
| **Revenue Overview** | ✅ Platform | ✅ Dealer Rev | ✅ My Sales | - | - |
| **Wallet** | ✅ All | ✅ Dealer | ✅ My Balance | ✅ My Balance | - |
| **Withdraw Request** | ✅ Approve | ✅ Create | ✅ Create | - | - |
| **Token Management** | ✅ Settings | ✅ Purchase | ✅ Purchase | ✅ Purchase | - |
| **Credit Packages** | ✅ CRUD | ✅ Purchase | ✅ Purchase | ✅ Purchase | - |
| **Boost Features** | ✅ CRUD | ✅ Use | ✅ Use | - | - |
| **Payment Verification** | ✅ Verify | - | - | - | - |
| **Manual Top-up** | ✅ Create | - | - | - | - |

### 5.4 System Features

| Feature | ADMIN | DEALER | SELLER | BUYER | INSPECTOR |
|---------|:-----:|:------:|:------:|:-----:|:---------:|
| **User Management** | ✅ Role Change | - | - | - | - |
| **KYC Review** | ✅ Approve/Reject | - | ✅ Submit | - | - |
| **Dealer Approval** | ✅ Approve/Reject | - | ✅ Register | - | - |
| **Analytics** | ✅ Advanced | ✅ Dealer | ✅ My Stats | - | - |
| **Settings** | ✅ Fee/AP/General | ✅ DM Settings | ✅ Profile | ✅ Profile | - |
| **Banners** | ✅ CRUD | - | - | 👁️ View | - |
| **Coupons** | ✅ CRUD | - | - | ✅ Use | - |
| **Notifications** | ✅ Manage | ✅ | ✅ | ✅ | ✅ |
| **Activity Logs** | ✅ Full | - | - | - | - |
| **Inspection Pricing** | ✅ CRUD | - | 👁️ View | 👁️ View | 👁️ View |

---

## 6. Detail Fitur Per Modul

### 6.1 AUTH MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `GET /api/auth/check-role` | Check user role | Auth | ✅ |
| `GET/PUT /api/profile` | Get/update profile | Auth | ✅ |
| `GET/PUT /api/users/[id]` | Get/update user by ID | Auth | ✅ |
| `GET/PUT /api/user-settings` | Get/update settings | Auth | ✅ |

**Flow**:
- NextAuth.js + Supabase Auth
- Google OAuth → create/update profile → JWT session
- Role hierarchy: admin > dealer > seller > buyer
- KYC verification required for seller actions

### 6.2 LISTING MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `GET /api/listings` | Search/browse listings | Public | ✅ |
| `POST /api/listings/create` | Create listing | Auth (seller) | ✅ |
| `GET/PUT/DELETE /api/listings/[id]` | Get/update/delete | Auth (owner) | ✅ |
| `POST /api/listings/[id]/view` | Track view | Public | ✅ |
| `GET /api/my-listings` | My listings | Auth | ✅ |
| `GET /api/user/listings` | User's listings | Auth | ✅ |
| `GET /api/marketplace-listings` | Marketplace listings | Public | ✅ |
| `GET /api/search` | Search | Public | ✅ |
| `POST /api/compare` | Compare listings | Public | ✅ |
| `GET /api/rentals` | Rental listings | Public | ✅ |
| `POST /api/admin/listings/ban` | Ban listing | Admin | ✅ |
| `GET/PUT /api/admin/listings` | Admin manage | Admin | ✅ |

**Listing Properties**: listing_number, title, slug, brand/model/variant, year, condition, price_cash/credit, mileage, features (20 boolean), marketplace_type, visibility, status (draft/published/sold/banned/expired)

### 6.3 DEALER MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `GET /api/dealers` | List dealers | Public | ✅ |
| `GET /api/dealers/[slug]` | Dealer detail | Public | ✅ |
| `GET/POST /api/dealer/team` | Staff CRUD | Dealer | ✅ |
| `GET /api/dealer/reviews` | Dealer reviews | Public | ✅ |
| `GET /api/dealer/stats` | Dealer stats | Dealer | ✅ |
| `POST /api/dealer-registration` | Register dealer | Auth | ✅ |
| `GET/POST /api/admin/dealers` | Admin manage | Admin | ✅ |

**Dealer Properties**: name, slug, logo, cover, phone, email, website, address, city/province, rating, review_count, verified, subscription_tier (free/premium), status

### 6.4 DEALER MARKETPLACE MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `GET /api/dealer-marketplace/listings` | Browse listings | Dealer | ✅ |
| `GET/POST /api/dealer-marketplace/offers` | Get/create offers | Dealer | ✅ |
| `GET /api/dealer-marketplace/offers/count` | Offer count | Dealer | ✅ |
| `GET/POST /api/dealer-marketplace/favorites` | Favorites | Dealer | ✅ |
| `GET/PUT /api/dealer-marketplace/settings` | Settings | Dealer | ✅ |
| `GET/POST /api/dealer-offers` | Alt offer endpoints | Dealer/Seller | ✅ |

**Offer Flow**: Dealer makes offer → Seller counter-offer → Accept/Reject/Withdraw
**Auto-Rejection**: Listing banned/expired → all pending offers auto-rejected
**Settings**: offer_duration (72h default), max_counter_offers (5), auto_reject_hours (48)

### 6.5 INSPECTION MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `GET/POST /api/inspections` | List/create inspections | Auth | ✅ |
| `POST /api/inspections/submit` | Submit results | Inspector | ✅ |
| `GET /api/inspections/bookings` | Bookings | Auth | ✅ |
| `GET /api/inspections/pricing` | Pricing | Public | ✅ |
| `GET /api/inspections/certificate` | Certificate | Auth | ✅ |
| `GET /api/inspections/[id]/certificate` | Specific certificate | Auth | ✅ |
| `GET /api/inspections/export-pdf` | Export PDF | Auth | ✅ |
| `GET /api/inspection-items` | Checklist items | Public | ✅ |
| `GET/POST /api/admin/categories` | Category CRUD | Admin | ✅ |
| `GET/PUT/DELETE /api/admin/categories/[id]` | Category manage | Admin | ✅ |

**Inspection Properties**: 160 check points, total_score, grade (A/B/C/D/E), accident/flood/fire_free, odometer_tampered, risk_level, certificate_number, AI price analysis

### 6.6 CREDIT / FINANCING MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `POST /api/credit/calculator` | Credit simulation | Public | ✅ |
| `POST /api/credit/apply` | Apply for credit | Auth (buyer) | ✅ |
| `GET /api/credit/apply` | My applications | Auth | ✅ |
| `GET /api/credit/[id]` | Application detail | Auth (owner) | ✅ |
| `PUT /api/credit/[id]` | Update status | Auth (admin) | ✅ |
| `POST /api/credit/pay-monthly` | Pay installment | Auth | ✅ |

**Credit Calculation (Flat Rate)**:
- Monthly Installment = (Loan Amount + Total Interest) / Tenor
- Total Interest = Loan Amount × Interest Rate × Tenor (years)
- Min DP: 10%, Max Tenor: 84 bulan
- Late Fee: 0.1% per hari dari amount_due

### 6.7 ASTRAPAY PAYMENT MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `GET /api/astrapay/auth` | Get OAuth token | Auth | ✅ |
| `POST /api/astrapay/payment` | Create payment | Auth | ✅ |
| `POST /api/astrapay/callback` | Webhook callback | AstraPay Server | ✅ |
| `GET /api/astrapay/transaction-status` | Check status | Auth | ✅ |
| `POST /api/astrapay/account-link` | Generate link URL | Auth | ✅ |
| `GET /api/astrapay/account-link` | Check link status | Auth | ✅ |

**Payment Methods**:
- Payment with Linking (akun AstraPay terhubung)
- Push to Payment (tanpa linking)
- Direct Debit (otomatis dari saldo)
- Paylater (cicilan AstraPay)

**Flow**: Create payment → Redirect to AstraPay → Callback (success/fail) → Update DB
**Amount Range**: Rp 10.000 – Rp 10.000.000
**Token Expiry**: 15 menit (900 detik)

**AstraPay Service Methods**:
- `getAccessToken()` — OAuth2 client_credentials, cached in-memory + DB
- `generateSignatureAuth()` — RSA-SHA256 for auth
- `generateSignatureService()` — HMAC-SHA512 for service requests
- `createPayment()` — Payment with account linking
- `createPushPayment()` — Push-to-payment (no linking)
- `getTransactionStatus()` — Query + sync with local DB
- `createAccountLinkUrl()` — Account linking flow
- `registerPaylater()` — Register for AstraPay Paylater
- `shareKycData()` — Share KYC data with AstraPay
- `sendRepaymentReminder()` — UPCOMING/OVERDUE/FINAL_NOTICE

### 6.8 TOKEN & CREDIT MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `GET /api/token-costs` | Token costs per action | Public | ✅ |
| `GET /api/token-settings` | Token settings | Auth | ✅ |
| `GET /api/token-packages` | Purchase packages | Public | ✅ |
| `POST /api/token-purchase` | Buy tokens | Auth | ✅ |
| `GET /api/token-transactions` | Transaction history | Auth | ✅ |
| `GET /api/user-tokens` | Token balance | Auth | ✅ |
| `GET /api/credits/balance` | Credit balance | Auth | ✅ |
| `GET /api/credits/transactions` | Credit history | Auth | ✅ |
| `GET /api/credits/packages` | Credit packages | Public | ✅ |
| `POST /api/credits/deduct` | Deduct credits | Auth | ✅ |
| `GET /api/credits/boosts` | Boost features | Auth | ✅ |
| `GET/POST /api/credits/payments` | Payment history/process | Auth | ✅ |
| `POST /api/credits/registration-bonus` | Claim bonus | Auth | ✅ |
| `GET /api/boost-features` | Available boosts | Public | ✅ |

**Token Economy**: 1 token = Rp 10.000
**Token Actions**: publish listing, boost featured, boost urgent, AI prediction, marketplace publish

### 6.9 CHAT MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `GET/POST /api/conversations` | List/create conversations | Auth | ✅ |
| `GET/POST /api/conversations/[id]/messages` | Get/send messages | Auth (participant) | ✅ |

**Chat Properties**: conversation per buyer+seller+listing, unread counts, last_message, message_type (text)

### 6.10 ORDER MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `GET/POST /api/orders` | List/create orders | Auth | ✅ |
| `GET /api/admin/orders` | All orders | Admin | ✅ |

**Order Properties**: order_number, agreed_price, platform_fee, seller_fee, buyer_fee, total_amount, escrow_id, escrow_status, status (pending/confirmed/processing/completed/cancelled)

### 6.11 AI PREDICTION MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `POST /api/predictions` | Create prediction | Auth | ✅ |
| `GET /api/my-predictions` | My predictions | Auth | ✅ |

**AI Features**: VLM image analysis, market price comparison, condition scoring, prediction factors breakdown, confidence level, quick_sale_price, optimal_price, days_to_sell_estimate

### 6.12 KYC MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `GET/POST /api/kyc` | Get/submit KYC | Auth | ✅ |
| `GET /api/admin/kyc` | Review KYC | Admin | ✅ |

**KYC Properties**: full_name, ktp_number, phone, address (province/city/district/village), ktp_image_url, selfie_image_url, status (not_submitted/pending/verified/rejected)

### 6.13 WALLET MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `GET/POST /api/wallet` | Balance / top up | Auth | ✅ |
| `GET /api/wallet/transactions` | Transaction history | Auth | ✅ |
| `GET/POST /api/admin/withdrawals` | Manage withdrawals | Admin | ✅ |

### 6.14 LOCATION MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `GET /api/locations/provinces` | Provinces | Public | ✅ |
| `GET /api/locations/cities` | Cities | Public | ✅ |
| `GET /api/locations/districts` | Districts | Public | ✅ |
| `GET /api/locations/villages` | Villages | Public | ✅ |

**4-level Indonesian admin hierarchy**: Province → City/Kabupaten → District/Kecamatan → Village/Kelurahan

### 6.15 NOTIFICATION MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `GET /api/notifications` | List notifications | Auth | ✅ |
| `GET/POST /api/admin/notifications` | Admin manage | Admin | ✅ |

### 6.16 BANNER MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `GET /api/banners` | Active banners | Public | ✅ |
| `GET/PUT /api/banners/[id]` | Manage banner | Admin | ✅ |
| `POST /api/banners/[id]/click` | Track click | Public | ✅ |
| `GET/POST /api/admin/banners` | Admin CRUD | Admin | ✅ |

### 6.17 DASHBOARD MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `GET /api/dashboard/stats` | Dashboard stats | Auth | ✅ |
| `GET /api/dashboard/charts` | Chart data | Auth | ✅ |
| `GET /api/dashboard/activity` | Recent activity | Auth | ✅ |
| `GET /api/admin/stats` | Admin stats | Admin | ✅ |
| `GET /api/admin/analytics` | Admin analytics | Admin | ✅ |
| `GET /api/admin/revenue` | Revenue reports | Admin | ✅ |
| `GET /api/admin/activity` | Activity logs | Admin | ✅ |
| `GET /api/admin/activity-logs` | Activity logs (alt) | Admin | ✅ |
| `GET /api/stats` | Platform stats | Public | ✅ |

---

## 7. Gap Analysis vs Kompetitor

### 7.1 Feature Comparison

| Feature | Mobil123 | Carmudi | OLX Autos | AutoMarket (Current) | Gap |
|---------|----------|---------|-----------|----------------------|-----|
| **AI Price Prediction** | ❌ | ❌ | ⚠️ Basic | ✅ VLM + Factors | ✅ BONUS |
| **AstraPay Payment** | ❌ | ❌ | ❌ | ✅ Full Integration | ✅ BONUS |
| **Credit/Financing** | ✅ | ✅ | ✅ | ✅ AstraPay Paylater | ✅ DONE |
| **Vehicle Inspection** | ✅ | ✅ | ✅ 200+ pts | ✅ 160 pts | ✅ DONE |
| **Inspection Certificate** | ✅ | ❌ | ✅ | ✅ + Purchase | ✅ DONE |
| **Dealer Marketplace** | ✅ | ✅ | ❌ | ✅ B2B Bidding | ✅ BONUS |
| **Chat System** | ✅ | ✅ | ✅ WA Only | ✅ In-app | ✅ DONE |
| **KYC Verification** | ✅ | ✅ | ✅ | ✅ KTP + Selfie | ✅ DONE |
| **Escrow System** | ❌ | ❌ | ✅ | ✅ Platform Fee | ✅ BONUS |
| **Token Economy** | ✅ Credit | ✅ Listing Fee | ❌ | ✅ Flexible | ✅ BONUS |
| **E-Tiket/Document** | ❌ | ❌ | ❌ | ✅ Certificate PDF | ✅ BONUS |
| **WhatsApp Integration** | ✅ | ✅ | ✅ | ❌ | 🔴 HIGH |
| **Test Drive Booking** | ✅ | ✅ | ✅ | ❌ | 🟡 MEDIUM |
| **Insurance Integration** | ✅ | ✅ | ❌ | ❌ | 🟡 MEDIUM |
| **Vehicle History Report** | ✅ | ❌ | ✅ | ❌ | 🟡 MEDIUM |
| **Multi-Platform App** | ✅ | ✅ | ✅ | ❌ Web Only | 🟡 MEDIUM |
| **SEO/SEM Tools** | ✅ | ✅ | ✅ | ⚠️ Basic meta | 🟡 MEDIUM |
| **Push Notifications** | ✅ | ✅ | ✅ | ❌ | 🟡 MEDIUM |
| **Video Walkaround** | ❌ | ❌ | ✅ | ✅ Upload | ✅ DONE |
| **Car Comparison** | ✅ | ❌ | ❌ | ✅ Compare Panel | ✅ BONUS |

### 7.2 Critical Missing Features (Prioritas)

#### 🔴 P0 — Harus Ada (MVP Gap)

1. **WhatsApp Integration**
   - Kirim detail listing, hasil inspeksi, reminder pembayaran via WhatsApp
   - Integrasi WhatsApp Business API / Fonnte / Wablas
   - Flow: Chat seller → Redirect WA, Payment success → Send WA receipt
   - Backend: `POST /api/notifications/whatsapp`

2. **Test Drive Booking**
   - Buyer bisa booking jadwal test drive
   - Seller/dealer approve/reject
   - Calendar integration, location picker
   - Backend: `test_drive_bookings` table, 5 endpoints

3. **Vehicle History Report**
   - Riwayat kepemilikan, kecelakaan (dari inspeksi), perawatan
   - Generate dari data inspeksi + order history
   - Backend: `vehicle_histories` table, integration with inspection results

#### 🟡 P1 — Penting (Competitive Parity)

4. **Insurance Integration**
   - Penawaran asuransi kendaraan saat checkout
   - Partner: Asuransi Astra, Simas Insurtech, etc.
   - Backend: `insurance_offers` table, API integration

5. **Push Notifications**
   - Browser push + mobile push (PWA)
   - Real-time notification for: new offer, chat message, payment status
   - Backend: Service Worker + Push API / Firebase Cloud Messaging

6. **SEO Optimization**
   - Dynamic meta tags per listing (title, description, OG image)
   - Sitemap.xml auto-generated
   - Schema.org structured data (Car, AutoDealer)
   - Google Indexing API integration

7. **Progressive Web App (PWA)**
   - Service worker for offline access
   - Add to home screen
   - Push notifications support

#### 🟢 P2 — Nice to Have

8. **Auction System**
   - Timed auction with bidding
   - Reserve price, buy-it-now
   - Backend: `auctions` table, `bids` table, real-time updates

9. **Vehicle Valuation API**
   - Public API for third-party valuation queries
   - Rate limited, monetized per query
   - Backend: API key management, rate limiting

10. **Analytics Export**
    - Export data ke Excel/CSV
    - Sales reports, inspection reports, financial reports
    - Scheduled email reports

---

## 8. Status Implementasi

### 8.1 Backend API Status

| Modul | Endpoints | Status | Catatan |
|-------|-----------|--------|---------|
| Auth/Profile | 4 | ✅ Lengkap | NextAuth + Supabase |
| Listings | 12 | ✅ Lengkap | CRUD + Search + Compare + Ban |
| Dealers | 7 | ✅ Lengkap | CRUD + Team + Reviews + Stats |
| Dealer Marketplace | 7 | ✅ Lengkap | Offers + Favorites + Settings |
| Inspections | 10 | ✅ Lengkap | Book/Pricing/Certificate/PDF |
| Credit/Financing | 6 | ✅ Lengkap | Calculator + Apply + Pay Monthly |
| AstraPay | 6 | ✅ Lengkap | Auth + Payment + Callback + Link |
| Tokens | 6 | ✅ Lengkap | Settings + Purchase + Transactions |
| Credits | 9 | ✅ Lengkap | Balance + Packages + Deduct + Boost |
| Chat | 2 | ✅ Lengkap | Conversations + Messages |
| Orders | 2 | ✅ Lengkap | Create + List |
| AI Predictions | 2 | ✅ Lengkap | Create + My Predictions |
| KYC | 2 | ✅ Lengkap | Submit + Review |
| Wallet | 2 | ✅ Lengkap | Balance + Transactions |
| Notifications | 2 | ✅ Lengkap | List + Admin Manage |
| Location | 5 | ✅ Lengkap | Province/City/District/Village |
| Banners | 4 | ✅ Lengkap | Active + CRUD + Click Track |
| Dashboard | 9 | ✅ Lengkap | Stats + Charts + Activity |
| Admin Routes | 24 | ✅ Lengkap | Full admin panel |
| Car Master Data | 4 | ✅ Lengkap | Brands + Models + Colors + Seed |
| Favorites | 3 | ✅ Lengkap | Add + Remove + My Favorites |
| Boost Features | 1 | ✅ Lengkap | Available boosts |
| Rentals | 1 | ✅ Lengkap | Rental listings |
| Stats | 1 | ✅ Lengkap | Platform stats |
| **WhatsApp** | 0 | ❌ Missing | Not started |
| **Test Drive** | 0 | ❌ Missing | Not started |
| **Insurance** | 0 | ❌ Missing | Not started |
| **Push Notifications** | 0 | ❌ Missing | Not started |
| **Auction** | 0 | ❌ Missing | Not started |

### 8.2 Frontend Page Status

| Page | Route | Status | Backend? |
|------|-------|--------|----------|
| **Landing Page** | `/` | ✅ Functional | ✅ |
| **Auth** | `/auth` | ✅ Functional | ✅ |
| **Onboarding** | `/onboarding` | ✅ Functional | ✅ |
| **Marketplace** | `/marketplace` | ✅ Functional | ✅ |
| **Dealer Marketplace** | `/dealer-marketplace` | ✅ Functional | ✅ |
| **Listing Detail** | `/listing/[slug]` | ✅ Functional | ✅ |
| **Create Listing** | `/listing/create` | ✅ Functional | ✅ |
| **AI Prediction** | `/prediction` | ✅ Functional | ✅ |
| **Inspections** | `/inspections` | ✅ Functional | ✅ |
| **Inspection Preview** | `/inspection-preview` | ✅ Functional | ✅ |
| **Certificate** | `/certificate/[id]` | ✅ Functional | ✅ |
| **Tokens** | `/tokens` | ✅ Functional | ✅ |
| **Credits** | `/credits` | ✅ Functional | ✅ |
| **User Profile** | `/user/[id]` | ✅ Functional | ✅ |
| **Dealer Profile** | `/dealer/[slug]` | ✅ Functional | ✅ |
| **Cara Kerja** | `/cara-kerja` | ✅ Functional | ❌ (static) |
| **Kategori** | `/kategori` | ✅ Functional | ✅ |
| **Dashboard** | `/dashboard` | ✅ Functional | ✅ |
| Dashboard Profile | `/dashboard/profile` | ✅ Functional | ✅ |
| Dashboard Listings | `/dashboard/listings` | ✅ Functional | ✅ |
| Dashboard Create | `/dashboard/listings/create` | ✅ Functional | ✅ |
| Dashboard Edit | `/dashboard/listings/[id]/edit` | ✅ Functional | ✅ |
| Dashboard Favorites | `/dashboard/favorites` | ✅ Functional | ✅ |
| Dashboard Messages | `/dashboard/messages` | ✅ Functional | ✅ |
| Dashboard Orders | `/dashboard/orders` | ✅ Functional | ✅ |
| Dashboard Inspeksi | `/dashboard/inspeksi` | ✅ Functional | ✅ |
| Dashboard Predictions | `/dashboard/predictions` | ✅ Functional | ✅ |
| Dashboard Tokens | `/dashboard/tokens` | ✅ Functional | ✅ |
| Dashboard Credits | `/dashboard/credits` | ✅ Functional | ✅ |
| Dashboard Wallet | `/dashboard/wallet` | ✅ Functional | ✅ |
| Dashboard Withdraw | `/dashboard/withdraw` | ✅ Functional | ✅ |
| Dashboard KYC | `/dashboard/kyc` | ✅ Functional | ✅ |
| Dashboard Notifications | `/dashboard/notifications` | ✅ Functional | ✅ |
| Dashboard Settings | `/dashboard/settings` | ✅ Functional | ✅ |
| Dashboard Offers | `/dashboard/offers` | ✅ Functional | ✅ |
| Dealer Dashboard | `/dealer/dashboard` | ✅ Functional | ✅ |
| Dealer Inventory | `/dealer/inventory` | ✅ Functional | ✅ |
| Dealer Offers | `/dealer/offers` | ✅ Functional | ✅ |
| Dealer Profile | `/dealer/profile` | ✅ Functional | ✅ |
| Dealer Stats | `/dealer/stats` | ✅ Functional | ✅ |
| Dealer Team | `/dealer/team` | ✅ Functional | ✅ |
| Dealer Marketplace | `/dealer/marketplace` | ✅ Functional | ✅ |
| Admin Dashboard | `/admin` | ✅ Functional | ✅ |
| Admin Users | `/admin/users` | ✅ Functional | ✅ |
| Admin Listings | `/admin/listings` | ✅ Functional | ✅ |
| Admin Dealers | `/admin/dealers` | ✅ Functional | ✅ |
| Admin Orders | `/admin/orders` | ✅ Functional | ✅ |
| Admin Payments | `/admin/payments` | ✅ Functional | ✅ |
| Admin Credits | `/admin/credits` | ✅ Functional | ✅ |
| Admin Tokens | `/admin/tokens` | ✅ Functional | ✅ |
| Admin KYC | `/admin/kyc` | ✅ Functional | ✅ |
| Admin Analytics | `/admin/analytics` | ✅ Functional | ✅ |
| Admin Revenue | `/admin/revenue` | ✅ Functional | ✅ |
| Admin Banners | `/admin/banners` | ✅ Functional | ✅ |
| Admin Settings | `/admin/settings` | ✅ Functional | ✅ |
| Admin Activity | `/admin/activity` | ✅ Functional | ✅ |
| Admin Withdrawals | `/admin/withdrawals` | ✅ Functional | ✅ |
| **WhatsApp Chat** | - | ❌ Missing | ❌ |
| **Test Drive** | - | ❌ Missing | ❌ |
| **Insurance** | - | ❌ Missing | ❌ |
| **Auction** | - | ❌ Missing | ❌ |

### 8.3 Total Count

| Area | Count |
|------|-------|
| Prisma Models | **67** |
| API Route Files | **127** |
| Frontend Pages | **76** |
| Component Files | **95** |
| Custom Hooks | **11** |
| Library Files | **11** |
| Schema Modules | **20** |
| Admin Pages | **27** |
| Dashboard Pages | **24** |
| Dealer Pages | **8** |
| Missing Features | **5 modules** |

---

## 9. Roadmap

### Phase 1 — Communication & Trust (Prioritas Tinggi)
> Target: 2 minggu

| # | Feature | Backend | Frontend | Estimasi |
|---|---------|---------|----------|----------|
| 1 | WhatsApp Chat | Fonnte/Wablas API + `POST /api/chat/whatsapp` | WA button on listing + chat | 3 hari |
| 2 | Test Drive Booking | `test_drive_bookings` table + 5 endpoints | Booking form + calendar | 3 hari |
| 3 | Vehicle History Report | Generate dari inspection + order data | History tab on listing detail | 3 hari |
| 4 | Push Notifications | FCM + Service Worker + `POST /api/push` | Notification permission + SW | 3 hari |

### Phase 2 — Competitive Features
> Target: 3 minggu

| # | Feature | Backend | Frontend | Estimasi |
|---|---------|---------|----------|----------|
| 5 | Insurance Integration | `insurance_offers` table + partner API | Insurance offer at checkout | 5 hari |
| 6 | SEO Optimization | Dynamic meta + Sitemap + Schema.org | OG tags + structured data | 3 hari |
| 7 | PWA Support | Service Worker + Manifest | Install prompt + offline mode | 3 hari |
| 8 | Auction System | `auctions` + `bids` tables + real-time | Auction page + live bidding | 5 hari |

### Phase 3 — Monetization & Scale
> Target: 2 minggu

| # | Feature | Detail | Estimasi |
|---|---------|--------|----------|
| 9 | Analytics Export | CSV/Excel download for dealers & admin | 2 hari |
| 10 | Valuation API | Public API with rate limiting & API keys | 3 hari |
| 11 | Scheduled Reports | Email reports (daily/weekly/monthly) | 2 hari |
| 12 | Advanced Matching | AI-powered car recommendation engine | 3 hari |
| 13 | Multi-Language | English + Bahasa Indonesia toggle | 2 hari |
| 14 | Mobile App API | React Native API optimization | 5 hari |

---

*Dokumen ini dibuat berdasarkan analisis codebase AutoMarket per 4 Maret 2026.*
*Total: 67 Prisma models, 127 API routes, 76 frontend pages, 95 components, 5 user roles.*
