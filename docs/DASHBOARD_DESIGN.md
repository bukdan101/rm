# 📋 Dashboard Design - AutoMarket

## 🎯 Overview

AutoMarket memiliki 3 jenis dashboard berbeda:
1. **Dashboard User Biasa** (Buyer/Seller)
2. **Dashboard Dealer/Showroom**
3. **Dashboard Admin** (sudah ada sebagian)

---

## 1️⃣ DASHBOARD USER BIASA

### 📌 Role & Status User Biasa

| Status | Deskripsi | Akses |
|--------|-----------|-------|
| **Buyer (Default)** | User baru register | Browse, Chat, Favorit, Beli Token |
| **Seller** | Buyer yang sudah verifikasi KYC | Semua fitur Buyer + Pasang Iklan |

### 📍 Menu Structure

```
┌─────────────────────────────────────────────────────────────┐
│  🏠 AutoMarket                                    [Avatar]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 Dashboard                      ← Overview & Stats       │
│  🚗 Iklan Saya                     ← Kelola iklan          │
│     ├─ Semua Iklan                                          │
│     ├─ Iklan Aktif                                          │
│     ├─ Iklan Suspended                                      │
│     ├─ Iklan Terjual                                        │
│     └─ [+] Buat Iklan Baru                                  │
│                                                             │
│  💬 Pesan                          ← Chat dengan seller    │
│     ├─ Semua Percakapan                                     │
│     ├─ Belum Dibaca                                         │
│     └─ Arsip                                                │
│                                                             │
│  ❤️ Favorit                        ← Mobil disimpan        │
│                                                             │
│  🤖 AI Prediction                  ← Prediksi harga        │
│     ├─ Riwayat Prediksi                                     │
│     ├─ Prediksi Baru                                        │
│     └─ Inspeksi 160 Titik (GRATIS)                          │
│                                                             │
│  🪙 Token Saya                     ← Saldo & Pembelian     │
│     ├─ Saldo Token                                          │
│     ├─ Beli Token                                           │
│     ├─ Riwayat Transaksi                                    │
│     └─ Riwayat Penggunaan                                   │
│                                                             │
│  ✅ Verifikasi KYC                 ← KTP + Selfie          │
│     ├─ Status Verifikasi                                    │
│     ├─ Submit Dokumen                                       │
│     └─ Hasil Review                                         │
│                                                             │
│  👤 Profil Saya                    ← Edit profil           │
│                                                             │
│  ⚙️ Pengaturan                     ← Settings              │
│     ├─ Notifikasi                                           │
│     ├─ Keamanan                                             │
│     └─ Privasi                                              │
│                                                             │
│  🚪 Keluar                                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 🎛️ Detail Fitur per Menu

#### 📊 Dashboard (Overview)
```
┌──────────────────────────────────────────────────────────────┐
│ Selamat Datang, [Nama User]!                                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│  │ 🪙 150  │ │ 🚗 3    │ │ 💬 12   │ │ ❤️ 8    │            │
│  │ Token   │ │ Iklan   │ │ Pesan   │ │ Favorit │            │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │
│                                                              │
│  📈 Aktivitas Terkini                                        │
│  ├─ Iklan "Toyota Avanza 2020" dilihat 45x hari ini        │
│  ├─ Pesan baru dari Budi tentang Honda Jazz                │
│  └─ Token 50 ditambahkan kemarin                            │
│                                                              │
│  🔥 Quick Actions                                            │
│  [+ Buat Iklan] [🤖 AI Prediction] [🪙 Beli Token]         │
│                                                              │
│  ⚠️ Aksi Diperlukan                                          │
│  ├─ 2 iklan akan expired dalam 3 hari                       │
│  └─ KYC belum terverifikasi - [Verifikasi Sekarang]         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### 🚗 Iklan Saya
```
┌──────────────────────────────────────────────────────────────┐
│ Iklan Saya                                    [+ Buat Iklan] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Filter: [Semua] [Aktif] [Suspended] [Terjual] [Draft]      │
│  Sort: [Terbaru] [Paling Dilihat] [Harga Tertinggi]         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🚗 Toyota Avanza 2020 - Rp 185.000.000                │ │
│  │    Dealer Marketplace | 7 hari tersisa | 156 views    │ │
│  │    Status: 🔴 SUSPENDED                               │ │
│  │    [Reaktivate] [Edit] [Hapus]                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 🚙 Honda Jazz 2019 - Rp 165.000.000                   │ │
│  │    Public Marketplace | 25 hari tersisa | 89 views    │ │
│  │    Status: 🟢 ACTIVE                                  │ │
│  │    [Boost] [Edit] [Hapus]                             │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### 🤖 AI Prediction
```
┌──────────────────────────────────────────────────────────────┐
│ AI Price Prediction                            [+ Prediksi]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  💡 Prediksi harga mobil Anda dengan AI canggih!            │
│     Biaya: 5 Token (hasil tersimpan 24 jam)                 │
│                                                              │
│  📋 Riwayat Prediksi                                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Toyota Avanza 2020 - E MT                             │ │
│  │ Hasil: Rp 178.000.000 - Rp 192.000.000               │ │
│  │ Inspeksi: 160 titik ✓ Grade A                        │ │
│  │ Tanggal: 15 Mar 2026 | Sisa waktu: 12 jam            │ │
│  │ [Lihat Detail] [Pasang Iklan]                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Honda Jazz 2019 - RS CVT                              │ │
│  │ Hasil: Rp 158.000.000 - Rp 172.000.000               │ │
│  │ Inspeksi: 160 titik ✓ Grade B+                       │ │
│  │ Tanggal: 14 Mar 2026 | Expired                       │ │
│  │ [Lihat Detail] [Prediksi Ulang]                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### 🪙 Token Saya
```
┌──────────────────────────────────────────────────────────────┐
│ Token Saya                                                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                    🪙 SALDO TOKEN                        ││
│  │                                                         ││
│  │                      150 TOKEN                          ││
│  │                   Rp 150.000                            ││
│  │                                                         ││
│  │            [Beli Token] [Riwayat]                       ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  💰 Paket Token                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ 50      │ │ 100     │ │ 250     │ │ 500     │           │
│  │ Token   │ │ Token   │ │ Token   │ │ Token   │           │
│  │ Rp 50rb │ │ Rp 95rb │ │ Rp 225rb│ │ Rp 425rb│           │
│  │ HEMAT!  │ │ DISKON! │ │ BONUS!  │ │ SUPER!  │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│                                                              │
│  📋 Penggunaan Token                                         │
│  ├─ AI Prediction: 5 Token                                  │
│  ├─ Pasang Iklan Normal: 10 Token (30 hari)                │
│  ├─ Jual ke Dealer: 20 Token (7 hari)                      │
│  ├─ Dealer Kontak Penjual: 5 Token                         │
│  ├─ Chat Public Marketplace: GRATIS ✓                      │
│  └─ Inspeksi 160 Titik: GRATIS ✓                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### ✅ Verifikasi KYC
```
┌──────────────────────────────────────────────────────────────┐
│ Verifikasi KYC                                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  📌 Persyaratan untuk menjadi Seller:                       │
│     ✓ KTP (Kartu Tanda Penduduk)                            │
│     ✓ Selfie dengan KTP                                     │
│                                                              │
│  Status: ⏳ BELUM VERIFIKASI                                 │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ FORM VERIFIKASI                                         ││
│  │                                                         ││
│  │ Nama Lengkap: [________________]                        ││
│  │ NIK: [____________________]                             ││
│  │ Nomor HP: [______________]                              ││
│  │                                                         ││
│  │ 📍 Alamat KTP                                           ││
│  │ Provinsi: [Pilih Provinsi ▼]                           ││
│  │ Kota/Kab: [Pilih Kota ▼]                               ││
│  │ Kecamatan: [Pilih Kecamatan ▼]                         ││
│  │ Kelurahan: [Pilih Kelurahan ▼]                         ││
│  │ Alamat Lengkap: [________________________]              ││
│  │                                                         ││
│  │ 📷 Upload Dokumen                                       ││
│  │ ┌─────────────┐ ┌─────────────┐                        ││
│  │ │ Foto KTP    │ │ Selfie+KTP  │                        ││
│  │ │ [Upload]    │ │ [Upload]    │                        ││
│  │ │ (Max 5MB)   │ │ (Max 5MB)   │                        ││
│  │ └─────────────┘ └─────────────┘                        ││
│  │                                                         ││
│  │ [Submit Verifikasi]                                     ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  ℹ️ Proses verifikasi maksimal 1-3 hari kerja              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ DASHBOARD DEALER / SHOWROOM

