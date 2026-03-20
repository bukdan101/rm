# 📊 ANALISIS DASHBOARD HOME vs DATABASE & API

## 🔍 RINGKASAN EKSEKUTIF

DashboardHome membutuhkan **7 komponen utama**, namun beberapa **API dan Hook belum ada**.

---

## 📋 KOMPONEN YANG DIBUTUHKAN DASHBOARDHOME

### 1. **Hook: useDashboardData** ❌ TIDAK ADA
```typescript
// Yang dibutuhkan:
const { stats, transactions, listings, orders, loading } = useDashboardData();
```
**Status:** TIDAK ADA - Perlu dibuat

---

### 2. **API: /api/notifications** ❌ TIDAK ADA
```typescript
// Yang dibutuhkan:
const response = await fetch('/api/notifications?limit=5');
// Return: { notifications: [], unreadCount: 0 }
```
**Status:** TIDAK ADA - Perlu dibuat

---

### 3. **API: /api/auth/check-role** ❌ TIDAK ADA
```typescript
// Yang dibutuhkan:
const response = await fetch('/api/auth/check-role');
// Return: { isAdmin: boolean }
```
**Status:** TIDAK ADA - Perlu dibuat

---

### 4. **API: /api/dashboard/stats** ✅ ADA (Perlu Perbaikan)
```typescript
// Return saat ini:
{
  totalListings, activeListings, soldListings,
  totalViews, totalFavorites, totalInquiries,
  tokenBalance, kycStatus, recentActivity,
  viewsData, inquiriesData
}
```
**Status:** ADA tapi kurang lengkap (tidak ada walletBalance, creditsBalance, pendingOrders, unreadMessages)

---

## 📊 ANALISIS DATA YANG DIBUTUHKAN

### A. STATS (Statistik Dashboard)

| Field | Sumber DB | Status API |
|-------|-----------|------------|
| `walletBalance` | `wallets.balance` | ❌ Tidak ada di API |
| `creditsBalance` | `wallets.balance` | ✅ Ada sebagai `tokenBalance` |
| `activeListings` | `car_listings` WHERE status='active' | ✅ Ada |
| `totalListings` | `car_listings` COUNT | ✅ Ada |
| `totalOrders` | `orders` COUNT | ❌ Tidak ada |
| `pendingOrders` | `orders` WHERE status='pending' | ❌ Tidak ada |
| `unreadMessages` | `messages` WHERE is_read=false | ❌ Tidak ada |

### B. TRANSACTIONS (Transaksi Wallet)

| Field | Sumber DB | Status |
|-------|-----------|--------|
| `id` | `wallet_transactions.id` | ✅ Ada tabel |
| `type` | `wallet_transactions.type` | ✅ Ada tabel |
| `amount` | `wallet_transactions.amount` | ✅ Ada tabel |
| `description` | `wallet_transactions.description` | ✅ Ada tabel |
| `created_at` | `wallet_transactions.created_at` | ✅ Ada tabel |
| **API** | `/api/wallet/transactions` | ❌ Tidak ada |

### C. LISTINGS (Iklan User)

| Field | Sumber DB | Status |
|-------|-----------|--------|
| `id` | `car_listings.id` | ✅ Ada tabel |
| `title` | `car_listings.title` | ✅ Ada tabel |
| `price` | `car_listings.price_cash` | ✅ Ada tabel |
| `status` | `car_listings.status` | ✅ Ada tabel |
| `view_count` | `car_listings.view_count` | ✅ Ada tabel |
| `listing_images` | `car_images` JOIN | ✅ Ada tabel |
| **API** | `/api/my-listings` | ✅ Ada |

### D. ORDERS (Pesanan)

| Field | Sumber DB | Status |
|-------|-----------|--------|
| `id` | `orders.id` | ✅ Ada tabel |
| `amount` | `orders.total_amount` | ✅ Ada tabel |
| `status` | `orders.status` | ✅ Ada tabel |
| `created_at` | `orders.created_at` | ✅ Ada tabel |
| `listing` | JOIN `car_listings` | ✅ Ada tabel |
| **API** | `/api/orders` | ❌ Tidak ada |

### E. NOTIFICATIONS (Notifikasi)

