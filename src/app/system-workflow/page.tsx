'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  AlertTriangle,
  Server,
  Database,
  Code2,
  Zap,
  MessageSquare,
  Users,
  Car,
  Building2,
  Settings,
  Layers,
  GitBranch,
  Clock,
  Shield,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  TriangleAlert,
  FileText,
  Brain,
  Gauge,
  LayoutGrid,
  AlertCircle,
} from 'lucide-react'

// ─── Data: Gap Analysis Table ──────────────────────────────
const gapRows = [
  ['Arsitektur API', 'GraphQL Gateway (Fiber)', 'REST API (Fiber) — 25 endpoint sudah ada'],
  ['Database', 'Schema Isolation per service', 'Single database, GORM AutoMigrate'],
  ['Foreign Key', '❌ NO FK — UUID reference only', '✅ 27 GORM foreignKey relations'],
  ['Frontend', 'GraphQL Client', '131 REST API routes + Supabase client'],
  ['Auth', 'JWT dari user-service', 'JWT sudah ada + Google OAuth'],
  ['ORM', 'Raw SQL (no FK)', 'GORM dengan relations'],
  ['Deployment', '6 Cloud Run containers', '1 binary (belum deploy)'],
  ['Caching', 'Redis + DataLoader', 'Redis connected (belum terpakai penuh)'],
  ['Storage', 'GCS', 'Belum diimplementasi (config ada)'],
  ['Event Bus', 'Pub/Sub (Phase 3)', 'Tidak ada'],
  ['Query Join', 'GraphQL resolver join', 'GORM Preload / JOIN SQL'],
  ['Location', 'Tidak ada di PRD', '4 tabel (Country, Province, City, District)'],
]

// ─── Data: Architecture Choices ────────────────────────────
const archChoices = [
  {
    id: 'A',
    title: 'IKUTI PRD',
    subtitle: 'GraphQL + No FK + Microservices',
    color: 'amber',
    borderClass: 'border-amber-500/40',
    tagClass: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    pros: [
      'Sesuai PRD 100%',
      'Schema isolation = true independence',
      'GraphQL resolver = flexible data fetching',
      'Siap scale ke 6 containers',
    ],
    cons: [
      'REWRITE seluruh backend (101 models → ulang)',
      'REWRITE seluruh frontend (131 REST routes → GraphQL client)',
      'Tidak ada GORM relations → manual join di resolver',
      'Timeline: 8-12 minggu',
      'Higher complexity untuk team kecil',
    ],
  },
  {
    id: 'B',
    title: 'HYBRID',
    subtitle: 'REST + Clean Architecture + Modular Monolith',
    color: 'emerald',
    borderClass: 'border-emerald-500/40',
    tagClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    pros: [
      '101 models sudah siap (tinggal restructure)',
      '25 API endpoints sudah jalan',
      'Frontend 131 routes tinggal redirect ke Go backend',
      'GORM relations → data consistency otomatis',
      'Timeline: 2-4 minggu',
    ],
    cons: [
      'Tidak sesuai PRD (GraphQL)',
      'Single DB = tidak true microservice',
      'GORM FK = coupling antar tabel',
      'Perlu refactor nanti untuk scale',
    ],
  },
  {
    id: 'C',
    title: 'INCREMENTAL',
    subtitle: 'REST sekarang → GraphQL nanti',
    color: 'blue',
    borderClass: 'border-blue-500/40',
    tagClass: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    pros: [
      'Mulai dengan REST + GORM (sudah ada)',
      'Tambahkan GraphQL gateway di depan (wrapper)',
      'Ganti ke No FK secara bertahap per service',
      'Extract service satu per satu',
      'Timeline: 4-6 minggu untuk MVP, 8-12 minggu untuk full',
    ],
    cons: [
      '2 system API (REST + GraphQL) sementara',
      'Migration complexity bertahap',
      'Perlu maintain 2 client (REST + GraphQL) sementara',
    ],
  },
]

// ─── Data: Table Coverage per Service ──────────────────────
interface TableCoverageRow {
  tableName: string
  prd: string
  backendModel: string
  status: string
}

