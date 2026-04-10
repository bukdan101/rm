'use client'

import { useState } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Database,
  Server,
  Cpu,
  Shield,
  Zap,
  MessageSquare,
  TrendingUp,
  Users,
  Car,
  Building2,
  Settings,
  Layers,
  GitBranch,
  Clock,
  Code2,
  Box,
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────
interface ServiceData {
  name: string
  icon: React.ReactNode
  tables: number
  responsibility: string
  status: string
  statusIcon: 'check' | 'partial'
}

interface FindingData {
  id: string
  title: string
  severity: 'critical' | 'high' | 'medium'
  description: string
  details: string[]
  codeBlock?: string
}

interface DiscussionPoint {
  id: string
  question: string
  recommendation: string
  pros?: string[]
  cons?: string[]
}

// ─── Data ──────────────────────────────────────────────────
const services: ServiceData[] = [
  {
    name: 'user-service',
    icon: <Users className="w-4 h-4" />,
    tables: 6,
    responsibility: 'Auth, profiles, sessions, KYC',
    status: 'Models ✅',
    statusIcon: 'check',
  },
  {
    name: 'listing-service',
    icon: <Car className="w-4 h-4" />,
    tables: 21,
    responsibility: 'Cars, images, features, inspections, locations, brands',
    status: 'Models ✅ Controllers ✅',
    statusIcon: 'check',
  },
  {
    name: 'interaction-service',
    icon: <MessageSquare className="w-4 h-4" />,
    tables: 13,
    responsibility: 'Favorites, views, compares, reviews, search, analytics',
    status: 'Models ✅',
    statusIcon: 'check',
  },
  {
    name: 'transaction-service',
    icon: <Zap className="w-4 h-4" />,
    tables: 19,
    responsibility: 'Orders, payments, escrow, tokens, rental, invoices',
    status: 'Models ✅',
    statusIcon: 'check',
  },
  {
    name: 'business-service',
    icon: <Building2 className="w-4 h-4" />,
    tables: 17,
    responsibility: 'Dealers, branches, staff, offers, banners, coupons, support',
    status: 'Models ✅',
    statusIcon: 'check',
  },
  {
    name: 'system-service',
    icon: <Settings className="w-4 h-4" />,
    tables: 15,
    responsibility: 'Chat, notifications, recommendations, analytics, settings',
    status: 'Models ✅',
    statusIcon: 'check',
  },
]

const findings: FindingData[] = [
  {
    id: 'f1',
    title: '15+ Tables Missing from Blueprint ERD Split',
    severity: 'critical',
    description:
      'The blueprint\'s ERD split doesn\'t mention these tables — they exist in model files but are not assigned to any service.',
    details: [
      'car_videos, car_documents, car_features, car_feature_values',
      'car_rental_prices, car_price_history, car_status_history',
      'trending_cars, dealer_documents, dealer_marketplace_settings',
      'dealer_marketplace_views, dealer_marketplace_favorites',
      'dealer_offer_histories, boost_settings, user_addresses',
      'feature_categories/groups/items, car_body_types/fuel_types/transmissions',
      'car_colors, payment_methods, withdrawals, fee_settings',
      'notification_templates, notification_logs, inspection_certificates',
    ],
  },
  {
    id: 'f2',
    title: 'Duplicate Model Definitions (Go Compilation Error)',
    severity: 'critical',
    description:
      'review.go defines CarReview/ReviewImage/ReviewVote with DIFFERENT fields than rental.go. This causes Go compilation error "redeclared".',
    details: [
      'rental.go version: order_id, pros, cons, anonymous, seller_response, not_helpful_count',
      'review.go version: listing_id, is_verified (simpler)',
    ],
    codeBlock: `// review.go — SIMPLER version
type CarReview struct {
    ListingID   uint
    IsVerified  bool
}

// rental.go — RICHER version
type CarReview struct {  // ← "redeclared in this block" ERROR
    OrderID        uint
    Pros           string
    Cons           string
    Anonymous      bool
    SellerResponse string
    NotHelpfulCount uint
}`,
  },
  {
    id: 'f3',
    title: 'Cross-Service Data Dependencies',
    severity: 'high',
    description:
      'Services need each other\'s data. Without shared DB, API calls, or event sourcing, these become bottlenecks.',
    details: [
      'Listing Service needs User data (seller info, profile)',
      'Transaction Service needs Listing data (price, status) + User data',
      'Interaction Service writes to car_views but Listing needs view_count for ranking',
      'Analytics needs data from ALL services for event enrichment',
      'These require either shared DB, API calls, or event sourcing',
    ],
  },
  {
    id: 'f4',
    title: 'Counter Sync Problem (Denormalized Fields)',
    severity: 'high',
    description:
      'car_listings has denormalized counters that are updated by interaction-service but owned by listing-service.',
    details: [
      'view_count, favorite_count, inquiry_count live in car_listings',
      'Updated by interaction-service, owned by listing-service',
      'Without shared DB or event bus, these get out of sync',
      'Potential solution: database triggers, event bus, or shared module access',
    ],
  },
]

