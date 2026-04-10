'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Database,
  Globe,
  Server,
  Cpu,
  Shield,
  MapPin,
  Car,
  ClipboardCheck,
  Building2,
  Coins,
  CreditCard,
  MessageSquare,
  Bell,
  FileCheck,
  Calendar,
  Star,
  BarChart3,
  Headphones,
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Users,
  LayoutGrid,
  Code2,
  Zap,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  ShoppingBag,
  Upload,
  Search,
  Filter,
  GitBranch,
  Layers,
  Workflow,
  Activity,
  Lock,
  ChevronRight,
  CircleDot,
  MousePointerClick,
  MoveRight,
  ArrowUpRight,
  RefreshCw,
  Wallet,
  Gift,
  Banknote,
  Receipt,
  FileText,
  UserCheck,
  Store,
  Settings,
  Radio,
  Phone,
  Mail,
  Send,
  Megaphone,
  AlertTriangle,
  CircleDot as CircleDotIcon,
  Package,
  Truck,
  ShieldCheck,
  Award,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Timer,
  Archive,
  HardDrive,
  Wifi,
} from 'lucide-react'

// ─── Color Palette ────────────────────────────────────────
const palette = {
  emerald: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-600',
    fill: 'bg-emerald-500',
    gradient: 'from-emerald-500 to-teal-500',
    light: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  teal: {
    bg: 'bg-teal-500/10',
    border: 'border-teal-500/30',
    text: 'text-teal-600',
    fill: 'bg-teal-500',
    gradient: 'from-teal-500 to-cyan-500',
    light: 'bg-teal-50 dark:bg-teal-950/30',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-600',
    fill: 'bg-amber-500',
    gradient: 'from-amber-500 to-orange-500',
    light: 'bg-amber-50 dark:bg-amber-950/30',
  },
  rose: {
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-600',
    fill: 'bg-rose-500',
    gradient: 'from-rose-500 to-pink-500',
    light: 'bg-rose-50 dark:bg-rose-950/30',
  },
  violet: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    text: 'text-violet-600',
    fill: 'bg-violet-500',
    gradient: 'from-violet-500 to-purple-500',
    light: 'bg-violet-50 dark:bg-violet-950/30',
  },
  sky: {
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/30',
    text: 'text-sky-600',
    fill: 'bg-sky-500',
    gradient: 'from-sky-500 to-cyan-500',
    light: 'bg-sky-50 dark:bg-sky-950/30',
  },
}

const moduleColors: Record<string, typeof palette.emerald> = {
  auth: palette.emerald,
  location: palette.teal,
  vehicle: palette.amber,
  listing: palette.rose,
  inspection: palette.violet,
  dealer: palette.sky,
  token: palette.amber,
  payment: palette.emerald,
  chat: palette.teal,
  notification: palette.rose,
  kyc: palette.violet,
  rental: palette.sky,
  review: palette.amber,
  analytics: palette.emerald,
  support: palette.teal,
}

// ─── Module Data ──────────────────────────────────────────
interface ModuleData {
  id: string
  name: string
  icon: React.ReactNode
  colorKey: string
  description: string
  tableCount: number
  tables: { name: string; columns: number; fks: string[] }[]
  endpoints: { method: string; path: string; description: string }[]
  statuses?: { from: string; to: string; color: string }[]
  flow: { step: string; icon: React.ReactNode }[]
}

