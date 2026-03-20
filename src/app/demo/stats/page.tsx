import { MainLayout } from '@/components/layout/MainLayout'
import { DashboardStats, MiniStats } from '@/components/dashboard/DashboardStats'
import { StatsCard } from '@/components/ui/stats-card'
import { 
  Car, 
  CheckCircle, 
  Eye, 
  Heart, 
  MessageCircle, 
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  Users,
  Store,
  Activity,
  BarChart
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function StatsDemoPage() {
  // Demo stats data (would come from API in real usage)
  const demoStats = {
    totalListings: 52,
    activeListings: 45,
    soldListings: 7,
    views: 15420,
    favorites: 234,
    inquiries: 45,
    revenue: 2580000000,
    conversionRate: 13.5,
  }

  return (
    <MainLayout>
      <main className="min-h-screen bg-muted/30 pb-12">
        <div className="container mx-auto px-4 pt-6 space-y-8">
          
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold">StatsCard Components Demo</h1>
            <p className="text-muted-foreground">
              Komponen statistik untuk dashboard AutoMarket
            </p>
          </div>

          {/* Full Dashboard Stats Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Stats - Full Variant</CardTitle>
              <CardDescription>
                Menampilkan semua statistik untuk dashboard dealer/seller
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardStats variant="full" />
            </CardContent>
          </Card>

          {/* Compact Variant */}
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Stats - Compact Variant</CardTitle>
              <CardDescription>
                Versi ringkas untuk header atau sidebar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardStats variant="compact" />
            </CardContent>
          </Card>

          {/* Minimal Variant */}
          <Card>
            <CardHeader>
              <CardTitle>Dashboard Stats - Minimal Variant</CardTitle>
              <CardDescription>
                Hanya 2 statistik utama
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardStats variant="minimal" />
            </CardContent>
          </Card>

          {/* Individual Cards Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Individual StatsCard Variants</CardTitle>
              <CardDescription>
                Setiap varian warna untuk konteks berbeda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Default */}
                <StatsCard
                  title="Default Variant"
                  value={demoStats.views}
                  icon={Eye}
                  format="short"
                  variant="default"
                  description="Tanpa warna khusus"
                  trend={{ value: 8, isPositive: true }}
                />
                
                {/* Primary */}
                <StatsCard
                  title="Primary Variant"
                  value={demoStats.totalListings}
                  icon={Car}
                  format="number"
                  variant="primary"
                  description="Warna brand utama"
                  badge="Baru"
                />
                
                {/* Success */}
                <StatsCard
                  title="Success Variant"
                  value={demoStats.activeListings}
                  icon={CheckCircle}
                  format="number"
                  variant="success"
                  description="Iklan aktif"
                  trend={{ value: 12, isPositive: true }}
                />
                
                {/* Warning */}
                <StatsCard
                  title="Warning Variant"
                  value={demoStats.inquiries}
                  icon={MessageCircle}
                  format="number"
                  variant="warning"
                  description="Perlu perhatian"
                />
                
                {/* Danger */}
                <StatsCard
                  title="Danger Variant"
                  value={demoStats.favorites}
                  icon={Heart}
                  format="number"
                  variant="danger"
                  description="Favorit pengguna"
                  trend={{ value: 5, isPositive: true }}
                />
                
                {/* Info */}
                <StatsCard
                  title="Info Variant"
                  value={demoStats.soldListings}
                  icon={TrendingUp}
                  format="number"
                  variant="info"
                  description="Transaksi selesai"
                />
              </div>
            </CardContent>
          </Card>

          {/* Format Options Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Format Options</CardTitle>
              <CardDescription>
                Berbagai format tampilan nilai
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Format: Number"
                  value={12345}
                  icon={Activity}
                  format="number"
                  variant="default"
                  description="12.345 (dengan separator)"
                />
                
                <StatsCard
                  title="Format: Currency"
                  value={250000000}
                  icon={DollarSign}
                  format="currency"
                  variant="success"
                  description="Rp 250.000.000"
                />
                
                <StatsCard
                  title="Format: Short"
                  value={1540000}
                  icon={BarChart}
                  format="short"
                  variant="primary"
                  description="1,54Jt (ringkas)"
                />
                
                <StatsCard
                  title="Format: Percentage"
                  value={85.5}
                  icon={TrendingUp}
                  format="percentage"
                  variant="success"
                  description="85,5%"
                />
              </div>
            </CardContent>
          </Card>

          {/* Trend Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Trend Indicators</CardTitle>
              <CardDescription>
                Indikator tren naik/turun
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <StatsCard
                  title="Trend Naik"
                  value={1250}
                  icon={TrendingUp}
                  format="number"
                  variant="success"
                  trend={{ value: 15, isPositive: true, label: 'dari bulan lalu' }}
                />
                
                <StatsCard
                  title="Trend Turun"
                  value={850}
                  icon={TrendingUp}
                  format="number"
                  variant="danger"
                  trend={{ value: 8, isPositive: false, label: 'dari minggu lalu' }}
                />
                
                <StatsCard
                  title="Stabil"
                  value={500}
                  icon={Activity}
                  format="number"
                  variant="default"
                  trend={{ value: 0, isPositive: true, label: 'tidak ada perubahan' }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Loading State */}
          <Card>
            <CardHeader>
              <CardTitle>Loading State</CardTitle>
              <CardDescription>
                Skeleton loading untuk state loading
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <StatsCard
                  title="Loading..."
                  value={0}
                  icon={Car}
                  isLoading={true}
                />
                <StatsCard
                  title="Loading..."
                  value={0}
                  icon={Eye}
                  isLoading={true}
                />
                <StatsCard
                  title="Loading..."
                  value={0}
                  icon={DollarSign}
                  isLoading={true}
                />
              </div>
            </CardContent>
          </Card>

          {/* Clickable Cards */}
          <Card>
            <CardHeader>
              <CardTitle>Clickable Cards</CardTitle>
              <CardDescription>
                Kartu yang bisa diklik untuk navigasi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <StatsCard
                  title="Total Listings"
                  value={demoStats.totalListings}
                  icon={Car}
                  format="number"
                  variant="primary"
                  href="/demo/stats"
                  description="Klik untuk melihat semua"
                />
                
                <StatsCard
                  title="Pertanyaan Baru"
                  value={demoStats.inquiries}
                  icon={MessageCircle}
                  format="number"
                  variant="warning"
                  href="/demo/stats"
                  badge="Baru"
                />
                
                <StatsCard
                  title="Pending Review"
                  value={3}
                  icon={Clock}
                  format="number"
                  variant="danger"
                  href="/demo/stats"
                  description="Perlu ditinjau segera"
                />
              </div>
            </CardContent>
          </Card>

          {/* Admin/Global Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Dashboard Stats</CardTitle>
              <CardDescription>
                Statistik global untuk admin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                  title="Total Users"
                  value={12500}
                  icon={Users}
                  format="short"
                  variant="primary"
                  trend={{ value: 20, isPositive: true }}
                  href="/admin/users"
                />
                
                <StatsCard
                  title="Total Dealers"
                  value={485}
                  icon={Store}
                  format="number"
                  variant="info"
                  trend={{ value: 8, isPositive: true }}
                  href="/admin/dealers"
                />
                
                <StatsCard
                  title="Total Listings"
                  value={8750}
                  icon={Car}
                  format="short"
                  variant="success"
                  trend={{ value: 15, isPositive: true }}
                  href="/admin/listings"
                />
                
                <StatsCard
                  title="Total Revenue"
                  value={15800000000}
                  icon={DollarSign}
                  format="currency"
                  variant="success"
                  subtitle="Estimasi nilai transaksi"
                />
              </div>
            </CardContent>
          </Card>

          {/* Mini Stats for Header */}
          <Card>
            <CardHeader>
              <CardTitle>Mini Stats</CardTitle>
              <CardDescription>
                Statistik mini untuk header/navbar
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-8">
              <MiniStats />
            </CardContent>
          </Card>

        </div>
      </main>
    </MainLayout>
  )
}
