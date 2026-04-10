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
  CheckCircle2,
  XCircle,
  AlertTriangle,
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
  Rocket,
  Target,
  Eye,
} from 'lucide-react'

// ─── Data: 7 Keputusan Final ─────────────────────────────────
const decisions = [
  { num: 1, topic: 'API Style', choice: '✅ GraphQL Gateway (gqlgen + Fiber)' },
  { num: 2, topic: 'Foreign Key', choice: '✅ No FK — UUID reference only' },
  { num: 3, topic: 'Database', choice: '✅ 6 PostgreSQL schemas' },
  { num: 4, topic: 'Architecture', choice: '✅ 6 Microservices (6 containers)' },
  { num: 5, topic: 'Extra Tables', choice: '✅ 27 tabel dipertahankan + masuk PRD' },
  { num: 6, topic: 'Duplicate Fix', choice: '✅ rental.go version (hapus review.go)' },
  { num: 7, topic: 'Prioritas', choice: '✅ All 6 services sekaligus' },
]

// ─── Data: Service Tables ────────────────────────────────────
interface TableDef {
  name: string
  schema: string
  columns: string
  notes: string
}

const userTables: TableDef[] = [
  { name: 'profiles', schema: 'user_schema', columns: 'id, name, phone, role, avatar_url, email_verified, is_active', notes: 'Main user table' },
  { name: 'user_settings', schema: 'user_schema', columns: 'id, user_id, email_notifications, push_notifications, language', notes: '1:1 with profiles' },
  { name: 'user_sessions', schema: 'user_schema', columns: 'id, user_id, token, ip_address, expires_at', notes: 'Auth sessions' },
  { name: 'user_tokens', schema: 'user_schema', columns: 'id, user_id, balance, total_purchased, total_used', notes: 'Token economy' },
  { name: 'kyc_verifications', schema: 'user_schema', columns: 'id, user_id, status, nik, ktp_photo_url, selfie_photo_url', notes: 'KYC flow' },
  { name: 'user_verifications', schema: 'user_schema', columns: 'id, user_id, verification_type, code, verified', notes: 'Email/phone verify' },
  { name: 'user_addresses', schema: 'user_schema', columns: 'id, user_id, city_id, province_id, address, is_primary', notes: 'User addresses' },
  { name: 'user_documents', schema: 'user_schema', columns: 'id, user_id, document_type, document_url, verified', notes: 'KTP/SIM/NPWP' },
]

const listingTables: TableDef[] = [
  { name: 'car_listings', schema: 'listing_schema', columns: 'id, user_id, brand_id, model_id, price_cash, status, slug', notes: 'MAIN table 45+ cols' },
  { name: 'car_images', schema: 'listing_schema', columns: 'id, car_listing_id, image_url, is_primary, display_order', notes: 'Max 10 per listing' },
  { name: 'car_videos', schema: 'listing_schema', columns: 'id, car_listing_id, video_url, thumbnail_url', notes: 'YouTube/uploaded' },
  { name: 'car_documents', schema: 'listing_schema', columns: 'id, car_listing_id, stnk_status, bpkb_status', notes: 'STNK/BPKB docs' },
  { name: 'car_features', schema: 'listing_schema', columns: 'id, car_listing_id, airbag, abs, sunroof...', notes: '18 boolean fields' },
  { name: 'car_feature_values', schema: 'listing_schema', columns: 'id, car_listing_id, feature_item_id, value', notes: 'Dynamic features' },
  { name: 'car_rental_prices', schema: 'listing_schema', columns: 'id, car_listing_id, price_per_day/week/month', notes: 'Rental pricing' },
  { name: 'car_price_history', schema: 'listing_schema', columns: 'id, car_listing_id, price_old, price_new, changed_by', notes: 'Audit trail' },
  { name: 'car_status_history', schema: 'listing_schema', columns: 'id, car_listing_id, status_old, status_new', notes: 'Status audit' },
  { name: 'car_inspections', schema: 'listing_schema', columns: 'id, car_listing_id, score, risk_level, overall_grade', notes: '160-point inspect' },
  { name: 'inspection_results', schema: 'listing_schema', columns: 'id, inspection_id, item_id, status, severity', notes: 'Per-item result' },
  { name: 'inspection_items', schema: 'listing_schema', columns: 'id, category_id, name, display_order, is_critical', notes: '160 items' },
  { name: 'inspection_categories', schema: 'listing_schema', columns: 'id, name, display_order, total_items', notes: '13 categories' },
  { name: 'inspection_photos', schema: 'listing_schema', columns: 'id, inspection_id, image_url, position', notes: 'Evidence photos' },
  { name: 'inspection_certificates', schema: 'listing_schema', columns: 'id, inspection_id, certificate_number, is_valid', notes: 'Certificate' },
  { name: 'brands', schema: 'listing_schema', columns: 'id, name, slug, logo_url, is_popular', notes: '30+ brands' },
  { name: 'car_models', schema: 'listing_schema', columns: 'id, brand_id, name, body_type, is_popular', notes: '200+ models' },
  { name: 'car_variants', schema: 'listing_schema', columns: 'id, model_id, name, engine_capacity, transmission', notes: 'Trim levels' },
  { name: 'car_generations', schema: 'listing_schema', columns: 'id, model_id, name, year_start, year_end', notes: 'Facelift/gen' },
  { name: 'car_colors', schema: 'listing_schema', columns: 'id, name, hex_code, is_metallic', notes: '50+ colors' },
  { name: 'car_body_types', schema: 'listing_schema', columns: 'id, name, description, icon_url', notes: 'SUV/Sedan/MPV...' },
  { name: 'car_fuel_types', schema: 'listing_schema', columns: 'id, name, description', notes: 'Bensin/Diesel/EV' },
  { name: 'car_transmissions', schema: 'listing_schema', columns: 'id, name, description', notes: 'AT/MT/CVT' },
]