const modules: ModuleData[] = [
  {
    id: 'auth',
    name: 'Auth & Users',
    icon: <Shield className="w-5 h-5" />,
    colorKey: 'auth',
    description: 'Sistem autentikasi dan manajemen pengguna dengan 4 peran',
    tableCount: 7,
    tables: [
      { name: 'users', columns: 12, fks: [] },
      { name: 'profiles', columns: 18, fks: ['users'] },
      { name: 'user_settings', columns: 8, fks: ['users'] },
      { name: 'user_sessions', columns: 6, fks: ['users'] },
      { name: 'user_verifications', columns: 8, fks: ['users'] },
      { name: 'user_documents', columns: 7, fks: ['users'] },
      { name: 'user_addresses', columns: 10, fks: ['users', 'provinces', 'cities'] },
    ],
    endpoints: [
      { method: 'POST', path: '/api/auth/login', description: 'Login pengguna' },
      { method: 'POST', path: '/api/auth/register', description: 'Registrasi baru' },
      { method: 'POST', path: '/api/auth/logout', description: 'Logout pengguna' },
      { method: 'POST', path: '/api/auth/refresh', description: 'Refresh token' },
      { method: 'GET', path: '/api/profile', description: 'Data profil pengguna' },
      { method: 'PUT', path: '/api/profile', description: 'Update profil' },
    ],
    flow: [
      { step: 'Daftar / Login', icon: <UserCheck /> },
      { step: 'Verifikasi Email', icon: <Mail /> },
      { step: 'Lengkapi Profil', icon: <Users /> },
      { step: 'Pilih Role', icon: <ShieldCheck /> },
    ],
  },
  {
    id: 'location',
    name: 'Lokasi',
    icon: <MapPin className="w-5 h-5" />,
    colorKey: 'location',
    description: 'Data wilayah Indonesia: Provinsi, Kota, Kecamatan, Kelurahan',
    tableCount: 4,
    tables: [
      { name: 'countries', columns: 5, fks: [] },
      { name: 'provinces', columns: 6, fks: ['countries'] },
      { name: 'cities', columns: 8, fks: ['provinces'] },
      { name: 'districts', columns: 8, fks: ['cities'] },
    ],
    endpoints: [
      { method: 'GET', path: '/api/locations/provinces', description: 'Daftar provinsi' },
      { method: 'GET', path: '/api/locations/cities', description: 'Kota berdasarkan provinsi' },
      { method: 'GET', path: '/api/locations/districts', description: 'Kecamatan berdasarkan kota' },
      { method: 'GET', path: '/api/locations/villages', description: 'Kelurahan berdasarkan kecamatan' },
    ],
    flow: [
      { step: 'Pilih Provinsi (38)', icon: <MapPin /> },
      { step: 'Pilih Kota (514)', icon: <Building2 /> },
      { step: 'Pilih Kecamatan', icon: <Globe /> },
      { step: 'Pilih Kelurahan', icon: <MapPin /> },
    ],
  },
  {
    id: 'vehicle',
    name: 'Data Master Kendaraan',
    icon: <Car className="w-5 h-5" />,
    colorKey: 'vehicle',
    description: 'Database lengkap merek, model, varian, dan fitur kendaraan',
    tableCount: 12,
    tables: [
      { name: 'brands', columns: 8, fks: [] },
      { name: 'car_models', columns: 10, fks: ['brands'] },
      { name: 'car_variants', columns: 12, fks: ['car_models'] },
      { name: 'car_generations', columns: 8, fks: ['car_models'] },
      { name: 'car_colors', columns: 5, fks: [] },
      { name: 'car_body_types', columns: 5, fks: [] },
      { name: 'car_fuel_types', columns: 5, fks: [] },
      { name: 'car_transmissions', columns: 5, fks: [] },
      { name: 'feature_categories', columns: 6, fks: [] },
      { name: 'feature_groups', columns: 8, fks: ['feature_categories'] },
      { name: 'feature_items', columns: 6, fks: ['feature_groups'] },
      { name: 'categories', columns: 6, fks: [] },
    ],
    endpoints: [
      { method: 'GET', path: '/api/brands', description: 'Daftar merek' },
      { method: 'GET', path: '/api/models', description: 'Model berdasarkan merek' },
      { method: 'GET', path: '/api/colors', description: 'Warna kendaraan' },
      { method: 'GET', path: '/api/categories', description: 'Kategori kendaraan' },
    ],
    flow: [
      { step: 'Pilih Merek', icon: <Car /> },
      { step: 'Pilih Model', icon: <Layers /> },
      { step: 'Pilih Varian', icon: <GitBranch /> },
      { step: 'Pilih Tahun', icon: <Calendar /> },
    ],
  },
  {
    id: 'listing',
    name: 'Sistem Listing',
    icon: <LayoutGrid className="w-5 h-5" />,
    colorKey: 'listing',
    description: 'Core marketplace: 45+ kolom, multi-visibilitas, boost, compare',
    tableCount: 14,
    tables: [
      { name: 'car_listings', columns: 45, fks: ['profiles', 'brands', 'car_models', 'car_variants', 'cities'] },
      { name: 'car_images', columns: 6, fks: ['car_listings'] },
      { name: 'car_videos', columns: 5, fks: ['car_listings'] },
      { name: 'car_documents', columns: 6, fks: ['car_listings'] },
      { name: 'car_features', columns: 4, fks: ['car_listings', 'feature_items'] },
      { name: 'car_feature_values', columns: 5, fks: ['car_listings', 'feature_items'] },
      { name: 'car_rental_prices', columns: 5, fks: ['car_listings'] },
      { name: 'car_price_history', columns: 6, fks: ['car_listings'] },
      { name: 'car_status_history', columns: 7, fks: ['car_listings', 'profiles'] },
      { name: 'car_views', columns: 5, fks: ['car_listings'] },
      { name: 'car_compares', columns: 5, fks: ['car_listings', 'profiles'] },
      { name: 'car_favorites', columns: 5, fks: ['car_listings', 'profiles'] },
      { name: 'recent_views', columns: 5, fks: ['car_listings', 'profiles'] },
      { name: 'trending_cars', columns: 6, fks: ['car_listings'] },
    ],
    endpoints: [
      { method: 'GET', path: '/api/listings', description: 'Daftar listing (filter, sort, search)' },
      { method: 'POST', path: '/api/listings/create', description: 'Buat listing baru' },
      { method: 'GET', path: '/api/listings/[id]', description: 'Detail listing' },
      { method: 'PUT', path: '/api/listings/[id]', description: 'Update listing' },
      { method: 'DELETE', path: '/api/listings/[id]', description: 'Hapus listing' },
      { method: 'POST', path: '/api/listings/[id]/view', description: 'Catat view' },
      { method: 'POST', path: '/api/favorites', description: 'Tambah favorit' },
      { method: 'GET', path: '/api/compare', description: 'Bandingkan mobil' },
    ],
    statuses: [
      { from: 'draft', to: 'pending', color: 'bg-amber-500' },
      { from: 'pending', to: 'active', color: 'bg-emerald-500' },
      { from: 'active', to: 'sold', color: 'bg-teal-500' },
      { from: 'active', to: 'suspended', color: 'bg-rose-500' },
      { from: 'suspended', to: 'active', color: 'bg-emerald-500' },
      { from: 'pending', to: 'rejected', color: 'bg-rose-500' },
    ],
    flow: [
      { step: 'Isi Data Mobil', icon: <FileText /> },
      { step: 'Upload Foto', icon: <Upload /> },
      { step: 'Pilih Visibilitas', icon: <Eye /> },
      { step: 'Bayar Token', icon: <Coins /> },
      { step: 'Listing Aktif', icon: <CheckCircle2 /> },
    ],
  },
  {
    id: 'inspection',
    name: 'Sistem Inspeksi',
    icon: <ClipboardCheck className="w-5 h-5" />,
    colorKey: 'inspection',
    description: '160 titik inspeksi dalam 13 kategori dengan grading A+ hingga E',
    tableCount: 6,
    tables: [
      { name: 'inspection_categories', columns: 6, fks: [] },
      { name: 'inspection_items', columns: 8, fks: ['inspection_categories'] },
      { name: 'car_inspections', columns: 12, fks: ['car_listings', 'profiles'] },
      { name: 'inspection_results', columns: 8, fks: ['car_inspections', 'inspection_items'] },
      { name: 'inspection_photos', columns: 6, fks: ['inspection_results'] },
      { name: 'inspection_certificates', columns: 10, fks: ['car_inspections'] },
    ],
    endpoints: [
      { method: 'GET', path: '/api/inspections', description: 'Daftar inspeksi' },
      { method: 'POST', path: '/api/inspections/submit', description: 'Submit hasil inspeksi' },
      { method: 'GET', path: '/api/inspections/[id]/certificate', description: 'Sertifikat inspeksi' },
      { method: 'GET', path: '/api/inspection-items', description: 'Daftar item inspeksi' },
    ],
    statuses: [
      { from: 'not_inspected', to: 'in_progress', color: 'bg-amber-500' },
      { from: 'in_progress', to: 'completed', color: 'bg-emerald-500' },
      { from: 'completed', to: 'certified', color: 'bg-teal-500' },
    ],
    flow: [
      { step: 'Pilih Listing', icon: <Car /> },
      { step: 'Mulai Inspeksi', icon: <ClipboardCheck /> },
      { step: 'Isi 160 Titik', icon: <CheckCircle2 /> },
      { step: 'Kalkulasi Grade', icon: <Award /> },
      { step: 'Sertifikat PDF', icon: <FileText /> },
    ],
  },
  {
    id: 'dealer',
    name: 'Sistem Dealer',
    icon: <Building2 className="w-5 h-5" />,
    colorKey: 'dealer',
    description: 'Dealer marketplace B2B dengan bidding, inventory, dan analytics',
    tableCount: 12,
    tables: [
      { name: 'dealers', columns: 20, fks: ['profiles', 'provinces', 'cities'] },
      { name: 'dealer_branches', columns: 12, fks: ['dealers', 'cities'] },
      { name: 'dealer_staff', columns: 10, fks: ['dealers', 'profiles'] },
      { name: 'dealer_documents', columns: 7, fks: ['dealers'] },
      { name: 'dealer_inventory', columns: 15, fks: ['dealers', 'car_listings'] },
      { name: 'dealer_reviews', columns: 8, fks: ['dealers', 'profiles'] },
      { name: 'dealer_marketplace_settings', columns: 8, fks: ['dealers'] },
      { name: 'dealer_marketplace_favorites', columns: 5, fks: ['dealers', 'car_listings'] },
      { name: 'dealer_marketplace_views', columns: 5, fks: ['dealers', 'car_listings'] },
      { name: 'dealer_offers', columns: 15, fks: ['dealers', 'car_listings', 'profiles'] },
      { name: 'dealer_offer_histories', columns: 8, fks: ['dealer_offers'] },
      { name: 'dealer_registrations', columns: 25, fks: ['profiles'] },
    ],
    endpoints: [
      { method: 'GET', path: '/api/dealers', description: 'Daftar dealer' },
      { method: 'GET', path: '/api/dealers/[slug]', description: 'Profil dealer' },
      { method: 'GET', path: '/api/dealer/stats', description: 'Statistik dealer' },
      { method: 'POST', path: '/api/dealer-marketplace/offers', description: 'Buat penawaran' },
      { method: 'GET', path: '/api/dealer-marketplace/listings', description: 'Listing dealer marketplace' },
      { method: 'POST', path: '/api/dealer/team', description: 'Kelola tim' },
    ],
    statuses: [
      { from: 'draft', to: 'pending', color: 'bg-amber-500' },
      { from: 'pending', to: 'under_review', color: 'bg-sky-500' },
      { from: 'under_review', to: 'approved', color: 'bg-emerald-500' },
      { from: 'under_review', to: 'rejected', color: 'bg-rose-500' },
    ],
    flow: [
      { step: 'Registrasi', icon: <UserCheck /> },
      { step: 'Upload Dokumen', icon: <FileText /> },
      { step: 'Review Admin', icon: <ClipboardCheck /> },
      { step: 'Kelola Inventaris', icon: <Package /> },
      { step: 'B2B Bidding', icon: <ShoppingBag /> },
    ],
  },
  {
    id: 'token',
    name: 'Sistem Token/Kredit',
    icon: <Coins className="w-5 h-5" />,
    colorKey: 'token',
    description: 'Token economy: beli, pakai, topup admin, bonus registrasi',
    tableCount: 5,
    tables: [
      { name: 'token_packages', columns: 10, fks: [] },
      { name: 'token_settings', columns: 8, fks: [] },
      { name: 'token_transactions', columns: 10, fks: ['profiles', 'token_packages'] },
      { name: 'user_tokens', columns: 8, fks: ['profiles'] },
      { name: 'topup_requests', columns: 10, fks: ['profiles'] },
    ],
    endpoints: [
      { method: 'GET', path: '/api/user-tokens', description: 'Saldo token' },
      { method: 'POST', path: '/api/token-purchase', description: 'Beli paket token' },
      { method: 'GET', path: '/api/token-transactions', description: 'Riwayat transaksi' },
      { method: 'GET', path: '/api/token-packages', description: 'Daftar paket' },
      { method: 'GET', path: '/api/token-settings', description: 'Pengaturan harga' },
    ],
    flow: [
      { step: 'Beli Paket', icon: <ShoppingBag /> },
      { step: 'Saldo Bertambah', icon: <Wallet /> },
      { step: 'Gunakan Token', icon: <Zap /> },
      { step: 'Riwayat', icon: <Receipt /> },
    ],
  },
  {
    id: 'payment',
    name: 'Pembayaran & Pesanan',
    icon: <CreditCard className="w-5 h-5" />,
    colorKey: 'payment',
    description: 'BNI VA, escrow, refund, penarikan, dan manajemen fee',
    tableCount: 9,
    tables: [
      { name: 'payments', columns: 15, fks: ['profiles'] },
      { name: 'payment_methods', columns: 6, fks: [] },
      { name: 'transactions', columns: 12, fks: ['profiles', 'payments'] },
      { name: 'invoices', columns: 10, fks: ['transactions', 'profiles'] },
      { name: 'orders', columns: 15, fks: ['profiles', 'car_listings'] },
      { name: 'order_items', columns: 8, fks: ['orders'] },
      { name: 'escrow_accounts', columns: 10, fks: ['orders'] },
      { name: 'refunds', columns: 8, fks: ['payments'] },
      { name: 'withdrawals', columns: 10, fks: ['profiles', 'payments'] },
    ],
    endpoints: [
      { method: 'POST', path: '/api/payments', description: 'Buat pembayaran' },
      { method: 'GET', path: '/api/payments', description: 'Daftar pembayaran' },
      { method: 'GET', path: '/api/orders', description: 'Daftar pesanan' },
      { method: 'POST', path: '/api/wallet/withdraw', description: 'Tarik dana' },
    ],
    statuses: [
      { from: 'pending', to: 'paid', color: 'bg-emerald-500' },
      { from: 'paid', to: 'processing', color: 'bg-amber-500' },
      { from: 'processing', to: 'completed', color: 'bg-teal-500' },
      { from: 'completed', to: 'refunded', color: 'bg-rose-500' },
    ],
    flow: [
      { step: 'Pilih Metode', icon: <CreditCard /> },
      { step: 'Bayar via BNI VA', icon: <Banknote /> },
      { step: 'Konfirmasi', icon: <CheckCircle2 /> },
      { step: 'Escrow', icon: <Lock /> },
      { step: 'Selesai/Refund', icon: <RefreshCw /> },
    ],
  },
  {
    id: 'chat',
    name: 'Chat & Messaging',
    icon: <MessageSquare className="w-5 h-5" />,
    colorKey: 'chat',
    description: 'Real-time messaging via WebSocket dengan lampiran',
    tableCount: 3,
    tables: [
      { name: 'conversations', columns: 10, fks: ['profiles', 'car_listings'] },
      { name: 'messages', columns: 8, fks: ['conversations', 'profiles'] },
      { name: 'message_attachments', columns: 6, fks: ['messages'] },
    ],
    endpoints: [
      { method: 'GET', path: '/api/conversations', description: 'Daftar percakapan' },
      { method: 'GET', path: '/api/conversations/[id]/messages', description: 'Pesan percakapan' },
      { method: 'POST', path: '/api/conversations/[id]/messages', description: 'Kirim pesan' },
    ],
    flow: [
      { step: 'Klik "Hubungi"', icon: <MessageCircle /> },
      { step: 'Buka Chat', icon: <MessageSquare /> },
      { step: 'Kirim Pesan', icon: <Send /> },
      { step: 'Real-time', icon: <Wifi /> },
    ],
  },
  {
    id: 'notification',
    name: 'Notifikasi',
    icon: <Bell className="w-5 h-5" />,
    colorKey: 'notification',
    description: 'Push, email, in-app notifications, broadcast admin',
    tableCount: 4,
    tables: [
      { name: 'notifications', columns: 8, fks: [] },
      { name: 'user_notifications', columns: 7, fks: ['notifications', 'profiles'] },
      { name: 'notification_templates', columns: 6, fks: [] },
      { name: 'broadcasts', columns: 8, fks: ['profiles'] },
    ],
    endpoints: [
      { method: 'GET', path: '/api/notifications', description: 'Daftar notifikasi' },
      { method: 'PUT', path: '/api/notifications', description: 'Tandai sudah dibaca' },
      { method: 'POST', path: '/api/admin/broadcast', description: 'Broadcast ke semua' },
    ],
    flow: [
      { step: 'Event Trigger', icon: <Zap /> },
      { step: 'Template', icon: <FileText /> },
      { step: 'Kirim', icon: <Send /> },
      { step: 'Push/Email', icon: <Megaphone /> },
    ],
  },
  {
    id: 'kyc',
    name: 'Verifikasi KYC',
    icon: <FileCheck className="w-5 h-5" />,
    colorKey: 'kyc',
    description: 'Verifikasi identitas penjual: KTP + Selfie + Alamat',
    tableCount: 1,
    tables: [
      { name: 'kyc_verifications', columns: 15, fks: ['profiles', 'provinces', 'cities'] },
    ],
    endpoints: [
      { method: 'GET', path: '/api/kyc', description: 'Cek status KYC' },
      { method: 'POST', path: '/api/kyc', description: 'Submit KYC' },
      { method: 'PUT', path: '/api/admin/kyc', description: 'Approve/Reject KYC' },
    ],
    statuses: [
      { from: 'not_submitted', to: 'pending', color: 'bg-amber-500' },
      { from: 'pending', to: 'approved', color: 'bg-emerald-500' },
      { from: 'pending', to: 'rejected', color: 'bg-rose-500' },
      { from: 'rejected', to: 'pending', color: 'bg-amber-500' },
    ],
    flow: [
      { step: 'Upload KTP', icon: <Upload /> },
      { step: 'Upload Selfie', icon: <UserCheck /> },
      { step: 'Isi Alamat', icon: <MapPin /> },
      { step: 'Review Admin', icon: <ClipboardCheck /> },
      { step: 'Approved', icon: <CheckCircle2 /> },
    ],
  },
  {
    id: 'rental',
    name: 'Sistem Rental',
    icon: <Calendar className="w-5 h-5" />,
    colorKey: 'rental',
    description: 'Sewa kendaraan: booking, ketersediaan, asuransi, review',
    tableCount: 4,
    tables: [
      { name: 'rental_bookings', columns: 15, fks: ['profiles', 'car_listings'] },
      { name: 'rental_availability', columns: 8, fks: ['car_listings'] },
      { name: 'rental_payments', columns: 10, fks: ['rental_bookings'] },
      { name: 'rental_reviews', columns: 8, fks: ['rental_bookings', 'profiles'] },
    ],
    endpoints: [
      { method: 'GET', path: '/api/rentals', description: 'Daftar booking' },
      { method: 'POST', path: '/api/rentals', description: 'Buat booking rental' },
    ],
    statuses: [
      { from: 'pending', to: 'confirmed', color: 'bg-emerald-500' },
      { from: 'confirmed', to: 'active', color: 'bg-teal-500' },
      { from: 'active', to: 'completed', color: 'bg-amber-500' },
    ],
    flow: [
      { step: 'Pilih Mobil', icon: <Car /> },
      { step: 'Pilih Tanggal', icon: <Calendar /> },
      { step: 'Bayar DP', icon: <CreditCard /> },
      { step: 'Ambil Mobil', icon: <Truck /> },
      { step: 'Kembalikan', icon: <RefreshCw /> },
    ],
  },
  {
    id: 'review',
    name: 'Review & Rating',
    icon: <Star className="w-5 h-5" />,
    colorKey: 'review',
    description: 'Sistem ulasan mobil dan dealer dengan voting',
    tableCount: 3,
    tables: [
      { name: 'car_reviews', columns: 10, fks: ['profiles', 'car_listings'] },
      { name: 'review_images', columns: 5, fks: ['car_reviews'] },
      { name: 'review_votes', columns: 5, fks: ['car_reviews', 'profiles'] },
    ],
    endpoints: [
      { method: 'POST', path: '/api/reviews', description: 'Buat review' },
      { method: 'GET', path: '/api/reviews/[listingId]', description: 'Review listing' },
    ],
    flow: [
      { step: 'Beli Mobil', icon: <ShoppingBag /> },
      { step: 'Tulis Review', icon: <Star /> },
      { step: 'Upload Foto', icon: <Upload /> },
      { step: 'Voting', icon: <ThumbsUp /> },
    ],
  },
  {
    id: 'analytics',
    name: 'Analitik',
    icon: <BarChart3 className="w-5 h-5" />,
    colorKey: 'analytics',
    description: 'Tracking events, page views, konversi, dan rekomendasi AI',
    tableCount: 5,
    tables: [
      { name: 'analytics_events', columns: 8, fks: ['profiles'] },
      { name: 'analytics_page_views', columns: 7, fks: ['profiles'] },
      { name: 'analytics_clicks', columns: 6, fks: ['profiles'] },
      { name: 'analytics_conversions', columns: 8, fks: ['profiles'] },
      { name: 'search_logs', columns: 6, fks: ['profiles'] },
    ],
    endpoints: [
      { method: 'GET', path: '/api/admin/analytics', description: 'Dashboard analitik' },
      { method: 'GET', path: '/api/admin/stats', description: 'Statistik platform' },
    ],
    flow: [
      { step: 'Track Event', icon: <Activity /> },
      { step: 'Aggregasi', icon: <BarChart3 /> },
      { step: 'Dashboard', icon: <LayoutGrid /> },
      { step: 'Rekomendasi AI', icon: <TrendingUp /> },
    ],
  },
  {
    id: 'support',
    name: 'Support & Admin',
    icon: <Headphones className="w-5 h-5" />,
    colorKey: 'support',
    description: 'Ticket support, laporan, activity log, banner, settings',
    tableCount: 5,
    tables: [
      { name: 'support_tickets', columns: 12, fks: ['profiles'] },
      { name: 'support_ticket_messages', columns: 7, fks: ['support_tickets', 'profiles'] },
      { name: 'reports', columns: 8, fks: ['profiles', 'car_listings'] },
      { name: 'activity_logs', columns: 8, fks: ['profiles'] },
      { name: 'banners', columns: 10, fks: [] },
    ],
    endpoints: [
      { method: 'POST', path: '/api/support', description: 'Buat ticket' },
      { method: 'GET', path: '/api/admin/tickets', description: 'Kelola ticket' },
      { method: 'POST', path: '/api/reports', description: 'Laporkan listing' },
      { method: 'GET', path: '/api/admin/activity', description: 'Activity log' },
    ],
    statuses: [
      { from: 'open', to: 'in_progress', color: 'bg-amber-500' },
      { from: 'in_progress', to: 'resolved', color: 'bg-emerald-500' },
      { from: 'in_progress', to: 'closed', color: 'bg-slate-500' },
    ],
    flow: [
      { step: 'User Buat Ticket', icon: <Headphones /> },
      { step: 'Admin Respon', icon: <MessageSquare /> },
      { step: 'Resolusi', icon: <CheckCircle2 /> },
      { step: 'Closed', icon: <Archive /> },
    ],
  },
]

