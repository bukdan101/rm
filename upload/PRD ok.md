# 📋 EventKu — Product Requirements Document (PRD)
## Versi 1.0 | 30 Mei 2026

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
Menjadi platform manajemen event #1 di Indonesia yang memudahkan organizer dari pembuatan event hingga D-Day, dengan pengalaman pembeli tiket yang seamless.

### Misi
- Memberikan tools end-to-end untuk organizer: buat event → jual tiket → kelola operasional → cairkan dana
- Menyediakan pengalaman beli tiket yang mudah (pilih kursi → bayar → e-tiket WhatsApp)
- Transparansi fee & keuangan untuk organizer dan platform
- Multi-tenant SaaS — setiap organizer punya subdomain sendiri

### Referensi Kompetitor
| Platform | URL | Model Bisnis |
|----------|-----|-------------|
| Artatix | artatix.co.id | Admin fee Rp5.000 + 5% ke buyer, partnership gratis |
| Loket | loket.com | Self-service, Craftor check-in, ticket protection |
| TixTix | tixtix.id | Fee 5% + Rp2.500, e-ticket WhatsApp |

---

## 2. User Roles & Personas

### 2.1 Role Hierarchy

```
SUPER_ADMIN
  └── ORGANIZER (approved by SUPER_ADMIN)
        ├── ORGANIZER_STAFF (created by ORGANIZER)
        ├── COUNTER_STAFF (created by ORGANIZER)
        └── GATE_STAFF (created by ORGANIZER)
PARTICIPANT (buyer/attendee — public register)
```

### 2.2 Persona Detail

| Role | Deskripsi | Akses Utama | Login Via |
|------|-----------|-------------|-----------|
| **SUPER_ADMIN** | Platform owner, mengelola seluruh sistem | `/admin` — Semua menu | Google Sign-In |
| **ORGANIZER** | Penyelenggara event, membuat & mengelola event sendiri | `/admin` — Menu terbatas (event sendiri saja) | Google Sign-In |
| **ORGANIZER_STAFF** | Staf organizer, bantu operasional event | `/admin` — Menu sangat terbatas (read-only + operasional) | Email/Password |
| **COUNTER_STAFF** | Staf loket penukaran tiket → wristband | `/counter` — Mobile scanner | Email/Password |
| **GATE_STAFF** | Staf gerbang scan masuk/keluar | `/gate` — Mobile scanner | Email/Password |
| **PARTICIPANT** | Pembeli tiket / peserta event | `/` — Landing page + checkout | Google Sign-In / Register |

### 2.3 Perbandingan Dashboard

| Aspek | SUPER_ADMIN | ORGANIZER |
|-------|------------|-----------|
| **Dashboard** | Platform-wide KPIs: total revenue, all events, all organizers | Event-scope KPIs: my event revenue, ticket sales, setup checklist |
| **Event** | Lihat semua event di platform | Hanya event milik sendiri |
| **Tiket** | Semua tiket di platform | Tiket event sendiri |
| **Keuangan** | Semua transaksi, fee masuk, disbursement | Pendapatan sendiri, saldo, tarik dana |
| **Organizer** | Approve/reject organizer, set fee | Tidak ada akses |
| **Settings** | Fee global, DOKU config, sistem | Tidak ada akses |
| **Users** | Manage semua user | Hanya bisa create staff |

---

## 3. Arsitektur Sistem

### 3.1 Infrastructure