const serviceCoverage: {
  serviceName: string
  tableCount: string
  rows: TableCoverageRow[]
}[] = [
  {
    serviceName: 'USER SERVICE',
    tableCount: '8 tables',
    rows: [
      { tableName: 'profiles', prd: '✅', backendModel: 'Profile (user.go)', status: '✅ Ready' },
      { tableName: 'user_settings', prd: '✅', backendModel: 'UserSettings (user.go)', status: '✅ Ready' },
      { tableName: 'user_sessions', prd: '✅', backendModel: 'UserSession (user.go)', status: '✅ Ready' },
      { tableName: 'user_tokens', prd: '✅', backendModel: 'UserToken (token.go)', status: '✅ Ready' },
      { tableName: 'kyc_verifications', prd: '✅', backendModel: 'KycVerification (admin.go)', status: '✅ Ready' },
      { tableName: 'user_verifications', prd: '✅', backendModel: 'UserVerification (user.go)', status: '✅ Ready' },
      { tableName: 'user_addresses', prd: '✅', backendModel: 'UserAddress (user.go)', status: '✅ Ready' },
      { tableName: 'user_documents', prd: '✅', backendModel: 'UserDocument (user.go)', status: '✅ Ready' },
    ],
  },
  {
    serviceName: 'LISTING SERVICE',
    tableCount: '18 tables',
    rows: [
      { tableName: 'car_listings', prd: '✅', backendModel: 'CarListing (listing.go)', status: '✅ Ready — 45+ columns' },
      { tableName: 'car_images', prd: '✅', backendModel: 'CarImage (listing.go)', status: '✅ Ready' },
      { tableName: 'car_features', prd: '✅', backendModel: 'CarFeatures (listing.go)', status: '✅ Ready — 18 boolean fields' },
      { tableName: 'car_feature_values', prd: '✅', backendModel: 'CarFeatureValue (listing.go)', status: '✅ Ready' },
      { tableName: 'car_documents', prd: '✅', backendModel: 'CarDocument (listing.go)', status: '✅ Ready' },
      { tableName: 'car_inspections', prd: '✅', backendModel: 'CarInspection (inspection.go)', status: '✅ Ready' },
      { tableName: 'inspection_results', prd: '✅', backendModel: 'InspectionResult (inspection.go)', status: '✅ Ready' },
      { tableName: 'inspection_items', prd: '✅', backendModel: 'InspectionItem (inspection.go)', status: '✅ Ready' },
      { tableName: 'inspection_categories', prd: '✅', backendModel: 'InspectionCategory (inspection.go)', status: '✅ Ready' },
      { tableName: 'car_brands', prd: '✅', backendModel: 'Brand (vehicle.go)', status: '✅ Ready' },
      { tableName: 'car_models', prd: '✅', backendModel: 'CarModel (vehicle.go)', status: '✅ Ready' },
      { tableName: 'car_variants', prd: '✅', backendModel: 'CarVariant (vehicle.go)', status: '✅ Ready' },
      { tableName: 'car_generations', prd: '✅', backendModel: 'CarGeneration (vehicle.go)', status: '✅ Ready' },
      { tableName: 'car_colors', prd: '✅', backendModel: 'CarColor (vehicle.go)', status: '✅ Ready' },
      { tableName: 'car_body_types', prd: '✅', backendModel: 'CarBodyType (vehicle.go)', status: '✅ Ready' },
      { tableName: 'car_fuel_types', prd: '✅', backendModel: 'CarFuelType (vehicle.go)', status: '✅ Ready' },
      { tableName: 'car_transmissions', prd: '✅', backendModel: 'CarTransmission (vehicle.go)', status: '✅ Ready' },
      { tableName: 'car_videos', prd: '✅', backendModel: 'CarVideo (listing.go)', status: '✅ Ready' },
    ],
  },
  {
    serviceName: 'INTERACTION SERVICE',
    tableCount: '7 tables',
    rows: [
      { tableName: 'car_reviews', prd: '✅', backendModel: 'CarReview (rental.go)', status: '⚠️ DUPLICATE — also in review.go' },
      { tableName: 'review_images', prd: '✅', backendModel: 'ReviewImage (rental.go)', status: '⚠️ DUPLICATE — also in review.go' },
      { tableName: 'review_votes', prd: '✅', backendModel: 'ReviewVote (rental.go)', status: '⚠️ DUPLICATE — also in review.go' },
      { tableName: 'car_favorites', prd: '✅', backendModel: 'CarFavorite (listing.go)', status: '⚠️ DUPLICATE — also Favorites in analytics.go' },
      { tableName: 'recent_views', prd: '✅', backendModel: 'RecentView (listing.go)', status: '✅ Ready' },
      { tableName: 'recommendations', prd: '✅', backendModel: 'Recommendation (analytics.go)', status: '✅ Ready' },
      { tableName: 'trending_cars', prd: '✅', backendModel: 'TrendingCar (listing.go)', status: '✅ Ready' },
    ],
  },
  {
    serviceName: 'TRANSACTION SERVICE',
    tableCount: '14 tables',
    rows: [
      { tableName: 'orders', prd: '✅', backendModel: 'Order (payment.go)', status: '✅ Ready' },
      { tableName: 'order_items', prd: '✅', backendModel: 'OrderItem (payment.go)', status: '✅ Ready' },
      { tableName: 'payments', prd: '✅', backendModel: 'Payment (payment.go)', status: '✅ Ready' },
      { tableName: 'transactions', prd: '✅', backendModel: 'Transaction (payment.go)', status: '✅ Ready' },
      { tableName: 'refunds', prd: '✅', backendModel: 'Refund (payment.go)', status: '✅ Ready' },
      { tableName: 'invoices', prd: '✅', backendModel: 'Invoice (payment.go)', status: '✅ Ready' },
      { tableName: 'escrow_accounts', prd: '✅', backendModel: 'EscrowAccount (payment.go)', status: '✅ Ready' },
      { tableName: 'token_transactions', prd: '✅', backendModel: 'TokenTransaction (token.go)', status: '✅ Ready' },
      { tableName: 'topup_requests', prd: '✅', backendModel: 'TopupRequest (token.go)', status: '✅ Ready' },
      { tableName: 'token_packages', prd: '✅', backendModel: 'TokenPackage (token.go)', status: '✅ Ready' },
      { tableName: 'rental_bookings', prd: '✅', backendModel: 'RentalBooking (rental.go)', status: '✅ Ready' },
      { tableName: 'rental_payments', prd: '✅', backendModel: 'RentalPayment (rental.go)', status: '✅ Ready' },
      { tableName: 'rental_reviews', prd: '✅', backendModel: 'RentalReview (rental.go)', status: '✅ Ready' },
      { tableName: 'rental_insurance', prd: '✅', backendModel: 'RentalInsurance (rental.go)', status: '✅ Ready' },
    ],
  },
  {
    serviceName: 'BUSINESS SERVICE',
    tableCount: '14 tables',
    rows: [
      { tableName: 'dealers', prd: '✅', backendModel: 'Dealer (dealer.go)', status: '✅ Ready' },
      { tableName: 'dealer_staff', prd: '✅', backendModel: 'DealerStaff (dealer.go)', status: '✅ Ready' },
      { tableName: 'dealer_reviews', prd: '✅', backendModel: 'DealerReview (dealer.go)', status: '✅ Ready' },
      { tableName: 'dealer_branches', prd: '✅', backendModel: 'DealerBranch (dealer.go)', status: '✅ Ready' },
      { tableName: 'dealer_documents', prd: '✅', backendModel: 'DealerDocument (dealer.go)', status: '✅ Ready' },
      { tableName: 'dealer_inventory', prd: '✅', backendModel: 'DealerInventory (dealer.go)', status: '✅ Ready' },
      { tableName: 'dealer_offers', prd: '✅', backendModel: 'DealerOffer (dealer.go)', status: '✅ Ready' },
      { tableName: 'dealer_offer_histories', prd: '✅', backendModel: 'DealerOfferHistory (dealer.go)', status: '✅ Ready' },
      { tableName: 'banners', prd: '✅', backendModel: 'Banner (admin.go)', status: '✅ Ready' },
      { tableName: 'broadcasts', prd: '✅', backendModel: 'Broadcast (notification.go)', status: '✅ Ready' },
      { tableName: 'categories', prd: '✅', backendModel: 'Category (vehicle.go)', status: '✅ Ready' },
      { tableName: 'coupons', prd: '✅', backendModel: 'Coupon (payment.go)', status: '✅ Ready' },
      { tableName: 'support_tickets', prd: '✅', backendModel: 'SupportTicket (admin.go)', status: '✅ Ready' },
      { tableName: 'support_ticket_messages', prd: '✅', backendModel: 'SupportTicketMessage (admin.go)', status: '✅ Ready' },
    ],
  },
  {
    serviceName: 'SYSTEM SERVICE',
    tableCount: '12 tables',
    rows: [
      { tableName: 'messages', prd: '✅', backendModel: 'Message (chat.go)', status: '✅ Ready' },
      { tableName: 'conversations', prd: '✅', backendModel: 'Conversation (chat.go)', status: '✅ Ready' },
      { tableName: 'message_attachments', prd: '✅', backendModel: 'MessageAttachment (chat.go)', status: '✅ Ready' },
      { tableName: 'notifications', prd: '✅', backendModel: 'Notification (notification.go)', status: '✅ Ready — split jadi 2 tabel' },
      { tableName: 'notification_logs', prd: '✅', backendModel: 'NotificationLog (notification.go)', status: '✅ Ready' },
      { tableName: 'notification_templates', prd: '✅', backendModel: 'NotificationTemplate (notification.go)', status: '✅ Ready' },
      { tableName: 'analytics_events', prd: '✅', backendModel: 'AnalyticsEvent (analytics.go)', status: '✅ Ready' },
      { tableName: 'analytics_clicks', prd: '✅', backendModel: 'AnalyticsClick (analytics.go)', status: '✅ Ready' },
      { tableName: 'analytics_conversions', prd: '✅', backendModel: 'AnalyticsConversion (analytics.go)', status: '✅ Ready' },
      { tableName: 'analytics_page_views', prd: '✅', backendModel: 'AnalyticsPageView (analytics.go)', status: '✅ Ready' },
      { tableName: 'search_logs', prd: '✅', backendModel: 'SearchLog (analytics.go)', status: '✅ Ready' },
      { tableName: 'activity_logs', prd: '✅', backendModel: 'ActivityLog (admin.go)', status: '✅ Ready' },
    ],
  },
]

