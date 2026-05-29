# 📋 ANALISIS ASTRAPAY API — Integrasi Pembayaran Kredit AutoMarket

> **Tanggal:** Maret 2026  
> **Sumber:** https://www.astrapay.com/docs/api/  
> **Tujuan:** Menjadikan AstraPay sebagai alat pembayaran kredit/token di AutoMarket  
> **Update Terakhir Dokumen AstraPay:** 6 Maret 2026  

---

## DAFTAR ISI

1. [Overview AstraPay API](#1-overview-astrapay-api)
2. [Arsitektur Keamanan SNAP](#2-arsitektur-keamanan-snap)
3. [Modul API yang Tersedia](#3-modul-api-yang-tersedia)
4. [Alur Integrasi untuk Pembayaran Kredit](#4-alur-integrasi-untuk-pembayaran-kredit)
5. [API yang Direkomendasikan](#5-api-yang-direkomendasikan)
6. [Perbandingan Metode Pembayaran](#6-perbandingan-metode-pembayaran)
7. [Implementasi Teknis](#7-implementasi-teknis)
8. [Estimasi Biaya & Timeline](#8-estimasi-biaya-timeline)
9. [Risiko & Mitigasi](#9-risiko-mitigasi)
10. [Kesimpulan & Rekomendasi](#10-kesimpulan-rekomendasi)

---

## 1. OVERVIEW ASTRAPAY API

### 1.1 Tentang AstraPay
AstraPay adalah **e-wallet dan payment gateway** dari Astra International (konglomerasi otomotif terbesar Indonesia). Sebagai bagian ekosistem Astra (Toyota, Honda, Daihatsu, dll), AstraPay memiliki keunggulan di sektor otomotif.

**Kenapa AstraPay cocok untuk AutoMarket?**
- ✅ **Ekosistem Otomotif** — Astra adalah pemilik dealer Toyota, Honda, Daihatsu di Indonesia
- ✅ **SNAP BI Certified** — Sesuai standar Bank Indonesia
- ✅ **Multi Payment Method** — E-Wallet, Virtual Account, QRIS, Paylater
- ✅ **Paylater** — Fitur kredit/pembiayaan yang bisa digunakan untuk pembelian kredit
- ✅ **Disbursement** — Transfer dana ke rekening bank (untuk withdraw seller)
- ✅ **Loyalty & Rewards** — Sistem poin dan reward

### 1.2 Struktur Dokumentasi API

Dokumentasi AstraPay API terbagi menjadi **8 modul utama**:

| # | Modul | Deskripsi | Relevansi untuk AutoMarket |
|---|-------|-----------|---------------------------|
| 1 | **Payment Channel** | Integrasi e-wallet sebagai metode pembayaran | ⭐⭐⭐ SANGAT RELEVAN |
| 2 | **SNAP BI V1.0** | Standar Bank Indonesia untuk direct debit | ⭐⭐⭐ SANGAT RELEVAN |
| 3 | **QRIS Dynamic** | Pembayaran via QR Code | ⭐⭐ RELEVAN |
| 4 | **Paylater** | Pembayaran kredit/pembiayaan | ⭐⭐⭐ SANGAT RELEVAN |
| 5 | **Disbursement** | Transfer dana ke rekening bank | ⭐⭐⭐ SANGAT RELEVAN |
| 6 | **Customer Top Up** | Top up saldo AstraPay | ⭐ RELEVAN |
| 7 | **Biller** | Pembayaran tagihan | ❌ Tidak relevan |
| 8 | **Loyalty** | Poin dan reward | ⭐ RELEVAN |

---

## 2. ARSITEKTUR KEAMANAN SNAP

AstraPay menggunakan **standar SNAP (Standard Nasional Open API Pembayaran)** dari Bank Indonesia.

### 2.1 Komponen Keamanan

| Komponen | Deskripsi | Disimpan Oleh |
|----------|-----------|---------------|
| **Client ID** | Identifier unik dari AstraPay | AutoMarket |
| **Client Secret** | Secret key untuk enkripsi request | AutoMarket (RAHASIA) |
| **Public Key** | RSA Public Key dari AutoMarket | Dibagikan ke AstraPay |
| **Private Key** | RSA Private Key dari AutoMarket | AutoMarket (RAHASIA) |

### 2.2 Alur Keamanan (3 Langkah)

```
Langkah 1: Generate Signature Auth
┌──────────────────────────────────────────────────┐
│ Payload: [X-CLIENT-KEY] + "|" + [X-TIMESTAMP]   │
│ Enkripsi: SHA-256 with RSA-2048 (Private Key)    │
│ Output: Base64-encoded signature                  │
└──────────────────────────────────────────────────┘

Langkah 2: API B2B Access Token Request
┌──────────────────────────────────────────────────┐
│ POST /snap-service/snap/v1.0/access-token/b2b    │
│ Headers: X-CLIENT-KEY, X-TIMESTAMP, X-SIGNATURE  │
│ Body: { "grantType": "client_credentials" }      │
│ Response: accessToken (Bearer, expires 900 detik) │
└──────────────────────────────────────────────────┘

Langkah 3: Generate Signature Service
┌──────────────────────────────────────────────────┐
│ Payload: [HTTP METHOD] + ":" +                   │
│   [RELATIVE PATH URL] + ":" +                    │
│   [B2B ACCESS TOKEN] + ":" +                     │
│   SHA-256(Minify([HTTP BODY])) + ":" +           │
│   [X-TIMESTAMP]                                  │
│ Enkripsi: HMAC_SHA512 (Client Secret)            │
│ Output: Base64-encoded signature                  │
└──────────────────────────────────────────────────┘
```

### 2.3 Generate Key Pairs

```bash
# Generate Private Key
openssl genrsa -out rsa_private_key.pem 2048

# Export Public Key
openssl rsa -in rsa_private_key.pem -out rsa_public_key.pem -pubout

# Encode to PKCS#8
openssl pkcs8 -topk8 -in rsa_private_key.pem -out pkcs8_rsa_private_key.pem -nocrypt
```

---

## 3. MODUL API YANG TERSEDIA

### 3.1 Payment Channel (Classic API)

| API | Method | Deskripsi |
|-----|--------|-----------|
| **Authorization** | POST | Login & mendapatkan access token |
| **Account Link** | POST | Hubungkan akun AstraPay dengan akun AutoMarket |
| **Account Registration** | POST | Registrasi akun AstraPay baru dari AutoMarket |
| **Payment with Linking** | POST | Pembayaran dengan akun yang sudah terhubung |
| **Push to Payment** (BETA) | POST | Push notifikasi pembayaran ke app AstraPay |
| **Profile** | GET | Info profil user AstraPay |
| **Transaction Status** | GET | Cek status transaksi |
| **Refund** (BETA) | POST | Pengembalian dana |
| **Cancel** (BETA) | POST | Batalkan transaksi |

### 3.2 SNAP BI V1.0 (Bank Indonesia Standard)

| API | Method | URL | Deskripsi |
|-----|--------|-----|-----------|
| **Access Token B2B** | POST | `/snap/v1.0/access-token/b2b` | Dapatkan token otorisasi |
| **Direct Debit Payment** | POST | `/snap/v1.0/debit/payment` | Debit langsung dari saldo |
| **Direct Debit Payment Status** | POST | `/snap/v1.0/debit/payment-status` | Cek status pembayaran |
| **Direct Debit Payment Notify** | POST | callback | Notifikasi pembayaran |
| **Direct Debit Payment Refund** | POST | `/snap/v1.0/debit/refund` | Refund pembayaran |
| **Top Up Instruction** (BETA) | POST | `/snap/v1.0/topup/instruction` | Instruksi top up |
| **Balance Inquiry** | POST | `/snap/v1.0/balance-inquiry` | Cek saldo |

### 3.3 QRIS Dynamic

| API | Method | Deskripsi |
|-----|--------|-----------|
| **Generate QR MPM** | POST | Buat QR Code pembayaran |
| **QR Payment Query** | POST | Cek status pembayaran QR |
| **Payment Notification** | POST | Callback pembayaran QR |
| **Refund QR MPM** | POST | Refund pembayaran QR |

### 3.4 Paylater

| API | Method | Deskripsi |
|-----|--------|-----------|
| **Paylater Registration** | POST | Registrasi user untuk Paylater |
| **Callback Registration** | POST | Callback setelah registrasi |
| **Share Data Customer** | POST | Bagi data customer ke AstraPay Auto-Preferred |
| **Reminder Repayment** | POST | Reminder pembayaran kredit |

### 3.5 Disbursement

| API | Method | Deskripsi |
|-----|--------|-----------|
| **Inquiry Disbursement** | POST | Cek rekening tujuan |
| **Payment Disbursement** | POST | Transfer dana |
| **Check Disbursement Status** | POST | Cek status transfer |

---

## 4. ALUR INTEGRASI UNTUK PEMBAYARAN KREDIT

### 4.1 Skenario Pembelian Kredit Token

**User Flow — "Andi beli 100 token (Rp 1.000.000)":**

```
┌─────────────────────────────────────────────────────────┐
│                    AUTO MARKET                           │
│                                                          │
│  1. Andi pilih paket "Basic 100 Token" = Rp 1.000.000  │
│  2. Klik "Beli Sekarang"                                │
│  3. Pilih metode pembayaran: "AstraPay"                 │
│                                                          │
│  ┌────────────────────────────────────────────┐          │
│  │        PAYMENT METHOD SELECTION            │          │
│  │                                            │          │
│  │  ○ AstraPay E-Wallet (Direct Debit)       │          │
│  │  ○ AstraPay Paylater (Bayar Nanti)        │          │
│  │  ○ AstraPay Virtual Account               │          │
│  │  ○ AstraPay QRIS                          │          │
│  └────────────────────────────────────────────┘          │
│                                                          │
│  4a. [E-Wallet] → Redirect ke app AstraPay → Konfirmasi │
│  4b. [Paylater] → Pilih tenor → Konfirmasi              │
│  4c. [VA] → Tampilkan nomor VA → User bayar via ATM     │
│  4d. [QRIS] → Scan QR → Bayar                          │
│                                                          │
│  5. AstraPay callback → Update status pembayaran         │
│  6. Token ditambahkan ke saldo Andi                      │
└─────────────────────────────────────────────────────────┘
```

### 4.2 Alur Teknis — SNAP Direct Debit (RECOMMENDED)

```
Step 1: Dapatkan Access Token
─────────────────────────────
AutoMarket → AstraPay: POST /snap/v1.0/access-token/b2b
  Headers: X-CLIENT-KEY, X-TIMESTAMP, X-SIGNATURE
  Body: { "grantType": "client_credentials" }
AstraPay → AutoMarket: { accessToken, tokenType: "Bearer", expiresIn: "900" }

Step 2: Buat Pembayaran (Direct Debit)
──────────────────────────────────────
AutoMarket → AstraPay: POST /snap/v1.0/debit/payment
  Headers: Authorization: Bearer {accessToken}, X-SIGNATURE, X-TIMESTAMP
  Body: {
    "partnerReferenceNo": "AM-2026-001234",
    "amount": { "value": "1000000.00", "currency": "IDR" },
    "beneficiaryAccountNo": "merchant_account",
    "additionalInfo": {
      "item": "Token Package - Basic 100",
      "tokens": 100
    }
  }
AstraPay → AutoMarket: { referenceNo, responseCode }

Step 3: User Konfirmasi di App AstraPay
────────────────────────────────────────
User membuka app AstraPay → Approve pembayaran

Step 4: Callback Notifikasi
───────────────────────────
AstraPay → AutoMarket: POST /callback/payment
  Body: {
    "referenceNo": "AP-xxx",
    "partnerReferenceNo": "AM-2026-001234",
    "amount": { "value": "1000000.00", "currency": "IDR" },
    "latestTransactionStatus": "00" // Success
  }

Step 5: Update Saldo Token
──────────────────────────
AutoMarket: Update user_credits + 100 tokens
AutoMarket: Record credit_transactions
```

### 4.3 Alur Teknis — Paylater (Untuk Pembelian Kredit)

```
Step 1: Registrasi Paylater (One-time)
───────────────────────────────────────
AutoMarket → AstraPay: POST /paylater/registration
  Body: {
    "userId": "user_id_automarket",
    "phone": "081234567890",
    "email": "andi@email.com"
  }
AstraPay → User: Verifikasi data → Approval limit kredit

Step 2: Pembayaran dengan Paylater
───────────────────────────────────
AutoMarket → AstraPay: POST /snap/v1.0/debit/payment
  additionalInfo: {
    "paymentType": "PAYLATER",
    "tenor": "3" // 3 bulan
  }

Step 3: Cicilan Bulanan
────────────────────────
AstraPay → User: Tagihan cicilan bulanan
AstraPay → AutoMarket: Settlement dana (setelah dikurangi fee)
```

### 4.4 Alur Teknis — Disbursement (Untuk Withdraw Seller)

```
Step 1: Inquiry Rekening Tujuan
───────────────────────────────
AutoMarket → AstraPay: POST /disbursement/inquiry
  Body: {
    "beneficiaryAccountNo": "1234567890",
    "beneficiaryBankCode": "BNI"
  }
AstraPay → AutoMarket: { accountName: "ANDI WIJAYA", status: "VALID" }

Step 2: Transfer Dana
─────────────────────
AutoMarket → AstraPay: POST /disbursement/payment
  Body: {
    "partnerReferenceNo": "WD-2026-001",
    "amount": { "value": "5000000.00", "currency": "IDR" },
    "beneficiaryAccountNo": "1234567890",
    "beneficiaryBankCode": "BNI",
    "beneficiaryAccountName": "ANDI WIJAYA"
  }

Step 3: Cek Status
──────────────────
AutoMarket → AstraPay: POST /disbursement/status
  Response: { status: "COMPLETED" }
```

---

## 5. API YANG DIREKOMENDASIKAN

### 5.1 Prioritas Integrasi

| Prioritas | API | Use Case AutoMarket | Metode |
|-----------|-----|---------------------|--------|
| **P0** | SNAP Direct Debit Payment | Pembelian token/kredit | SNAP BI |
| **P0** | SNAP Access Token B2B | Auth untuk semua API | SNAP BI |
| **P0** | Payment Notification (Callback) | Konfirmasi pembayaran otomatis | Callback |
| **P1** | Paylater Registration | Pembelian kredit/token secara cicilan | Paylater |
| **P1** | Disbursement Payment | Withdraw dana seller ke rekening bank | Disbursement |
| **P1** | Disbursement Inquiry | Validasi rekening bank sebelum withdraw | Disbursement |
| **P2** | QRIS Generate QR MPM | Pembayaran via QR Code (alternatif) | QRIS |
| **P2** | SNAP Payment Status | Cek status pembayaran | SNAP BI |
| **P2** | SNAP Refund | Refund pembayaran | SNAP BI |
| **P3** | Account Link | Hubungkan akun AstraPay ↔ AutoMarket | Classic |
| **P3** | Balance Inquiry | Cek saldo AstraPay user | SNAP BI |
| **P3** | Loyalty / Earn Point | Poin untuk pembelian token | Loyalty |

### 5.2 Mapping ke Fitur AutoMarket

| Fitur AutoMarket | API AstraPay | Alur |
|------------------|-------------|------|
| **Beli Token/Kredit** | Direct Debit Payment | User bayar → Token masuk saldo |
| **Beli Kredit (Cicilan)** | Paylater + Direct Debit | User pilih tenor → Cicilan bulanan |
| **Withdraw Seller** | Disbursement Payment | Seller tarik dana → Transfer ke rekening |
| **Boost Listing** | Direct Debit Payment | User bayar boost → Listing di-boost |
| **Inspeksi Profesional** | Direct Debit Payment | User bayar inspeksi → Booking confirmed |
| **Sertifikat Inspeksi** | Direct Debit Payment | User bayar sertifikat → Sertifikat terbit |
| **AI Prediction** | Direct Debit Payment | User bayar prediksi → Hasil AI ditampilkan |
| **Refund** | SNAP Refund | Pembatalan → Dana dikembalikan |

---

## 6. PERBANDINGAN METODE PEMBAYARAN

| Metode | Min Transaksi | Max Transaksi | Settlement | User Experience | Fee Estimasi |
|--------|--------------|---------------|------------|-----------------|-------------|
| **E-Wallet (Direct Debit)** | Rp 1.000 | Rp 10.000.000 | Real-time | ⭐⭐⭐⭐⭐ Terbaik | 1.5-2% |
| **Paylater** | Rp 100.000 | Rp 10.000.000 | T+1 | ⭐⭐⭐⭐ Baik | 2-4% |
| **Virtual Account** | Rp 10.000 | Rp 50.000.000 | T+1 | ⭐⭐⭐ Cukup | Rp 4.000/txn |
| **QRIS** | Rp 1.000 | Rp 10.000.000 | T+1 | ⭐⭐⭐⭐ Baik | 0.7% |
| **Disbursement** | Rp 10.000 | Rp 50.000.000 | Real-time | N/A (backend) | Rp 5.000/txn |

### Rekomendasi Metode per Use Case

| Use Case | Metode Rekomendasi | Alasan |
|----------|--------------------|--------|
| Beli Token (Rp 30K-10Jt) | **E-Wallet Direct Debit** | Real-time, UX terbaik |
| Beli Kredit Cicilan | **Paylater** | Bisa bayar nanti/cicil |
| Withdraw (Rp 50K+) | **Disbursement** | Transfer langsung ke rekening |
| Pembayaran Alternatif | **QRIS** | Untuk user tanpa akun AstraPay |
| Pembayaran Besar (>10Jt) | **Virtual Account** | Limit tinggi |

---

## 7. IMPLEMENTASI TEKNIS

### 7.1 Arsitektur Integrasi

```
┌────────────────────────────────────────────────────────────┐
│                    AUTO MARKET                              │
│                                                             │
│  ┌─────────────┐   ┌──────────────┐   ┌────────────────┐  │
│  │  Frontend    │   │  API Routes  │   │  AstraPay      │  │
│  │  (Next.js)   │──▶│  /api/pay/   │──▶│  Service       │  │
│  │              │   │              │   │  (lib/astrapay) │  │
│  └─────────────┘   └──────┬───────┘   └───────┬────────┘  │
│                           │                    │            │
│                    ┌──────▼───────┐    ┌──────▼────────┐   │
│                    │  Database    │    │  AstraPay API  │   │
│                    │  (Supabase)  │    │  (SNAP BI)     │   │
│                    └──────────────┘    └────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Callback Endpoint                        │   │
│  │  /api/payment/callback/astrapay                       │   │
│  │  → Verifikasi signature                              │   │
│  │  → Update status pembayaran                          │   │
│  │  → Tambah token/saldo                                │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### 7.2 File yang Perlu Dibuat

| File | Deskripsi |
|------|-----------|
| `src/lib/astrapay/client.ts` | AstraPay API client (signature, auth, request) |
| `src/lib/astrapay/config.ts` | Konfigurasi (Client ID, Secret, URLs) |
| `src/lib/astrapay/types.ts` | TypeScript types untuk request/response |
| `src/lib/astrapay/snap.ts` | SNAP BI API wrapper |
| `src/lib/astrapay/disbursement.ts` | Disbursement API wrapper |
| `src/lib/astrapay/paylater.ts` | Paylater API wrapper |
| `src/lib/astrapay/signature.ts` | Signature generation (RSA + HMAC) |
| `src/app/api/payment/astrapay/create/route.ts` | Buat pembayaran |
| `src/app/api/payment/astrapay/status/route.ts` | Cek status |
| `src/app/api/payment/astrapay/callback/route.ts` | Terima callback |
| `src/app/api/payment/astrapay/refund/route.ts` | Refund |
| `src/app/api/payment/astrapay/disburse/route.ts` | Disbursement |
| `src/app/api/withdraw/process/route.ts` | Proses withdraw via disbursement |

### 7.3 Environment Variables yang Dibutuhkan

```env
# AstraPay Configuration
ASTRAPAY_CLIENT_ID=your_client_id
ASTRAPAY_CLIENT_SECRET=your_client_secret
ASTRAPAY_PRIVATE_KEY=path_to_pkcs8_private_key.pem
ASTRAPAY_PUBLIC_KEY=path_to_public_key.pem
ASTRAPAY_BASE_URL=https://sandbox-api.astrapay.com  # Sandbox
ASTRAPAY_BASE_URL=https://api.astrapay.com           # Production
ASTRAPAY_MERCHANT_ID=your_merchant_id
ASTRAPAY_CALLBACK_URL=https://automarket.co.id/api/payment/callback/astrapay
```

### 7.4 Contoh Kode — AstraPay Client

```typescript
// src/lib/astrapay/client.ts
import crypto from 'crypto'

const ASTRAPAY_BASE_URL = process.env.ASTRAPAY_BASE_URL!
const CLIENT_ID = process.env.ASTRAPAY_CLIENT_ID!
const CLIENT_SECRET = process.env.ASTRAPAY_CLIENT_SECRET!
const PRIVATE_KEY = process.env.ASTRAPAY_PRIVATE_KEY!

// Step 1: Generate Signature Auth (SHA-256 with RSA-2048)
function generateSignatureAuth(timestamp: string): string {
  const payload = `${CLIENT_ID}|${timestamp}`
  const sign = crypto.createSign('SHA256')
  sign.update(payload)
  sign.end()
  return sign.sign(PRIVATE_KEY, 'base64')
}

// Step 2: Get Access Token
async function getAccessToken(): Promise<string> {
  const timestamp = new Date().toISOString()
  const signature = generateSignatureAuth(timestamp)

  const response = await fetch(
    `${ASTRAPAY_BASE_URL}/snap-service/snap/v1.0/access-token/b2b`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CLIENT-KEY': CLIENT_ID,
        'X-TIMESTAMP': timestamp,
        'X-SIGNATURE': signature,
      },
      body: JSON.stringify({ grantType: 'client_credentials' }),
    }
  )

  const data = await response.json()
  return data.accessToken
}

// Step 3: Generate Service Signature (HMAC_SHA512)
function generateServiceSignature(
  method: string,
  path: string,
  accessToken: string,
  body: string,
  timestamp: string
): string {
  const bodyHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(JSON.parse(body)))
    .digest('hex')
    .toLowerCase()

  const payload = `${method}:${path}:${accessToken}:${bodyHash}:${timestamp}`
  return crypto
    .createHmac('sha512', CLIENT_SECRET)
    .update(payload)
    .digest('base64')
}

// Step 4: Create Payment (Direct Debit)
export async function createPayment(params: {
  partnerReferenceNo: string
  amount: number
  description: string
}) {
  const accessToken = await getAccessToken()
  const timestamp = new Date().toISOString()
  const path = '/snap/v1.0/debit/payment'
  const body = JSON.stringify({
    partnerReferenceNo: params.partnerReferenceNo,
    amount: {
      value: params.amount.toFixed(2),
      currency: 'IDR',
    },
    additionalInfo: {
      item: params.description,
    },
  })

  const signature = generateServiceSignature(
    'POST', path, accessToken, body, timestamp
  )

  const response = await fetch(
    `${ASTRAPAY_BASE_URL}/snap-service${path}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'X-CLIENT-KEY': CLIENT_ID,
        'X-TIMESTAMP': timestamp,
        'X-SIGNATURE': signature,
      },
      body,
    }
  )

  return response.json()
}
```

### 7.5 Database Schema Updates

Perlu menambahkan tabel berikut ke Prisma schema:

```prisma
model AstraPayTransactions {
  id                  String   @id @default(cuid())
  user_id             String
  user                User     @relation(fields: [user_id], references: [id])
  
  // AstraPay Reference
  partner_reference_no String  @unique  // AM-2026-001234
  astrapay_reference_no String?          // AP-xxx (dari AstraPay)
  
  // Payment Details
  amount              Float              // Jumlah dalam IDR
  tokens_awarded      Int                // Jumlah token yang diberikan
  payment_method      String             // ewallet, paylater, va, qris
  payment_status      String   @default("pending")  // pending, success, failed, refunded
  
  // Paylater
  tenor               Int?               // Tenor cicilan (bulan)
  installment_amount  Float?             // Cicilan per bulan
  
  // Timestamps
  created_at          DateTime @default(now())
  paid_at             DateTime?
  settled_at          DateTime?
  expired_at          DateTime?
  
  // Metadata
  astrapay_response   String?            // JSON response dari AstraPay
  callback_data       String?            // JSON callback data
}

model AstraPayDisbursements {
  id                  String   @id @default(cuid())
  user_id             String
  withdrawal_id       String?            // Link ke withdrawals table
  
  // Disbursement Details
  partner_reference_no String  @unique
  amount              Float
  beneficiary_account_no String
  beneficiary_bank_code  String
  beneficiary_account_name String?
  
  // Status
  status              String   @default("pending")  // pending, processing, completed, failed
  
  // Timestamps
  created_at          DateTime @default(now())
  completed_at        DateTime?
  
  // Metadata
  astrapay_response   String?
}
```

---

## 8. ESTIMASI BIAYA & TIMELINE

### 8.1 Biaya Integrasi AstraPay

| Item | Biaya |
|------|-------|
| Pendaftaran Merchant | **Gratis** (hubungi payment.channel@astrapay.com) |
| Development Fee | Tidak ada (self-integration) |
| MDR (Merchant Discount Rate) - E-Wallet | ~1.5-2% per transaksi |
| MDR - QRIS | ~0.7% per transaksi |
| MDR - Paylater | ~2-4% per transaksi |
| Disbursement Fee | ~Rp 5.000 per transfer |
| Virtual Account Fee | ~Rp 4.000 per transaksi |
| Settlement | T+1 (hari kerja berikutnya) |

### 8.2 Timeline Implementasi

| Fase | Durasi | Deliverables |
|------|--------|-------------|
| **Phase 1: Setup** | 1-2 minggu | Pendaftaran merchant, dapatkan credentials, setup sandbox |
| **Phase 2: Core Payment** | 2-3 minggu | Implementasi SNAP Direct Debit + Callback |
| **Phase 3: Paylater** | 2 minggu | Integrasi Paylater untuk pembelian kredit |
| **Phase 4: Disbursement** | 1-2 minggu | Integrasi Disbursement untuk withdraw |
| **Phase 5: QRIS + VA** | 1 minggu | Integrasi QRIS dan Virtual Account |
| **Phase 6: Testing & Go-Live** | 2 minggu | UAT di sandbox, fix bugs, go-live |
| **Total** | **9-12 minggu** | Full integrasi AstraPay |

---

## 9. RISIKO & MITIGASI

| Risiko | Probabilitas | Impact | Mitigasi |
|--------|-------------|--------|----------|
| Proses pendaftaran merchant lama | Medium | High | Mulai proses sekarang, siapkan dokumen |
| Sandbox tidak stabil | Low | Medium | Gunakan mock service sebagai fallback |
| Fee MDR terlalu tinggi | Medium | Medium | Bandingkan dengan Midtrans/Xendit |
| Paylater approval rate rendah | Medium | High | Tetap sediakan metode pembayaran lain |
| Callback terlambat/tidak sampai | Low | High | Implementasi polling status sebagai backup |
| Token kadaluarsa (900 detik) | Low | Low | Cache token, refresh sebelum expired |
| Perubahan API breaking | Low | High | Monitor changelog, versioning API client |

---

## 10. KESIMPULAN & REKOMENDASI

### 10.1 Rekomendasi Utama

| # | Rekomendasi | Prioritas |
|---|-------------|-----------|
| 1 | **Gunakan SNAP BI Direct Debit** sebagai metode utama pembayaran token/kredit | ⭐ P0 |
| 2 | **Integrasikan Paylater** untuk pembelian kredit secara cicilan | ⭐ P1 |
| 3 | **Gunakan Disbursement** untuk withdraw dana seller ke rekening bank | ⭐ P1 |
| 4 | **Tambahkan QRIS** sebagai metode pembayaran alternatif | ⭐ P2 |
| 5 | **Lakukan pendaftaran merchant segera** ke payment.channel@astrapay.com | ⭐ P0 |

### 10.2 Keunggulan AstraPay untuk AutoMarket

1. 🏎️ **Ekosistem Astra (Otomotif)** — User base yang sudah terbiasa dengan transaksi otomotif
2. 💳 **Paylater** — Memungkinkan pembelian kredit tanpa kartu kredit
3. 🏦 **SNAP BI Certified** — Standar resmi Bank Indonesia
4. 🔄 **Disbursement** — Memecahkan masalah withdraw yang belum terintegrasi
5. 📱 **Deep Linking** — UX seamless dari AutoMarket ke app AstraPay
6. 🎁 **Loyalty Points** — Bisa memberikan reward untuk pembelian token

### 10.3 Next Steps

1. **Minggu ini:** Kirim email ke payment.channel@astrapay.com dengan formulir pendaftaran
2. **Minggu depan:** Dapatkan credentials (Client ID, Secret, sandbox access)
3. **2 minggu depan:** Mulai implementasi AstraPay client library
4. **4 minggu depan:** Integrasi Direct Debit Payment ke halaman pembelian token
5. **6 minggu depan:** Integrasi Paylater + Disbursement
6. **8 minggu depan:** UAT + Go-live

---

*Dokumen ini dihasilkan dari analisis lengkap dokumentasi AstraPay API Merchant di https://www.astrapay.com/docs/api/ — mencakup 8 modul API, arsitektur keamanan SNAP, dan rekomendasi implementasi untuk integrasi pembayaran kredit di AutoMarket.*