```
┌─────────────────────────────────────────────────────┐
│                     GCP Cloud Run                    │
│                                                      │
│  ┌──────────────────┐    ┌──────────────────────┐   │
│  │  eventku-api     │    │  eventku-web          │   │
│  │  (Go/Fiber v3)   │    │  (Next.js 16)         │   │
│  │  Port: 8080      │    │  Port: 3000           │   │
│  └────────┬─────────┘    └───────────┬───────────┘   │
│           │                          │               │
│           ▼                          │               │
│  ┌──────────────────┐                │               │
│  │  Cloud SQL       │                │               │
│  │  PostgreSQL 15   │◄───────────────┘               │
│  │  eventku-db      │  (API proxy)                   │
│  └──────────────────┘                                │
│                                                      │
│  ┌──────────────────┐    ┌──────────────────────┐   │
│  │  Cloud Storage   │    │  Cloud Scheduler      │   │
│  │  (images, QR)    │    │  (auto-expire orders) │   │
│  └──────────────────┘    └──────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 3.2 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Backend** | Go 1.23, Fiber v3, GORM, JWT (HS256) |
| **Frontend** | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| **Database** | PostgreSQL 15 (Cloud SQL), SQLite (dev) |
| **Payment** | DOKU SNAP API (VA, QRIS, e-wallet, CC) |
| **Auth** | Google OAuth2 ID Token + JWT |
| **Storage** | GCS (prod) / Local filesystem (dev) |
| **Realtime** | SSE (Server-Sent Events) + polling fallback |
| **State** | Zustand (client) + TanStack Query (server) |

### 3.3 Database — 31 Tabel

| # | Tabel | Fungsi |
|---|-------|--------|
| 1 | `tenants` | Multi-tenant SaaS organisasi |
| 2 | `subscriptions` | Billing per tenant |
| 3 | `tenant_users` | User→Tenant membership + role |
| 4 | `users` | Semua user (6 role) |
| 5 | `organizers` | Profil organizer (status: pending/approved/rejected) |
| 6 | `organizer_fee_configs` | Fee % per organizer |
| 7 | `organizer_bank_accounts` | Rekening bank organizer |
| 8 | `withdrawal_requests` | Pencairan dana (MANUAL/AUTO_DOKU) |
| 9 | `events` | Event listing (soft-deletable) |
| 10 | `ticket_types` | Kategori tiket per event |
| 11 | `venues` | Layout venue (1:1 dengan event) |
| 12 | `venue_sections` | Seksi venue (VIP, CAT1, dll) |
| 13 | `seats` | Kursi individual (4 status) |
| 14 | `seat_holds` | Reservasi sementara (5 menit) |
| 15 | `orders` | Order pembelian (full breakdown) |
| 16 | `order_items` | Line item order |
| 17 | `tickets` | Tiket individual + QR + wristband |
| 18 | `coupons` | Kupon diskon |
| 19 | `coupon_usages` | Tracking pemakaian kupon |
| 20 | `counters` | Loket penukaran wristband |
| 21 | `counter_staff` | Staf→Counter assignment |
| 22 | `gates` | Gerbang masuk/keluar |
| 23 | `gate_staff` | Staf→Gate assignment |
| 24 | `redemptions` | Record penukaran tiket→wristband |
| 25 | `gate_logs` | Log scan gerbang (partitioned) |
| 26 | `wristband_inventories` | Stok wristband per event/warna |
| 27 | `notifications` | Notifikasi user |
| 28 | `audit_logs` | Audit trail |
| 29 | `payment_logs` | Log DOKU notification |
| 30 | `refunds` | Refund request |
| 31 | `system_settings` | Setting key-value (fee, payment, general) |

---

## 4. User Flow — Lengkap

### 4.1 🟢 SUPER_ADMIN Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SUPER_ADMIN USER FLOW                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Google Login ──► Dashboard (Platform KPIs)                     │
│                     │                                            │
│         ┌───────────┼───────────────┬──────────────┐            │
│         ▼           ▼               ▼              ▼            │
│    ┌─────────┐ ┌──────────┐  ┌───────────┐ ┌───────────┐      │
│    │ Events  │ │Organizers│  │  Orders   │ │  Users    │      │
│    │ (All)   │ │Approve/  │  │  (All)    │ │Manage     │      │
│    │CRUD+Img │ │Reject    │  │  Filter   │ │Roles      │      │
│    └─────────┘ │Set Fee   │  └───────────┘ └───────────┘      │
│                └──────────┘                                     │
│         ┌───────────┼───────────────┬──────────────┐            │
│         ▼           ▼               ▼              ▼            │
│    ┌─────────┐ ┌──────────┐  ┌───────────┐ ┌───────────┐      │
│    │ Tickets │ │Venues &  │  │ Coupons   │ │  Staff    │      │
│    │ (All)   │ │Seats     │  │  CRUD     │ │Counter+   │      │
│    │Cancel/  │ │Full CRUD │  │Per-Category│ │Gate Mgmt  │      │
│    │Expire   │ │+Visual   │  │           │ │Crew Assign │      │
│    └─────────┘ └──────────┘  └───────────┘ └───────────┘      │
│         ┌───────────┼───────────────┬──────────────┐            │
│         ▼           ▼               ▼              ▼            │
│    ┌─────────┐ ┌──────────┐  ┌───────────┐ ┌───────────┐      │
│    │Finance  │ │Withdraw- │  │ Payment   │ │ Refunds   │      │
│    │All Rev  │ │als       │  │ Logs      │ │Approve/   │      │
│    │Charts   │ │Approve/  │  │DOKU Logs  │ │Reject     │      │
│    │         │ │Disburse  │  │           │ │           │      │
│    └─────────┘ └──────────┘  └───────────┘ └───────────┘      │
│         ┌───────────┼───────────────┐                           │
│         ▼           ▼               ▼                            │
│    ┌──────────┐ ┌──────────┐ ┌───────────┐                     │
│    │Analytics │ │ Settings │ │  Audit    │                     │
│    │Advanced  │ │Fee/DOKU/ │ │  Logs     │                     │
│    │Charts    │ │General   │ │Filterable │                     │
│    └──────────┘ └──────────┘ └───────────┘                     │
│         ┌───────────┼───────────────┐                           │
│         ▼           ▼               ▼                            │
│    ┌──────────┐ ┌──────────┐ ┌───────────┐                     │
│    │  Gate    │ │  Live    │ │  Banner   │                     │
│    │Monitor   │ │ Monitor  │ │  Setup    │                     │
│    │(SSE)     │ │ (SSE)    │ │ (NEW)     │                     │
│    └──────────┘ └──────────┘ └───────────┘                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 🔵 ORGANIZER Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     ORGANIZER USER FLOW                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Google Login ──► Dashboard (My Event KPIs)                     │
│                     │                                            │
│         ┌───────────┼───────────────┬──────────────┐            │
│         ▼           ▼               ▼              ▼            │
│    ┌─────────┐ ┌──────────┐  ┌───────────┐ ┌───────────┐      │
│    │ Events  │ │Ticket    │  │  Orders   │ │  Tickets  │      │
│    │ (Mine)  │ │ Types    │  │  (Mine)   │ │  (Mine)   │      │
│    │CRUD+Img │ │CRUD      │  │  Filter   │ │ Manage    │      │
│    └─────────┘ └──────────┘  └───────────┘ └───────────┘      │
│                                                                  │
│  ── SETUP EVENT ────────────────────────────────────────────── │
│         ┌───────────┼───────────────┬──────────────┐            │
│         ▼           ▼               ▼              ▼            │
│    ┌─────────┐ ┌──────────┐  ┌───────────┐ ┌───────────┐      │
│    │Venues & │ │Sponsors  │  │Custom     │ │Invitation │      │
│    │Seats    │ │Logos     │  │Fields     │ │Tickets    │      │
│    │(Mine)   │ │⚠️ No BE  │  │⚠️ No BE  │ │⚠️ Mock   │      │
│    └─────────┘ └──────────┘  └───────────┘ └───────────┘      │
│                                                                  │
│  ── OPERASIONAL ────────────────────────────────────────────── │
│         ┌───────────┼───────────────┬──────────────┐            │
│         ▼           ▼               ▼              ▼            │
│    ┌─────────┐ ┌──────────┐  ┌───────────┐ ┌───────────┐      │
│    │Staff    │ │Counter+  │  │  Redeem   │ │  Wrist-   │      │
│    │Create   │ │Gate Mgmt │  │  QR Scan  │ │band Guide │      │
│    │CR/GR/OS │ │(Mine)    │  │  History  │ │           │      │
│    └─────────┘ └──────────┘  └───────────┘ └───────────┘      │
│         ┌───────────┐                                           │
│         ▼           │                                           │
│    ┌──────────┐     │                                           │
│    │OTS Sales │     │                                           │
│    │⚠️ Simul. │     │                                           │
│    └──────────┘     │                                           │
│                     │                                           │
│  ── KEUANGAN ───────────────────────────────────────────────── │
│         ┌───────────┼───────────────┬──────────────┐            │
│         ▼           ▼               ▼              ▼            │
│    ┌─────────┐ ┌──────────┐  ┌───────────┐ ┌───────────┐      │
│    │Finance  │ │Bank      │  │ Withdraw  │ │Payment    │      │
│    │(My Rev) │ │Account   │  │ Request+  │ │Logs       │      │
│    │Charts   │ │CRUD      │  │ History   │ │(Mine)     │      │
│    └─────────┘ └──────────┘  └───────────┘ └───────────┘      │
│         ┌───────────┐                                           │
│         ▼           │                                           │
│    ┌──────────┐     │                                           │
│    │ Refunds  │     │                                           │
│    │ Request  │     │                                           │
│    └──────────┘     │                                           │
│                     │                                           │
│  ── D-DAY ─────────────────────────────────────────────────── │
│         ┌───────────┼───────────────┐                           │
│         ▼           ▼               ▼                            │
│    ┌──────────┐ ┌──────────┐ ┌───────────┐                     │
│    │  Gate    │ │  Live    │ │Analytics  │                     │
│    │Monitor   │ │ Monitor  │ │(My Event) │                     │
│    └──────────┘ └──────────┘ └───────────┘                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.3 🟠 PARTICIPANT (Buyer) Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   PARTICIPANT / BUYER FLOW                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  1. BROWSE EVENT                                      │       │
│  │  Landing Page (/) → Hero + Event Info                │       │
│  │  └─► Lihat detail: lineup, venue, FAQ                │       │
│  └──────────────────────┬───────────────────────────────┘       │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  2. PILIH TIKET                                       │       │
│  │  Pilih Ticket Type (Festival/VIP/VVIP)               │       │
│  │  └─► Lihat harga, kuota, benefit                     │       │
│  │  └─► [Untuk seated] Pilih kursi di seat map          │       │
│  └──────────────────────┬───────────────────────────────┘       │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  3. CHECKOUT                                           │       │
│  │  Isi data pembeli (nama, email, phone)                │       │
│  │  └─► [Opsional] Kode kupon diskon                     │       │
│  │  └─► Lihat breakdown: subtotal + fee + PPN - diskon   │       │
│  │  └─► [HOLD SEAT] 5 menit reservasi kursi              │       │
│  └──────────────────────┬───────────────────────────────┘       │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  4. PEMBAYARAN (DOKU)                                 │       │
│  │  Pilih metode:                                        │       │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │       │
│  │  │ Virtual  │ │  QRIS    │ │E-Wallet  │ │Credit   │ │       │
│  │  │ Account  │ │          │ │OVO/Gopay │ │Card     │ │       │
│  │  └──────────┘ └──────────┘ └──────────┘ └─────────┘ │       │
│  │  └─► Redirect ke DOKU payment page                    │       │
│  └──────────────────────┬───────────────────────────────┘       │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  5. KONFIRMASI PEMBAYARAN                             │       │
│  │  Polling status tiap 5 detik                          │       │
│  │  └─► SUCCESS → E-Tiket muncul                        │       │
│  │  └─► EXPIRED → Order dibatalkan otomatis              │       │
│  │  └─► CANCELLED → User batalkan                        │       │
│  └──────────────────────┬───────────────────────────────┘       │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  6. E-TIKET                                           │       │
│  │  QR Code per tiket (scan di gate)                     │       │
│  │  └─► Detail: nama, jenis tiket, nomor kursi          │       │
│  │  └─► [⚠️ BELUM] Kirim via WhatsApp                   │       │
│  └──────────────────────┬───────────────────────────────┘       │
│                         ▼                                        │
│  ┌──────────────────────────────────────────────────────┐       │
│  │  7. D-DAY — MASUK EVENT                               │       │
│  │  ┌──────────────────────────────────────┐             │       │
│  │  │ Step 1: Counter (Tukar Tiket)        │             │       │
│  │  │ Scan QR → Verifikasi → Dapat Wristband│            │       │
│  │  │ (Warna sesuai jenis tiket)            │             │       │
│  │  └──────────────┬───────────────────────┘             │       │
│  │                 ▼                                      │       │
│  │  ┌──────────────────────────────────────┐             │       │
│  │  │ Step 2: Gate (Masuk Venue)           │             │       │
│  │  │ Scan QR/Wristband → Log IN           │             │       │
│  │  │ Scan lagi → Log OUT                  │             │       │
│  │  └──────────────────────────────────────┘             │       │
│  └──────────────────────────────────────────────────────┘       │
│                                                                  │
│  ── AKUN SAYA ──────────────────────────────────────────────── │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                       │
│  │My Orders │ │My Tickets│ │ Profile  │                       │
│  │History   │ │Active    │ │Edit Info │                       │
│  └──────────┘ └──────────┘ └──────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 🟣 COUNTER_STAFF Flow

```
┌──────────────────────────────────────────────────┐
│            COUNTER_STAFF FLOW                     │
├──────────────────────────────────────────────────┤
│                                                   │
│  Login (Email/PW) ──► /counter                   │
│                         │                         │
│    ┌────────────────────┼───────────────┐         │
│    ▼                    ▼               ▼         │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐     │
│  │  SCAN QR │   │  Riwayat │   │  Status  │     │
│  │  ──────  │   │  ──────  │   │  ──────  │     │
│  │  Scan QR │   │  Daftar  │   │  Stats   │     │
│  │  tiket   │   │  redemp- │   │  counter │     │
│  │          │   │  tion    │   │  + wrist-│     │
│  │  Verif:  │   │          │   │  band    │     │
│  │  ✓Valid  │   └──────────┘   │  stock   │     │
│  │  ✗Invalid│                  └──────────┘     │
│  │  ✗Used   │                                    │
│  │          │   ┌──────────┐   ┌──────────┐     │
│  │  Pilih:  │   │  Guide   │   │  Help    │     │
│  │  Wrist-  │   │  Wrist-  │   │  FAQ +   │     │
│  │  band    │   │  band    │   │  Emergency│     │
│  │  Color   │   │  Colors  │   │  Contact │     │
│  └──────────┘   └──────────┘   └──────────┘     │
│                                                   │
└──────────────────────────────────────────────────┘
```

### 4.5 🔴 GATE_STAFF Flow

```
┌──────────────────────────────────────────────────┐
│              GATE_STAFF FLOW                      │
├──────────────────────────────────────────────────┤
│                                                   │
│  Login (Email/PW) ──► /gate                      │
│                         │                         │
│    ┌────────────────────┼───────────────┐         │
│    ▼                    ▼               ▼         │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐     │
│  │  SCAN QR │   │   LOG    │   │  STATUS  │     │
│  │  ──────  │   │  ──────  │   │  ──────  │     │
│  │  Scan →  │   │  Riwayat │   │  Stats   │     │
│  │  IN/OUT  │   │  scan    │   │  gerbang │     │
│  │          │   │  per     │   │  + chart │     │
│  │  Result: │   │  gate    │   │  hourly  │     │
│  │  ✓ Masuk │   │          │   │          │     │
│  │  ✓ Keluar│   └──────────┘   └──────────┘     │
│  │  ✗ Invalid│                                   │
│  │  ✗ Double │   ┌──────────┐                    │
│  │           │   │  PROFIL  │                    │
│  │  Tampilkan│   │  ──────  │                    │
│  │  Info     │   │  Nama,   │                    │
│  │  Tiket    │   │  Assign- │                    │
│  └──────────┘   │  ment,   │                    │
│                  │  Stats   │                    │
│                  └──────────┘                    │
└──────────────────────────────────────────────────┘
```

### 4.6 💰 Financial Flow (Pembayaran → Pencairan)

```
┌─────────────────────────────────────────────────────────────────┐
│                    FINANCIAL FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BUYER PAYS                  PLATFORM RECEIVES                  │
│  ──────────                   ──────────────                    │
│  Rp 1.000.000               Rp 1.000.000                       │
│  (Tiket VIP)                    │                               │
│       │                         ▼                               │
│       │                 ┌─────────────────┐                     │
│       │                 │  Full Breakdown  │                     │
│       │                 │  ──────────────  │                     │
│       │                 │  Subtotal    1M  │                     │
│       │                 │  Service Fee 50K │  ← Buyer bayar     │
│       │                 │  PPN 11%    110K │                     │
│       │                 │  ──────────────  │                     │
│       │                 │  Total    1.16M  │                     │
│       │                 │  ──────────────  │                     │
│       │                 │  Platform Fee 5% │                     │
│       │                 │    = 50K         │  ← Ke platform     │
│       │                 │  MDR (DOKU)  ~2% │                     │
│       │                 │    = ~20K        │  ← Ke DOKU         │
│       │                 │  PPh 4(2)  0.5%  │                     │
│       │                 │    = 5K          │  ← Ke pajak        │
│       │                 │  ──────────────  │                     │
│       │                 │  Net to Org 925K │  ← Ke organizer    │
│       │                 └─────────────────┘                     │
│       │                            │                            │
│       │                            ▼                            │
│       │                   ┌───────────────┐                     │
│       │                   │ Organizer     │                     │
│       │                   │ Balance: 925K │                     │
│       │                   └───────┬───────┘                     │
│       │                           │                             │
│       │              ┌────────────┼────────────┐                │
│       │              ▼                         ▼                │
│       │     ┌───────────────┐      ┌────────────────┐          │
│       │     │ WITHDRAW      │      │ AUTO_DOKU      │          │
│       │     │ (MANUAL)      │      │ Disbursement   │          │
│       │     │               │      │                │          │
│       │     │ 1. Request    │      │ 1. Admin       │          │
│       │     │ 2. Admin      │      │    approve     │          │
│       │     │    approve    │      │ 2. Auto DOKU   │          │
│       │     │ 3. Transfer   │      │    transfer    │          │
│       │     │    manual     │      │ 3. Status      │          │
│       │     │ 4. Upload     │      │    check       │          │
│       │     │    bukti      │      └────────────────┘          │
│       │     └───────────────┘                                    │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────┐                                                    │
│  │ DOKU    │ ◄── Payment Gateway (VA, QRIS, E-Wallet, CC)      │
│  │ SNAP   │                                                    │
│  └─────────┘                                                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.7 🔄 Order Lifecycle