const interactionTables: TableDef[] = [
  { name: 'car_reviews', schema: 'interaction_schema', columns: 'id, user_id, car_listing_id, rating, pros, cons, anonymous', notes: 'Rich reviews' },
  { name: 'review_images', schema: 'interaction_schema', columns: 'id, review_id, image_url, caption', notes: 'Review media' },
  { name: 'review_votes', schema: 'interaction_schema', columns: 'id, review_id, user_id, vote_type', notes: 'Helpful/not' },
  { name: 'car_favorites', schema: 'interaction_schema', columns: 'id, user_id, car_listing_id, notes', notes: 'Save cars' },
  { name: 'recent_views', schema: 'interaction_schema', columns: 'id, user_id, car_listing_id, view_count', notes: 'Browsing history' },
  { name: 'recommendations', schema: 'interaction_schema', columns: 'id, user_id, car_listing_id, score, source', notes: 'AI recs' },
  { name: 'trending_cars', schema: 'interaction_schema', columns: 'id, car_listing_id, period, score, rank', notes: 'Trending algo' },
  { name: 'car_views', schema: 'interaction_schema', columns: 'id, car_listing_id, viewer_id, ip_address, duration', notes: 'View tracking' },
  { name: 'car_compares', schema: 'interaction_schema', columns: 'id, user_id, car_listing_ids (uuid[])', notes: 'Compare feature' },
  { name: 'search_logs', schema: 'interaction_schema', columns: 'id, user_id, query, filters, results_count', notes: 'Search analytics' },
]

const transactionTables: TableDef[] = [
  { name: 'orders', schema: 'transaction_schema', columns: 'id, buyer_id, seller_id, car_listing_id, total_amount', notes: 'Main order' },
  { name: 'order_items', schema: 'transaction_schema', columns: 'id, order_id, item_type, item_id, unit_price', notes: 'Line items' },
  { name: 'payments', schema: 'transaction_schema', columns: 'id, order_id, payer_id, amount, payment_method', notes: 'Payment records' },
  { name: 'payment_methods', schema: 'transaction_schema', columns: 'id, user_id, method_type, provider, account_number', notes: 'Saved methods' },
  { name: 'transactions', schema: 'transaction_schema', columns: 'id, order_id, transaction_type, amount, from_account', notes: 'Ledger' },
  { name: 'invoices', schema: 'transaction_schema', columns: 'id, order_id, items (jsonb), subtotal, total', notes: 'Invoice gen' },
  { name: 'escrow_accounts', schema: 'transaction_schema', columns: 'id, order_id, amount_held, status, release_conditions', notes: 'Escrow' },
  { name: 'refunds', schema: 'transaction_schema', columns: 'id, order_id, amount, reason, status', notes: 'Refund flow' },
  { name: 'withdrawals', schema: 'transaction_schema', columns: 'id, user_id, amount, bank_name, status', notes: 'Dealer payout' },
  { name: 'fee_settings', schema: 'transaction_schema', columns: 'id, platform_fee_percent, transaction_fee, withdrawal_fee', notes: 'Config' },
  { name: 'coupons', schema: 'transaction_schema', columns: 'id, code, discount_type, discount_value, usage_limit', notes: 'Promo codes' },
  { name: 'token_packages', schema: 'transaction_schema', columns: 'id, name, tokens, price, bonus_tokens', notes: 'Buy tokens' },
  { name: 'token_settings', schema: 'transaction_schema', columns: 'id, token_price_base, listing_tokens, boost_tokens', notes: 'Pricing config' },
  { name: 'token_transactions', schema: 'transaction_schema', columns: 'id, user_id, transaction_type, amount, balance_after', notes: 'Token ledger' },
  { name: 'user_tokens', schema: 'transaction_schema', columns: 'id, user_id, balance, total_purchased, total_used', notes: 'Balance' },
  { name: 'topup_requests', schema: 'transaction_schema', columns: 'id, user_id, amount, tokens, payment_proof_url', notes: 'Manual topup' },
  { name: 'boost_settings', schema: 'transaction_schema', columns: 'id, boost_type, price_tokens, duration_days', notes: 'Boost config' },
  { name: 'rental_bookings', schema: 'transaction_schema', columns: 'id, car_listing_id, renter_id, total_days, total_amount', notes: 'Rental' },
  { name: 'rental_payments', schema: 'transaction_schema', columns: 'id, booking_id, payment_type, amount, paid_at', notes: 'Rental pay' },
  { name: 'rental_reviews', schema: 'transaction_schema', columns: 'id, booking_id, reviewer_id, rating, comment', notes: 'Rental review' },
  { name: 'rental_insurance', schema: 'transaction_schema', columns: 'id, booking_id, provider, coverage_type, premium', notes: 'Insurance' },
  { name: 'rental_availability', schema: 'transaction_schema', columns: 'id, car_listing_id, date, is_available, booking_id', notes: 'Calendar' },
]

