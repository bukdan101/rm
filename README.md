# AutoMarket - Marketplace Mobil dengan Inspeksi 160 Titik

Marketplace jual beli mobil terpercaya dengan sistem inspeksi 160 titik, mirip dengan Carro dan Carsome.

## 🚀 Quick Start

### 1. Setup Supabase Database

1. Buka **Supabase Dashboard**: https://supabase.com/dashboard
2. Pilih project Anda
3. Pergi ke **SQL Editor**
4. Jalankan file SQL secara berurutan:

```bash
# File yang harus dijalankan di Supabase SQL Editor:
1. supabase/schema-quick.sql       # Buat tabel database
2. supabase/seed-data.sql          # Seed master data (brands, models, colors, inspection items)
3. supabase/seed-sample-listings.sql # Sample listings (opsional)
```

### 2. Environment Variables

Pastikan file `.env` sudah dikonfigurasi:

```env
NEXT_PUBLIC_SUPABASE_URL=https://vxigrlqpzzzgmlddijyj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DATABASE_URL="postgresql://postgres:password@db.vxigrlqpzzzgmlddijyj.supabase.co:5432/postgres"

# Google OAuth (opsional)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Setup Google OAuth (Opsional)

1. Buka **Google Cloud Console**: https://console.cloud.google.com
2. Buat OAuth 2.0 credentials
3. Tambahkan authorized redirect URIs:
   - `https://vxigrlqpzzzgmlddijyj.supabase.co/auth/v1/callback`
   - `http://localhost:3000/auth/callback`
4. Copy Client ID dan Client Secret ke `.env`
5. Di Supabase Dashboard > Authentication > Providers:
   - Enable Google
   - Masukkan Client ID dan Client Secret

### 4. Development

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Run linter
bun run lint
```

## 📊 Database Schema (72 Tabel)

### Modul Utama:

| Modul | Tabel | Deskripsi |
|-------|-------|-----------|
| User System | 7 tabel | Profile, Address, Documents, Verifications, Sessions, Notifications, Settings |
| Dealer System | 6 tabel | Dealers, Branches, Staff, Documents, Reviews, Inventory |
| Car Master | 8 tabel | Brands, Models, Variants, Generations, Colors, Body Types, Fuel Types, Transmissions |
| Listing System | 10 tabel | Listings, Images, Videos, Documents, Features, Price History, etc |
| Inspection System | 6 tabel | Categories, Items (160), Inspections, Results, Photos, Certificates |
| Rental System | 6 tabel | Prices, Bookings, Availability, Payments, Reviews, Insurance |
| Transaction System | 8 tabel | Orders, Items, Payments, Methods, Escrow, Transactions, Refunds, Invoices |
| Chat System | 3 tabel | Conversations, Messages, Attachments |
| Review & Rating | 3 tabel | Car Reviews, Votes, Images |
| Search & Analytics | 8 tabel | Search Logs, Recommendations, Recent Views, Trending, Analytics |
| Notification | 3 tabel | Notifications, Templates, Logs |
| Location | 4 tabel | Countries, Provinces, Cities, Districts |

## 🔧 API Endpoints

| Endpoint | Method | Deskripsi |
|----------|--------|-----------|
| `/api/brands` | GET | Daftar brand mobil |
| `/api/models` | GET | Daftar model mobil |
| `/api/colors` | GET | Daftar warna mobil |
| `/api/listings` | GET, POST | Daftar/tambah mobil |
| `/api/listings/[id]` | GET, PUT, DELETE | Detail mobil |
| `/api/inspections` | GET, POST | Data inspeksi |
| `/api/inspection-items` | GET | Daftar 160 item inspeksi |
| `/api/locations` | GET | Daftar lokasi Indonesia |
| `/api/conversations` | GET, POST | Chat conversations |
| `/api/search` | GET | Pencarian |

## 📝 Query Parameters untuk Filter

| Parameter | Deskripsi |
|-----------|-----------|
| `brand_id` | Filter berdasarkan brand |
| `model_id` | Filter berdasarkan model |
| `transaction_type` | jual / beli / rental |
| `condition` | baru / bekas / sedang / istimewa |
| `fuel` | bensin / diesel / electric / hybrid |
| `transmission` | automatic / manual |
| `body_type` | sedan / suv / mpv / hatchback / pickup / van |
| `year_min`, `year_max` | Filter tahun |
| `price_min`, `price_max` | Filter harga |
| `search` | Pencarian teks |
| `page`, `limit` | Paginasi |

## 🔐 RLS (Row Level Security)

Database dilengkapi dengan RLS untuk keamanan:

- ✅ Profiles - User hanya bisa update profile sendiri
- ✅ Car Listings - Owner bisa manage listing sendiri
- ✅ Favorites - User hanya bisa manage favorit sendiri
- ✅ Conversations - Peserta conversation bisa melihat pesan
- ✅ Public tables - Brands, models, colors bisa dilihat semua orang

## 🛠️ Inspeksi 160 Titik

Kategori inspeksi:

1. **Engine** (15 item) - Mesin, oli, radiator, aki
2. **Transmission** (10 item) - Persneling, drive shaft, CV joint
3. **Brake** (10 item) - Kampas rem, disc, ABS
4. **Suspension** (10 item) - Shock absorber, ball joint, bushing
5. **Steering** (5 item) - Setir, steering rack
6. **Exterior** (15 item) - Bumper, pintu, cat
7. **Interior** (10 item) - Dashboard, jok, AC
8. **Electrical** (10 item) - Lampu, power window, audio
9. **Safety** (5 item) - Airbag, ABS, seat belt
10. **Wheels** (6 item) - Ban, velg
11. **Underbody** (4 item) - Chassis, knalpot
12. **Body Structure** (5 item) - Frame, structural weld
13. **Features** (40 item) - Fitur tambahan
14. **Road Test** (10 item) - Pengujian jalan

## 📱 Preview

Buka aplikasi di **Preview Panel** yang tersedia di sebelah kanan interface.

## 📜 License

MIT