```
                    ┌──────────┐
                    │ PENDING  │ ◄── CreateOrder
                    └────┬─────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │   PAID   │  │CANCELLED │  │ EXPIRED  │
    │          │  │ (User)   │  │ (Auto/   │
    │          │  │          │  │  Timeout)│
    └────┬─────┘  └──────────┘  └──────────┘
         │
         ▼
    ┌──────────┐
    │ REFUNDED │ ◄── Refund request approved
    └──────────┘

    Auto-Expiry: Scheduler tiap 1 menit
    Seat Hold: Maks 10 kursi, expired 5 menit
    DOKU Timeout: 15 menit (VA), 10 menit (QRIS/E-Wallet)
```

### 4.8 🎫 Ticket Lifecycle

```
    ┌──────────┐     Payment OK     ┌──────────┐
    │ PENDING  │ ──────────────────►│  ACTIVE  │
    └──────────┘                    └────┬─────┘
                                         │
                          ┌──────────────┼──────────────┐
                          ▼              ▼              ▼
                    ┌──────────┐  ┌──────────┐  ┌──────────┐
                    │ REDEEMED │  │ CANCELLED│  │  EXPIRED │
                    │(Wristband│  │(Order    │  │(Payment  │
                    │ received)│  │cancelled)│  │timeout)  │
                    └────┬─────┘  └──────────┘  └──────────┘
                         │
              ┌──────────┼──────────┐
              ▼                     ▼
        ┌──────────┐         ┌──────────┐
        │  INSIDE  │         │  OUTSIDE │
        │(Gate IN) │         │(Gate OUT)│
        └──────────┘         └──────────┘
```