const businessTables: TableDef[] = [
  { name: 'dealers', schema: 'business_schema', columns: 'id, name, owner_id, slug, logo_url, rating, verified', notes: 'Dealer profile' },
  { name: 'dealer_branches', schema: 'business_schema', columns: 'id, dealer_id, name, city_id, operating_hours', notes: 'Multi-branch' },
  { name: 'dealer_staff', schema: 'business_schema', columns: 'id, dealer_id, user_id, role, can_edit, can_delete', notes: 'Team mgmt' },
  { name: 'dealer_documents', schema: 'business_schema', columns: 'id, dealer_id, document_type, document_url, verified', notes: 'Legal docs' },
  { name: 'dealer_inventory', schema: 'business_schema', columns: 'id, dealer_id, car_listing_id, location, stock_status', notes: 'Inventory' },
  { name: 'dealer_reviews', schema: 'business_schema', columns: 'id, dealer_id, user_id, rating, comment, helpful_count', notes: 'Dealer rating' },
  { name: 'dealer_marketplace_settings', schema: 'business_schema', columns: 'id, token_cost_public, token_cost_dealer, inspection_cost', notes: 'B2B config' },
  { name: 'dealer_marketplace_favorites', schema: 'business_schema', columns: 'id, dealer_id, car_listing_id, staff_id', notes: 'B2B wishlist' },
  { name: 'dealer_marketplace_views', schema: 'business_schema', columns: 'id, dealer_id, car_listing_id, view_duration_seconds', notes: 'B2B tracking' },
  { name: 'dealer_offers', schema: 'business_schema', columns: 'id, dealer_id, car_listing_id, offer_price, status', notes: 'B2B offers' },
  { name: 'dealer_offer_histories', schema: 'business_schema', columns: 'id, offer_id, action, previous_price, new_price', notes: 'Offer audit' },
  { name: 'banners', schema: 'business_schema', columns: 'id, title, image_url, position, is_active, click_count', notes: 'CMS banners' },
  { name: 'broadcasts', schema: 'business_schema', columns: 'id, title, body, segment, scheduled_at, status', notes: 'Push broadcast' },
  { name: 'categories', schema: 'business_schema', columns: 'id, name, slug, parent_id, is_featured', notes: 'Car categories' },
  { name: 'coupons', schema: 'business_schema', columns: 'id, code, discount_type, discount_value, usage_limit', notes: 'Promos' },
  { name: 'support_tickets', schema: 'business_schema', columns: 'id, user_id, subject, category, priority, status', notes: 'Help desk' },
  { name: 'support_ticket_messages', schema: 'business_schema', columns: 'id, ticket_id, sender_id, is_admin, message', notes: 'Ticket chat' },
]

const systemTables: TableDef[] = [
  { name: 'conversations', schema: 'system_schema', columns: 'id, buyer_id, seller_id, last_message, status', notes: 'Chat threads' },
  { name: 'messages', schema: 'system_schema', columns: 'id, conversation_id, sender_id, message, message_type', notes: 'Chat messages' },
  { name: 'message_attachments', schema: 'system_schema', columns: 'id, message_id, file_url, file_type, file_size', notes: 'Chat files' },
  { name: 'notifications', schema: 'system_schema', columns: 'id, type, title, body, data, image_url', notes: 'Notification content' },
  { name: 'user_notifications', schema: 'system_schema', columns: 'id, user_id, notification_id, is_read, clicked', notes: 'Per-user delivery' },
  { name: 'notification_templates', schema: 'system_schema', columns: 'id, type, name, subject, body, channels', notes: 'Templates' },
  { name: 'notification_logs', schema: 'system_schema', columns: 'id, template_id, user_id, channel, status', notes: 'Delivery log' },
  { name: 'analytics_events', schema: 'system_schema', columns: 'id, user_id, event_type, event_name, properties', notes: 'Event tracking' },
  { name: 'analytics_page_views', schema: 'system_schema', columns: 'id, user_id, page_type, page_url, time_on_page', notes: 'Page analytics' },
  { name: 'analytics_clicks', schema: 'system_schema', columns: 'id, user_id, element_type, element_id, page_url', notes: 'Click tracking' },
  { name: 'analytics_conversions', schema: 'system_schema', columns: 'id, user_id, conversion_type, funnel_step', notes: 'Conversion' },
  { name: 'activity_logs', schema: 'system_schema', columns: 'id, user_id, action, entity_type, entity_id', notes: 'Audit log' },
  { name: 'system_settings', schema: 'system_schema', columns: 'id, key, value, type, group', notes: 'Config KV' },
  { name: 'reports', schema: 'system_schema', columns: 'id, reporter_id, entity_type, entity_id, reason, status', notes: 'User reports' },
  { name: 'locations_countries', schema: 'system_schema', columns: 'id, name, code, iso2', notes: 'Countries' },
  { name: 'locations_provinces', schema: 'system_schema', columns: 'id, country_id, name, code', notes: 'Provinces' },
  { name: 'locations_cities', schema: 'system_schema', columns: 'id, province_id, name, type', notes: 'Cities' },
  { name: 'locations_districts', schema: 'system_schema', columns: 'id, city_id, name', notes: 'Districts' },
]