// ─── Journey Data ─────────────────────────────────────────
interface JourneyStep {
  title: string
  description: string
  icon: React.ReactNode
  module: string
}

const buyerJourney: JourneyStep[] = [
  { title: 'Daftar', description: 'Registrasi akun baru', icon: <UserCheck />, module: 'Auth' },
  { title: 'Jelajahi', description: 'Browse listing dengan filter', icon: <Search />, module: 'Listing' },
  { title: 'Bandingkan', description: 'Compare beberapa mobil', icon: <GitBranch />, module: 'Listing' },
  { title: 'Favorit', description: 'Simpan mobil yang disukai', icon: <Heart />, module: 'Listing' },
  { title: 'Chat', description: 'Hubungi penjual via chat', icon: <MessageCircle />, module: 'Chat' },
  { title: 'Buat Penawaran', description: 'Nego harga dengan penjual', icon: <ShoppingBag />, module: 'Dealer' },
  { title: 'Bayar', description: 'Proses pembayaran via VA', icon: <CreditCard />, module: 'Pembayaran' },
  { title: 'Review', description: 'Beri ulasan setelah beli', icon: <Star />, module: 'Review' },
]

const sellerJourney: JourneyStep[] = [
  { title: 'Daftar', description: 'Registrasi akun penjual', icon: <UserCheck />, module: 'Auth' },
  { title: 'KYC', description: 'Verifikasi identitas (KTP+Selfie)', icon: <FileCheck />, module: 'KYC' },
  { title: 'Beli Token', description: 'Top-up saldo token', icon: <Coins />, module: 'Token' },
  { title: 'Buat Iklan', description: 'Isi data & upload foto mobil', icon: <Upload />, module: 'Listing' },
  { title: 'Boost', description: 'Tingkatkan visibilitas listing', icon: <Zap />, module: 'Token' },
  { title: 'Kelola Penawaran', description: 'Terima/reject penawaran buyer', icon: <ShoppingBag />, module: 'Dealer' },
  { title: 'Selesaikan', description: 'Proses penjualan via escrow', icon: <CheckCircle2 />, module: 'Pembayaran' },
]