---

## 5. Feature Matrix — Per Role

### 5.1 Core Features

| Feature | SUPER_ADMIN | ORGANIZER | ORG_STAFF | COUNTER | GATE | PARTICIPANT |
|---------|:-----------:|:---------:|:---------:|:-------:|:----:|:-----------:|
| **Dashboard** | ✅ Platform-wide | ✅ My Event | ✅ Limited | - | - | - |
| **Event CRUD** | ✅ All Events | ✅ My Events | 👁️ Read | - | - | 👁️ Browse |
| **Ticket Types** | ✅ All | ✅ My Events | 👁️ Read | - | - | 👁️ View |
| **Venue/Seats** | ✅ All | ✅ My Events | - | - | - | 👁️ Seat Map |
| **Orders** | ✅ All | ✅ My Events | 👁️ Read | - | - | ✅ My Orders |
| **Tickets** | ✅ All + Cancel | ✅ My Events | 👁️ Read | ✅ Scan | ✅ Scan | ✅ My Tickets |
| **Coupons** | ✅ CRUD | ✅ CRUD | - | - | - | ✅ Validate |
| **Sponsors** | - | ⚠️ No BE | - | - | - | 👁️ View |
| **Custom Fields** | - | ⚠️ No BE | - | - | - | - |
| **Invitation Tickets** | - | ⚠️ Mock | - | - | - | - |
| **OTS Sales** | - | ⚠️ Simul | - | - | - | - |
| **Banner Setup** | ✅ (NEW) | - | - | - | - | 👁️ View |

