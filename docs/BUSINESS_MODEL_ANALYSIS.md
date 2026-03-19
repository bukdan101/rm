# 📊 ANALISA BISNIS MODEL - AUTOMARKET

## 🔍 HASIL ANALISA DATABASE

### Tabel yang Tersedia dan Status:

| Kategori | Tabel | Jumlah Data | Status |
|----------|-------|-------------|--------|
| **Master Data** | brands | 10 | ✅ Ada |
| | car_models | 48 | ✅ Ada |
| | provinces | 45 | ✅ Ada |
| | cities | 523 | ✅ Ada |
| | districts | 7,285 | ✅ Ada |
| **Listings** | car_listings | 50 | ✅ Ada |
| | car_images | 151 | ✅ Ada |
| | car_inspections | 50 | ✅ Ada |
| | inspection_results | 8,000 | ✅ Ada |
| **User System** | profiles | 0 | ⚠️ Kosong |
| | dealers | 0 | ⚠️ Kosong |
| | user_addresses | 0 | ⚠️ Kosong |
| **Transaksi** | orders | 0 | ⚠️ Kosong |
| | payments | 0 | ⚠️ Kosong |
| | rental_bookings | 0 | ⚠️ Kosong |
| **Komunikasi** | conversations | 0 | ⚠️ Kosong |
| | messages | 0 | ⚠️ Kosong |

---

## 🏗️ STRUKTUR LISTING MOBIL

### Kolom di `car_listings`:

```sql
-- Ownership
user_id          -- Owner pribadi (individual seller)
dealer_id        -- Owner dealer (dealer seller)

-- Tipe Transaksi
transaction_type -- 'jual' (saat ini hanya ada ini)
condition        -- 'baru' | 'bekas'

-- Harga
price_cash       -- Harga tunai
price_credit     -- Harga kredit
price_negotiable -- true/false (bisa dinegosiasi?)

-- Status
status           -- 'active' | 'pending' | 'sold' | 'expired' | 'rejected' | 'deleted'
published_at     -- Tanggal publish
featured_until   -- Tanggal featured berakhir
sold_at          -- Tanggal terjual
```

---

## 📋 BUSINESS MODEL YANG SUDAH DIDESAIN

### 1. **TIPE PENJUAL**

| Tipe | Field | Deskripsi |
|------|-------|-----------|
| **Individual Seller** | `user_id` NOT NULL | User biasa yang menjual mobil pribadi |
| **Dealer Seller** | `dealer_id` NOT NULL | Dealer resmi yang menjual mobil |

### 2. **TIPE TRANSAKSI**

```typescript
// Saat ini hanya:
transaction_type: 'jual'  // Dijual

// Desain database mendukung:
- 'jual'    = Dijual (cash/kredit)
- 'rental'  = Disewakan
- 'beli'    = Ingin membeli (request)
```

### 3. **SISTEM HARGA**

```typescript
price_cash       // Harga cash (tunai)
price_credit     // Harga kredit (cicilan)
price_negotiable // Boolean - bisa negosiasi atau tidak
```

### 4. **SISTEM INSPEKSI**

```
Total: 160 titik inspeksi
Kategori: 14 kategori

Hasil inspeksi:
- total_points: 160
- passed_points: jumlah lolos
- failed_points: jumlah gagal
- inspection_score: persentase (0-100)
- risk_level: 'low' | 'medium' | 'high'
- overall_grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' | 'E'
```

---

## 🔄 WORKFLOW LISTING USER

### SCENARIO A: User Individual Menjual Mobil

