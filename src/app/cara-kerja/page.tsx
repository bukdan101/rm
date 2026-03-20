'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  User,
  Store,
  Car,
  Shield,
  CreditCard,
  MessageSquare,
  FileCheck,
  Search,
  PlusCircle,
  Clock,
  CheckCircle,
  ArrowDown,
  Zap,
  Eye,
  Handshake,
  Banknote,
  ClipboardCheck,
  Award,
  Users,
  Building2,
  Globe,
  MapPin,
  Camera,
  FileText,
  Settings,
  ChevronRight,
  AlertCircle,
  Info,
  DollarSign,
  PiggyBank,
  IdCard,
  BadgeCheck,
  Wallet,
  Gavel,
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ==============================
// DATA CONSTANTS FROM DATABASE
// ==============================

const KREDIT_SETTINGS = {
  marketplace_umum: { kredits: 3, duration: '30 hari', name: 'Marketplace Umum (WhatsApp)' },
  dealer_marketplace: { kredits: 5, duration: '7 hari', name: 'Dealer Marketplace (Bidding)' },
  chat_platform: { kredits: 4, duration: '30 hari', name: 'Chat Platform' },
  inspection_160: { kredits: 10, duration: 'Sekali', name: 'Inspeksi 160 Titik' },
  featured_7days: { kredits: 5, duration: '7 hari', name: 'Featured/Promoted' },
  extend_listing: { kredits: 2, duration: '30 hari', name: 'Perpanjangan Listing' },
  extend_dealer: { kredits: 2, duration: '7 hari', name: 'Perpanjangan Dealer' },
  kredit_value: 10000, // 1 Kredit = Rp 10.000
}

const USER_ROLES = [
  { role: 'user', label: 'Pembeli', icon: User, color: 'text-blue-500', desc: 'Mencari dan membeli mobil' },
  { role: 'seller', label: 'Penjual', icon: Car, color: 'text-green-500', desc: 'Menjual mobil pribadi' },
  { role: 'dealer', label: 'Dealer', icon: Building2, color: 'text-purple-500', desc: 'Showroom mobil terverifikasi' },
  { role: 'inspector', label: 'Inspektor', icon: ClipboardCheck, color: 'text-amber-500', desc: 'Melakukan inspeksi kendaraan' },
  { role: 'admin', label: 'Admin', icon: Shield, color: 'text-red-500', desc: 'Mengelola platform' },
]