### 5.2 Operational Features

| Feature | SUPER_ADMIN | ORGANIZER | ORG_STAFF | COUNTER | GATE | PARTICIPANT |
|---------|:-----------:|:---------:|:---------:|:-------:|:----:|:-----------:|
| **Staff Management** | ✅ View All | ✅ Create | - | - | - | - |
| **Counter Mgmt** | ✅ All | ✅ My Event | - | - | - | - |
| **Gate Mgmt** | ✅ All | ✅ My Event | - | - | - | - |
| **Crew-Gate Assign** | ✅ | - | - | - | - | - |
| **Redeem (Wristband)** | - | ✅ | - | ✅ Scan | - | - |
| **Redeem History** | - | ✅ | - | ✅ My | - | - |
| **Gate Scan (IN/OUT)** | - | - | - | - | ✅ Scan | - |
| **Gate Log** | - | - | - | - | ✅ My | - |
| **Wristband Guide** | - | ✅ | - | ✅ View | - | 👁️ View |
| **Check Ticket** | - | ✅ | - | - | - | - |
| **Gate Monitoring** | ✅ | ✅ | - | - | - | - |
| **Live Monitor** | ✅ | ✅ | ✅ | - | - | - |

### 5.3 Financial Features

| Feature | SUPER_ADMIN | ORGANIZER | ORG_STAFF | COUNTER | GATE | PARTICIPANT |
|---------|:-----------:|:---------:|:---------:|:-------:|:----:|:-----------:|
| **Finance Overview** | ✅ All | ✅ My Rev | - | - | - | - |
| **Bank Account** | - | ✅ CRUD | - | - | - | - |
| **Withdraw Request** | ✅ View | ✅ Create | - | - | - | - |
| **Withdrawal History** | - | ✅ My | - | - | - | - |
| **Approve Withdrawal** | ✅ | - | - | - | - | - |
| **DOKU Disburse** | ✅ | - | - | - | - | - |
| **Payment Logs** | ✅ All | ✅ My | - | - | - | - |
| **Refund Request** | ✅ View | ✅ Create | - | - | - | - |
| **Approve Refund** | ✅ | - | - | - | - | - |

### 5.4 System Features

| Feature | SUPER_ADMIN | ORGANIZER | ORG_STAFF | COUNTER | GATE | PARTICIPANT |
|---------|:-----------:|:---------:|:---------:|:-------:|:----:|:-----------:|
| **Analytics** | ✅ Advanced | ✅ My Event | - | - | - | - |
| **Organizer Mgmt** | ✅ Approve/Fee | - | - | - | - | - |
| **User Mgmt** | ✅ Role Change | - | - | - | - | - |
| **Settings** | ✅ Fee/DOKU/Gen | - | - | - | - | - |
| **Audit Logs** | ✅ | - | - | - | - | - |
| **Notifications** | ✅ | ✅ | ✅ | - | - | ✅ |

---

## 6. Detail Fitur Per Modul

### 6.1 AUTH MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `POST /api/v1/auth/register` | Register PARTICIPANT | Public | ✅ |
| `POST /api/v1/auth/login` | Email/PW login | Public | ✅ |
| `POST /api/v1/auth/google` | Google OAuth | Public | ✅ |
| `POST /api/v1/auth/refresh` | Refresh JWT | Public | ✅ |
| `GET /api/v1/auth/me` | Get profile | Auth | ✅ |

**Flow**: 
- Google Sign-In → backend validasi ID Token → create/update user → return JWT
- Email/PW → hash bcrypt → JWT
- Token: Access (24h) + Refresh (168h)
- Auto-role: SUPER_ADMIN_EMAILS env var auto-promotes

### 6.2 EVENT MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `GET /api/v1/events/:slug` | Public event detail | Public | ✅ |
| `GET /api/v1/events/:slug/ticket-types` | Ticket types | Public | ✅ |
| `GET /api/v1/events/:slug/seat-map` | Venue + seats | Public | ✅ |
| `GET /api/v1/admin/events` | All events | SUPER_ADMIN | ✅ |
| `POST /api/v1/admin/events/:id/image` | Upload banner | SUPER_ADMIN | ✅ |
| `POST /api/v1/admin/events/:id/archive` | Soft-delete | SUPER_ADMIN | ✅ |
| `GET /api/v1/organizer/event` | My events | ORG/SA | ✅ |
| `POST /api/v1/organizer/event` | Create event | ORG/SA | ✅ |
| `PATCH /api/v1/organizer/event/:id` | Update event | ORG/SA | ✅ |
| `DELETE /api/v1/organizer/event/:id` | Delete event | ORG/SA | ✅ |
| `POST /api/v1/organizer/event/:id/image` | Upload banner | ORG/SA | ✅ |

**Event Properties**: title, slug, description, start/end date, venue info, status (draft/published/ongoing/completed/cancelled), tenant_id, organizer_id

### 6.3 TICKET TYPE MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `GET /api/v1/admin/ticket-types` | All types | SUPER_ADMIN | ✅ |
| `PUT /api/v1/admin/ticket-types/:id` | Update type | SUPER_ADMIN | ✅ |
| `DELETE /api/v1/admin/ticket-types/:id` | Delete type | SUPER_ADMIN | ✅ |
| `GET /api/v1/organizer/ticket-types` | My types | ORG/SA | ✅ |
| `POST /api/v1/organizer/ticket-types` | Create type | ORG/SA | ✅ |
| `PUT /api/v1/organizer/ticket-types/:id` | Update type | ORG/SA | ✅ |
| `DELETE /api/v1/organizer/ticket-types/:id` | Delete type | ORG/SA | ✅ |