| Field | Sumber DB | Status |
|-------|-----------|--------|
| `id` | `notifications.id` | ✅ Ada tabel |
| `type` | `notifications.type` | ✅ Ada tabel |
| `title` | `notifications.title` | ✅ Ada tabel |
| `message` | `notifications.message` | ✅ Ada tabel |
| `isRead` | `notifications.read` | ✅ Ada tabel |
| `createdAt` | `notifications.created_at` | ✅ Ada tabel |
| **API** | `/api/notifications` | ❌ Tidak ada |

---

## 🔗 KETERKAITAN DATABASE

### Tabel yang Digunakan Dashboard:

```
┌─────────────────────────────────────────────────────────────┐
│                    DASHBOARD HOME DATA FLOW                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  profiles ────────────┬── user_settings (pengaturan)        │
│         │              │                                     │
│         ├── wallets ───┼── wallet_transactions (transaksi)  │
│         │              │                                     │
│         ├── car_listings ── car_images (iklan)              │
│         │              │                                     │
│         ├── orders ────┼── order_items                       │
│         │              │   └── payments                      │
│         ├── notifications (notifikasi)                       │
│         │                                                    │
│         └── conversations ── messages (chat)                 │
│                                                              │
│  dealers ────── dealer_inventory (dealer stats)             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚨 YANG PERLU DIBUAT

### 1. Hook: `/hooks/useDashboardData.ts`
```typescript
// fetch dari beberapa API:
// - /api/dashboard/stats
// - /api/wallet/transactions  
// - /api/my-listings
// - /api/orders
```

### 2. API: `/api/notifications/route.ts`
```typescript
// GET: Ambil notifikasi user
// PUT: Mark as read
```

### 3. API: `/api/auth/check-role/route.ts`
```typescript
// GET: Return { isAdmin, isDealer, role }
```

### 4. API: `/api/orders/route.ts`
```typescript
// GET: Ambil orders user (buyer atau seller)
```

### 5. API: `/api/wallet/transactions/route.ts`
```typescript
// GET: Ambil transaksi wallet user
```

### 6. Update: `/api/dashboard/stats/route.ts`
```typescript
// Tambahkan:
// - walletBalance (dari wallets)
// - totalOrders (dari orders)
// - pendingOrders (dari orders WHERE status='pending')
// - unreadMessages (dari messages WHERE is_read=false)
```

---

## 📊 PRIORITAS IMPLEMENTASI

| Priority | Komponen | Estimasi Waktu |
|----------|----------|----------------|
| 🔴 HIGH | useDashboardData hook | 30 min |
| 🔴 HIGH | /api/notifications | 20 min |
| 🔴 HIGH | /api/auth/check-role | 10 min |
| 🟡 MEDIUM | /api/orders | 30 min |
| 🟡 MEDIUM | /api/wallet/transactions | 20 min |
| 🟢 LOW | Update /api/dashboard/stats | 15 min |

**Total Estimasi:** ~2 jam

---

## 🔄 LOGIC BISNIS YANG PERLU DIPAHAMI

### 1. Sistem Wallet & Credits
```
User memiliki 2 jenis saldo:
├── Wallet (IDR) - Untuk pembayaran
│   └── Top up via payment gateway
│   └── Digunakan untuk beli credits
│
└── Credits (Token) - Untuk fitur premium
    └── Beli via credit_packages
    └── Digunakan untuk: boost listing, highlight, dll
```

### 2. Sistem Listing
```
Listing (Iklan Mobil)
├── Status: draft → pending → active → sold/expired
├── View count: tracking pengunjung
├── Favorite: user bisa simpan favorit
└── Boost: bayar credits untuk highlight
```

### 3. Sistem Order
```
Order (Transaksi Jual Beli)
├── Buyer: User yang membeli
├── Seller: User/Dealer yang menjual
├── Status: pending → confirmed → processing → completed
├── Escrow: Pembayaran ditahan sampai selesai
└── Invoice: Dokumen transaksi
```

### 4. Sistem Notifikasi
```
Notification Types:
├── info - Informasi umum
├── success - Berhasil
├── warning - Peringatan
├── error - Error
├── order - Pesanan baru
├── payment - Pembayaran
└── message - Chat baru
```

---

## ✅ KESIMPULAN

1. **Database sudah ada** (72 tabel lengkap)
2. **API sebagian ada** tapi perlu dilengkapi
3. **Hook belum ada** - perlu dibuat `useDashboardData`
4. **Logic bisnis** sudah terdefinisi di schema

**Langkah Selanjutnya:**
1. Buat API yang belum ada
2. Buat hook useDashboardData
3. Update dashboard stats API
4. Test integrasi