// ─── Data: Extra Tables Not in PRD ─────────────────────────
const extraTables = [
  ['User', 'user.go', 'Auth table (implicit, PRD only has profiles)'],
  ['SystemSetting', 'admin.go', 'Admin configuration key-value store'],
  ['Report', 'admin.go', 'User content reporting'],
  ['TokenSetting', 'token.go', 'Token pricing configuration'],
  ['BoostSetting', 'token.go', 'Listing boost configuration'],
  ['PaymentMethod', 'payment.go', 'Saved payment methods'],
  ['Withdrawal', 'payment.go', 'Seller withdrawal requests'],
  ['FeeSetting', 'payment.go', 'Platform fee configuration'],
  ['Country', 'location.go', 'Geographic master data'],
  ['Province', 'location.go', 'Geographic master data'],
  ['City', 'location.go', 'Geographic master data'],
  ['District', 'location.go', 'Geographic master data'],
  ['InspectionPhoto', 'inspection.go', 'Inspection photo evidence'],
  ['InspectionCertificate', 'inspection.go', 'Certificate tracking'],
  ['UserNotification', 'notification.go', 'Per-user notification delivery'],
  ['FeatureCategory', 'vehicle.go', 'Feature hierarchy (3-level)'],
  ['FeatureGroup', 'vehicle.go', 'Feature hierarchy (3-level)'],
  ['FeatureItem', 'vehicle.go', 'Feature hierarchy (3-level)'],
  ['CarRentalPrice', 'listing.go', 'Rental pricing per listing'],
  ['CarPriceHistory', 'listing.go', 'Price change audit trail'],
  ['CarStatusHistory', 'listing.go', 'Status change audit trail'],
  ['CarView', 'listing.go', 'View tracking'],
  ['CarCompare', 'listing.go', 'Car comparison'],
  ['RentalAvailability', 'rental.go', 'Calendar availability'],
  ['DealerMarketplaceSetting', 'dealer.go', 'B2B marketplace config'],
  ['DealerMarketplaceFavorite', 'dealer.go', 'B2B favorites'],
  ['DealerMarketplaceView', 'dealer.go', 'B2B view tracking'],
]