**Ticket Type Properties**: name, price, quota, sold_count, benefits[], is_seated, color (wristband)

### 6.4 ORDER MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `POST /api/v1/orders/` | Create order | Auth | ✅ |
| `GET /api/v1/orders/` | My orders | Auth | ✅ |
| `GET /api/v1/orders/:id` | Order detail | Auth (owner) | ✅ |
| `POST /api/v1/orders/:id/cancel` | Cancel order | Auth (owner) | ✅ |
| `POST /api/v1/orders/hold-seat` | Hold seats | Auth | ✅ |
| `GET /api/v1/admin/orders` | All orders | SUPER_ADMIN | ✅ |
| `GET /api/v1/organizer/orders` | My orders | ORG/SA | ✅ |

**Order Properties**: order_number, sub_total, service_fee, platform_fee, tax_amount, discount_amount, mdr_amount, pph_amount, net_to_organizer, payment_method, status

**Financial Breakdown**:
- `serviceFee`: Biaya layanan yang dibayar buyer (ditambah ke total)
- `platformFee`: Komisi platform dari organizer (dipotong dari net)
- `taxAmount`: PPN 11% dari service fee
- `mdrAmount`: Merchant Discount Rate ke DOKU
- `pphAmount`: PPh Final 4(2) dari gross
- `netToOrganizer`: Yang diterima organizer

### 6.5 PAYMENT MODULE (DOKU)

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `POST /api/v1/doku/create` | Create payment | Auth | ✅ |
| `GET /api/v1/doku/status/:orderId` | Check status | Auth | ✅ |
| `POST /api/v1/doku/notification` | Webhook | DOKU Server | ✅ |

**Payment Methods**: Virtual Account (BCA, BNI, Mandiri, dll), QRIS, E-Wallet (OVO, GoPay, ShopeePay), Credit Card

**Mock Mode**: Jika DOKU credentials tidak dikonfigurasi, sistem auto-complete pembayaran setelah 5 detik untuk testing.

### 6.6 VENUE & SEAT MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| Admin Venues (13 endpoints) | Full CRUD | SUPER_ADMIN | ✅ |
| Organizer Venues (8 endpoints) | Scoped CRUD | ORG/SA | ✅ |
| Seat generation, bulk update | | | ✅ |

**Seat Status**: AVAILABLE → RESERVED (hold 5min) → SOLD | DISABLED

### 6.7 COUPON MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `POST /api/v1/coupons/validate` | Validate | Public | ✅ |
| `GET/POST/PUT/DELETE /api/v1/admin/coupons/*` | CRUD | SUPER_ADMIN | ✅ |

**Coupon Types**: percentage / nominal, global / event-scoped, usage_limit, valid_from/valid_until

### 6.8 WITHDRAWAL MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `POST /api/v1/organizer/withdraw` | Request | ORG/SA | ✅ |
| `GET /api/v1/organizer/withdrawals` | My list | ORG/SA | ✅ |
| `GET /api/v1/admin/withdrawals` | All | SUPER_ADMIN | ✅ |
| `PATCH /api/v1/admin/withdrawals/:id/approve` | Approve | SUPER_ADMIN | ✅ |
| `PATCH /api/v1/admin/withdrawals/:id/reject` | Reject | SUPER_ADMIN | ✅ |
| `POST /api/v1/admin/withdrawals/:id/proof` | Upload bukti | SUPER_ADMIN | ✅ |
| `POST /api/v1/admin/withdrawals/disburse` | DOKU disburse | SUPER_ADMIN | ✅ |
| `POST /api/v1/admin/withdrawals/:id/check-doku` | Check status | SUPER_ADMIN | ✅ |

**Withdrawal Types**: 
- MANUAL: Admin approve → transfer manual → upload bukti
- AUTO_DOKU: Admin approve → DOKU auto-disburse → check status

### 6.9 GATE & COUNTER MODULE

**Gate (4 endpoints)**: Scan IN/OUT, logs, status, profile
**Counter (5 endpoints)**: Scan + redeem, redemptions, status, inventory, guide
**Organizer monitoring (3 endpoints)**: Live monitor, gate monitoring, wristband inventory

### 6.10 NOTIFICATION MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `GET /api/v1/notifications/` | List | Auth | ✅ |
| `PATCH /api/v1/notifications/:id/read` | Mark read | Auth | ✅ |
| `POST /api/v1/notifications/read-all` | Mark all read | Auth | ✅ |

### 6.11 SETTINGS MODULE

| Endpoint | Method | Access | Status |
|----------|--------|--------|--------|
| `GET /api/v1/settings/fee-config` | Public fee | Public | ✅ |
| `GET /api/v1/admin/settings/all` | All settings | SUPER_ADMIN | ✅ |
| `GET /api/v1/admin/settings/:category` | By category | SUPER_ADMIN | ✅ |
| `PUT /api/v1/admin/settings/:key` | Update setting | SUPER_ADMIN | ✅ |
| `PUT /api/v1/admin/settings/bulk` | Bulk update | SUPER_ADMIN | ✅ |
| `GET /api/v1/admin/settings/doku/config` | DOKU config | SUPER_ADMIN | ✅ |
| `PUT /api/v1/admin/settings/doku/environment` | Toggle sandbox | SUPER_ADMIN | ✅ |
| `PUT /api/v1/admin/settings/doku/credentials` | Update creds | SUPER_ADMIN | ✅ |

**Setting Categories**: `fee` (service_fee_pct, platform_fee_pct, tax_pct, pph_pct), `payment` (doku_*), `general` (site_name, etc)

---

## 7. Gap Analysis vs Kompetitor

### 7.1 Feature Comparison