const moduleTableAssignments = [
  {
    id: 'auth',
    name: 'auth',
    label: 'Auth Module (7 tables)',
    icon: <Shield className="w-4 h-4" />,
    color: 'emerald',
    tables: [
      'User',
      'Profile',
      'UserSettings',
      'UserSession',
      'UserVerification',
      'UserDocument',
      'UserAddress',
    ],
  },
  {
    id: 'listing',
    name: 'listing',
    label: 'Listing Module (32 tables)',
    icon: <Car className="w-4 h-4" />,
    color: 'amber',
    tables: [
      'CarListing',
      'CarImage',
      'CarVideo',
      'CarDocument',
      'CarFeatures',
      'CarFeatureValue',
      'CarRentalPrice',
      'CarPriceHistory',
      'CarStatusHistory',
      'Brand',
      'CarModel',
      'CarVariant',
      'CarGeneration',
      'CarColor',
      'CarBodyType',
      'CarFuelType',
      'CarTransmission',
      'FeatureCategory',
      'FeatureGroup',
      'FeatureItem',
      'Category',
      'InspectionCategory',
      'InspectionItem',
      'CarInspection',
      'InspectionResult',
      'InspectionPhoto',
      'InspectionCertificate',
      'Country',
      'Province',
      'City',
      'District',
    ],
  },
  {
    id: 'interaction',
    name: 'interaction',
    label: 'Interaction Module (16 tables)',
    icon: <MessageSquare className="w-4 h-4" />,
    color: 'teal',
    tables: [
      'CarView',
      'CarFavorite',
      'CarCompare',
      'RecentView',
      'TrendingCar',
      'CarReview',
      'ReviewImage',
      'ReviewVote',
      'RentalReview',
      'AnalyticsEvent',
      'AnalyticsPageView',
      'AnalyticsClick',
      'AnalyticsConversion',
      'SearchLog',
      'Recommendation',
      'Favorites',
    ],
  },
  {
    id: 'transaction',
    name: 'transaction',
    label: 'Transaction Module (21 tables)',
    icon: <Zap className="w-4 h-4" />,
    color: 'rose',
    tables: [
      'Order',
      'OrderItem',
      'Payment',
      'PaymentMethod',
      'Transaction',
      'Invoice',
      'EscrowAccount',
      'Refund',
      'Withdrawal',
      'FeeSetting',
      'Coupon',
      'TokenPackage',
      'TokenSetting',
      'TokenTransaction',
      'UserToken',
      'TopupRequest',
      'BoostSetting',
      'RentalBooking',
      'RentalAvailability',
      'RentalPayment',
      'RentalInsurance',
    ],
  },
  {
    id: 'business',
    name: 'business',
    label: 'Business Module (12 tables)',
    icon: <Building2 className="w-4 h-4" />,
    color: 'sky',
    tables: [
      'Dealer',
      'DealerBranch',
      'DealerStaff',
      'DealerDocument',
      'DealerInventory',
      'DealerReview',
      'DealerMarketplaceSetting',
      'DealerMarketplaceFavorite',
      'DealerMarketplaceView',
      'DealerOffer',
      'DealerOfferHistory',
      'Banner',
      'Broadcast',
    ],
  },
  {
    id: 'system',
    name: 'system',
    label: 'System Module (12 tables)',
    icon: <Settings className="w-4 h-4" />,
    color: 'violet',
    tables: [
      'Conversation',
      'Message',
      'MessageAttachment',
      'Notification',
      'UserNotification',
      'NotificationTemplate',
      'NotificationLog',
      'SupportTicket',
      'SupportTicketMessage',
      'Report',
      'ActivityLog',
      'SystemSetting',
      'KycVerification',
    ],
  },
]