```
┌─────────────────────────────────────────────────────────────────┐
│                    WORKFLOW USER INDIVIDUAL                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. DAFTAR/AUTH                                                  │
│     ├── User register/login                                     │
│     ├── Profile completion                                      │
│     └── Phone verification                                      │
│                                                                  │
│  2. BUAT LISTING                                                 │
│     ├── Input data mobil (brand, model, year, dll)              │
│     ├── Upload foto (max 20 foto)                               │
│     ├── Set harga (cash/credit)                                 │
│     ├── Set price_negotiable: true/false                        │
│     └── Submit untuk review                                     │
│                                                                  │
│  3. REVIEW & APPROVAL                                            │
│     ├── Admin review listing                                    │
│     ├── Status: pending → active / rejected                     │
│     └── Published if approved                                   │
│                                                                  │
│  4. INSPEKSI (Opsional tapi direkomendasikan)                   │
│     ├── Request inspection                                      │
│     ├── Inspector datang                                        │
│     ├── 160 titik inspeksi                                      │
│     └── Sertifikat inspeksi                                     │
│                                                                  │
│  5. INTERAKSI PEMBELI                                            │
│     ├── ┌───────────────────────────────────────────┐           │
│     │   │     PILIHAN KOMUNIKASI                    │           │
│     │   ├───────────────────────────────────────────┤           │
│     │   │ A. CHAT via Platform                      │           │
│     │   │    - Conversations table                  │           │
│     │   │    - Messages table                       │           │
│     │   │    - Dokumentasi lengkap                  │           │
│     │   │    - Bisa tawar-menawar                  │           │
│     │   │                                           │           │
│     │   │ B. HUBUNGI LANGSUNG                       │           │
│     │   │    - WhatsApp langsung                    │           │
│     │   │    - Telepon                             │           │
│     │   │    - Tidak tercatat di platform           │           │
│     │   └───────────────────────────────────────────┘           │
│                                                                  │
│  6. TRANSAKSI                                                    │
│     ├── ┌───────────────────────────────────────────┐           │
│     │   │     PILIHAN TRANSAKSI                     │           │
│     │   ├───────────────────────────────────────────┤           │
│     │   │ A. TRANSAKSI MANDIRI                      │           │
│     │   │    - Deal di luar platform                │           │
│     │   │    - User update status: SOLD             │           │
│     │   │    - Tidak ada escrow                     │           │
│     │   │                                           │           │
│     │   │ B. TRANSAKSI via PLATFORM                 │           │
│     │   │    - Orders table                         │           │
│     │   │    - Payments table                       │           │
│     │   │    - Escrow system                        │           │
│     │   │    - Platform fee                         │           │
│     │   └───────────────────────────────────────────┘           │
│                                                                  │
│  7. SELESAI                                                      │
│     └── Status: sold, sold_at updated                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### SCENARIO B: Dealer Menjual Mobil

```
┌─────────────────────────────────────────────────────────────────┐
│                      WORKFLOW DEALER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. REGISTRASI DEALER                                            │
│     ├── Submit dokumen bisnis                                    │
│     │   ├── NPWP                                                │
│     │   ├── NIB (Nomor Induk Berusaha)                          │
│     │   ├── SIUP (opsional)                                     │
│     │   └── Surat Domisili (opsional)                           │
│     ├── Admin verifikasi                                        │
│     └── Dealer account activated                                │
│                                                                  │
│  2. BUAT LISTING                                                  │
│     ├── Sama seperti user individual                            │
│     ├── TAPI: dealer_id filled                                  │
│     ├── Bisa set multiple branches                              │
│     └── Dealer branding visible                                 │
│                                                                  │
│  3. FITUR DEALER                                                  │
│     ├── dealer_branches - Multiple lokasi                       │
│     ├── dealer_staff - Staff management                         │
│     ├── dealer_reviews - Rating & reviews                       │
│     └── Subscription tiers                                      │
│                                                                  │
│  4. KEUNGGULAN DEALER                                            │
│     ├── Featured listings                                       │
│     ├── Verified badge                                          │
│     ├── Higher visibility                                       │
│     └── Analytics dashboard                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💰 MODEL BISNIS YANG DITERAPKAN