| Feature | Artatix | Loket | EventKu (Current) | Gap |
|---------|---------|-------|-------------------|-----|
| **E-Ticket WhatsApp** | ✅ | ✅ | ❌ | 🔴 HIGH |
| **Tiket Undangan** | ✅ | ✅ | ⚠️ Mock UI | 🔴 HIGH |
| **On-the-Spot Sales** | ✅ | ✅ | ⚠️ Simulated | 🟡 MEDIUM |
| **Custom Checkout Fields** | ✅ | ✅ | ⚠️ No BE | 🟡 MEDIUM |
| **Sponsor Display** | ✅ | ✅ | ⚠️ No BE | 🟡 MEDIUM |
| **Ticket Transfer** | ❌ | ✅ | ❌ | 🟡 MEDIUM |
| **ID Crew Barcode** | ✅ | ❌ | ❌ | 🟢 LOW |
| **Multi-Event Marketplace** | ✅ | ✅ | ❌ Single event | 🔴 HIGH |
| **Seat Map Interactive** | ✅ | ✅ | ✅ | ✅ DONE |
| **DOKU Payment** | ✅ | ✅ | ✅ | ✅ DONE |
| **Gate Scanner** | ✅ | ✅ (Craftor) | ✅ | ✅ DONE |
| **Wristband Redemption** | ✅ | ❌ | ✅ | ✅ DONE |
| **Live Monitoring** | ✅ | ✅ | ✅ (SSE) | ✅ DONE |
| **Withdrawal/Dashboard** | ✅ | ✅ | ✅ | ✅ DONE |
| **Refund System** | ✅ | ✅ | ✅ | ✅ DONE |
| **Coupon System** | ✅ | ✅ | ✅ | ✅ DONE |
| **Organizer Fee Config** | ✅ | ✅ | ✅ | ✅ DONE |
| **Audit Trail** | ❌ | ❌ | ✅ | ✅ BONUS |
| **Banner Setup** | ❌ | ❌ | ✅ (Basic) | ✅ BONUS |

### 7.2 Critical Missing Features (Prioritas)

#### 🔴 P0 — Harus Ada (MVP Gap)

1. **E-Ticket via WhatsApp**
   - Kirim QR code + detail tiket ke WhatsApp buyer
   - Integrasi WhatsApp Business API / Fonnte / Wablas
   - Flow: Payment success → Generate QR → Send WA message with QR image
   - Backend: `POST /api/v1/tickets/:id/send-whatsapp`

2. **Tiket Undangan (Invitation Tickets)**
   - Organizer bisa membuat tiket gratis/undangan
   - Tipe: VIP Guest, Media, Sponsor, Crew
   - Quantity limited, bisa di-revoke
   - Flow: Create invitation → Send link → Guest claim → Active ticket
   - Backend: `invitations` table, `POST /api/v1/organizer/invitations`, etc.

3. **Multi-Event Marketplace**
   - Homepage menampilkan semua event (bukan hardcoded 1 event)
   - Search, filter (kota, tanggal, kategori)
   - Setiap organizer punya subdomain: `{slug}.eventku.co.id`
   - Backend: `GET /api/v1/events` (public listing with pagination)

#### 🟡 P1 — Penting (Competitive Parity)

4. **On-the-Spot Sales**
   - Counter staff bisa jual tiket langsung di lokasi
   - Cash payment (tidak via DOKU)
   - Auto-generate ticket + QR
   - Backend: `POST /api/v1/organizer/ots-sale` → create order + ticket (status: paid, method: CASH)

5. **Custom Checkout Fields**
   - Organizer bisa tambah field saat checkout (NIK, alamat, emergency contact, dll)
   - Field types: text, number, select, checkbox
   - Data disimpan per order_item
   - Backend: `custom_fields` table, `custom_field_responses` table

6. **Sponsor Display**
   - Organizer upload logo sponsor (gold/silver/bronze tier)
   - Ditampilkan di landing page event
   - Backend: `sponsors` table with tier, logo_url, event_id

7. **Ticket Transfer**
   - Buyer bisa transfer tiket ke orang lain
   - Generate new QR, old QR invalidated
   - Flow: Request transfer → Confirm → New ticket issued
   - Backend: `POST /api/v1/tickets/:id/transfer`

#### 🟢 P2 — Nice to Have

8. **Crew ID Barcode**
   - Generate barcode per crew/staff
   - Scan di gate untuk verifikasi crew
   - Backend: Add `staff_code` to staff assignments

9. **Email E-Ticket**
   - Kirim e-ticket via email (selain WhatsApp)
   - HTML email with QR image embedded

10. **Event Analytics Export**
    - Export data ke Excel/CSV
    - Check-in reports, sales reports, financial reports

---

## 8. Status Implementasi

### 8.1 Backend API Status

| Modul | Endpoints | Status | Catatan |
|-------|-----------|--------|---------|
| Auth | 5 | ✅ Lengkap | Google OAuth + Email/PW |
| Events | 11 | ✅ Lengkap | Admin + Organizer scoped |
| Ticket Types | 7 | ✅ Lengkap | Admin + Organizer scoped |
| Orders | 7 | ✅ Lengkap | Hold seat, coupon, fee calc |
| DOKU Payment | 3 | ✅ Lengkap | VA, QRIS, E-Wallet, CC + Mock |
| Venues/Seats | 21 | ✅ Lengkap | Full CRUD + seat generation |
| Coupons | 5 | ✅ Lengkap | % / nominal, global/event |
| Organizers | 6 | ✅ Lengkap | Approve, reject, fee config |
| Withdrawals | 8 | ✅ Lengkap | Manual + DOKU disburse |
| Staff/Ops | 22 | ✅ Lengkap | Counter + Gate + Monitoring |
| Notifications | 3 | ✅ Lengkap | CRUD + mark read |
| Settings | 8 | ✅ Lengkap | Fee, DOKU, General |
| Analytics | 2 | ✅ Lengkap | Admin + Organizer |
| Finance | 4 | ✅ Lengkap | Balance, summary, payment logs |
| Refunds | 3 | ✅ Lengkap | Request, approve, reject |
| Users | 2 | ✅ Lengkap | List, role change |
| Audit Logs | 1 | ✅ Lengkap | Filterable |
| **Banners** | 0 | ❌ Missing | Frontend exists, no backend |
| **Sponsors** | 0 | ❌ Missing | Frontend exists, no backend |
| **Custom Fields** | 0 | ❌ Missing | Frontend exists, no backend |
| **Invitation Tickets** | 0 | ❌ Missing | Frontend mock only |
| **OTS Sales** | 0 | ❌ Missing | Frontend simulated |
| **E-Ticket WhatsApp** | 0 | ❌ Missing | Not started |
| **Multi-Event Listing** | 0 | ❌ Missing | Hardcoded single event |
| **Ticket Transfer** | 0 | ❌ Missing | Not started |