const discussionPoints: DiscussionPoint[] = [
  {
    id: 'd1',
    question: 'Merge User + Profile into single table?',
    recommendation:
      'Profile has 1:1 with User — merge eliminates a JOIN and simplifies queries. Keep profile fields optional on the User table.',
    pros: [
      'Eliminates JOIN on every user query',
      'Simpler model — one struct instead of two',
      'Profile always exists for every user',
      'Easier to manage in a single transaction',
    ],
    cons: [
      'User table becomes wider (25+ columns)',
      'Profile data co-located with auth data',
    ],
  },
  {
    id: 'd2',
    question: 'Keep review.go or rental.go version of CarReview?',
    recommendation:
      'Keep rental.go version — it has order_id, pros/cons, anonymous, seller_response, not_helpful_count. Delete review.go to fix compilation.',
    pros: [
      'Richer data model with order linkage',
      'Supports pros/cons for detailed reviews',
      'Seller can respond to reviews',
      'Helpfulness voting built-in',
    ],
    cons: ['Tighter coupling to rental domain'],
  },
  {
    id: 'd3',
    question: 'Modular Monolith vs Microservices from start?',
    recommendation:
      'Start with Modular Monolith — single deployable, shared DB, no network latency. Extract services later when DAU justifies it.',
  },
  {
    id: 'd4',
    question: 'Shared database or database-per-service?',
    recommendation:
      'Shared initially with schema-level isolation (prefixes/namespaces). Migrate to per-service DB when extracting microservices.',
  },
  {
    id: 'd5',
    question: 'Event-driven architecture needed now?',
    recommendation:
      'Defer to Phase 2 (1000+ DAU). Use direct function calls within monolith. Add event bus when services are extracted.',
  },
]

const monolithStructure = `├── cmd/
│   └── server/
│       └── main.go
├── internal/
│   ├── config/
│   │   └── config.go
│   ├── database/
│   │   ├── postgres.go
│   │   └── redis.go
│   ├── middleware/
│   │   ├── auth.go
│   │   └── rbac.go
│   ├── utils/
│   │   └── response.go
│   ├── modules/                    ← Domain modules (clean architecture)
│   │   ├── auth/                   ← user-service equivalent
│   │   │   ├── domain/             (models, enums)
│   │   │   ├── repository/
│   │   │   ├── usecase/
│   │   │   ├── handler/
│   │   │   └── dto/
│   │   ├── listing/                ← listing-service equivalent
│   │   │   ├── domain/
│   │   │   ├── repository/
│   │   │   ├── usecase/
│   │   │   ├── handler/
│   │   │   └── dto/
│   │   ├── interaction/            ← interaction-service equivalent
│   │   │   ├── domain/
│   │   │   ├── repository/
│   │   │   ├── usecase/
│   │   │   ├── handler/
│   │   │   └── dto/
│   │   ├── transaction/            ← transaction-service equivalent
│   │   │   ├── domain/
│   │   │   ├── repository/
│   │   │   ├── usecase/
│   │   │   ├── handler/
│   │   │   └── dto/
│   │   ├── business/               ← business-service equivalent
│   │   │   ├── domain/
│   │   │   ├── repository/
│   │   │   ├── usecase/
│   │   │   ├── handler/
│   │   │   └── dto/
│   │   └── system/                 ← system-service equivalent
│   │       ├── domain/
│   │       ├── repository/
│   │       ├── usecase/
│   │       ├── handler/
│   │       └── dto/
│   └── routes/
│       ├── public.go
│       ├── auth.go
│       ├── admin.go
│       └── dealer.go
├── pkg/                            ← Shared libraries
│   ├── storage/                    (GCS/MinIO)
│   ├── notification/
│   └── eventbus/
├── migrations/
├── go.mod
├── go.sum
├── .env
└── Dockerfile`