// ─── Data: Roadmap Phases ────────────────────────────────────
const roadmapPhases = [
  {
    phase: 1,
    weeks: 'Week 1-2',
    title: 'Foundation',
    icon: <Layers className="w-5 h-5 text-emerald-400" />,
    items: [
      'Setup 6 service repositories + gateway',
      'PostgreSQL schemas creation (6 schemas, 100 tables)',
      'Shared Go modules (pkg/database, pkg/logger)',
      'Docker Compose for local dev',
    ],
  },
  {
    phase: 2,
    weeks: 'Week 2-3',
    title: 'User Service + Auth',
    icon: <Users className="w-5 h-5 text-cyan-400" />,
    items: [
      'profiles CRUD + Google OAuth + JWT',
      'user_sessions, user_settings',
      'GraphQL auth resolvers',
      'Gateway auth middleware',
    ],
  },
  {
    phase: 3,
    weeks: 'Week 3-4',
    title: 'Listing Service',
    icon: <Car className="w-5 h-5 text-amber-400" />,
    items: [
      'car_listings CRUD + images',
      'brands, models, variants',
      'GraphQL listing resolvers',
      'File upload (GCS integration)',
    ],
  },
  {
    phase: 4,
    weeks: 'Week 4-5',
    title: 'Interaction + Inspection',
    icon: <Eye className="w-5 h-5 text-purple-400" />,
    items: [
      'favorites, reviews, search',
      'inspection system (160-point)',
      'view tracking, recommendations',
    ],
  },
  {
    phase: 5,
    weeks: 'Week 5-6',
    title: 'Transaction Service',
    icon: <Cpu className="w-5 h-5 text-orange-400" />,
    items: [
      'orders, payments, escrow',
      'token system (purchase, usage, balance)',
      'rental bookings',
    ],
  },
  {
    phase: 6,
    weeks: 'Week 6-7',
    title: 'Business Service',
    icon: <Building2 className="w-5 h-5 text-blue-400" />,
    items: [
      'dealers, branches, staff',
      'dealer offers (B2B marketplace)',
      'banners, coupons, categories',
    ],
  },
  {
    phase: 7,
    weeks: 'Week 7-8',
    title: 'System Service',
    icon: <MessageSquare className="w-5 h-5 text-rose-400" />,
    items: [
      'chat (conversations + messages via WebSocket)',
      'notifications (push, email, in-app)',
      'analytics (events, page views, clicks)',
      'support tickets',
    ],
  },
  {
    phase: 8,
    weeks: 'Week 8-10',
    title: 'Frontend Migration + Integration',
    icon: <Rocket className="w-5 h-5 text-emerald-400" />,
    items: [
      'Replace 131 REST routes with GraphQL client',
      'Update all components data fetching',
      'Gateway deployment',
      'Testing + QA',
    ],
  },
]

// ─── Data: Tech Stack ────────────────────────────────────────
const techStack = [
  { layer: 'Frontend', tech: 'Next.js + React + Tailwind', version: '16 + 19 + 4' },
  { layer: 'GraphQL Client', tech: 'urql (lighter than Apollo)', version: 'latest' },
  { layer: 'API Gateway', tech: 'Fiber + gqlgen', version: 'v3 + latest' },
  { layer: 'Backend Services', tech: 'Go + Fiber + gqlgen', version: '1.25 + v3' },
  { layer: 'Database', tech: 'PostgreSQL (Cloud SQL)', version: '17' },
  { layer: 'Cache', tech: 'Redis (Memorystore)', version: '7' },
  { layer: 'Storage', tech: 'Google Cloud Storage', version: '—' },
  { layer: 'Auth', tech: 'Google OAuth + JWT', version: '—' },
  { layer: 'Inter-service', tech: 'gRPC (or HTTP for simplicity)', version: 'latest' },
  { layer: 'Container', tech: 'Docker + Cloud Run', version: '—' },
  { layer: 'Infrastructure', tech: 'Terraform (optional)', version: '—' },
]

// ─── Data: Risks ─────────────────────────────────────────────
const risks = [
  { risk: 'GraphQL complexity', severity: 'Medium', mitigation: 'Start with simple schema, iterate' },
  { risk: 'No FK data inconsistency', severity: 'High', mitigation: 'Application-level validation, periodic cleanup jobs' },
  { risk: 'N+1 queries in resolvers', severity: 'High', mitigation: 'DataLoader batching, Redis cache' },
  { risk: '6 services = 6 deploy pipelines', severity: 'Medium', mitigation: 'CI/CD automation, shared Makefile' },
  { risk: 'Cross-service latency', severity: 'Medium', mitigation: 'gRPC for internal calls, Redis cache' },
  { risk: 'Frontend rewrite (131 routes)', severity: 'High', mitigation: 'Incremental migration, feature flags' },
  { risk: 'Schema migration across 6 DBs', severity: 'Medium', mitigation: 'Versioned migrations per service' },
  { risk: 'Team size (1-3 devs for 6 services)', severity: 'High', mitigation: 'Clear documentation, shared patterns' },
]

// ─── Section Title Component ─────────────────────────────────
function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/15 to-cyan-500/15 border border-emerald-500/20 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
        {children}
      </h2>
    </div>
  )
}