### 8.2 Frontend Page Status

| Page | Route | Status | Backend? |
|------|-------|--------|----------|
| Landing/Checkout | `/` | ✅ Functional | ✅ |
| Login | `/login` | ✅ Functional | ✅ |
| Admin Dashboard | `/admin` | ✅ Functional | ✅ |
| Events | `/admin/events` | ✅ Functional | ✅ |
| Organizers | `/admin/organizers` | ✅ Functional | ✅ |
| Orders | `/admin/orders` | ✅ Functional | ✅ |
| Tickets | `/admin/tickets` | ✅ Functional | ✅ |
| Ticket Types | `/admin/ticket-types` | ✅ Functional | ✅ |
| Venues | `/admin/venues` | ✅ Functional | ✅ |
| Seat Layout | `/admin/seat-layout` | ✅ Functional | ✅ |
| Coupons | `/admin/coupons` | ✅ Functional | ✅ |
| Staff | `/admin/staff` | ✅ Functional | ✅ |
| Counters | `/admin/counters` | ✅ Functional | ✅ |
| Gates | `/admin/gate-management` | ✅ Functional | ✅ |
| Crew-Gates | `/admin/crew-gates` | ✅ Functional | ✅ |
| Redeem | `/admin/redeem` | ✅ Functional | ✅ |
| Redeem History | `/admin/redeem-history` | ✅ Functional | ✅ |
| Check Ticket | `/admin/check-ticket` | ✅ Functional | ✅ |
| Wristband Guide | `/admin/wristband-guide` | ✅ Functional | ✅ |
| Finance | `/admin/finance` | ✅ Functional | ✅ |
| Bank Account | `/admin/bank-account` | ✅ Functional | ✅ |
| Withdraw | `/admin/withdraw` | ✅ Functional | ✅ |
| Withdrawal History | `/admin/withdrawal-history` | ✅ Functional | ✅ |
| Withdrawals (Admin) | `/admin/withdrawals` | ✅ Functional | ✅ |
| Payment Logs | `/admin/payment-logs` | ✅ Functional | ✅ |
| Refunds | `/admin/refunds` | ✅ Functional | ✅ |
| Gate Monitoring | `/admin/gate-monitoring` | ✅ Functional | ✅ |
| Live Monitor | `/admin/live-monitor` | ✅ Functional | ✅ |
| Analytics | `/admin/analytics` | ✅ Functional | ✅ |
| Users | `/admin/users` | ✅ Functional | ✅ |
| Settings | `/admin/settings` | ✅ Functional | ✅ |
| **Sponsors** | `/admin/sponsors` | ⚠️ Frontend-only | ❌ |
| **Custom Fields** | `/admin/custom-fields` | ⚠️ Frontend-only | ❌ |
| **Invitation Tickets** | `/admin/invitation-tickets` | ⚠️ Mock data | ❌ |
| **OTS Sales** | `/admin/ots-sales` | ⚠️ Simulated | ❌ |
| Gate Scanner | `/gate` | ✅ Functional | ✅ |
| Gate Log | `/gate/log` | ✅ Functional | ✅ |
| Gate Status | `/gate/status` | ✅ Functional | ✅ |
| Gate Profile | `/gate/profil` | ✅ Functional | ✅ |
| Counter Scanner | `/counter` | ✅ Functional | ✅ |
| Counter History | `/counter/riwayat` | ✅ Functional | ✅ |
| Counter Status | `/counter/status` | ✅ Functional | ✅ |
| Counter Guide | `/counter/guide` | ✅ Functional | ✅ |
| Counter Help | `/counter/help` | ✅ Functional | ❌ (static) |

### 8.3 Total Endpoint Count

| Area | Count |
|------|-------|
| Backend API Endpoints | ~116 |
| Frontend Pages | ~40 |
| Frontend-only (no backend) | 4 |
| Missing Backend (needed) | 6 modules |

---

## 9. Roadmap

### Phase 1 — Backend Gaps (Prioritas Tinggi)
> Target: 2 minggu

| # | Feature | Backend | Frontend | Estimasi |
|---|---------|---------|----------|----------|
| 1 | Banner CRUD | `banners` table + 5 endpoints | SetupBanner connect | 2 hari |
| 2 | Sponsor CRUD | `sponsors` table + 5 endpoints | Sponsors page connect | 2 hari |
| 3 | Custom Fields | `custom_fields` + `custom_field_responses` + 6 endpoints | Custom Fields page connect | 3 hari |
| 4 | Invitation Tickets | `invitations` table + 6 endpoints | Invitation page connect | 3 hari |
| 5 | OTS Sales | `POST /api/v1/organizer/ots-sale` | OTS page connect | 2 hari |

### Phase 2 — Competitive Features
> Target: 3 minggu

| # | Feature | Backend | Frontend | Estimasi |
|---|---------|---------|----------|----------|
| 6 | E-Ticket WhatsApp | WhatsApp API + endpoint | WA button on e-ticket | 3 hari |
| 7 | Multi-Event Marketplace | Public event listing API | New homepage | 5 hari |
| 8 | Ticket Transfer | Transfer endpoint + new QR | Transfer UI on My Tickets | 3 hari |
| 9 | Email E-Ticket | SMTP/SendGrid + template | Email button | 2 hari |

### Phase 3 — Optimization
> Target: 2 minggu

| # | Feature | Detail | Estimasi |
|---|---------|--------|----------|
| 10 | Analytics Export | CSV/Excel download | 2 hari |
| 11 | Crew ID Barcode | Staff code generation + scan | 2 hari |
| 12 | Middleware RBAC | Server-side role validation in middleware | 2 hari |
| 13 | Payment Proof Fix | Fix multipart upload for DOKU | 1 hari |
| 14 | Homepage Refactor | Split monolith into components | 3 hari |

---

*Dokumen ini dibuat berdasarkan analisis codebase EventKu per 30 Mei 2026.*
*Total: 116 backend endpoints, ~40 frontend pages, 31 database tables, 6 user roles.*