const nextSteps = [
  {
    step: 1,
    title: 'Fix duplicate model definitions',
    description:
      'Delete review.go, keep rental.go version of CarReview/ReviewImage/ReviewVote',
  },
  {
    step: 2,
    title: 'Restructure backend to modular architecture',
    description:
      'Refactor into internal/modules/ with clean architecture per module',
  },
  {
    step: 3,
    title: 'Add missing tables from blueprint',
    description:
      'Implement the 15+ tables not covered in the original ERD split',
  },
  {
    step: 4,
    title: 'Implement remaining controllers',
    description:
      'Wire up handlers for interaction, transaction, business, and system modules',
  },
  {
    step: 5,
    title: 'Add file upload service (GCS/MinIO)',
    description:
      'Implement image, document, and video upload with CDN integration',
  },
  {
    step: 6,
    title: 'Wire admin routes',
    description:
      'Connect admin dashboard endpoints with RBAC middleware',
  },
  {
    step: 7,
    title: 'Add transaction wrapper for token operations',
    description:
      'Make token deduction/reward atomic with DB transactions',
  },
  {
    step: 8,
    title: 'Build complete API for all 6 modules',
    description:
      'Full CRUD endpoints with proper validation, pagination, and filtering',
  },
]

// ─── Color Helpers ─────────────────────────────────────────
const colorMap: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  emerald: {
    border: 'border-emerald-500/30',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  },
  amber: {
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    badge: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  },
  teal: {
    border: 'border-teal-500/30',
    bg: 'bg-teal-500/10',
    text: 'text-teal-400',
    badge: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  },
  rose: {
    border: 'border-rose-500/30',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    badge: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  },
  sky: {
    border: 'border-sky-500/30',
    bg: 'bg-sky-500/10',
    text: 'text-sky-400',
    badge: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  },
  violet: {
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/10',
    text: 'text-violet-400',
    badge: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  },
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case 'critical':
      return 'border-red-500/50 bg-red-500/10'
    case 'high':
      return 'border-amber-500/50 bg-amber-500/10'
    default:
      return 'border-yellow-500/50 bg-yellow-500/10'
  }
}

function getSeverityBadge(severity: string) {
  switch (severity) {
    case 'critical':
      return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'high':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    default:
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  }
}