const dealerJourney: JourneyStep[] = [
  { title: 'Registrasi', description: 'Daftar sebagai dealer', icon: <Building2 />, module: 'Auth' },
  { title: 'Onboarding', description: 'Upload NPWP, NIB, SIUP', icon: <FileText />, module: 'KYC' },
  { title: 'Inventaris', description: 'Kelola stok mobil', icon: <Package />, module: 'Dealer' },
  { title: 'Marketplace', description: 'Listing ke dealer marketplace', icon: <Store />, module: 'Dealer' },
  { title: 'B2B Bidding', description: 'Beli dari dealer lain', icon: <ShoppingBag />, module: 'Dealer' },
  { title: 'Analytics', description: 'Pantau performa penjualan', icon: <BarChart3 />, module: 'Analitik' },
]

// ─── Stat Cards ───────────────────────────────────────────
const stats = [
  { label: 'Database Tables', value: '101', icon: <Database className="w-6 h-6" />, gradient: 'from-emerald-500 to-teal-500', subtitle: 'Tabel Database' },
  { label: 'Frontend Pages', value: '81', icon: <LayoutGrid className="w-6 h-6" />, gradient: 'from-teal-500 to-cyan-500', subtitle: 'Halaman Frontend' },
  { label: 'API Endpoints', value: '120+', icon: <Code2 className="w-6 h-6" />, gradient: 'from-amber-500 to-orange-500', subtitle: 'Endpoint API' },
  { label: 'User Roles', value: '4', icon: <Shield className="w-6 h-6" />, gradient: 'from-rose-500 to-pink-500', subtitle: 'Peran Pengguna' },
  { label: 'System Modules', value: '15', icon: <Layers className="w-6 h-6" />, gradient: 'from-violet-500 to-purple-500', subtitle: 'Modul Sistem' },
  { label: 'Inspection Points', value: '160', icon: <ClipboardCheck className="w-6 h-6" />, gradient: 'from-sky-500 to-cyan-500', subtitle: 'Titik Inspeksi' },
]