// ─── Table Renderer ──────────────────────────────────────────
function ServiceTable({ tables }: { tables: TableDef[] }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800 hover:bg-transparent">
            <TableHead className="text-zinc-400 font-semibold text-xs uppercase tracking-wider py-3 px-4">
              Table Name
            </TableHead>
            <TableHead className="text-zinc-400 font-semibold text-xs uppercase tracking-wider py-3 px-4 hidden md:table-cell">
              Schema
            </TableHead>
            <TableHead className="text-zinc-400 font-semibold text-xs uppercase tracking-wider py-3 px-4">
              Key Columns
            </TableHead>
            <TableHead className="text-zinc-400 font-semibold text-xs uppercase tracking-wider py-3 px-4 hidden lg:table-cell">
              Notes
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tables.map((t) => (
            <TableRow key={t.name} className="border-zinc-800 hover:bg-zinc-800/40 transition-colors">
              <TableCell className="py-2.5 px-4 text-sm font-mono font-medium text-emerald-400 whitespace-nowrap">
                {t.name}
              </TableCell>
              <TableCell className="py-2.5 px-4 text-xs text-zinc-500 font-mono hidden md:table-cell">
                {t.schema}
              </TableCell>
              <TableCell className="py-2.5 px-4 text-xs text-zinc-400 max-w-xs">
                {t.columns}
              </TableCell>
              <TableCell className="py-2.5 px-4 text-xs text-zinc-500 hidden lg:table-cell">
                {t.notes}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// ─── Severity Badge ──────────────────────────────────────────
function SeverityBadge({ severity }: { severity: string }) {
  if (severity === 'High') {
    return (
      <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 text-xs whitespace-nowrap">
        {severity}
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs whitespace-nowrap">
      {severity}
    </Badge>
  )
}

// ─── Main Page ───────────────────────────────────────────────
export default function FinalBlueprintPage() {
  const totalTables = userTables.length + listingTables.length + interactionTables.length + transactionTables.length + businessTables.length + systemTables.length

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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 mb-8">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium tracking-wide">
                AUTOMARKET INDONESIA
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                FINAL BLUEPRINT
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto">
              AutoMarket Indonesia — Keputusan Final Arsitektur
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              {[
                { icon: <Zap className="w-4 h-4" />, value: 'GraphQL' },
                { icon: <Server className="w-4 h-4" />, value: '6 Microservices' },
                { icon: <Database className="w-4 h-4" />, value: '6 Schemas' },
                { icon: <Shield className="w-4 h-4" />, value: 'No FK' },
                { icon: <Layers className="w-4 h-4" />, value: `${totalTables} Tables` },
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

            <Badge className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-6 py-2 text-sm font-semibold">
              ✅ KEPUTUSAN FINAL — SIAP IMPLEMENTASI
            </Badge>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════════════════════════════ */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-12 sm:py-16 space-y-20 flex-1">

        {/* ─── SECTION 2: KEPUTUSAN SUMMARY ──────────────── */}
        <section>
          <SectionTitle icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}>
            Ringkasan Keputusan
          </SectionTitle>

          <Card className="bg-zinc-900 border border-emerald-500/30 overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-zinc-200">7 Keputusan Final Arsitektur</CardTitle>
              <CardDescription className="text-zinc-500">
                Semua keputusan sudah final dan siap untuk implementasi
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400 font-semibold text-sm py-3 px-4 w-12">#</TableHead>
                      <TableHead className="text-zinc-400 font-semibold text-sm py-3 px-4 w-44">Keputusan</TableHead>
                      <TableHead className="text-zinc-400 font-semibold text-sm py-3 px-4">Pilihan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {decisions.map((d) => (
                      <TableRow key={d.num} className="border-zinc-800 hover:bg-zinc-800/40 transition-colors">
                        <TableCell className="py-3 px-4 text-sm font-bold text-zinc-500">{d.num}</TableCell>
                        <TableCell className="py-3 px-4 text-sm font-medium text-zinc-200">{d.topic}</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-emerald-400 font-medium">{d.choice}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="bg-zinc-800/60" />

        {/* ─── SECTION 3: UPDATED PRD — COMPLETE TABLE LIST ─ */}
        <section>
          <SectionTitle icon={<Database className="w-5 h-5 text-emerald-400" />}>
            Updated PRD — Daftar Tabel Lengkap
          </SectionTitle>

          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <CardContent className="p-0">
              <Tabs defaultValue="user" className="w-full">
                <TabsList className="w-full justify-start bg-zinc-900 border-b border-zinc-800 rounded-none p-0 h-auto gap-0 overflow-x-auto flex-nowrap">
                  <TabsTrigger
                    value="user"
                    className="rounded-none border-b-2 border-transparent px-4 sm:px-6 py-3 data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:text-emerald-400 data-[state=active]:shadow-none text-zinc-500 text-xs sm:text-sm whitespace-nowrap"
                  >
                    USER ({userTables.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="listing"
                    className="rounded-none border-b-2 border-transparent px-4 sm:px-6 py-3 data-[state=active]:border-cyan-500 data-[state=active]:bg-transparent data-[state=active]:text-cyan-400 data-[state=active]:shadow-none text-zinc-500 text-xs sm:text-sm whitespace-nowrap"
                  >
                    LISTING ({listingTables.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="interaction"
                    className="rounded-none border-b-2 border-transparent px-4 sm:px-6 py-3 data-[state=active]:border-purple-500 data-[state=active]:bg-transparent data-[state=active]:text-purple-400 data-[state=active]:shadow-none text-zinc-500 text-xs sm:text-sm whitespace-nowrap"
                  >
                    INTERACTION ({interactionTables.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="transaction"
                    className="rounded-none border-b-2 border-transparent px-4 sm:px-6 py-3 data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:text-orange-400 data-[state=active]:shadow-none text-zinc-500 text-xs sm:text-sm whitespace-nowrap"
                  >
                    TRANSACTION ({transactionTables.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="business"
                    className="rounded-none border-b-2 border-transparent px-4 sm:px-6 py-3 data-[state=active]:border-blue-500 data-[state=active]:bg-transparent data-[state=active]:text-blue-400 data-[state=active]:shadow-none text-zinc-500 text-xs sm:text-sm whitespace-nowrap"
                  >
                    BUSINESS ({businessTables.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="system"
                    className="rounded-none border-b-2 border-transparent px-4 sm:px-6 py-3 data-[state=active]:border-rose-500 data-[state=active]:bg-transparent data-[state=active]:text-rose-400 data-[state=active]:shadow-none text-zinc-500 text-xs sm:text-sm whitespace-nowrap"
                  >
                    SYSTEM ({systemTables.length})
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="max-h-[600px]">
                  <TabsContent value="user" className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-semibold text-emerald-400">USER SERVICE — user_schema</span>
                    </div>
                    <ServiceTable tables={userTables} />
                  </TabsContent>

                  <TabsContent value="listing" className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Car className="w-4 h-4 text-cyan-400" />
                      <span className="text-sm font-semibold text-cyan-400">LISTING SERVICE — listing_schema</span>
                    </div>
                    <ServiceTable tables={listingTables} />
                  </TabsContent>

                  <TabsContent value="interaction" className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-semibold text-purple-400">INTERACTION SERVICE — interaction_schema</span>
                    </div>
                    <ServiceTable tables={interactionTables} />
                  </TabsContent>

                  <TabsContent value="transaction" className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Cpu className="w-4 h-4 text-orange-400" />
                      <span className="text-sm font-semibold text-orange-400">TRANSACTION SERVICE — transaction_schema</span>
                    </div>
                    <ServiceTable tables={transactionTables} />
                  </TabsContent>

                  <TabsContent value="business" className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-semibold text-blue-400">BUSINESS SERVICE — business_schema</span>
                    </div>
                    <ServiceTable tables={businessTables} />
                  </TabsContent>

                  <TabsContent value="system" className="p-4 sm:p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Settings className="w-4 h-4 text-rose-400" />
                      <span className="text-sm font-semibold text-rose-400">SYSTEM SERVICE — system_schema</span>
                    </div>
                    <ServiceTable tables={systemTables} />
                  </TabsContent>
                </ScrollArea>
              </Tabs>

              <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/50">
                <p className="text-sm text-zinc-400">
                  <span className="font-bold text-emerald-400">TOTAL: {totalTables} tabel</span> across 6 schemas{' '}
                  <span className="text-zinc-500">(73 PRD + 27 extra)</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="bg-zinc-800/60" />

        {/* ─── SECTION 4: SYSTEM ARCHITECTURE DIAGRAM ────── */}
        <section>
          <SectionTitle icon={<Server className="w-5 h-5 text-emerald-400" />}>
            Diagram Arsitektur Sistem
          </SectionTitle>

          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <pre className="p-4 sm:p-6 rounded-lg bg-zinc-950 border border-zinc-800 overflow-x-auto text-[10px] sm:text-xs font-mono text-zinc-400 leading-relaxed">
                <code>{`┌──────────────────────────────────────────────────────┐
│                    Next.js 16 (FE)                    │
│              GraphQL Client (urql/Apollo)              │
│         131 pages · 120+ components · SSR/SSG         │
└────────────────────────┬─────────────────────────────┘
                         │ GraphQL (HTTP)
                         ▼
┌──────────────────────────────────────────────────────┐
│              GraphQL Gateway (Fiber v3)               │
│         gqlgen · Schema Stitching · Auth              │
│         DataLoader · Rate Limiting · Logging          │
└───┬────┬────┬────┬────┬──────────────────────────────┘
    │    │    │    │    │
    ▼    ▼    ▼    ▼    ▼
┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐┌──────┐
│ user ││listng││inter ││trans ││busin ││system│
│ svc  ││ svc  ││ svc  ││ svc  ││ svc  ││ svc  │
│:3001 ││:3002 ││:3003 ││:3004 ││:3005 ││:3006 │
└──┬───┘└──┬───┘└──┬───┘└──┬───┘└──┬───┘└──┬───┘
   │       │       │       │       │       │
   ▼       ▼       ▼       ▼       ▼       ▼
┌──────────────────────────────────────────────────────┐
│              Cloud SQL — PostgreSQL 17                │
│                                                       │
│  user_schema    listing_schema    interaction_schema  │
│  transaction_schema  business_schema  system_schema  │
└──────────────────────────────────────────────────────┘
   │               │               │
   ▼               ▼               ▼
┌────────┐  ┌──────────┐  ┌────────────────┐
│ Redis  │  │ GCS      │  │ Cloud Run     │
│ Cache  │  │ Storage  │  │ (6 containers) │
└────────┘  └──────────┘  └────────────────┘`}</code>
              </pre>
            </CardContent>
          </Card>
        </section>

        <Separator className="bg-zinc-800/60" />

        {/* ─── SECTION 5: GRAPHQL SCHEMA DESIGN ─────────── */}
        <section>
          <SectionTitle icon={<Code2 className="w-5 h-5 text-emerald-400" />}>
            Desain GraphQL Schema
          </SectionTitle>

          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                  Gateway Schema
                </Badge>
                <span className="text-sm text-zinc-500">Stitched dari semua services</span>
              </div>
              <pre className="p-4 sm:p-6 rounded-lg bg-zinc-950 border border-zinc-800 overflow-x-auto text-[10px] sm:text-xs font-mono text-zinc-400 leading-relaxed">
                <code>{`# Gateway Schema (stitched from all services)

type Query {
  # Listing Service
  cars(filter: CarFilter, pagination: Pagination): CarConnection!
  car(id: ID!): Car
  brands: [Brand!]!
  models(brandId: ID!): [CarModel!]!

  # User Service  
  me: User!
  user(id: ID!): User
  dealer(slug: String!): Dealer

  # Transaction Service
  orders: [Order!]!
  order(id: ID!): Order
  myTokens: UserToken!

  # Interaction Service
  myFavorites: [Favorite!]!
  reviews(carId: ID!): [Review!]!
  recommendations: [Recommendation!]!

  # Business Service
  dealers(filter: DealerFilter): [Dealer!]!
  banners(position: String): [Banner!]!

  # System Service
  conversations: [Conversation!]!
  notifications: [Notification!]!
  trendingCars: [TrendingCar!]!
}

type Mutation {
  # Auth
  login(input: LoginInput!): AuthPayload!
  register(input: RegisterInput!): AuthPayload!
  googleAuth(token: String!): AuthPayload!

  # Listings
  createListing(input: CreateListingInput!): Car!
  updateListing(id: ID!, input: UpdateListingInput!): Car!
  deleteListing(id: ID!): Boolean!

  # Interactions
  toggleFavorite(carId: ID!): Boolean!
  createReview(input: CreateReviewInput!): Review!

  # Transactions
  createOrder(input: CreateOrderInput!): Order!
  purchaseTokens(packageId: ID!): UserToken!

  # Chat
  sendMessage(input: SendMessageInput!): Message!
  createConversation(carId: ID!): Conversation!
}`}</code>
              </pre>
            </CardContent>
          </Card>
        </section>

        <Separator className="bg-zinc-800/60" />

        {/* ─── SECTION 6: FOLDER STRUCTURE PER SERVICE ───── */}
        <section>
          <SectionTitle icon={<GitBranch className="w-5 h-5 text-emerald-400" />}>
            Struktur Folder per Service
          </SectionTitle>

          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-zinc-200">Struktur Standar — Berlaku untuk semua 6 services</CardTitle>
              <CardDescription className="text-zinc-500">
                Setiap service mengikuti pola Clean Architecture yang sama
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <pre className="p-4 sm:p-6 rounded-lg bg-zinc-950 border border-zinc-800 overflow-x-auto text-[10px] sm:text-xs font-mono text-zinc-400 leading-relaxed">
                <code>{`/services
├── gateway/                    # GraphQL Gateway (Fiber + gqlgen)
│   ├── cmd/server/main.go
│   ├── internal/
│   │   ├── gqlgen/             # Generated GraphQL code
│   │   ├── resolver/           # Gateway resolvers (stitching)
│   │   ├── middleware/         # Auth, rate limit, logging
│   │   └── config/
│   ├── graph/
│   │   └── gateway.graphql     # Stitched schema
│   └── go.mod
│
├── user-service/               # Port 3001
│   ├── cmd/server/main.go
│   ├── internal/
│   │   ├── domain/             # Models (NO GORM FK)
│   │   │   └── user.go
│   │   ├── repository/
│   │   │   └── user_repository.go
│   │   ├── usecase/
│   │   │   └── user_usecase.go
│   │   ├── handler/
│   │   │   └── grpc_handler.go  # or REST for internal
│   │   ├── gqlgen/             # GraphQL resolvers
│   │   └── dto/
│   ├── graph/
│   │   └── user.graphql        # User service schema
│   ├── migrations/             # SQL migrations (user_schema)
│   └── go.mod
│
├── listing-service/            # Port 3002
├── interaction-service/        # Port 3003
├── transaction-service/        # Port 3004
├── business-service/           # Port 3005
└── system-service/             # Port 3006`}</code>
              </pre>
            </CardContent>
          </Card>
        </section>

        <Separator className="bg-zinc-800/60" />

        {/* ─── SECTION 7: NO FK — HOW IT WORKS ──────────── */}
        <section>
          <SectionTitle icon={<Shield className="w-5 h-5 text-emerald-400" />}>
            No Foreign Key — Cara Kerja
          </SectionTitle>

          <Accordion type="multiple" defaultValue={['before', 'after', 'why']} className="space-y-3">
            <AccordionItem value="before" className="border-zinc-800 bg-zinc-900 rounded-lg px-4 data-[state=open]:border-red-500/30 overflow-hidden">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-semibold text-red-400">Before — GORM foreignKey (creates DB constraint)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <pre className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 overflow-x-auto text-[10px] sm:text-xs font-mono text-zinc-400 leading-relaxed">
                  <code>{`// ❌ OLD — GORM foreignKey (creates DB constraint)
type CarListing struct {
    BrandID *uuid.UUID \`gorm:"type:uuid;index"\`
    Brand   *Brand     \`gorm:"foreignKey:BrandID"\` // Creates FK constraint!
}
// → ALTER TABLE car_listings ADD CONSTRAINT fk_brand 
//   FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE CASCADE`}</code>
                </pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="after" className="border-zinc-800 bg-zinc-900 rounded-lg px-4 data-[state=open]:border-emerald-500/30 overflow-hidden">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">After — No FK, UUID reference only</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <pre className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 overflow-x-auto text-[10px] sm:text-xs font-mono text-zinc-400 leading-relaxed">
                  <code>{`// ✅ NEW — No FK constraint, GORM preload via manual resolver
type CarListing struct {
    BrandID *uuid.UUID \`gorm:"type:uuid;index"\` // Just an index, no FK
    // NO gorm:"foreignKey:BrandID" tag
    // Brand resolved in GraphQL resolver
}

// In GraphQL resolver:
func (r *carResolver) Brand(ctx context.Context, obj *CarListing) (*Brand, error) {
    if obj.BrandID == nil { return nil, nil }
    return r.listingSvc.GetBrandByID(ctx, *obj.BrandID)
}`}</code>
                </pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="why" className="border-zinc-800 bg-zinc-900 rounded-lg px-4 data-[state=open]:border-cyan-500/30 overflow-hidden">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-cyan-400">Why this matters for microservices</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                    <span className="text-emerald-400 mt-0.5">→</span>
                    <p className="text-sm text-zinc-400">
                      <span className="text-zinc-200 font-medium">listing-service</span> tidak bisa JOIN ke <span className="font-mono text-zinc-200">user_service.profiles</span> (berbeda schema/service)
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                    <span className="text-emerald-400 mt-0.5">→</span>
                    <p className="text-sm text-zinc-400">
                      GraphQL resolver memanggil <span className="text-zinc-200 font-medium">user-service</span> internally via gRPC atau HTTP
                    </p>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                    <span className="text-emerald-400 mt-0.5">→</span>
                    <p className="text-sm text-zinc-400">
                      Setiap service memiliki data secara independen — true service ownership
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <Separator className="bg-zinc-800/60" />

        {/* ─── SECTION 8: IMPLEMENTATION ROADMAP ────────── */}
        <section>
          <SectionTitle icon={<Rocket className="w-5 h-5 text-emerald-400" />}>
            Implementation Roadmap
          </SectionTitle>

          <div className="space-y-4">
            {roadmapPhases.map((phase) => (
              <Card key={phase.phase} className="bg-zinc-900 border-zinc-800 overflow-hidden">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                        {phase.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                            Phase {phase.phase}
                          </Badge>
                          <span className="text-xs text-zinc-500 font-mono">{phase.weeks}</span>
                        </div>
                        <h3 className="text-base font-bold text-zinc-100 mt-0.5">{phase.title}</h3>
                      </div>
                    </div>
                    {phase.phase < 8 && (
                      <div className="hidden sm:flex items-center justify-end flex-1">
                        <ArrowRight className="w-5 h-5 text-zinc-700" />
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-0 sm:ml-[52px]">
                    {phase.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 rounded-lg bg-zinc-900 border border-zinc-800">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-zinc-500" />
              <span className="text-sm font-semibold text-zinc-300">Total Estimasi Timeline</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-zinc-400">Backend: 8 minggu</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-cyan-500" />
                <span className="text-xs text-zinc-400">Frontend Migration: 2 minggu</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-xs text-zinc-400">Testing + QA: 2 minggu</span>
              </div>
              <span className="text-xs text-zinc-500 font-bold">= ~10 minggu total</span>
            </div>
          </div>
        </section>

        <Separator className="bg-zinc-800/60" />

        {/* ─── SECTION 9: TECHNOLOGY STACK ──────────────── */}
        <section>
          <SectionTitle icon={<Box className="w-5 h-5 text-emerald-400" />}>
            Technology Stack (Final)
          </SectionTitle>

          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-zinc-200">Teknologi per Layer</CardTitle>
              <CardDescription className="text-zinc-500">
                Stack final yang akan digunakan di seluruh proyek
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400 font-semibold text-sm py-3 px-4">Layer</TableHead>
                      <TableHead className="text-zinc-400 font-semibold text-sm py-3 px-4">Technology</TableHead>
                      <TableHead className="text-zinc-400 font-semibold text-sm py-3 px-4">Version</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {techStack.map((t) => (
                      <TableRow key={t.layer} className="border-zinc-800 hover:bg-zinc-800/40 transition-colors">
                        <TableCell className="py-3 px-4 text-sm font-medium text-zinc-200">{t.layer}</TableCell>
                        <TableCell className="py-3 px-4 text-sm font-mono text-cyan-400">{t.tech}</TableCell>
                        <TableCell className="py-3 px-4 text-sm text-zinc-500 font-mono">{t.version}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="bg-zinc-800/60" />

        {/* ─── SECTION 10: RISKS & MITIGATIONS ──────────── */}
        <section>
          <SectionTitle icon={<AlertTriangle className="w-5 h-5 text-emerald-400" />}>
            Risks & Mitigations
          </SectionTitle>

          <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400 font-semibold text-sm py-3 px-4">Risk</TableHead>
                      <TableHead className="text-zinc-400 font-semibold text-sm py-3 px-4 w-28">Severity</TableHead>
                      <TableHead className="text-zinc-400 font-semibold text-sm py-3 px-4">Mitigation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {risks.map((r) => (
                      <TableRow key={r.risk} className="border-zinc-800 hover:bg-zinc-800/40 transition-colors">
                        <TableCell className="py-3 px-4 text-sm font-medium text-zinc-200">{r.risk}</TableCell>
                        <TableCell className="py-3 px-4">
                          <SeverityBadge severity={r.severity} />
                        </TableCell>
                        <TableCell className="py-3 px-4 text-sm text-zinc-400">{r.mitigation}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Alert className="mt-6 border-amber-500/40 bg-amber-500/5">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <AlertTitle className="text-amber-400 font-semibold">Perhatian Khusus</AlertTitle>
            <AlertDescription className="text-zinc-400 text-sm mt-1">
              Risiko tertinggi ada di <span className="text-amber-400 font-semibold">data inconsistency (No FK)</span> dan <span className="text-amber-400 font-semibold">frontend rewrite (131 routes)</span>. 
              Kedua hal ini perlu mitigasi proaktif dari awal development.
            </AlertDescription>
          </Alert>
        </section>

      </main>

      {/* ═══════════════════════════════════════════════════════
          FOOTER — Sticky Bottom Bar
      ═══════════════════════════════════════════════════════ */}
      <footer className="sticky bottom-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Rocket className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-bold text-emerald-400">
                FINAL BLUEPRINT — Menunggu konfirmasi untuk mulai implementasi
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{totalTables} tables · 6 services · 6 schemas · GraphQL</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