// ─── Data: Duplicate & Bug List ────────────────────────────
const bugItems = [
  { severity: 'critical', emoji: '🔴', text: 'CarReview duplicate: review.go vs rental.go → COMPILE ERROR' },
  { severity: 'critical', emoji: '🔴', text: 'ReviewImage duplicate: review.go vs rental.go → COMPILE ERROR' },
  { severity: 'critical', emoji: '🔴', text: 'ReviewVote duplicate: review.go vs rental.go → COMPILE ERROR' },
  { severity: 'warning', emoji: '⚠️', text: 'Favorites vs CarFavorite: analytics.go vs listing.go → 2 tabel terpisah untuk 1 konsep' },
  { severity: 'warning', emoji: '⚠️', text: 'Token deduction not atomic in CreateListing controller' },
  { severity: 'warning', emoji: '⚠️', text: 'Hardcoded tokenCost = 10 in controller (seharusnya dari TokenSetting)' },
  { severity: 'warning', emoji: '⚠️', text: 'Admin routes group assigned to blank identifier (_ = auth.Group(...))' },
  { severity: 'warning', emoji: '⚠️', text: 'MinIO/GCS config exists but no storage service implemented' },
  { severity: 'warning', emoji: '⚠️', text: 'Invoice.Items using *string (jsonb) instead of proper struct' },
]

// ─── Data: Frontend Impact Table ───────────────────────────
const frontendImpactRows = [
  ['API Calls per page', '3-8 REST calls', '1 GraphQL query'],
  ['Data fetching', "fetch('/api/listings')", 'useQuery(getCars, {variables})'],
  ['State management', 'React Query + SWR', 'Apollo Client / urql'],
  ['Bundle size', '~15KB (fetch)', '~45KB (graphql client)'],
  ['Developer exp', 'Simpler, familiar', 'Learning curve, schema'],
  ['131 routes', 'Redirect ke Go backend', 'REWRITE semua ke GraphQL'],
  ['Components', 'Tidak perlu diubah', 'Perlu diubah semua data fetching'],
]

// ─── Data: Discussion Points ───────────────────────────────
const decisions = [
  {
    number: 1,
    title: 'GraphQL atau REST?',
    content:
      'PRD mengusulkan GraphQL. Tapi backend sudah REST. Pilihan:',
    options: [
      'A) Rewrite ke GraphQL (sesuai PRD, 8-12 minggu)',
      'B) Pertahankan REST, tambah GraphQL layer nanti (pragmatis, 2-4 minggu MVP)',
      'C) REST untuk MVP, GraphQL untuk v2',
    ],
  },
  {
    number: 2,
    title: 'Foreign Key atau No FK?',
    content:
      'PRD bilang NO FK. Tapi 27 GORM foreignKey sudah ada.',
    options: [
      'A) Hapus semua FK, pakai UUID reference manual (sesuai PRD, banyak rewrite)',
      'B) Pertahankan GORM FK, hapus DB-level FK constraint (middle ground)',
      'C) Pertahankan semua FK seperti sekarang (paling cepat)',
    ],
  },
  {
    number: 3,
    title: 'Schema Isolation atau Single DB?',
    content:
      'PRD mengusulkan CREATE SCHEMA per service. Sekarang single public schema.',
    options: [
      'A) 6 PostgreSQL schemas (sesuai PRD, perlu migration besar)',
      'B) Single DB, pisah pakai folder/module di code (pragmatis)',
      'C) Mulai single, schema isolation saat extract service',
    ],
  },
  {
    number: 4,
    title: 'Microservice dari awal atau Modular Monolith dulu?',
    content:
      'PRD Phase 1 bilang "monolith microservice lite".',
    options: [
      'A) 6 service dari awal (6 repositori, 6 container, sesuai PRD)',
      'B) Modular monolith, 1 binary, clean architecture per module (paling cepat)',
      'C) 2 service dulu: core (user+listing+interaction) + support (sisanya)',
    ],
  },
  {
    number: 5,
    title: '27 tabel extra (ada di backend, tidak di PRD) — hapus atau dokumentasi?',
    content:
      'Banyak tabel penting: locations (4), dealer_marketplace (3), settings (4), dll',
    options: [
      'A) Hapus yang tidak perlu, sisakan yang penting',
      'B) Masukkan semua ke PRD (update PRD)',
      'C) Pertahankan semua, PRD dianggap minimum viable',
    ],
  },
  {
    number: 6,
    title: 'Tabel duplikat — versi mana yang dipakai?',
    content:
      'CarReview: review.go (sederhana) vs rental.go (lengkap dengan order_id, pros/cons, anonymous)',
    options: [
      'A) Pakai rental.go version (lebih lengkap), hapus review.go',
      'B) Pakai review.go version (lebih clean), hapus dari rental.go',
      'C) Merge keduanya jadi 1 struct yang komprehensif',
    ],
  },
  {
    number: 7,
    title: 'Timeline & Prioritas?',
    content:
      'Fitur apa yang pertama kali dibangun untuk user bisa pakai:',
    options: [
      'A) Auth + Listing + Search (MVP minimum)',
      'B) Auth + Listing + Dealer + Token (MVP marketplace)',
      'C) Semua 6 service sekaligus (sesuai PRD, lebih lama)',
    ],
  },
]