// ─── Token Costs ──────────────────────────────────────────
const tokenCosts = [
  { action: 'Prediksi AI', cost: 5, icon: <Zap />, free: false },
  { action: 'Listing Umum', cost: 10, icon: <LayoutGrid />, free: false },
  { action: 'Listing Dealer', cost: 20, icon: <Building2 />, free: false },
  { action: 'Hubungi Dealer', cost: 5, icon: <Phone />, free: false },
  { action: 'Boost Listing', cost: 3, icon: <TrendingUp />, free: false },
  { action: 'Chat Publik', cost: 0, icon: <MessageCircle />, free: true },
  { action: 'Inspeksi 160 Titik', cost: 0, icon: <ClipboardCheck />, free: true },
]

// ─── Helper Components ────────────────────────────────────
function FlowArrow() {
  return (
    <div className="flex items-center justify-center py-1">
      <MoveRight className="w-5 h-5 text-muted-foreground/50" />
    </div>
  )
}

function FlowStep({ step, icon, color, active }: { step: string; icon: React.ReactNode; color: string; active?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1.5 ${active ? '' : 'opacity-60'}`}>
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${color} text-white shadow-lg`}>
        {icon}
      </div>
      <span className="text-[10px] sm:text-xs text-center font-medium text-muted-foreground leading-tight max-w-[70px]">
        {step}
      </span>
    </div>
  )
}