### 📌 Role & Status Dealer

| Status | Deskripsi | Akses |
|--------|-----------|-------|
| **Pending** | Dealer sudah register, menunggu approval | Dashboard terbatas |
| **Approved** | Dealer aktif | Semua fitur Dealer |
| **Suspended** | Dealer dinonaktifkan admin | Akses read-only |

### 📍 Menu Structure

```
┌─────────────────────────────────────────────────────────────┐
│  🏪 [Nama Dealer]                                  [Avatar]  │
│     Verified ✓ Dealer                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 Dashboard                      ← Overview & Analytics   │
│                                                             │
│  🚗 Inventori                      ← Kelola mobil          │
│     ├─ Semua Mobil                                          │
│     ├─ Tersedia                                             │
│     ├─ Terjual                                              │
│     ├─ Suspended                                            │
│     └─ [+] Tambah Mobil                                     │
│                                                             │
│  🏪 Dealer Marketplace             ← Iklan khusus dealer   │
│     ├─ Iklan Aktif                                          │
│     ├─ Penawaran Masuk                                      │
│     ├─ Iklan Expired                                        │
│     └─ Statistik                                            │
│                                                             │
│  🌐 Public Marketplace             ← Iklan publik          │
│     ├─ Iklan Aktif                                          │
│     ├─ Chat Pembeli (GRATIS)                                │
│     └─ Statistik                                            │
│                                                             │
│  💬 Pesan                          ← Semua chat            │
│     ├─ Dealer Marketplace Chat                              │
│     ├─ Public Marketplace Chat                              │
│     └─ Semua Percakapan                                     │
│                                                             │
│  📊 Statistik & Analytics          ← Laporan lengkap       │
│     ├─ Performa Iklan                                       │
│     ├─ Views & Leads                                        │
│     ├─ Conversion Rate                                      │
│     └─ Laporan Penjualan                                    │
│                                                             │
│  🤖 AI Prediction                  ← Prediksi harga        │
│     ├─ Prediksi Baru                                        │
│     ├─ Riwayat                                              │
│     └─ Inspeksi 160 Titik                                   │
│                                                             │
│  🪙 Token Bisnis                   ← Token dealer          │
│     ├─ Saldo                                                │
│     ├─ Beli Token                                           │
│     ├─ Riwayat                                              │
│     └─ Penggunaan Tim                                       │
│                                                             │
│  👥 Tim & Staf                     ← Manajemen tim         │
│     ├─ Daftar Staf                                          │
│     ├─ Tambah Staf                                          │
│     └─ Hak Akses                                            │
│                                                             │
│  🏢 Profil Dealer                  ← Info showroom         │
│     ├─ Edit Profil                                          │
│     ├─ Logo & Cover                                         │
│     ├─ Alamat & Lokasi                                      │
│     └─ Jam Operasional                                      │
│                                                             │
│  ✅ Legalitas                     ← Dokumen bisnis        │
│     ├─ NPWP                                                 │
│     ├─ NIB                                                  │
│     ├─ SIUP (Opsional)                                      │
│     └─ Surat Domisili (Opsional)                           │
│                                                             │
│  ⭐ Ulasan & Rating               ← Review dari customer  │
│                                                             │
│  ⚙️ Pengaturan                    ← Settings              │
│     ├─ Notifikasi                                           │
│     ├─ Integrasi                                            │
│     └─ Keamanan                                             │
│                                                             │
│  🚪 Keluar                                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 🎛️ Detail Fitur per Menu

#### 📊 Dashboard (Overview)
```
┌──────────────────────────────────────────────────────────────┐
│ Dashboard Dealer - [Nama Showroom]                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│  │ 🚗 45   │ │ 🟢 38   │ │ 🔴 7    │ │ 💬 24   │            │
│  │ Total   │ │ Tersedia│ │ Terjual │ │ Pesan   │            │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │
│                                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐            │
│  │ 👁️ 1.2K │ │ ❤️ 156  │ │ 📞 45   │ │ ⭐ 4.8  │            │
│  │ Views   │ │ Favorit │ │ Leads   │ │ Rating  │            │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘            │
│                                                              │
│  📈 Grafik Views & Leads (7 hari terakhir)                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │     📊                                                │ │
│  │  ▓▓▓                                                  │ │
│  │  ▓▓▓▓▓▓     ▓▓▓                                      │ │
│  │  ▓▓▓▓▓▓▓▓▓  ▓▓▓▓▓  ▓▓▓▓▓▓                            │ │
│  │  Sen Sel Rab Kam Jum Sab Min                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  🔥 Quick Actions                                            │
│  [+ Tambah Mobil] [🤖 AI Prediction] [📊 Lihat Statistik]   │
│                                                              │
│  ⚠️ Perlu Perhatian                                          │
│  ├─ 5 iklan akan expired dalam 7 hari                       │
│  ├─ 12 pesan belum dibalas                                  │
│  └─ 3 penawaran baru menunggu respon                        │
│                                                              │
│  📱 Performa Marketplace                                     │
│  ┌────────────────────────┬───────────────────────────────┐ │
│  │ 🏪 Dealer Marketplace  │ 🌐 Public Marketplace         │ │
│  │ 15 Iklan Aktif         │ 23 Iklan Aktif                │ │
│  │ 8 Penawaran Masuk      │ 156 Chat Aktif                │
│  │ Rp 450jt Estimasi      │ Rp 890jt Estimasi             │
│  └────────────────────────┴───────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### 🚗 Inventori
```
┌──────────────────────────────────────────────────────────────┐
│ Inventori Mobil                               [+ Tambah]     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Search: [___________________] [Cari]                       │
│                                                              │
│  Filter: [Semua] [Tersedia] [Terjual] [Suspended] [Draft]   │
│  Brand: [Semua Brand ▼]  Tahun: [Semua ▼]                   │
│                                                              │
│  View: [Grid] [List]                                        │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ 🚗       │ │ 🚙       │ │ 🚐       │ │ 🚗       │       │
│  │ Avanza   │ │ Jazz     │ │ Xenia    │ │ Innova   │       │
│  │ 2020     │ │ 2019     │ │ 2021     │ │ 2022     │       │
│  │ Rp 185jt │ │ Rp 165jt │ │ Rp 145jt │ │ Rp 295jt │       │
│  │ 🟢 Aktif │ │ 🟢 Aktif │ │ 🔴 Sold  │ │ 🟢 Aktif │       │
│  │ [Edit]   │ │ [Edit]   │ │ [View]   │ │ [Edit]   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                              │
│  Pagination: 1 2 3 ... 10                                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### 🏪 Dealer Marketplace
```
┌──────────────────────────────────────────────────────────────┐
│ Dealer Marketplace                            [Info] [Help]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  💡 Khusus untuk dealer! Iklan Anda akan ditampilkan        │
│     di marketplace dealer network (20 Token / 7 hari)       │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 📊 Statistik Dealer Marketplace                         ││
│  │                                                         ││
│  │ Iklan Aktif: 15     Penawaran Masuk: 8                 ││
│  │ Views Bulan Ini: 450  Conversion: 12%                  ││
│  │ Estimasi Nilai: Rp 2.850.000.000                       ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  📋 Penawaran Terbaru                                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Toyota Avanza 2020 | Penawaran: Rp 180.000.000        │ │
│  │ Dari: Dealer ABC Motor | 2 jam yang lalu              │ │
│  │ [Terima] [Tolak] [Negosiasi]                           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  📋 Iklan Aktif                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Toyota Avanza 2020 - E MT                             │ │
│  │ 20 Token | 5 hari tersisa | 89 views | 3 penawaran   │ │
│  │ Status: 🟢 ACTIVE | [Extend] [Edit] [View Stats]      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [+ Pasang Iklan di Dealer Marketplace - 20 Token]          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### 🌐 Public Marketplace
```
┌──────────────────────────────────────────────────────────────┐
│ Public Marketplace                                           │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  💡 Iklan untuk publik umum! Chat GRATIS untuk pembeli      │
│     10 Token / 30 hari                                      │
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ 📊 Statistik Public Marketplace                        ││
│  │                                                         ││
│  │ Iklan Aktif: 23     Chat Aktif: 156                    ││
│  │ Views Bulan Ini: 1.2K  Favorit: 89                     ││
│  │ Estimasi Nilai: Rp 4.250.000.000                       ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  💬 Chat Terbaru (GRATIS untuk respon!)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Budi: "Mas, Avanza 2020 masih ada? Nego dong..."      │ │
│  │ 5 menit lalu | [Balas]                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  📋 Iklan Aktif                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Honda Jazz 2019 - RS CVT                              │ │
│  │ 10 Token | 25 hari tersisa | 234 views | 12 chat     │ │
│  │ Status: 🟢 ACTIVE | [Boost] [Edit] [View Stats]       │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [+ Pasang Iklan di Public Marketplace - 10 Token]          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### 👥 Tim & Staf
```
┌──────────────────────────────────────────────────────────────┐
│ Tim & Staf                                    [+ Tambah]     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  💡 Kelola tim showroom Anda. Setiap staf memiliki akses    │
│     berdasarkan role mereka.                                 │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 👤 Ahmad (Owner)                                       │ │
│  │    ahmad@email.com | Akses Penuh                       │ │
│  │    [Edit Hak Akses]                                    │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ 👤 Budi (Manager)                                      │ │
│  │    budi@email.com | Kelola Iklan, Lihat Statistik      │ │
│  │    [Edit Hak Akses] [Hapus]                            │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │ 👤 Citra (Sales)                                       │ │
│  │    citra@email.com | Chat, Tambah Iklan                │ │
│  │    [Edit Hak Akses] [Hapus]                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  📋 Role & Hak Akses                                         │
│  ┌────────────┬───────────────────────────────────────────┐ │
│  │ Owner      │ Akses penuh semua fitur                   │ │
│  │ Manager    │ Kelola iklan, statistik, tim (tanpa hapus)│ │
│  │ Sales      │ Chat, tambah iklan, edit iklan sendiri    │ │
│  │ Inspector  │ Inspeksi mobil, lihat laporan             │ │
│  └────────────┴───────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### 📊 Statistik & Analytics
```
┌──────────────────────────────────────────────────────────────┐
│ Statistik & Analytics                        [Export PDF]    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Periode: [7 Hari] [30 Hari] [3 Bulan] [Custom]             │
│                                                              │
│  📈 Performa Iklan                                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Views: 12,450 (+15% dari minggu lalu)                 │ │
│  │ Leads: 156 (+8% dari minggu lalu)                     │ │
│  │ Conversion: 12.5%                                     │ │
│  │                                                        │ │
│  │ [Grafik Views & Leads]                                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  🏆 Top Performing Listings                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ 1. Toyota Innova 2022 | 450 views | 12 leads          │ │
│  │ 2. Honda Jazz 2019 | 380 views | 8 leads              │ │
│  │ 3. Toyota Avanza 2020 | 320 views | 6 leads           │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  💰 Revenue Estimation                                       │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Total Nilai Inventori: Rp 4.5 Miliar                  │ │
│  │ Penjualan Bulan Ini: Rp 850 Juta (3 unit)             │ │
│  │ Estimasi Penjualan: Rp 1.2 Miliar (5 unit prospek)    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  📊 Marketplace Comparison                                   │
│  ┌────────────────────────┬───────────────────────────────┐ │
│  │ Dealer Marketplace     │ Public Marketplace            │ │
│  │ Views: 2,450          │ Views: 10,000                 │ │
│  │ Leads: 45             │ Leads: 111                    │ │
│  │ Conversion: 18%       │ Conversion: 11%               │ │
│  └────────────────────────┴───────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### 🏢 Profil Dealer
```
┌──────────────────────────────────────────────────────────────┐
│ Profil Dealer                                               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  [Cover Image - 1200x400]                               ││
│  │                                                         ││
│  │  ┌────────┐                                             ││
│  │  │ [Logo] │  Auto Prima Jakarta                        ││
│  │  │ 80x80  │  ⭐ 4.8 (56 ulasan) | Verified ✓           ││
│  │  └────────┘  [Edit Logo] [Edit Cover]                  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  📝 Informasi Dasar                                          │
│  Nama Showroom: [Auto Prima Jakarta_________] [Edit]        │
│  Deskripsi: [_______________________________] [Edit]        │
│  Telepon: [021-56789012____] [Edit]                         │
│  Email: [info@autoprima.id____] [Edit]                      │
│  Website: [www.autoprima.id___] [Edit]                      │
│                                                              │
│  📍 Alamat & Lokasi                                          │
│  Provinsi: [DKI Jakarta ▼]                                  │
│  Kota: [Jakarta Selatan ▼]                                  │
│  Alamat: [Jl. Fatmawati No. 123, Cipete Utara_]            │
│  Kode Pos: [12410]                                          │
│  [📍 Lihat di Maps]                                         │
│                                                              │
│  📷 Foto Showroom                                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Foto 1   │ │ Foto 2   │ │ Foto 3   │ │ [+ Add]  │       │
│  │ (Utama)  │ │          │ │          │ │          │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│  * Foto depan showroom WAJIB                                │
│                                                              │
│  🕐 Jam Operasional                                          │
│  Senin - Jumat: [08:00] - [20:00]                           │
│  Sabtu: [08:00] - [18:00]                                   │
│  Minggu: [09:00] - [17:00]                                  │
│                                                              │
│  [Simpan Perubahan]                                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

