# 🚀 AutoMarket - Complete System Documentation

> Last Updated: March 2026  
> Version: 1.0.0

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Database Architecture](#database-architecture)
3. [User Journey Workflow](#user-journey-workflow)
4. [Feature Documentation](#feature-documentation)
5. [API Reference](#api-reference)
6. [Pages Reference](#pages-reference)
7. [Admin Workflows](#admin-workflows)

---

## System Overview

### Tech Stack
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **UI Components**: shadcn/ui (New York style)
- **Database**: Supabase (PostgreSQL with UUID)
- **Authentication**: Supabase Auth (Google OAuth)
- **Maps**: Leaflet + OpenStreetMap / LocationIQ
- **PDF Generation**: Python reportlab

### Key Features
- ✅ User Authentication (Google OAuth)
- ✅ KYC Verification System
- ✅ Credit System with BNI VA Payment
- ✅ Car Listing Management
- ✅ 160-Point Inspection System
- ✅ Boost Features (Highlight, Top Search, Featured)
- ✅ Dealer Registration & Profile
- ✅ Admin Dashboard APIs

---

## Database Architecture

### Tables Summary (76+ Tables)

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE ARCHITECTURE                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  USERS & AUTHENTICATION                                         │
│  ├── profiles (user data, roles)                                │
│  ├── dealers (dealer profiles)                                  │
│  ├── dealer_registrations (dealer onboarding)                   │
│  └── kyc_verifications (identity verification)                  │
│                                                                 │
│  LOCATION DATA                                                  │
│  ├── provinces (38 provinsi)                                    │
│  ├── cities (514 kota/kabupaten)                                │
│  ├── districts (kecamatan)                                      │
│  └── villages (kelurahan/desa)                                  │
│                                                                 │
│  CAR MASTER DATA                                                │
│  ├── brands (10 brands: Toyota, Honda, etc)                     │
│  ├── car_models (20 models)                                     │
│  ├── car_variants (20 variants)                                 │
│  └── car_colors (15 colors)                                     │
│                                                                 │
│  LISTING SYSTEM                                                 │
│  ├── car_listings (main listing data)                           │
│  ├── car_images (multiple images per listing)                   │
│  ├── car_videos (video content)                                 │
│  ├── car_documents (STNK, BPKB, etc)                            │
│  └── car_features (sunroof, ABS, etc)                           │
│                                                                 │
│  INSPECTION SYSTEM                                              │
│  ├── inspection_categories (13 categories)                      │
│  ├── inspection_items (160 items)                               │
│  ├── car_inspections (inspection records)                       │
│  └── inspection_results (per-item results)                      │
│                                                                 │
│  CREDIT SYSTEM                                                  │
│  ├── credit_packages (5 user + 4 dealer packages)               │
│  ├── user_credits (balance tracking)                            │
│  ├── credit_transactions (history)                              │
│  ├── payments (BNI VA payments)                                 │
│  ├── boost_features (3 boost types)                             │
│  ├── listing_boosts (active boosts)                             │
│  ├── registration_bonus_tracker (500 free credits)              │
│  └── credit_usage_log (detailed usage)                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### User Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| `buyer` | Default role | Browse, contact sellers |
| `seller` | Verified user | Create listings, manage own listings |
| `dealer` | Business seller | Dealer profile, dealer packages |
| `admin` | Administrator | Verify KYC, approve listings, verify payments |
| `inspector` | Professional inspector | Perform inspections, issue certificates |

---

## User Journey Workflow

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         AUTO MARKET USER JOURNEY                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

    ┌─────────┐     ┌──────────┐     ┌───────────┐     ┌─────────────┐
    │  USER   │────▶│ REGISTER │────▶│  KYC      │────▶│   CREDITS   │
    │  BARU   │     │ /auth    │     │ VERIFIKASI│     │   /credits  │
    └─────────┘     └──────────┘     └───────────┘     └─────────────┘
         │               │                 │                   │
         │               │                 │                   │
         ▼               ▼                 ▼                   ▼
    ┌─────────┐     ┌──────────┐     ┌───────────┐     ┌─────────────┐
    │ Bonus   │     │ Profile  │     │ KTP +     │     │ 500 Kredit  │
    │ 500     │     │ Created  │     │ Selfie    │     │ Gratis!     │
    │ Kredit  │     │ buyer    │     │ Upload    │     │ (500 first) │
    └─────────┘     └──────────┘     └───────────┘     └─────────────┘
                                                              │
                                                              ▼
    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                              LISTING FLOW                                    │
    └─────────────────────────────────────────────────────────────────────────────┘
    
    ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌─────────────┐
    │ CHECK SALDO  │────▶│ VEHICLE INFO │────▶│   DETAILS    │────▶│   LOCATION  │
    │ Min 1 Kredit │     │ Brand/Model  │     │ Year/Mileage │     │ Province    │
    └──────────────┘     └──────────────┘     └──────────────┘     └─────────────┘
                                                                          │
         ┌────────────────────────────────────────────────────────────────┘
         ▼
    ┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌─────────────┐
    │   PRICING    │────▶│   IMAGES     │────▶│  INSPECTION  │────▶│   REVIEW    │
    │ Harga/Nego   │     │ Multi Upload │     │ (Optional)   │     │ & PUBLISH   │
    └──────────────┘     └──────────────┘     └──────────────┘     └─────────────┘
         │                                                                │
         │                                                                ▼
         │                                                         ┌─────────────┐
         │                                                         │ -1 KREDIT   │
         │                                                         │ 30 HARI     │
         │                                                         └─────────────┘
         │
         ▼
    ┌─────────────────────────────────────────────────────────────────────────────┐
    │                              BOOST OPTIONS                                   │
    └─────────────────────────────────────────────────────────────────────────────┘
    
    ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
    │  HIGHLIGHT   │     │  TOP SEARCH  │     │   FEATURED   │
    │  3 Kredit    │     │  5 Kredit    │     │  10 Kredit   │
    │  7 Hari      │     │  7 Hari      │     │  14 Hari     │
    └──────────────┘     └──────────────┘     └──────────────┘
```

---

## Feature Documentation

### 1. Registration Flow (`/auth`)

```
┌─────────────────────────────────────────────────────────────────┐
│                      REGISTRASI USER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Step 1: User kunjungi /auth                                    │
│     ↓                                                           │
│  Step 2: Klik "Masuk dengan Google"                             │
│     ↓                                                           │
│  Step 3: Google OAuth redirect                                  │
│     ↓                                                           │
│  Step 4: Callback ke /auth/callback                             │
│     ↓                                                           │
│  Step 5: Auto-create profile di database:                       │
│     - id: (UUID dari Google)                                    │
│     - email: (Google email)                                     │
│     - full_name: (Google name)                                  │
│     - role: 'buyer' (default)                                   │
│     ↓                                                           │
│  Step 6: Redirect ke home                                       │
│                                                                 │
│  📁 Files:                                                      │
│  - /src/app/auth/page.tsx                                       │
│  - /src/app/auth/callback/route.ts                              │
│  - /src/hooks/useAuth.ts                                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 2. KYC Verification (`/listing/create` → KYC Form)

**KYC Form (4 Steps):**

| Step | Fields |
|------|--------|
| **Step 1: Data Pribadi** | Nama Lengkap, NIK (16 digit), Tempat Lahir, Tanggal Lahir, Jenis Kelamin, Nomor HP |
| **Step 2: Alamat** | Provinsi, Kota/Kabupaten, Kecamatan, Kelurahan, Alamat Lengkap, Kode Pos |
| **Step 3: Dokumen** | Upload KTP (image), Upload Selfie dengan KTP (image) |
| **Step 4: Review** | Konfirmasi data, Setujui syarat & ketentuan, Submit |

**KYC Status Workflow:**
```
not_submitted → pending → approved ✅
                   ↓
              rejected ❌
```

### 3. Credit System (`/credits`)

#### Registration Bonus (Automatis)
- **500 Kredit GRATIS** untuk 500 pendaftar pertama
- Otomatis dikreditkan saat user akses `/credits` pertama kali

#### Credit Packages

**User Packages:**

| Paket | Harga | Kredit | Bonus | Total |
|-------|-------|--------|-------|-------|
| Starter | Rp 50.000 | 50 | 0 | 50 |
| Basic | Rp 100.000 | 100 | +10 | 110 |
| Standard | Rp 250.000 | 250 | +30 | 280 |
| **Premium** ⭐ | Rp 500.000 | 500 | +75 | 575 |
| Ultimate | Rp 1.000.000 | 1000 | +200 | 1200 |

**Dealer Packages (Bonus 20-70% lebih banyak):**

| Paket | Harga | Kredit | Bonus | Total |
|-------|-------|--------|-------|-------|
| Dealer Starter | Rp 200.000 | 250 | +50 | 300 |
| **Dealer Pro** ⭐ | Rp 500.000 | 700 | +150 | 850 |
| Dealer Enterprise | Rp 1.000.000 | 1500 | +500 | 2000 |
| Dealer Unlimited | Rp 2.500.000 | 4000 | +1500 | 5500 |

#### Payment Flow (BNI VA)

```
1. Pilih Paket → Konfirmasi
        ↓
2. Generate VA Number (8808XXXXXXXXXX)
   Generate Invoice (INV-YYYYMMDD-XXXX)
   Set Expiry (24 jam)
        ↓
3. Tampilkan Instruksi:
   ┌─────────────────────────────┐
   │ Bank: BNI                   │
   │ VA: 8808XXXXXXXXXX          │
   │ Amount: Rp XXX.XXX          │
   │ a.n. AUTOMARKET INDONESIA   │
   │ Valid: 24 jam               │
   └─────────────────────────────┘
        ↓
4. User Transfer via BNI VA
        ↓
5. Upload Bukti Transfer
        ↓
6. Status → 'paid' (menunggu verifikasi)
        ↓
7. Admin Verifikasi
        ↓
8. IF Approved:
   - Status → 'verified'
   - Credits added to balance
   - Transaction recorded
```

### 4. Listing Creation (`/listing/create`)

**7-Step Listing Form:**

| Step | Fields |
|------|--------|
| **Step 1: Vehicle Info** | Brand, Model, Variant, Auto-generate title |
| **Step 2: Details** | Year, Mileage, Transmission, Fuel, Engine CC, Seats, Colors, Plate, VIN, Condition |
| **Step 3: Location** | Province, City, Address |
| **Step 4: Pricing** | Transaction Type, Cash Price, Credit Price, Negotiable, Rental Prices |
| **Step 5: Images** | Multiple upload (max 10), Set primary, Reorder |
| **Step 6: Inspection** | Optional 160-point inspection |
| **Step 7: Review** | Review all data, Description, Terms, Publish (-1 kredit) |

**Listing Status Workflow:**
```
draft → pending → active ✅
           ↓          ↓
       rejected    sold
           ↓
      Refund 1 Kredit
```

### 5. Inspection System (160-Point)

**Categories (13 Categories, 160 Items):**

| # | Category | Items | Critical |
|---|----------|-------|----------|
| 1 | Eksterior | 20 | Cat Body, Atap, Kaca |
| 2 | Interior | 20 | AC, Odometer |
| 3 | Mesin | 25 | Start, Suara, Aki |
| 4 | Transmisi | 10 | Pergeseran Gigi |
| 5 | Rangka & Suspensi | 15 | Chassis, Ball Joint |
| 6 | Rem | 10 | Rem Depan, ABS |
| 7 | Ban & Velg | 8 | Semua Ban |
| 8 | Listrik & Elektronik | 12 | Lampu Utama, Rem |
| 9 | Dokumen | 8 | STNK, BPKB |
| 10 | Safety | 12 | Airbag, ESP |
| 11 | Test Drive | 10 | Handling, Rem |
| 12 | Undercarriage | 5 | Chassis |
| 13 | Accident History | 5 | Ex Tabrak, Ex Banjir |

**Status Options:**
- **Istimewa** (Like New) - 100%
- **Baik** (Good) - 75%
- **Sedang** (Fair) - 50%
- **Perlu Perbaikan** (Needs Repair) - 25%

**Grade Calculation:**
| Grade | Score | Description |
|-------|-------|-------------|
| A+ | 95-100 | Istimewa |
| A | 85-94 | Sangat Baik |
| B+ | 75-84 | Baik |
| B | 65-74 | Cukup Baik |
| C | 50-64 | Sedang |
| D | 35-49 | Kurang Baik |
| E | 0-34 | Perlu Perbaikan |

### 6. Boost Features

| Boost | Kredit | Durasi | Benefits |
|-------|--------|--------|----------|
| **Highlight** 💛 | 3 | 7 hari | Background kuning, Lebih mudah dilihat |
| **Top Search** 🔵 | 5 | 7 hari | Posisi teratas, Visibilitas 3x lipat |
| **Featured** 🟣 | 10 | 14 hari | Home page, Badge eksklusif, Eksposur maksimal |

**Stacked Boosts:** Bisa kombinasi multiple boost sekaligus!

**Refund Policy:**
- Dibatalkan dengan sisa > 50% → Refund proporsional
- Dibatalkan dengan sisa ≤ 50% → No refund

---

## API Reference

### Authentication APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/user` | GET | Get current logged-in user |
| `/api/auth/callback` | GET | OAuth callback handler |

### KYC APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/kyc` | GET | Get KYC status for user |
| `/api/kyc` | POST | Submit KYC verification |
| `/api/kyc` | PUT | Update KYC status (admin) |

### Credit APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/credits/balance` | GET | Get user credit balance |
| `/api/credits/packages` | GET | Get credit packages |
| `/api/credits/transactions` | GET | Get transaction history |
| `/api/credits/payments` | GET/POST/PUT | Payment management |
| `/api/credits/deduct` | POST | Deduct credits |
| `/api/credits/boosts` | GET/POST/DELETE | Boost management |

### Listing APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/listings` | GET/POST | Get/Create listings |
| `/api/listings/[id]` | GET/PUT/DELETE | Single listing CRUD |

### Admin APIs

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/payments` | GET/PUT | Payment verification |
| `/api/admin/credits` | GET/PUT | Credit adjustment |

---

## Pages Reference

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/auth` | Login/Register |
| `/listing/create` | Create listing |
| `/listing/[id]/edit` | Edit listing |
| `/listing/[id]/inspection` | Inspection form |
| `/credits` | Credit management |
| `/dealer/[slug]` | Dealer profile |
| `/user/[id]` | User profile |
| `/onboarding` | Dealer registration |

---

## Cost Summary

| Action | Credit Cost | Duration |
|--------|-------------|----------|
| Post Listing | 1 kredit | 30 hari |
| Extend Listing | 1 kredit | 30 hari |
| Highlight Boost | 3 kredit | 7 hari |
| Top Search Boost | 5 kredit | 7 hari |
| Featured Boost | 10 kredit | 14 hari |

---

## Database Schema Files

| File | Description |
|------|-------------|
| `supabase/schema-complete.sql` | Main schema |
| `supabase/schema-kyc-extension.sql` | KYC tables |
| `supabase/schema-dealer-registration.sql` | Dealer registration |
| `supabase/schema-credit-system.sql` | Credit system |

---

*Last updated: March 2026*