// ─── Status Badge Helper ───────────────────────────────────
function StatusBadge({ text }: { text: string }) {
  if (text.startsWith('✅'))
    return (
      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs whitespace-nowrap">
        {text}
      </Badge>
    )
  if (text.startsWith('⚠️'))
    return (
      <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs whitespace-nowrap">
        {text}
      </Badge>
    )
  return (
    <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/20 text-xs whitespace-nowrap">
      {text}
    </Badge>
  )
}

// ─── Section Title Component ───────────────────────────────
function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 border border-emerald-500/20 flex items-center justify-center">
        {icon}
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
        {children}
      </h2>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────
export default function PrdAnalysisPage() {
  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen flex flex-col">
      {/* ═══════════════════════════════════════════════════════
          SECTION 1: HERO
      ═══════════════════════════════════════════════════════ */}
      <header className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-emerald-950/20 to-zinc-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 mb-8">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs text-amber-400 font-medium tracking-wide">
                PRODUCT REQUIREMENTS DOCUMENT
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
              <span className="text-zinc-100">PRD ANALYSIS</span>{' '}
              <span className="text-amber-400">—</span>{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                DISCUSSION
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
              AutoMarket Indonesia — Deep Dive Arsitektur &amp; Database
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              {[
                { icon: <Server className="w-4 h-4" />, value: '6 Services' },
                { icon: <Database className="w-4 h-4" />, value: '73 Tables' },
                { icon: <Zap className="w-4 h-4" />, value: '131 API Routes' },
                { icon: <Code2 className="w-4 h-4" />, value: '101 Go Models' },
                { icon: <GitBranch className="w-4 h-4" />, value: 'GraphQL vs REST' },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900/80 border border-zinc-800"
                >
                  <span className="text-emerald-400">{stat.icon}</span>
                  <span className="text-sm text-zinc-300 font-medium">{stat.value}</span>
                </div>
              ))}
            </div>

            <p className="text-sm text-amber-400/80 italic">
              ⏸️ MODE DISKUSI — Belum ada implementasi. Kita analisa dulu.
            </p>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16 space-y-20 flex-1">

        {/* ─── SECTION 2: GAP ANALYSIS ─────────────────── */}
        <section>
          <SectionTitle icon={<Brain className="w-5 h-5 text-emerald-400" />}>
            PRD vs REALITY — Gap Analysis
          </SectionTitle>

          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-zinc-200">Perbandingan PRD dengan Kondisi Existing</CardTitle>
              <CardDescription className="text-zinc-500">
                Setiap aspek dibandingkan antara dokumen PRD dan kondisi backend yang sudah dibangun
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400 font-semibold text-sm py-3 px-4 w-40">
                        Aspek
                      </TableHead>
                      <TableHead className="text-zinc-400 font-semibold text-sm py-3 px-4">
                        PRD (Diusulkan)
                      </TableHead>
                      <TableHead className="text-zinc-400 font-semibold text-sm py-3 px-4">
                        Realita (Existing)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gapRows.map((row, i) => (
                      <TableRow key={i} className="border-zinc-800 hover:bg-zinc-800/40 transition-colors">
                        <TableCell className="py-3 px-4 text-sm font-medium text-zinc-200">
                          {row[0]}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-sm text-amber-400/90 font-mono">
                          {row[1]}
                        </TableCell>
                        <TableCell className="py-3 px-4 text-sm text-emerald-400/90 font-mono">
                          {row[2]}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Alert className="mt-6 border-red-500/40 bg-red-500/5">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <AlertTitle className="text-red-400 font-semibold">⚠️ Gap Terbesar</AlertTitle>
            <AlertDescription className="text-zinc-400 text-sm mt-1">
              PRD mengusulkan GraphQL + No FK + Schema Isolation, tapi backend sudah dibangun dengan REST + GORM FK + Single DB. Migrasi berarti <span className="text-red-400 font-semibold">REWRITE hampir seluruh backend</span>.
            </AlertDescription>
          </Alert>
        </section>

        <Separator className="bg-zinc-800/60" />

        {/* ─── SECTION 3: 3 PILIHAN ARSITEKTUR ─────────── */}
        <section>
          <SectionTitle icon={<GitBranch className="w-5 h-5 text-emerald-400" />}>
            3 Pilihan Arsitektur
          </SectionTitle>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {archChoices.map((choice) => (
              <Card key={choice.id} className={`bg-zinc-900 ${choice.borderClass} border-2 flex flex-col`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={choice.tagClass}>
                      Pilihan {choice.id}
                    </Badge>
                    <span className="text-2xl font-black text-zinc-700">{choice.id}</span>
                  </div>
                  <CardTitle className="text-lg text-zinc-100 mt-2">{choice.title}</CardTitle>
                  <CardDescription className="text-zinc-500 text-xs">{choice.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Kelebihan</span>
                    </div>
                    <ul className="space-y-1.5">
                      {choice.pros.map((pro, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                          <span className="text-emerald-500 mt-0.5">+</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Separator className="bg-zinc-800" />
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <ThumbsDown className="w-3.5 h-3.5 text-red-400" />
                      <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Kekurangan</span>
                    </div>
                    <ul className="space-y-1.5">
                      {choice.cons.map((con, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                          <span className="text-red-500 mt-0.5">−</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="bg-zinc-800/60" />

        {/* ─── SECTION 4: DATABASE STRATEGY DEEP DIVE ──── */}
        <section>
          <SectionTitle icon={<Database className="w-5 h-5 text-emerald-400" />}>
            Database Strategy — Deep Dive
          </SectionTitle>

          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <CardContent className="p-0">
              <Tabs defaultValue="graphql" className="w-full">
                <TabsList className="w-full justify-start bg-zinc-900 border-b border-zinc-800 rounded-none p-0 h-auto gap-0">
                  <TabsTrigger
                    value="graphql"
                    className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:text-amber-400 data-[state=active]:shadow-none text-zinc-500"
                  >
                    GraphQL Resolver (PRD)
                  </TabsTrigger>
                  <TabsTrigger
                    value="gorm"
                    className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 data-[state=active]:shadow-none text-zinc-500"
                  >
                    GORM Preload (Existing)
                  </TabsTrigger>
                  <TabsTrigger
                    value="hybrid"
                    className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-cyan-500 data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 data-[state=active]:shadow-none text-zinc-500"
                  >
                    Hybrid (Recommended)
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="graphql" className="p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                      PRD Approach
                    </Badge>
                    <span className="text-sm text-zinc-500">No FK + GraphQL resolver join</span>
                  </div>
                  <p className="text-sm text-zinc-400">
                    Dengan <span className="text-amber-400 font-mono">No Foreign Key</span>, setiap relasi diselesaikan di GraphQL resolver layer. Client minta data, gateway resolves dari masing-masing service secara paralel.
                  </p>
                  <pre className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 overflow-x-auto text-xs font-mono text-zinc-400 leading-relaxed">
                    <code>{`# Client asks: getCarDetail(id: "abc")
# GraphQL Gateway resolves:

1. listing-service: SELECT * FROM car_listings WHERE id = 'abc'
2. user-service:    SELECT * FROM profiles WHERE id = '{user_id dari step 1}'
3. listing-service: SELECT * FROM car_images WHERE car_listing_id = 'abc'
4. listing-service: SELECT * FROM car_inspections WHERE car_listing_id = 'abc'

# Gateway merges results → single JSON response`}</code>
                  </pre>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <p className="text-xs font-bold text-emerald-400 mb-2">✅ Kelebihan</p>
                      <ul className="space-y-1 text-xs text-zinc-400">
                        <li>• True service independence</li>
                        <li>• Schema isolation per service</li>
                        <li>• Flexible data fetching (client-driven)</li>
                      </ul>
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                      <p className="text-xs font-bold text-red-400 mb-2">❌ Kekurangan</p>
                      <ul className="space-y-1 text-xs text-zinc-400">
                        <li>• N+1 problem (perlu DataLoader)</li>
                        <li>• 3-5 network calls per query</li>
                        <li>• Higher latency vs SQL JOIN</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="gorm" className="p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      Existing Approach
                    </Badge>
                    <span className="text-sm text-zinc-500">GORM Preload dengan SQL JOIN</span>
                  </div>
                  <p className="text-sm text-zinc-400">
                    GORM <span className="text-emerald-400 font-mono">Preload</span> menghasilkan SQL JOIN yang efisien. Semua data diambil dalam 1 query ke single database.
                  </p>
                  <pre className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 overflow-x-auto text-xs font-mono text-zinc-400 leading-relaxed">
                    <code>{`// Single SQL with JOIN
db.Preload("Brand").Preload("Model").Preload("Images").
  Preload("User").Preload("Dealer").
  First(&listing, id)
// → 1 query with LEFT JOINs = fast`}</code>
                  </pre>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                      <p className="text-xs font-bold text-emerald-400 mb-2">✅ Kelebihan</p>
                      <ul className="space-y-1 text-xs text-zinc-400">
                        <li>• ACID transactions</li>
                        <li>• Fast JOIN (1 query)</li>
                        <li>• Data consistency otomatis</li>
                        <li>• Simple code</li>
                      </ul>
                    </div>
                    <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                      <p className="text-xs font-bold text-red-400 mb-2">❌ Kekurangan</p>
                      <ul className="space-y-1 text-xs text-zinc-400">
                        <li>• Single DB (coupling)</li>
                        <li>• Service coupling via FK</li>
                        <li>• Harder to split later</li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="hybrid" className="p-6 space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/20">
                      Recommended
                    </Badge>
                    <span className="text-sm text-zinc-500">GORM dulu → GraphQL nanti, bertahap</span>
                  </div>
                  <p className="text-sm text-zinc-400">
                    Pertahankan GORM untuk Phase 1 (cepat, sudah ada). Persiapkan migrasi ke GraphQL di Phase 2-3.
                  </p>

                  <div className="space-y-3">
                    {[
                      {
                        phase: 'Phase 1',
                        desc: 'GORM with soft relations (no FK constraints in DB, tapi GORM tags tetap ada)',
                        badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                      },
                      {
                        phase: 'Phase 2',
                        desc: 'Add GraphQL layer on top (gqlgen) sebagai wrapper di depan REST',
                        badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                      },
                      {
                        phase: 'Phase 3',
                        desc: 'Extract services, remove GORM relations, pakai resolver joins',
                        badgeClass: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
                      },
                    ].map((item) => (
                      <div key={item.phase} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                        <Badge variant="outline" className={`${item.badgeClass} text-xs whitespace-nowrap mt-0.5`}>
                          {item.phase}
                        </Badge>
                        <p className="text-sm text-zinc-400">{item.desc}</p>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs text-zinc-500 mt-2 font-medium">Contoh implementasi Phase 1:</p>
                  <pre className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 overflow-x-auto text-xs font-mono text-zinc-400 leading-relaxed">
                    <code>{`// Phase 1: GORM without DB-level FK
type CarListing struct {
    ID       uuid.UUID  \`gorm:"primaryKey"\`
    BrandID  *uuid.UUID \`gorm:"index"\`       // no foreignKey tag
    Brand    *Brand      \`gorm:"foreignKey:BrandID"\` // GORM-level only
}`}</code>
                  </pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        <Separator className="bg-zinc-800/60" />

        {/* ─── SECTION 5: TABLE COVERAGE ───────────────── */}
        <section>
          <SectionTitle icon={<LayoutGrid className="w-5 h-5 text-emerald-400" />}>
            Table Coverage — PRD vs Existing
          </SectionTitle>

          <Accordion type="multiple" defaultValue={serviceCoverage.map((_, i) => `svc-${i}`)}>
            {serviceCoverage.map((svc, idx) => (
              <AccordionItem key={idx} value={`svc-${idx}`} className="border-zinc-800">
                <AccordionTrigger className="hover:no-underline hover:bg-zinc-900/50 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                      {svc.tableCount}
                    </Badge>
                    <span className="font-semibold text-zinc-200">{svc.serviceName}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <Card className="bg-zinc-900/80 border-zinc-800 overflow-hidden">
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-zinc-800 hover:bg-transparent">
                              <TableHead className="text-zinc-500 text-xs py-2.5 px-4">Table Name</TableHead>
                              <TableHead className="text-zinc-500 text-xs py-2.5 px-4">PRD</TableHead>
                              <TableHead className="text-zinc-500 text-xs py-2.5 px-4">Backend Model</TableHead>
                              <TableHead className="text-zinc-500 text-xs py-2.5 px-4">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {svc.rows.map((row, i) => (
                              <TableRow key={i} className="border-zinc-800/60 hover:bg-zinc-800/30 transition-colors">
                                <TableCell className="py-2.5 px-4 text-sm font-mono text-zinc-300">{row.tableName}</TableCell>
                                <TableCell className="py-2.5 px-4 text-sm text-center">{row.prd}</TableCell>
                                <TableCell className="py-2.5 px-4 text-sm font-mono text-zinc-400">{row.backendModel}</TableCell>
                                <TableCell className="py-2.5 px-4">
                                  <StatusBadge text={row.status} />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-6 flex items-center gap-3">
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-sm px-4 py-1.5">
              73/73 tables covered (100%)
            </Badge>
            <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-sm px-4 py-1.5">
              +20 extra structs not in PRD
            </Badge>
            <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-sm px-4 py-1.5">
              +4 duplicates to fix
            </Badge>
          </div>
        </section>

        <Separator className="bg-zinc-800/60" />

        {/* ─── SECTION 6: EXTRA TABLES NOT IN PRD ──────── */}
        <section>
          <SectionTitle icon={<AlertCircle className="w-5 h-5 text-emerald-400" />}>
            What&apos;s Missing from PRD — 27 Extra Tables
          </SectionTitle>

          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-zinc-200">
                Struct yang ada di backend tapi TIDAK tercantum di PRD
              </CardTitle>
              <CardDescription className="text-zinc-500 text-xs">
                Tabel-tabel ini sudah dibangun di Go backend karena kebutuhan fitur yang sudah ada
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[500px]">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 hover:bg-transparent">
                        <TableHead className="text-zinc-500 text-xs py-2.5 px-4 w-48">Struct</TableHead>
                        <TableHead className="text-zinc-500 text-xs py-2.5 px-4 w-32">File</TableHead>
                        <TableHead className="text-zinc-500 text-xs py-2.5 px-4">Why it exists</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {extraTables.map((row, i) => (
                        <TableRow key={i} className="border-zinc-800/60 hover:bg-zinc-800/30 transition-colors">
                          <TableCell className="py-2.5 px-4 text-sm font-mono text-amber-400">{row[0]}</TableCell>
                          <TableCell className="py-2.5 px-4 text-sm font-mono text-zinc-500">{row[1]}</TableCell>
                          <TableCell className="py-2.5 px-4 text-xs text-zinc-400">{row[2]}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Alert className="mt-6 border-amber-500/30 bg-amber-500/5">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <AlertTitle className="text-amber-400 font-semibold">❓ Pertanyaan</AlertTitle>
            <AlertDescription className="text-zinc-400 text-sm mt-1">
              27 tabel ini hapus atau masukkan ke PRD? Banyak yang penting untuk fitur yang sudah ada di frontend.
            </AlertDescription>
          </Alert>
        </section>

        <Separator className="bg-zinc-800/60" />

        {/* ─── SECTION 7: DUPLICATE & BUG LIST ─────────── */}
        <section>
          <SectionTitle icon={<TriangleAlert className="w-5 h-5 text-emerald-400" />}>
            Duplicate &amp; Bug List
          </SectionTitle>

          <Card className="bg-zinc-900 border-red-500/20 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="w-5 h-5" />
                Masalah yang Harus Diperbaiki
              </CardTitle>
              <CardDescription className="text-zinc-500 text-xs">
                {bugItems.filter(b => b.severity === 'critical').length} critical errors, {bugItems.filter(b => b.severity === 'warning').length} warnings
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-800/60">
                {bugItems.map((item, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 px-6 py-3.5 transition-colors ${
                      item.severity === 'critical' ? 'bg-red-500/5' : 'hover:bg-zinc-800/30'
                    }`}
                  >
                    <span className="text-base flex-shrink-0 mt-0.5">{item.emoji}</span>
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="text-sm text-zinc-300">{item.text}</span>
                      {item.severity === 'critical' && (
                        <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] font-bold uppercase flex-shrink-0">
                          CRITICAL
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="bg-zinc-800/60" />

        {/* ─── SECTION 8: FRONTEND IMPACT ANALYSIS ─────── */}
        <section>
          <SectionTitle icon={<Gauge className="w-5 h-5 text-emerald-400" />}>
            Frontend Impact Analysis
          </SectionTitle>

          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-zinc-200">
                Dampak Pilihan Arsitektur terhadap Frontend
              </CardTitle>
              <CardDescription className="text-zinc-500 text-xs">
                Frontend saat ini sudah punya 131 REST API routes — pengaruh besar tergantung pilihan
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-500 text-xs py-3 px-4 w-44">Aspek</TableHead>
                      <TableHead className="text-zinc-500 text-xs py-3 px-4">
                        Jika REST (Sekarang)
                      </TableHead>
                      <TableHead className="text-zinc-500 text-xs py-3 px-4">
                        Jika GraphQL (PRD)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {frontendImpactRows.map((row, i) => (
                      <TableRow key={i} className="border-zinc-800/60 hover:bg-zinc-800/30 transition-colors">
                        <TableCell className="py-3 px-4 text-sm font-medium text-zinc-200">{row[0]}</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-emerald-400 font-mono">{row[1]}</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-amber-400 font-mono">{row[2]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Alert className="mt-6 border-amber-500/30 bg-amber-500/5">
            <Gauge className="h-4 w-4 text-amber-400" />
            <AlertTitle className="text-amber-400 font-semibold">Frontend Impact Summary</AlertTitle>
            <AlertDescription className="text-zinc-400 text-sm mt-1">
              REST = redirect URL saja (minim perubahan). GraphQL = <span className="text-red-400 font-semibold">REWRITE semua 131 routes + components</span>.
            </AlertDescription>
          </Alert>
        </section>

        <Separator className="bg-zinc-800/60" />

        {/* ─── SECTION 9: DISCUSSION POINTS ────────────── */}
        <section>
          <SectionTitle icon={<MessageSquare className="w-5 h-5 text-emerald-400" />}>
            Discussion Points — Keputusan yang Harus Diambil
          </SectionTitle>

          <div className="space-y-6">
            {decisions.map((d) => (
              <Card key={d.number} className="bg-zinc-900 border-amber-500/20 overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-500/20 text-lg font-black text-amber-400">
                      {d.number}
                    </span>
                    <div>
                      <CardTitle className="text-base text-zinc-100">{d.title}</CardTitle>
                      <CardDescription className="text-zinc-500 text-xs mt-0.5">{d.content}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 ml-1">
                    {d.options.map((opt, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/40 border border-zinc-700/40 hover:bg-zinc-800/60 transition-colors"
                      >
                        <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-amber-400/50" />
                        </div>
                        <span className="text-sm text-zinc-300">{opt}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-10 text-center">
            <p className="text-sm text-zinc-500 italic">
              💬 Diskusikan keputusan-keputusan di atas. Setelah disetujui, baru kita implementasi.
            </p>
          </div>
        </section>

      </main>

      {/* ═══════════════════════════════════════════════════════
          STICKY BOTTOM BAR
      ═══════════════════════════════════════════════════════ */}
      <div className="sticky bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="text-sm">⏸️</span>
            <span className="text-sm text-amber-400 font-medium">
              MODE DISKUSI — Tidak ada kode yang ditulis
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