### 1. **FREE LISTING** (User Individual)
```
✅ Post iklan gratis
✅ Maksimal 3 iklan aktif
✅ Durasi 30 hari
✅ Inspeksi opsional (biaya terpisah)
✅ Tidak ada featured placement
✅ Komunikasi via WhatsApp atau Chat
```

### 2. **PREMIUM LISTING** (Berbayar)
```
💰 Featured di homepage
💰 Prioritas di search result
💰 Badge "Featured"
💰 Durasi 7-30 hari
💰 Lebih banyak foto
💰 Video upload
```

### 3. **DEALER SUBSCRIPTION**
```
🏢 Subscription bulanan/tahunan
🏢 Unlimited listings
🏢 Featured placement
🏢 Dealer branding
🏢 Analytics dashboard
🏢 Multi-branch support
```

### 4. **PLATFORM FEE** (Jika transaksi via platform)
```
📊 Escrow system
📊 Platform fee: 1-2% dari transaksi
📊 Payment gateway fee
📊 Dokumentasi transaksi
```

---

## 🔧 SISTEM TAWAR-MENAWAR

### Opsi A: Direct Negotiation (WhatsApp)
```
Kelebihan:
+ Cepat dan langsung
+ Familiar untuk user Indonesia
+ Tidak ada biaya platform

Kekurangan:
- Tidak terdokumentasi
- Rentan penipuan
- Tidak ada escrow
- Sulit tracking
```

### Opsi B: In-App Negotiation (Chat)
```
Kelebihan:
+ Terdokumentasi
+ Aman dengan escrow
+ Platform fee
+ Professional image

Kekurangan:
- Perlu adoption dari user
- Lebih lambat
- Ada biaya platform
```

### Opsi C: Hybrid (RECOMMENDED)
```
┌─────────────────────────────────────────────────────────────────┐
│                    HYBRID NEGOTIATION MODEL                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. CHAT DI PLATFORM                                             │
│     ├── Initial contact via platform                            │
│     ├── Tawar-menawar awal                                      │
│     ├── Share dokumen pendukung                                 │
│     └── Lihat inspeksi report                                   │
│                                                                  │
│  2. PILIHAN LANJUTAN                                             │
│     ├── ┌─────────────────────────────────────┐                 │
│     │   │ A. LANJUT via PLATFORM              │                 │
│     │   │    - Escrow system                  │                 │
│     │   │    - Platform fee                   │                 │
│     │   │    - Garansi transaksi              │                 │
│     │   │    - Dokumentasi lengkap            │                 │
│     │   │                                     │                 │
│     │   │ B. LANJUT DI LUAR PLATFORM          │                 │
│     │   │    - Deal via WhatsApp              │                 │
│     │   │    - Tidak ada fee                  │                 │
│     │   │    - Tidak ada garansi              │                 │
│     │   │    - User update status SOLD        │                 │
│     │   └─────────────────────────────────────┘                 │
│                                                                  │
│  3. TRANSPARANSI                                                  │
│     ├── Platform TIDAK memaksa escrow                          │
│     ├── Inform risiko deal di luar platform                     │
│     └── User pilih sendiri                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ KESIMPULAN DAN REKOMENDASI

### Model Bisnis yang Direkomendasikan:

1. **FREE USER** 
   - Post gratis dengan batasan
   - Bisa pilih: Chat platform atau WhatsApp
   - Tidak ada fee jika deal di luar platform

2. **PREMIUM USER**
   - Featured listing berbayar
   - More visibility

3. **DEALER**
   - Subscription model
   - Professional tools

4. **TRANSACTION**
   - ESCROW opsional, tidak wajib
   - Platform fee hanya jika via escrow
   - User bebas pilih cara transaksi

### Flow:
```
User → Post Listing → Inspection (optional) → 
Buyer Contact → CHAT or WHATSAPP → 
DEAL via PLATFORM (escrow) OR DEAL OFFLINE (no fee) → 
Update Status SOLD
```