function StatusBadge({ from, to, color }: { from: string; to: string; color: string }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">{from}</span>
      <ArrowRight className="w-3 h-3 text-muted-foreground" />
      <span className={`text-xs font-mono px-2 py-0.5 rounded ${color} text-white`}>{to}</span>
    </div>
  )
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    POST: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    PUT: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
    DELETE: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  }
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${colors[method] || 'bg-muted text-muted-foreground'}`}>
      {method}
    </span>
  )
}

// ─── Main Page ────────────────────────────────────────────
export default function SystemWorkflowPage() {
  const [activeJourney, setActiveJourney] = useState('buyer')
  const [expandedModules, setExpandedModules] = useState<string[]>([])

  const totalTables = modules.reduce((acc, m) => acc + m.tableCount, 0)

  const journeys = {
    buyer: buyerJourney,
    seller: sellerJourney,
    dealer: dealerJourney,
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ─── Hero Section ─────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-950" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzR6bTAtMzBWMkgydjJoMzR6TTIgMjJoMzR2LTJIMHZ6bTAtMTJ2Mkgydi0yaDM0ek0yIDRoMzRWMkgydjJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
        <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl" />

        <div className="relative z-10 container mx-auto px-4 pt-12 pb-16 sm:pt-20 sm:pb-24">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
              <Activity className="w-3.5 h-3.5 text-emerald-300" />
              <span className="text-xs text-emerald-200 font-medium">Dokumentasi Sistem v2.0</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
              AutoMarket Indonesia
              <span className="block mt-2 bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
                System Architecture
              </span>
            </h1>
            <p className="text-base sm:text-lg text-emerald-100/70 max-w-2xl mx-auto">
              Platform Marketplace Otomotif Terlengkap &mdash; 101 Database Tables, 15 System Modules, 120+ API Endpoints
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="group relative bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/10 hover:bg-white/15 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-white mb-0.5">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-emerald-200/60 font-medium">{stat.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Architecture Diagram ─────────────────────────── */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-8">
          <Badge variant="success" className="mb-3">
            <Server className="w-3.5 h-3.5" />
            Infrastruktur
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Arsitektur Sistem</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Arsitektur full-stack modern dengan API Gateway, backend terpisah, dan WebSocket real-time
          </p>
        </div>

        <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
          <CardContent className="p-4 sm:p-8">
            <div className="flex flex-col items-center gap-4 sm:gap-6">
              {/* Client Layer */}
              <div className="flex flex-wrap justify-center gap-3">
                <ArchNode icon={<Globe />} label="Browser / Client" color="from-emerald-400 to-teal-400" />
                <ArchArrow />
                <ArchNode icon={<Layers />} label="Next.js 16 Frontend" color="from-teal-400 to-cyan-400" sub="React, Tailwind, shadcn/ui" />
                <ArchArrow />
                <ArchNode icon={<Shield />} label="API Gateway (Caddy)" color="from-amber-400 to-orange-400" sub="Reverse Proxy, SSL" />
              </div>

              {/* Vertical Arrow */}
              <div className="flex flex-col items-center py-2">
                <div className="w-px h-6 sm:h-8 bg-gradient-to-b from-amber-400 to-emerald-400" />
                <ArrowDown className="w-5 h-5 text-emerald-500" />
              </div>

              {/* Backend */}
              <ArchNode icon={<Server />} label="Golang Fiber v3 Backend" color="from-emerald-500 to-teal-500" sub="Port :8080 | REST API" size="lg" />

              {/* Vertical Arrow */}
              <div className="flex flex-col items-center py-2">
                <div className="w-px h-6 sm:h-8 bg-gradient-to-b from-emerald-400 to-slate-300" />
                <ArrowDown className="w-5 h-5 text-slate-400" />
              </div>

              {/* Services */}
              <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                <ArchNode icon={<Database />} label="PostgreSQL" color="from-sky-400 to-cyan-400" sub=":5432" />
                <ArchNode icon={<Zap />} label="Redis Cache" color="from-rose-400 to-pink-400" sub=":6379" />
                <ArchNode icon={<HardDrive />} label="MinIO Storage" color="from-amber-400 to-yellow-400" sub=":9000" />
                <ArchNode icon={<Wifi />} label="WebSocket" color="from-emerald-400 to-teal-400" sub=":3003" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* ─── Module Explorer ──────────────────────────────── */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-8">
          <Badge variant="premium" className="mb-3">
            <Layers className="w-3.5 h-3.5" />
            {totalTables} Tabel
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">15 Modul Sistem</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Setiap modul memiliki tabel database, API endpoints, dan flow kerja yang terintegrasi
          </p>
        </div>

        <Accordion
          type="multiple"
          className="space-y-3"
          onValueChange={(val) => setExpandedModules(val)}
        >
          {modules.map((mod, idx) => {
            const mc = moduleColors[mod.colorKey] || palette.emerald
            const isExpanded = expandedModules.includes(mod.id)

            return (
              <AccordionItem
                key={mod.id}
                value={mod.id}
                className="rounded-xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="hover:no-underline px-4 sm:px-6 py-4 hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${mc.gradient} flex items-center justify-center text-white shadow-md flex-shrink-0`}>
                      {mod.icon}
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm sm:text-base text-foreground">
                          Modul {idx + 1}: {mod.name}
                        </span>
                        <Badge variant="outline" className={`${mc.text} ${mc.border} text-[10px]`}>
                          {mod.tableCount} tabel
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {mod.description}
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-4 sm:px-6">
                  {isExpanded && (
                    <div className="space-y-6 pb-4">
                      {/* Module Flow */}
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Workflow className="w-4 h-4 text-muted-foreground" />
                          Alur Kerja Modul
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-muted/30 rounded-xl p-4">
                          {mod.flow.map((step, si) => (
                            <div key={si} className="flex items-center gap-2 sm:gap-3">
                              <FlowStep
                                step={step.step}
                                icon={step.icon}
                                color={mc.gradient}
                              />
                              {si < mod.flow.length - 1 && <FlowArrow />}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Database Tables */}
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Database className="w-4 h-4 text-muted-foreground" />
                          Database Tables ({mod.tableCount})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                          {mod.tables.map((table) => (
                            <div
                              key={table.name}
                              className={`flex items-center gap-3 p-3 rounded-lg border ${mc.light} ${mc.border} transition-colors hover:bg-opacity-80`}
                            >
                              <Database className={`w-4 h-4 ${mc.text} flex-shrink-0`} />
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-mono font-semibold text-foreground truncate">
                                  {table.name}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-muted-foreground">
                                    {table.columns} kolom
                                  </span>
                                  {table.fks.length > 0 && (
                                    <span className="text-[10px] text-muted-foreground">
                                      &middot; {table.fks.length} FK
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* API Endpoints */}
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Code2 className="w-4 h-4 text-muted-foreground" />
                          API Endpoints ({mod.endpoints.length})
                        </h4>
                        <div className="space-y-1.5">
                          {mod.endpoints.map((ep, ei) => (
                            <div
                              key={ei}
                              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                            >
                              <MethodBadge method={ep.method} />
                              <code className="text-[11px] sm:text-xs font-mono text-foreground flex-shrink-0">
                                {ep.path}
                              </code>
                              <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">
                                &mdash; {ep.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status Workflows */}
                      {mod.statuses && mod.statuses.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <GitBranch className="w-4 h-4 text-muted-foreground" />
                            Status Workflow
                          </h4>
                          <div className="flex flex-wrap gap-3">
                            {mod.statuses.map((status, si) => (
                              <StatusBadge key={si} from={status.from} to={status.to} color={status.color} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </section>

      {/* ─── User Journey Maps ────────────────────────────── */}
      <section className="bg-gradient-to-b from-slate-50 to-background dark:from-slate-950/50 dark:to-background py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Badge variant="warning" className="mb-3">
              <MousePointerClick className="w-3.5 h-3.5" />
              User Flows
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Peta Perjalanan Pengguna</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Tiga alur utama pengguna: Pembeli, Penjual, dan Dealer
            </p>
          </div>

          <Tabs value={activeJourney} onValueChange={setActiveJourney} className="w-full">
            <TabsList className="mx-auto grid w-full max-w-md grid-cols-3 mb-6">
              <TabsTrigger value="buyer" className="text-xs sm:text-sm">
                <ShoppingBag className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
                Pembeli
              </TabsTrigger>
              <TabsTrigger value="seller" className="text-xs sm:text-sm">
                <Upload className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
                Penjual
              </TabsTrigger>
              <TabsTrigger value="dealer" className="text-xs sm:text-sm">
                <Building2 className="w-3.5 h-3.5 mr-1 hidden sm:inline" />
                Dealer
              </TabsTrigger>
            </TabsList>

            {(['buyer', 'seller', 'dealer'] as const).map((type) => {
              const journeySteps = journeys[type]
              const journeyColors: Record<string, string> = {
                buyer: 'from-emerald-400 to-teal-400',
                seller: 'from-amber-400 to-orange-400',
                dealer: 'from-rose-400 to-pink-400',
              }
              const journeyBg: Record<string, string> = {
                buyer: 'from-emerald-500/10 to-teal-500/5',
                seller: 'from-amber-500/10 to-orange-500/5',
                dealer: 'from-rose-500/10 to-pink-500/5',
              }

              return (
                <TabsContent key={type} value={type}>
                  <Card className="border-0 shadow-lg overflow-hidden">
                    <div className={`bg-gradient-to-br ${journeyBg[type]} p-1`}>
                      <CardContent className="p-4 sm:p-8 bg-card rounded-xl">
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                          {journeySteps.map((step, si) => (
                            <div key={si} className="flex items-center gap-2 sm:gap-3">
                              <div className="group flex flex-col items-center gap-2">
                                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${journeyColors[type]} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300 relative`}>
                                  {step.icon}
                                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-background text-foreground text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-sm">
                                    {si + 1}
                                  </span>
                                </div>
                                <div className="text-center max-w-[80px] sm:max-w-[90px]">
                                  <p className="text-xs font-semibold text-foreground">{step.title}</p>
                                  <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-2">{step.description}</p>
                                  <Badge variant="outline" className="mt-1 text-[9px] px-1.5 py-0">
                                    {step.module}
                                  </Badge>
                                </div>
                              </div>
                              {si < journeySteps.length - 1 && (
                                <div className="hidden sm:flex flex-col items-center">
                                  <MoveRight className="w-5 h-5 text-muted-foreground/40" />
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </TabsContent>
              )
            })}
          </Tabs>
        </div>
      </section>

      {/* ─── Database Schema Grid ─────────────────────────── */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-8">
          <Badge variant="success" className="mb-3">
            <Database className="w-3.5 h-3.5" />
            {totalTables} Tabel
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Database Schema Grid</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Visualisasi semua {totalTables} tabel database yang dikelompokkan berdasarkan modul
          </p>
        </div>

        <ScrollArea className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
            {modules.map((mod) => {
              const mc = moduleColors[mod.colorKey] || palette.emerald
              return (
                <Card key={mod.id} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className={`${mc.light} border-b ${mc.border} py-3 px-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${mc.gradient} flex items-center justify-center text-white`}>
                          {mod.icon}
                        </div>
                        <div>
                          <CardTitle className="text-sm font-semibold">{mod.name}</CardTitle>
                          <CardDescription className="text-[10px]">{mod.tableCount} tabel</CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" className={`${mc.text} ${mc.border} text-[10px]`}>
                        {mod.tables.reduce((acc, t) => acc + t.columns, 0)} kolom
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                      {mod.tables.map((table) => (
                        <div
                          key={table.name}
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 transition-colors"
                        >
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${mc.gradient}`} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-mono font-medium text-foreground truncate">
                              {table.name}
                            </p>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground">
                                {table.columns} kolom
                              </span>
                              {table.fks.length > 0 && (
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] text-muted-foreground">FK:</span>
                                  {table.fks.slice(0, 2).map((fk, fi) => (
                                    <span key={fi} className="text-[9px] px-1 py-0 rounded bg-muted text-muted-foreground font-mono">
                                      {fk}
                                    </span>
                                  ))}
                                  {table.fks.length > 2 && (
                                    <span className="text-[9px] text-muted-foreground">+{table.fks.length - 2}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      </section>

      {/* ─── Token Economy ────────────────────────────────── */}
      <section className="bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/10 dark:to-background py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <Badge variant="warning" className="mb-3">
              <Coins className="w-3.5 h-3.5" />
              Token Economy
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Ekonomi Token</h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto">
              Sistem token yang terintegrasi: beli, pakai, dan kelola saldo untuk semua fitur platform
            </p>
          </div>

          {/* Token Flow Diagram */}
          <Card className="mb-8 border-0 shadow-xl overflow-hidden">
            <CardContent className="p-4 sm:p-8">
              <div className="flex flex-col items-center gap-4 sm:gap-6">
                {/* Purchase Row */}
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                  <TokenFlowNode icon={<ShoppingBag />} label="Beli Paket" color="from-amber-400 to-orange-400" />
                  <ArrowRight className="w-5 h-5 text-muted-foreground/40 hidden sm:block" />
                  <ArrowDown className="w-5 h-5 text-muted-foreground/40 sm:hidden" />
                  <TokenFlowNode icon={<Wallet />} label="Saldo Token" color="from-emerald-400 to-teal-400" sub="user_tokens" />
                  <ArrowRight className="w-5 h-5 text-muted-foreground/40 hidden sm:block" />
                  <ArrowDown className="w-5 h-5 text-muted-foreground/40 sm:hidden" />
                  <TokenFlowNode icon={<Zap />} label="Gunakan Token" color="from-rose-400 to-pink-400" sub="Deduct Balance" />
                  <ArrowRight className="w-5 h-5 text-muted-foreground/40 hidden sm:block" />
                  <ArrowDown className="w-5 h-5 text-muted-foreground/40 sm:hidden" />
                  <TokenFlowNode icon={<Receipt />} label="Transaksi Log" color="from-violet-400 to-purple-400" sub="token_transactions" />
                </div>

                {/* Admin Row */}
                <div className="flex items-center gap-3 sm:gap-4 mt-2">
                  <ArrowDown className="w-5 h-5 text-muted-foreground/40" />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                  <TokenFlowNode icon={<Shield />} label="Admin Topup" color="from-sky-400 to-cyan-400" sub="Manual Adjustment" />
                  <ArrowRight className="w-5 h-5 text-muted-foreground/40 hidden sm:block" />
                  <ArrowDown className="w-5 h-5 text-muted-foreground/40 sm:hidden" />
                  <TokenFlowNode icon={<Gift />} label="Bonus Registrasi" color="from-emerald-400 to-teal-400" sub="500 Token (500 user pertama)" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Token Costs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {tokenCosts.map((tc, i) => (
              <Card key={i} className="border shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      tc.free
                        ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600'
                        : 'bg-amber-100 dark:bg-amber-950/30 text-amber-600'
                    }`}>
                      {tc.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{tc.action}</p>
                      <p className={`text-sm font-bold mt-0.5 ${tc.free ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {tc.free ? 'GRATIS' : `${tc.cost} Token`}
                      </p>
                    </div>
                    {tc.free && (
                      <Badge variant="success" className="text-[10px]">Free</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Token Packages */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Paket Token</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {[
                { tokens: 50, price: 'Rp 10.000', popular: false },
                { tokens: 100, price: 'Rp 18.000', popular: false },
                { tokens: 200, price: 'Rp 32.000', popular: true },
                { tokens: 500, price: 'Rp 75.000', popular: false },
                { tokens: 1000, price: 'Rp 140.000', popular: false },
              ].map((pkg, i) => (
                <Card
                  key={i}
                  className={`border-2 transition-all hover:-translate-y-1 ${
                    pkg.popular
                      ? 'border-amber-400 shadow-amber-100 shadow-lg dark:shadow-amber-950/30'
                      : 'border-border shadow-sm hover:shadow-md'
                  }`}
                >
                  <CardContent className="p-4 text-center">
                    {pkg.popular && (
                      <Badge variant="warning" className="text-[10px] mb-2 mx-auto">Populer</Badge>
                    )}
                    <p className="text-2xl font-bold text-foreground">{pkg.tokens}</p>
                    <p className="text-xs text-muted-foreground">Token</p>
                    <Separator className="my-3" />
                    <p className="text-sm font-semibold text-foreground">{pkg.price}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {Math.round(parseInt(pkg.price.replace(/\D/g, '')) / pkg.tokens)} Rupiah/token
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Roles Overview ───────────────────────────────── */}
      <section className="container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-8">
          <Badge variant="rose" className="mb-3">
            <Users className="w-3.5 h-3.5" />
            4 Peran
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">User Roles & Hak Akses</h2>
          <p className="text-sm text-muted-foreground max-w-lg mx-auto">
            Empat peran pengguna dengan hak akses yang berbeda-beda
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              role: 'User (Buyer)',
              icon: <Users className="w-6 h-6" />,
              color: 'from-emerald-400 to-teal-400',
              permissions: ['Jelajahi listing', 'Bandingkan mobil', 'Favorit', 'Chat penjual', 'Buat penawaran', 'Beli mobil', 'Review'],
              bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
            },
            {
              role: 'Seller',
              icon: <Upload className="w-6 h-6" />,
              color: 'from-amber-400 to-orange-400',
              permissions: ['Semua hak User', 'Buat listing', 'Kelola listing', 'Inspeksi mobil', 'Beli token', 'Boost listing'],
              bgColor: 'bg-amber-50 dark:bg-amber-950/20',
            },
            {
              role: 'Dealer',
              icon: <Building2 className="w-6 h-6" />,
              color: 'from-rose-400 to-pink-400',
              permissions: ['Semua hak Seller', 'Dealer marketplace', 'B2B bidding', 'Inventaris', 'Tim/staff', 'Analytics'],
              bgColor: 'bg-rose-50 dark:bg-rose-950/20',
            },
            {
              role: 'Admin',
              icon: <Shield className="w-6 h-6" />,
              color: 'from-violet-400 to-purple-400',
              permissions: ['Akses penuh', 'Verifikasi KYC', 'Kelola listing', 'Topup token', 'Analytics', 'Settings', 'Broadcast'],
              bgColor: 'bg-violet-50 dark:bg-violet-950/20',
            },
          ].map((r, i) => (
            <Card key={i} className="overflow-hidden border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className={`${r.bgColor} py-4 px-5 border-b`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center text-white shadow-lg`}>
                    {r.icon}
                  </div>
                  <CardTitle className="text-sm font-bold">{r.role}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <ul className="space-y-1.5">
                  {r.permissions.map((perm, pi) => (
                    <li key={pi} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                      {perm}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── Quick Stats Summary ──────────────────────────── */}
      <section className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 py-10 sm:py-14">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center text-white">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold mb-1">101</p>
              <p className="text-xs sm:text-sm text-emerald-100/70">Database Tables</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold mb-1">81</p>
              <p className="text-xs sm:text-sm text-emerald-100/70">Frontend Pages</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold mb-1">120+</p>
              <p className="text-xs sm:text-sm text-emerald-100/70">API Endpoints</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold mb-1">15</p>
              <p className="text-xs sm:text-sm text-emerald-100/70">System Modules</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────── */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold text-foreground">AutoMarket Indonesia</span>
              <Badge variant="outline" className="text-[10px] ml-2">v2.0</Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Next.js 16</span>
              <Separator orientation="vertical" className="h-3" />
              <span>TypeScript</span>
              <Separator orientation="vertical" className="h-3" />
              <span>Tailwind CSS 4</span>
              <Separator orientation="vertical" className="h-3" />
              <span>Prisma ORM</span>
              <Separator orientation="vertical" className="h-3" />
              <span>Golang Fiber v3</span>
            </div>
          </div>
          <p className="text-center text-[10px] text-muted-foreground/50 mt-4">
            Dokumentasi sistem ini dibuat secara otomatis berdasarkan analisis 101 database tables dan 15 modul sistem
          </p>
        </div>
      </footer>
    </div>
  )
}

// ─── Architecture Diagram Components ──────────────────────
function ArchNode({
  icon,
  label,
  sub,
  color,
  size,
}: {
  icon: React.ReactNode
  label: string
  sub?: string
  color: string
  size?: 'sm' | 'lg'
}) {
  const isLg = size === 'lg'
  return (
    <div className={`flex flex-col items-center gap-2 p-${isLg ? '6' : '3'} sm:p-${isLg ? '8' : '4'} rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-shadow hover:-translate-y-0.5 ${isLg ? 'w-full max-w-sm' : ''}`}>
      <div className={`w-${isLg ? '14' : '10'} h-${isLg ? '14' : '10'} sm:w-${isLg ? '16' : '12'} sm:h-${isLg ? '16' : '12'} rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-md`}>
        {icon}
      </div>
      <div className="text-center">
        <p className={`font-semibold text-foreground ${isLg ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'}`}>{label}</p>
        {sub && <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

function ArchArrow() {
  return (
    <div className="hidden sm:flex items-center">
      <ArrowRight className="w-5 h-5 text-muted-foreground/40" />
    </div>
  )
}

function TokenFlowNode({
  icon,
  label,
  sub,
  color,
}: {
  icon: React.ReactNode
  label: string
  sub?: string
  color: string
}) {
  return (
    <div className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-slate-200/50 dark:border-slate-700/50 hover:shadow-lg hover:-translate-y-0.5 transition-all min-w-[100px] sm:min-w-[120px]">
      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-md`}>
        {icon}
      </div>
      <div className="text-center">
        <p className="text-xs sm:text-sm font-semibold text-foreground">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">{sub}</p>}
      </div>
    </div>
  )
}