const LISTING_STATUSES = [
  { status: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-700', desc: 'Belum dipublish' },
  { status: 'pending', label: 'Pending', color: 'bg-amber-100 text-amber-700', desc: 'Menunggu review' },
  { status: 'active', label: 'Aktif', color: 'bg-green-100 text-green-700', desc: 'Tampil di marketplace' },
  { status: 'sold', label: 'Terjual', color: 'bg-blue-100 text-blue-700', desc: 'Sudah terjual' },
  { status: 'expired', label: 'Expired', color: 'bg-red-100 text-red-700', desc: 'Masa aktif habis' },
  { status: 'suspended', label: 'Suspended', color: 'bg-red-100 text-red-700', desc: 'Dinonaktifkan' },
]

const INSPECTION_GRADES = [
  { grade: 'A+', label: 'Istimewa', color: 'bg-emerald-500', score: '95-100', desc: 'Kondisi sangat prima' },
  { grade: 'A', label: 'Sangat Baik', color: 'bg-green-500', score: '85-94', desc: 'Kondisi sangat baik' },
  { grade: 'B+', label: 'Baik Plus', color: 'bg-lime-500', score: '75-84', desc: 'Kondisi baik' },
  { grade: 'B', label: 'Baik', color: 'bg-yellow-500', score: '65-74', desc: 'Kondisi layak pakai' },
  { grade: 'C', label: 'Cukup', color: 'bg-orange-500', score: '50-64', desc: 'Perlu perhatian' },
  { grade: 'D', label: 'Kurang', color: 'bg-red-400', score: '35-49', desc: 'Perlu perbaikan' },
  { grade: 'E', label: 'Buruk', color: 'bg-red-600', score: '0-34', desc: 'Tidak layak' },
]

const INSPECTION_CATEGORIES = [
  { name: 'Eksterior', items: 45, icon: Car, desc: 'Body, cat, kaca, lampu, dll' },
  { name: 'Interior', items: 30, icon: Users, desc: 'Jok, dashboard, AC, audio, dll' },
  { name: 'Mesin', items: 35, icon: Settings, desc: 'Engine, transmisi, cooling, dll' },
  { name: 'Undercarriage', items: 25, icon: Zap, desc: 'Suspensi, knalpot, rangka' },
  { name: 'Elektrikal', items: 15, icon: Zap, desc: 'Kelistrikan, sensor, ECU' },
  { name: 'Dokumen', items: 10, icon: FileText, desc: 'STNK, BPKB, Service Book' },
]

// ==============================
// WORKFLOW DIAGRAM COMPONENT
// ==============================

interface WorkflowStep {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  details?: string[]
}

function WorkflowDiagram({ steps, title, description }: { steps: WorkflowStep[]; title: string; description?: string }) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-green-500 hidden md:block" />
        
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={step.id} className="flex items-start gap-4 relative">
                {/* Step Number */}
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10",
                  step.color
                )}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                
                {/* Content */}
                <Card className="flex-1 border-0 shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">Step {index + 1}</Badge>
                      <h4 className="font-semibold">{step.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{step.description}</p>
                    {step.details && (
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
                
                {/* Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute left-[22px] -bottom-4 z-0">
                    <ArrowDown className="w-3 h-3 text-gray-400" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}



// ==============================
// KREDIT CALCULATOR
// ==============================

function KreditCalculator() {
  const [selectedServices, setSelectedServices] = useState<string[]>(['marketplace_umum'])
  
  const totalKredit = selectedServices.reduce((sum, key) => {
    const setting = KREDIT_SETTINGS[key as keyof typeof KREDIT_SETTINGS]
    return sum + (typeof setting === 'object' ? setting.kredits : 0)
  }, 0)
  
  const totalRupiah = totalKredit * KREDIT_SETTINGS.kredit_value
  
  const toggleService = (key: string) => {
    setSelectedServices(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    )
  }

  return (
    <Card className="border-0 shadow-lg overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="w-5 h-5" />
          Kalkulator Kredit
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Services */}
        <div className="grid gap-2">
          {Object.entries(KREDIT_SETTINGS).filter(([key]) => key !== 'kredit_value').map(([key, value]) => {
            const setting = value as { kredits: number; duration: string; name: string }
            const isSelected = selectedServices.includes(key)
            return (
              <button
                key={key}
                onClick={() => toggleService(key)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border-2 transition-all text-left",
                  isSelected 
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20" 
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <div>
                  <p className="font-medium text-sm">{setting.name}</p>
                  <p className="text-xs text-muted-foreground">{setting.duration}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-amber-600">{setting.kredits} Kredit</p>
                  <p className="text-xs text-muted-foreground">
                    Rp {(setting.kredits * KREDIT_SETTINGS.kredit_value).toLocaleString('id-ID')}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
        
        {/* Total */}
        <div className="p-4 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Total Biaya</p>
              <p className="text-2xl font-bold text-amber-600">{totalKredit} Kredit</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Setara</p>
              <p className="text-xl font-bold">Rp {totalRupiah.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="w-4 h-4" />
          <span>1 Kredit = Rp {KREDIT_SETTINGS.kredit_value.toLocaleString('id-ID')}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// ==============================
// VISIBILITY DIAGRAM
// ==============================

function VisibilityDiagram() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {/* Public */}
      <Card className="border-2 border-blue-200 dark:border-blue-800 overflow-hidden">
        <CardHeader className="bg-blue-50 dark:bg-blue-950/30 py-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-base">Marketplace Umum</CardTitle>
          </div>
          <Badge className="bg-blue-500 w-fit">PUBLIC</Badge>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Biaya</span>
            <span className="font-bold">3 Kredit</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Durasi</span>
            <span className="font-bold">30 Hari</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Visibilitas</span>
            <span className="font-bold text-blue-500">Semua User</span>
          </div>
          <div className="pt-2 border-t text-xs text-muted-foreground">
            <p>✓ Tampil di halaman utama</p>
            <p>✓ Chat via WhatsApp</p>
            <p>✓ Tanpa KYC</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Dealer Marketplace */}
      <Card className="border-2 border-purple-200 dark:border-purple-800 overflow-hidden relative">
        <div className="absolute top-2 right-2">
          <Badge className="bg-purple-500">PREMIUM</Badge>
        </div>
        <CardHeader className="bg-purple-50 dark:bg-purple-950/30 py-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-purple-500" />
            <CardTitle className="text-base">Dealer Marketplace</CardTitle>
          </div>
          <Badge className="bg-purple-500 w-fit">DEALER ONLY</Badge>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Biaya</span>
            <span className="font-bold">5 Kredit</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Durasi</span>
            <span className="font-bold">7 Hari</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Visibilitas</span>
            <span className="font-bold text-purple-500">Dealer Terverifikasi</span>
          </div>
          <div className="pt-2 border-t text-xs text-muted-foreground">
            <p>✓ Bidding System</p>
            <p>✓ Penawaran dari Dealer</p>
            <p>✓ Wajib KYC Approved</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Both */}
      <Card className="border-2 border-green-200 dark:border-green-800 overflow-hidden relative">
        <div className="absolute top-2 right-2">
          <Badge className="bg-green-500">BEST VALUE</Badge>
        </div>
        <CardHeader className="bg-green-50 dark:bg-green-950/30 py-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-500" />
            <CardTitle className="text-base">Keduanya</CardTitle>
          </div>
          <Badge className="bg-green-500 w-fit">BOTH</Badge>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Biaya</span>
            <span className="font-bold">8 Kredit (3+5)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Durasi</span>
            <span className="font-bold">30 Hari</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Visibilitas</span>
            <span className="font-bold text-green-500">Semua + Dealer</span>
          </div>
          <div className="pt-2 border-t text-xs text-muted-foreground">
            <p>✓ Semua keuntungan Public</p>
            <p>✓ Semua keuntungan Dealer</p>
            <p>✓ Maksimal eksposur</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ==============================
// INSPECTION VISUALIZATION
// ==============================

function InspectionVisualization() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-green-500">160</p>
            <p className="text-xs text-muted-foreground">Titik Inspeksi</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-blue-500">6</p>
            <p className="text-xs text-muted-foreground">Kategori</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-purple-500">7</p>
            <p className="text-xs text-muted-foreground">Grade Level</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4 text-center">
            <p className="text-3xl font-bold text-amber-500">10</p>
            <p className="text-xs text-muted-foreground">Kredit / Inspeksi</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Categories */}
      <div className="grid md:grid-cols-3 gap-3">
        {INSPECTION_CATEGORIES.map((cat, i) => {
          const Icon = cat.icon
          return (
            <Card key={i} className="border-0 shadow-md">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">{cat.items} titik • {cat.desc}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      
      {/* Grades */}
      <Card className="border-0 shadow-md">
        <CardHeader className="py-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            Grade Inspeksi
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {INSPECTION_GRADES.map((grade) => (
              <div key={grade.grade} className="text-center">
                <div className={cn(
                  "w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold",
                  grade.color
                )}>
                  {grade.grade}
                </div>
                <p className="text-xs font-medium">{grade.label}</p>
                <p className="text-[10px] text-muted-foreground">{grade.score}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ==============================
// TRANSACTION FLOW
// ==============================

function TransactionFlow() {
  const steps = [
    { id: '1', title: 'Pembeli Menemukan Mobil', description: 'Pembeli menelusuri listing dan menemukan mobil yang diinginkan', icon: Search, color: 'bg-blue-500', details: ['Filter berdasarkan preferensi', 'Lihat detail & foto', 'Cek inspeksi (jika ada)'] },
    { id: '2', title: 'Hubungi Penjual', description: 'Pembeli menghubungi penjual via WhatsApp atau Chat Platform', icon: MessageSquare, color: 'bg-green-500', details: ['Tanya detail kendaraan', 'Negosiasi harga', 'Jadwalkan test drive'] },
    { id: '3', title: 'Deal & Transaksi', description: 'Kesepakatan harga dan metode pembayaran', icon: Handshake, color: 'bg-amber-500', details: ['Setujui harga final', 'Pilih metode bayar', 'Opsional: Gunakan escrow'] },
    { id: '4', title: 'Pembayaran', description: 'Pembeli melakukan pembayaran', icon: Banknote, color: 'bg-purple-500', details: ['Transfer ke rekening', 'Konfirmasi pembayaran', 'Tanda terima digital'] },
    { id: '5', title: 'Serah Terima', description: 'Proses serah terima kendaraan dan dokumen', icon: Car, color: 'bg-pink-500', details: ['Balik nama STNK', 'Serah BPKP & kunci', 'Update status listing'] },
    { id: '6', title: 'Selesai', description: 'Transaksi selesai dan review', icon: CheckCircle, color: 'bg-emerald-500', details: ['Listing ditandai TERJUAL', 'Review penjual', 'Review pembeli'] },
  ]
  
  return <WorkflowDiagram steps={steps} title="Alur Transaksi Pembelian" description="Dari pencarian hingga serah terima kendaraan" />
}

// ==============================
// DEALER MARKETPLACE FLOW
// ==============================

function DealerMarketplaceFlow() {
  const steps = [
    { id: '1', title: 'User Pasang Iklan ke Dealer Marketplace', description: 'User memilih visibility "Dealer Marketplace" atau "Both"', icon: PlusCircle, color: 'bg-purple-500', details: ['Biaya 5 Kredit (7 hari)', 'Wajib KYC Approved', 'Status: pending_inspection'] },
    { id: '2', title: 'Listing Tersedia untuk Dealer', description: 'Listing muncul di dashboard dealer terverifikasi', icon: Eye, color: 'bg-blue-500', details: ['Dealer dapat melihat detail', 'Dealer dapat bid', 'Sistem bidding aktif'] },
    { id: '3', title: 'Dealer Ajukan Penawaran', description: 'Dealer mengajukan penawaran harga', icon: Gavel, color: 'bg-amber-500', details: ['Harga penawaran', 'Pesan untuk seller', 'Financing/pickup options'] },
    { id: '4', title: 'Seller Review Penawaran', description: 'Seller menerima, tolak, atau negosiasi', icon: FileCheck, color: 'bg-green-500', details: ['Lihat profil dealer', 'Compare penawaran', 'Counter offer'] },
    { id: '5', title: 'Deal & Transaksi', description: 'Proses jual beli dengan dealer', icon: Handshake, color: 'bg-pink-500', details: ['Inspeksi oleh dealer', 'Pembayaran', 'Serah terima'] },
    { id: '6', title: 'Mobil Masuk Inventori Dealer', description: 'Dealer memasukkan ke inventori untuk dijual kembali', icon: Store, color: 'bg-emerald-500', details: ['Listing dari dealer', 'Harga baru', 'Siap dijual kembali'] },
  ]
  
  return <WorkflowDiagram steps={steps} title="Dealer Marketplace Workflow" description="Sistem bidding untuk dealer terverifikasi" />
}

// ==============================
// USER REGISTRATION FLOW
// ==============================

function UserRegistrationFlow() {
  const steps = [
    { id: '1', title: 'Daftar Akun', description: 'Buat akun dengan email atau nomor HP', icon: User, color: 'bg-blue-500', details: ['Email/HP valid', 'Password aman', 'Verifikasi email/HP'] },
    { id: '2', title: 'Lengkapi Profil', description: 'Isi informasi profil dasar', icon: IdCard, color: 'bg-green-500', details: ['Nama lengkap', 'Foto profil', 'Nomor telepon'] },
    { id: '3', title: 'Verifikasi KYC (Opsional)', description: 'Untuk fitur dealer marketplace', icon: Shield, color: 'bg-amber-500', details: ['Upload KTP', 'Foto selfie', 'Verifikasi 1-2 hari'] },
    { id: '4', title: 'Beli Kredit', description: 'Isi saldo kredit untuk transaksi', icon: Wallet, color: 'bg-purple-500', details: ['Pilih paket kredit', 'Pembayaran aman', 'Kredit langsung masuk'] },
    { id: '5', title: 'Mulai Transaksi', description: 'Jual atau beli mobil di AutoMarket', icon: Car, color: 'bg-pink-500', details: ['Pasang iklan', 'Cari mobil', 'Dealer marketplace'] },
  ]
  
  return <WorkflowDiagram steps={steps} title="Alur Pendaftaran User" description="Dari registrasi hingga siap bertransaksi" />
}

// ==============================
// LISTING CREATION FLOW
// ==============================

function ListingCreationFlow() {
  const steps = [
    { id: '1', title: 'Kendaraan', description: 'Pilih brand, model, tahun, dan spesifikasi', icon: Car, color: 'bg-blue-500', details: ['Merek & Model', 'Tahun produksi', 'Transmisi & BBM', 'Kilometer'] },
    { id: '2', title: 'Detail', description: 'Lengkapi detail kondisi dan deskripsi', icon: FileText, color: 'bg-green-500', details: ['Kondisi: Baru/Bekas', 'Warna eksterior/interior', 'Judul iklan', 'Deskripsi lengkap'] },
    { id: '3', title: 'Lokasi', description: 'Tentukan lokasi kendaraan', icon: MapPin, color: 'bg-amber-500', details: ['Provinsi', 'Kota/Kabupaten', 'Alamat detail'] },
    { id: '4', title: 'Harga', description: 'Tentukan harga jual', icon: DollarSign, color: 'bg-emerald-500', details: ['Harga tunai', 'Harga kredit (opsional)', 'Status nego'] },
    { id: '5', title: 'Foto', description: 'Upload foto kendaraan', icon: Camera, color: 'bg-pink-500', details: ['Min 1 foto', 'Max 10 foto', 'Foto utama', 'Multiple angles'] },
    { id: '6', title: 'Inspeksi', description: 'Pilih apakah ingin inspeksi', icon: ClipboardCheck, color: 'bg-purple-500', details: ['Opsional', '160 titik inspeksi', 'Sertifikat resmi'] },
    { id: '7', title: 'Review & Publish', description: 'Review dan publikasikan iklan', icon: CheckCircle, color: 'bg-teal-500', details: ['Cek semua data', 'Pilih visibility', 'Potong kredit', 'Listing aktif!'] },
  ]
  
  return <WorkflowDiagram steps={steps} title="Alur Pembuatan Iklan (7 Langkah)" description="Dari informasi kendaraan hingga publikasi" />
}

// ==============================
// MAIN PAGE COMPONENT
// ==============================

export default function CaraKerjaPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 mb-4">USER GUIDE</Badge>
          <h1 className="text-3xl font-bold mb-2">Cara Kerja AutoMarket</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Panduan lengkap menggunakan platform AutoMarket untuk jual beli mobil dengan aman dan mudah
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2 border-b">
            <TabsList className="grid grid-cols-3 md:grid-cols-5 gap-1 h-auto">
              <TabsTrigger value="overview" className="text-xs md:text-sm py-2">
                <Globe className="w-4 h-4 mr-1 hidden md:inline" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="user" className="text-xs md:text-sm py-2">
                <User className="w-4 h-4 mr-1 hidden md:inline" />
                User
              </TabsTrigger>
              <TabsTrigger value="listing" className="text-xs md:text-sm py-2">
                <Car className="w-4 h-4 mr-1 hidden md:inline" />
                Listing
              </TabsTrigger>
              <TabsTrigger value="dealer" className="text-xs md:text-sm py-2">
                <Building2 className="w-4 h-4 mr-1 hidden md:inline" />
                Dealer
              </TabsTrigger>
              <TabsTrigger value="inspection" className="text-xs md:text-sm py-2">
                <ClipboardCheck className="w-4 h-4 mr-1 hidden md:inline" />
                Inspeksi
              </TabsTrigger>
            </TabsList>
          </div>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {/* Platform Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-4 text-center">
                  <Car className="w-8 h-8 mx-auto mb-2 opacity-80" />
                  <p className="text-2xl font-bold">10,000+</p>
                  <p className="text-sm text-white/80">Mobil Tersedia</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-4 text-center">
                  <Shield className="w-8 h-8 mx-auto mb-2 opacity-80" />
                  <p className="text-2xl font-bold">8,500+</p>
                  <p className="text-sm text-white/80">Inspeksi Selesai</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4 text-center">
                  <Handshake className="w-8 h-8 mx-auto mb-2 opacity-80" />
                  <p className="text-2xl font-bold">6,200+</p>
                  <p className="text-sm text-white/80">Transaksi Sukses</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                <CardContent className="p-4 text-center">
                  <Building2 className="w-8 h-8 mx-auto mb-2 opacity-80" />
                  <p className="text-2xl font-bold">500+</p>
                  <p className="text-sm text-white/80">Dealer Aktif</p>
                </CardContent>
              </Card>
            </div>

            {/* User Roles */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  Tipe Pengguna
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid md:grid-cols-5 gap-3">
                  {USER_ROLES.map((role) => {
                    const Icon = role.icon
                    return (
                      <div key={role.role} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 text-center">
                        <Icon className={cn("w-8 h-8 mx-auto mb-2", role.color)} />
                        <p className="font-semibold">{role.label}</p>
                        <p className="text-xs text-muted-foreground">{role.desc}</p>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveTab('listing')}>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center">
                    <PlusCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Pasang Iklan</h3>
                    <p className="text-sm text-muted-foreground">7 langkah mudah memasang iklan mobil</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={() => setActiveTab('dealer')}>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Dealer Marketplace</h3>
                    <p className="text-sm text-muted-foreground">Sistem bidding untuk dealer terverifikasi</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </div>

            {/* Transaction Flow Preview */}
            <TransactionFlow />
          </TabsContent>

          {/* USER TAB */}
          <TabsContent value="user" className="space-y-6">
            {/* Registration Flow */}
            <UserRegistrationFlow />

            {/* KYC Requirements */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-500" />
                  Persyaratan KYC
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Dokumen Wajib</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                        <IdCard className="w-5 h-5 text-red-500" />
                        <div>
                          <p className="font-medium text-sm">KTP (Kartu Tanda Penduduk)</p>
                          <p className="text-xs text-muted-foreground">Foto KTP yang jelas dan terbaca</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                        <Camera className="w-5 h-5 text-blue-500" />
                        <div>
                          <p className="font-medium text-sm">Foto Selfie dengan KTP</p>
                          <p className="text-xs text-muted-foreground">Selfie sambil memegang KTP</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Keuntungan KYC</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Akses Dealer Marketplace</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Badge Terverifikasi</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Transaksi lebih aman</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Limit transaksi lebih tinggi</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kredit Calculator */}
            <KreditCalculator />
          </TabsContent>

          {/* LISTING TAB */}
          <TabsContent value="listing" className="space-y-6">
            {/* Listing Creation Flow */}
            <ListingCreationFlow />

            {/* Visibility Options */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-500" />
                  Opsi Visibilitas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <VisibilityDiagram />
              </CardContent>
            </Card>

            {/* Listing Statuses */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-500" />
                  Status Listing
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {LISTING_STATUSES.map((status) => (
                    <div key={status.status} className="p-3 rounded-lg border">
                      <Badge className={status.color}>{status.label}</Badge>
                      <p className="text-xs text-muted-foreground mt-2">{status.desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* DEALER TAB */}
          <TabsContent value="dealer" className="space-y-6">
            {/* Dealer Marketplace Flow */}
            <DealerMarketplaceFlow />

            {/* Dealer Registration Requirements */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-purple-500" />
                  Persyaratan Pendaftaran Dealer
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Dokumen Wajib</h4>
                    <div className="space-y-2">
                      {[
                        { name: 'NPWP Perusahaan', desc: 'Nomor Pokok Wajib Pajak' },
                        { name: 'NIB', desc: 'Nomor Induk Berusaha' },
                        { name: 'KTP Pemilik', desc: 'Kartu Tanda Penduduk pemilik' },
                        { name: 'Foto Selfie + KTP', desc: 'Verifikasi identitas' },
                      ].map((doc, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Dokumen Tambahan (Opsional)</h4>
                    <div className="space-y-2">
                      {[
                        { name: 'SIUP', desc: 'Surat Izin Usaha Perdagangan' },
                        { name: 'Surat Domisili', desc: 'Surat keterangan domisili usaha' },
                        { name: 'Logo & Banner', desc: 'Branding dealer' },
                      ].map((doc, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground">{doc.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        Proses verifikasi dealer membutuhkan waktu 3-5 hari kerja
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dealer Benefits */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/30">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-500 mx-auto mb-3 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold">Visibilitas Tinggi</h4>
                  <p className="text-xs text-muted-foreground">Badge verified & prioritas tampil</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500 mx-auto mb-3 flex items-center justify-center">
                    <Gavel className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold">Bidding System</h4>
                  <p className="text-xs text-muted-foreground">Ajukan penawaran ke seller</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30">
                <CardContent className="p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-green-500 mx-auto mb-3 flex items-center justify-center">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-semibold">Inventori Management</h4>
                  <p className="text-xs text-muted-foreground">Kelola stok mobil dengan mudah</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* INSPECTION TAB */}
          <TabsContent value="inspection" className="space-y-6">
            {/* Inspection Visualization */}
            <InspectionVisualization />

            {/* Inspection Process */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-green-500" />
                  Proses Inspeksi
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <div className="w-10 h-10 rounded-full bg-blue-500 mx-auto mb-2 flex items-center justify-center text-white font-bold">1</div>
                    <p className="font-medium text-sm">Booking</p>
                    <p className="text-xs text-muted-foreground">Jadwalkan inspeksi</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                    <div className="w-10 h-10 rounded-full bg-amber-500 mx-auto mb-2 flex items-center justify-center text-white font-bold">2</div>
                    <p className="font-medium text-sm">Inspeksi</p>
                    <p className="text-xs text-muted-foreground">160 titik pemeriksaan</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                    <div className="w-10 h-10 rounded-full bg-purple-500 mx-auto mb-2 flex items-center justify-center text-white font-bold">3</div>
                    <p className="font-medium text-sm">Laporan</p>
                    <p className="text-xs text-muted-foreground">Hasil & rekomendasi</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div className="w-10 h-10 rounded-full bg-green-500 mx-auto mb-2 flex items-center justify-center text-white font-bold">4</div>
                    <p className="font-medium text-sm">Sertifikat</p>
                    <p className="text-xs text-muted-foreground">Dokumen resmi</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Inspection Checklist Sample */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-base">Contoh Item Inspeksi</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <p className="font-semibold text-purple-600">Eksterior</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Kondisi cat body</li>
                      <li>• Panel-panel body</li>
                      <li>• Kaca & spion</li>
                      <li>• Lampu depan/belakang</li>
                      <li>• Pintu & jendela</li>
                      <li>• Ban & velg</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-blue-600">Interior</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Kondisi jok</li>
                      <li>• Dashboard & panel</li>
                      <li>• AC & pendingin</li>
                      <li>• Audio system</li>
                      <li>• Karpet & plafon</li>
                      <li>• Elektrikal interior</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-green-600">Mesin</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Kondisi mesin</li>
                      <li>• Transmisi</li>
                      <li>• Sistem pendingin</li>
                      <li>• Sistem bahan bakar</li>
                      <li>• Knalpot</li>
                      <li>• Belt & selang</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <p className="font-semibold text-amber-600">Undercarriage</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Sistem suspensi</li>
                      <li>• Rem & ABS</li>
                      <li>• Rangka/chassis</li>
                      <li>• Power steering</li>
                      <li>• Driveshaft</li>
                      <li>• Kondisi underbody</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA */}
        <div className="mt-8 text-center">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2">Siap Memulai?</h3>
              <p className="text-white/80 mb-4">Daftar gratis dan mulai jual beli mobil dengan aman</p>
              <div className="flex justify-center gap-3 flex-wrap">
                <Link href="/auth">
                  <Button variant="secondary" className="bg-white text-purple-700 hover:bg-gray-100">
                    Daftar Sekarang
                  </Button>
                </Link>
                <Link href="/listing/create">
                  <Button variant="outline" className="text-white border-white/30 hover:bg-white/10">
                    Pasang Iklan
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}