// ─── Main Page ─────────────────────────────────────────────
export default function SystemWorkflowPage() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState('monolith')

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const checkedCount = Object.values(checkedItems).filter(Boolean).length

  return (
    <div className="bg-zinc-950 text-zinc-100 min-h-screen">
      {/* ═══════════════════════════════════════════════════════
          SECTION 1: HERO HEADER
      ═══════════════════════════════════════════════════════ */}
      <header className="relative overflow-hidden border-b border-zinc-800">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-emerald-950/20 to-zinc-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <div className="text-center">
            {/* Top label */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 mb-8">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium tracking-wide">
                MICROSERVICE BLUEPRINT REVIEW
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-4">
              <span className="text-zinc-100">ARCHITECTURE</span>{' '}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                ANALYSIS
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto">
              AutoMarket Indonesia &mdash; Microservice Blueprint Review
            </p>

            {/* Stats bar */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {[
                { icon: <Server className="w-4 h-4" />, value: '6 Services' },
                { icon: <Database className="w-4 h-4" />, value: '101 Tables' },
                { icon: <Code2 className="w-4 h-4" />, value: '14 Model Files' },
                { icon: <Zap className="w-4 h-4" />, value: 'Go + Fiber v3 + PostgreSQL' },
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
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12 sm:py-16 space-y-16">
        {/* ═══════════════════════════════════════════════════════
            SECTION 2: CURRENT STATE
        ═══════════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Server className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100">Kondisi Saat Ini</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* What exists */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-emerald-400 text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  Sudah Ada di Backend
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    label: 'Model Files',
                    value: '14 files with 101 structs defined',
                    icon: <Code2 className="w-4 h-4" />,
                  },
                  {
                    label: 'API Endpoints',
                    value: '25 endpoints wired (14 public, 8 auth, 0 admin)',
                    icon: <Zap className="w-4 h-4" />,
                  },
                  {
                    label: 'Authentication',
                    value: 'Google OAuth + JWT working',
                    icon: <Shield className="w-4 h-4" />,
                  },
                  {
                    label: 'Listing CRUD',
                    value: 'Create, Read, Update, Delete functional',
                    icon: <Car className="w-4 h-4" />,
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
                  >
                    <div className="w-8 h-8 rounded-md bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-emerald-400">{item.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">{item.label}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Issues found */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-amber-400 text-base">
                  <AlertTriangle className="w-5 h-5" />
                  Masalah yang Ditemukan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    title: 'Duplicate CarReview/ReviewImage/ReviewVote',
                    desc: 'Defined in review.go vs rental.go with different fields — Go redeclared error',
                    severity: 'critical' as const,
                  },
                  {
                    title: 'Token deduction not atomic',
                    desc: 'No database transaction wrapping token operations — race condition risk',
                    severity: 'high' as const,
                  },
                  {
                    title: 'Hardcoded token cost',
                    desc: 'Token pricing not configurable from database — requires code change to update',
                    severity: 'medium' as const,
                  },
                ].map((issue, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50"
                  >
                    <div className="w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-amber-500" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-zinc-200">{issue.title}</p>
                        <span
                          className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            issue.severity === 'critical'
                              ? 'bg-red-500/20 text-red-400'
                              : issue.severity === 'high'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-zinc-500/20 text-zinc-400'
                          }`}
                        >
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">{issue.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="bg-zinc-800" />

        {/* ═══════════════════════════════════════════════════════
            SECTION 3: BLUEPRINT SERVICE TABLE
        ═══════════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Layers className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100">Tabel Layanan Blueprint</h2>
          </div>

          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400 font-semibold text-sm py-4 px-6">
                        Service
                      </TableHead>
                      <TableHead className="text-zinc-400 font-semibold text-sm py-4 px-4 text-center">
                        Tables
                      </TableHead>
                      <TableHead className="text-zinc-400 font-semibold text-sm py-4 px-4">
                        Responsibility
                      </TableHead>
                      <TableHead className="text-zinc-400 font-semibold text-sm py-4 px-6">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((svc) => (
                      <TableRow
                        key={svc.name}
                        className="border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                      >
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                              {svc.icon}
                            </div>
                            <span className="font-mono text-sm text-zinc-200 font-medium">
                              {svc.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-4 text-center">
                          <span className="inline-flex items-center justify-center w-10 h-6 rounded-md bg-emerald-500/10 text-emerald-400 text-sm font-bold">
                            {svc.tables}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-4 text-sm text-zinc-400 max-w-xs">
                          {svc.responsibility}
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge
                            variant="outline"
                            className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {svc.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="bg-zinc-800" />

        {/* ═══════════════════════════════════════════════════════
            SECTION 4: CRITICAL FINDINGS
        ═══════════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100">Temuan Kritis</h2>
          </div>

          <div className="space-y-4">
            {findings.map((finding) => (
              <Alert
                key={finding.id}
                className={`border ${getSeverityColor(finding.severity)} bg-zinc-900 [&>svg]:text-amber-400`}
              >
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                <AlertTitle className="flex items-center gap-2 text-zinc-100">
                  {finding.title}
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${getSeverityBadge(finding.severity)}`}
                  >
                    {finding.severity}
                  </span>
                </AlertTitle>
                <AlertDescription className="text-zinc-400">
                  <p className="mb-3">{finding.description}</p>
                  <ul className="space-y-1.5 ml-1">
                    {finding.details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <ArrowRight className="w-3 h-3 text-amber-500/70 mt-1 flex-shrink-0" />
                        <span className="font-mono text-zinc-300">{detail}</span>
                      </li>
                    ))}
                  </ul>
                  {finding.codeBlock && (
                    <pre className="mt-4 p-4 rounded-lg bg-zinc-950 border border-zinc-800 overflow-x-auto text-xs font-mono text-zinc-400 leading-relaxed">
                      <code>{finding.codeBlock}</code>
                    </pre>
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </section>

        <Separator className="bg-zinc-800" />

        {/* ═══════════════════════════════════════════════════════
            SECTION 5: ARCHITECTURE RECOMMENDATION
        ═══════════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <GitBranch className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100">Rekomendasi Arsitektur</h2>
          </div>

          <Card className="bg-zinc-900 border-emerald-500/30 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl text-emerald-400">
                🎯 Rekomendasi: Modular Monolith First
              </CardTitle>
              <CardDescription className="text-zinc-500">
                Modular Monolith with domain packages — extract services only when scale demands it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="bg-zinc-800 border border-zinc-700">
                  <TabsTrigger
                    value="monolith"
                    className="data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                    PRO Monolith
                  </TabsTrigger>
                  <TabsTrigger
                    value="microservice"
                    className="data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400"
                  >
                    <Server className="w-3.5 h-3.5 mr-1.5" />
                    PRO Microservice (nanti)
                  </TabsTrigger>
                  <TabsTrigger
                    value="timeline"
                    className="data-[state=active]:bg-teal-500/15 data-[state=active]:text-teal-400"
                  >
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    Timeline
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="monolith" className="mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        icon: <Database className="w-4 h-4" />,
                        title: 'Single Database',
                        desc: 'No cross-service data issues — ACID transactions everywhere',
                      },
                      {
                        icon: <Code2 className="w-4 h-4" />,
                        title: 'Simple Development',
                        desc: 'One process, easy debugging and tracing',
                      },
                      {
                        icon: <Zap className="w-4 h-4" />,
                        title: 'Fast Development',
                        desc: 'No service mesh, no API gateway complexity',
                      },
                      {
                        icon: <Box className="w-4 h-4" />,
                        title: 'Single Deploy',
                        desc: 'Deploy to single Cloud Run container',
                      },
                      {
                        icon: <Layers className="w-4 h-4" />,
                        title: 'Clean Architecture',
                        desc: 'Current code already follows domain-driven patterns',
                      },
                      {
                        icon: <Cpu className="w-4 h-4" />,
                        title: 'ACID Transactions',
                        desc: 'Transactions across all modules without distributed complexity',
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10"
                      >
                        <div className="w-8 h-8 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-400 flex-shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-200">{item.title}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="microservice" className="mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        icon: <TrendingUp className="w-4 h-4" />,
                        title: 'Independent Scaling',
                        desc: 'Scale per-service based on load',
                      },
                      {
                        icon: <Server className="w-4 h-4" />,
                        title: 'Isolated Deployments',
                        desc: 'Deploy services independently without affecting others',
                      },
                      {
                        icon: <Code2 className="w-4 h-4" />,
                        title: 'Technology Diversity',
                        desc: 'Use different tech stacks per service',
                      },
                      {
                        icon: <Users className="w-4 h-4" />,
                        title: 'Team Scaling',
                        desc: 'Better for large teams (10+ developers)',
                      },
                      {
                        icon: <Shield className="w-4 h-4" />,
                        title: 'Fault Isolation',
                        desc: 'True fault isolation — one service crash doesn\'t bring down others',
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"
                      >
                        <div className="w-8 h-8 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-zinc-200">{item.title}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="mt-4">
                  <div className="space-y-4">
                    {[
                      {
                        phase: 'Phase 1',
                        when: 'Now',
                        action: 'Modular Monolith with domain packages',
                        color: 'emerald',
                      },
                      {
                        phase: 'Phase 2',
                        when: '1000+ DAU',
                        action: 'Extract interaction-service (high write volume)',
                        color: 'teal',
                      },
                      {
                        phase: 'Phase 3',
                        when: '5000+ DAU',
                        action: 'Extract analytics-service (heavy computation)',
                        color: 'amber',
                      },
                      {
                        phase: 'Phase 4',
                        when: '10000+ DAU',
                        action: 'Extract transaction-service (critical path isolation)',
                        color: 'rose',
                      },
                    ].map((phase, i) => {
                      const c = colorMap[phase.color]
                      return (
                        <div
                          key={i}
                          className={`flex items-start gap-4 p-4 rounded-lg border ${c.border} ${c.bg}`}
                        >
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-10 h-10 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}
                            >
                              <span className={`text-sm font-bold ${c.text}`}>{i + 1}</span>
                            </div>
                            {i < 3 && (
                              <div className="w-px h-4 bg-zinc-700 mt-1" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-bold text-sm ${c.text}`}>
                                {phase.phase}
                              </span>
                              <Badge
                                variant="outline"
                                className={`${c.badge} text-[10px]`}
                              >
                                {phase.when}
                              </Badge>
                            </div>
                            <p className="text-sm text-zinc-300 mt-1">{phase.action}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        <Separator className="bg-zinc-800" />

        {/* ═══════════════════════════════════════════════════════
            SECTION 6: PROPOSED MONOLITH STRUCTURE
        ═══════════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Code2 className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100">Struktur Monolith yang Diusulkan</h2>
          </div>

          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-zinc-200 font-mono">
                /backend — Folder Structure
              </CardTitle>
              <CardDescription className="text-zinc-500">
                Clean architecture with domain modules. Each module has domain, repository, usecase, handler, and dto layers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="p-4 sm:p-6 rounded-xl bg-zinc-950 border border-zinc-800 overflow-x-auto text-xs sm:text-sm font-mono text-zinc-400 leading-relaxed max-h-[600px] overflow-y-auto">
                <code>{monolithStructure}</code>
              </pre>
            </CardContent>
          </Card>
        </section>

        <Separator className="bg-zinc-800" />

        {/* ═══════════════════════════════════════════════════════
            SECTION 7: TABLE ASSIGNMENT (Accordion)
        ═══════════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Database className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-100">Penugasan Tabel per Modul</h2>
              <p className="text-sm text-zinc-500 mt-1">
                Klik setiap modul untuk melihat tabel yang dimilikinya
              </p>
            </div>
          </div>

          <Accordion type="multiple" className="space-y-3">
            {moduleTableAssignments.map((mod) => {
              const c = colorMap[mod.color]
              return (
                <AccordionItem
                  key={mod.id}
                  value={mod.id}
                  className={`rounded-xl border ${c.border} bg-zinc-900 overflow-hidden`}
                >
                  <AccordionTrigger className="hover:no-underline px-5 py-4 hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`w-9 h-9 rounded-lg ${c.bg} border ${c.border} flex items-center justify-center text-zinc-400`}
                      >
                        {mod.icon}
                      </div>
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-zinc-200">
                            {mod.name} module
                          </span>
                          <Badge
                            variant="outline"
                            className={`${c.badge} text-[10px]`}
                          >
                            {mod.tables.length} tables
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-4">
                    <div className="flex flex-wrap gap-2">
                      {mod.tables.map((table) => (
                        <span
                          key={table}
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono border ${c.border} ${c.bg} ${c.text}`}
                        >
                          {table}
                        </span>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </section>

        <Separator className="bg-zinc-800" />

        {/* ═══════════════════════════════════════════════════════
            SECTION 8: DISCUSSION POINTS
        ═══════════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-amber-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100">Poin Diskusi</h2>
          </div>
          <p className="text-sm text-zinc-500 mb-6 ml-11">
            Keputusan arsitektur yang perlu dikonfirmasi sebelum lanjut ke implementasi.{' '}
            {checkedCount > 0 && (
              <span className="text-emerald-400">
                {checkedCount}/{discussionPoints.length} confirmed
              </span>
            )}
          </p>

          <div className="space-y-4">
            {discussionPoints.map((point, idx) => (
              <Card
                key={point.id}
                className={`bg-zinc-900 border transition-colors ${
                  checkedItems[point.id]
                    ? 'border-emerald-500/30 bg-emerald-500/[0.03]'
                    : 'border-zinc-800'
                }`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="pt-1">
                      <Checkbox
                        id={point.id}
                        checked={!!checkedItems[point.id]}
                        onCheckedChange={() => toggleCheck(point.id)}
                        className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-md bg-amber-500/10 text-amber-400 text-xs font-bold flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <div>
                          <label
                            htmlFor={point.id}
                            className="text-sm font-semibold text-zinc-200 cursor-pointer hover:text-zinc-100 transition-colors"
                          >
                            {point.question}
                          </label>
                          <div className="mt-2 flex items-start gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-emerald-400/90">{point.recommendation}</p>
                          </div>
                        </div>
                      </div>

                      {point.pros && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-9">
                          {point.pros && point.pros.length > 0 && (
                            <div className="space-y-1.5">
                              <p className="text-[10px] uppercase tracking-wider font-semibold text-emerald-500/70">
                                Keuntungan
                              </p>
                              {point.pros.map((pro, i) => (
                                <div key={i} className="flex items-start gap-1.5">
                                  <span className="text-emerald-500 mt-1 text-[10px]">+</span>
                                  <span className="text-xs text-zinc-400">{pro}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {point.cons && point.cons.length > 0 && (
                            <div className="space-y-1.5">
                              <p className="text-[10px] uppercase tracking-wider font-semibold text-amber-500/70">
                                Kekurangan
                              </p>
                              {point.cons.map((con, i) => (
                                <div key={i} className="flex items-start gap-1.5">
                                  <span className="text-amber-500 mt-1 text-[10px]">−</span>
                                  <span className="text-xs text-zinc-400">{con}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator className="bg-zinc-800" />

        {/* ═══════════════════════════════════════════════════════
            SECTION 9: NEXT STEPS
        ═══════════════════════════════════════════════════════ */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-100">Langkah Selanjutnya</h2>
          </div>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-6">
              <div className="space-y-4">
                {nextSteps.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 group">
                    {/* Step number */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20">
                          {item.step}
                        </div>
                        {idx < nextSteps.length - 1 && (
                          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-px h-4 bg-zinc-700" />
                        )}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pb-2">
                      <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-zinc-500 mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ═══════════════════════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════════════════════ */}
        <footer className="mt-16 pt-8 border-t border-zinc-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-zinc-500 text-xs">
              <Cpu className="w-3.5 h-3.5" />
              <span>AutoMarket Indonesia — Architecture Analysis Document</span>
            </div>
            <div className="flex items-center gap-4 text-zinc-600 text-xs">
              <span>Go 1.23 + Fiber v3</span>
              <span className="text-zinc-700">•</span>
              <span>PostgreSQL 16</span>
              <span className="text-zinc-700">•</span>
              <span>Next.js 16</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