#### ⭐ Ulasan & Rating
```
┌──────────────────────────────────────────────────────────────┐
│ Ulasan & Rating                                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              ⭐ 4.8 / 5.0                               ││
│  │              56 Ulasan                                  ││
│  │                                                         ││
│  │  ████████████░ Layanan (4.9)                           ││
│  │  ███████████░░ Kualitas (4.8)                          ││
│  │  ████████████░ Responsif (4.9)                         ││
│  │  ███████████░░ Harga (4.6)                             ││
│  └─────────────────────────────────────────────────────────┘│
│                                                              │
│  📋 Ulasan Terbaru                                           │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ⭐⭐⭐⭐⭐ Budi Santoso                                  │ │
│  │ 12 Mar 2026                                           │ │
│  │ "Pelayanan sangat ramah, mobil sesuai deskripsi.       │ │
│  │  Proses jual beli lancar dan transparan."              │ │
│  │ [Balas]                                                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ ⭐⭐⭐⭐ Ahmad Wijaya                                    │ │
│  │ 10 Mar 2026                                           │ │
│  │ "Mobil bagus, harga reasonable. Recommended!"          │ │
│  │ [Balas]                                                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Lihat Semua Ulasan]                                       │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 3️⃣ PERBANDINGAN USER vs DEALER

| Fitur | User Biasa | Dealer/Showroom |
|-------|-----------|-----------------|
| Dashboard Overview | ✅ | ✅ |
| Iklan Saya | ✅ (max 5 aktif) | ✅ (unlimited) |
| Public Marketplace | ✅ | ✅ |
| Dealer Marketplace | ❌ | ✅ |
| Chat Public | ✅ GRATIS | ✅ GRATIS |
| Chat Dealer | ❌ | ✅ (5 Token/kontak) |
| AI Prediction | ✅ (5 Token) | ✅ (5 Token) |
| Inspeksi 160 Titik | ✅ GRATIS | ✅ GRATIS |
| Statistik Basic | ✅ | ✅ |
| Statistik Advanced | ❌ | ✅ |
| Tim & Staf | ❌ | ✅ |
| Profil Public | ✅ | ✅ (lebih lengkap) |
| Ulasan & Rating | ❌ | ✅ |
| Multi Branch | ❌ | ✅ |
| Verified Badge | Setelah KYC | ✅ Otomatis |

---

## 4️⃣ STATUS VERIFIKASI

### User Biasa → Seller
| Status | Keterangan | Aksi |
|--------|------------|------|
| Not Submitted | Belum verifikasi | Submit KYC |
| Pending | Menunggu review | Tunggu 1-3 hari |
| Approved | Dapat pasang iklan | Mulai berjualan |
| Rejected | Ditolak admin | Re-submit dengan perbaikan |

### Dealer Registration
| Status | Keterangan | Aksi |
|--------|------------|------|
| Draft | Belum lengkap | Lengkapi data |
| Pending | Menunggu review | Tunggu 1-3 hari |
| Under Review | Sedang direview | Tunggu hasil |
| Approved | Dealer aktif | Akses penuh |
| Rejected | Ditolak admin | Re-submit dengan perbaikan |

---

## 5️⃣ IMPLEMENTASI PRIORITAS

### Phase 1: Core Dashboard (User Biasa)
1. ✅ Dashboard Layout dengan sidebar
2. ✅ Dashboard Overview dengan stats
3. ✅ Menu navigasi lengkap
4. 🔄 Iklan Saya (list, filter, actions)
5. 🔄 Token Saya (saldo, beli, riwayat)
6. 🔄 AI Prediction (riwayat, baru)
7. 🔄 Pesan (chat list, conversation)
8. 🔄 Favorit (saved cars)

### Phase 2: Seller Features
1. 🔄 Verifikasi KYC (form, upload, status)
2. 🔄 Buat Iklan (multi-step form)
3. 🔄 Edit Iklan
4. 🔄 Marketplace Selection (Dealer/Public/Both)

### Phase 3: Dealer Dashboard
1. 🔄 Dealer-specific menu
2. 🔄 Inventori management
3. 🔄 Dealer Marketplace
4. 🔄 Tim & Staf management
5. 🔄 Statistik & Analytics
6. 🔄 Profil Dealer
7. 🔄 Ulasan & Rating

### Phase 4: Admin Dashboard
1. 🔄 User Management
2. 🔄 Dealer Approval
3. 🔄 KYC Review
4. 🔄 Token Management (sudah ada)
5. 🔄 Reports & Analytics
