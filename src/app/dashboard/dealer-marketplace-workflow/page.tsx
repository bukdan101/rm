'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Store,
  Users,
  ArrowRight,
  CheckCircle,
  Clock,
  Coins,
  MessageSquare,
  Car,
  Send,
  Eye,
  Heart,
  Settings,
  Sparkles,
  AlertCircle,
  Loader2,
} from 'lucide-react'

export default function DealerMarketplaceWorkflowPage() {
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [dbStatus, setDbStatus] = useState<any>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch settings
        const settingsRes = await fetch('/api/dealer-marketplace/settings')
        const settingsData = await settingsRes.json()
        if (settingsData.success) {
          setSettings(settingsData.settings)
        }

        // Check DB status
        const dbRes = await fetch('/api/dealer-marketplace/check-db')
        const dbData = await dbRes.json()
        setDbStatus(dbData)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center justify-center gap-2">
          <Store className="h-8 w-8 text-purple-500" />
          Dealer Marketplace Workflow
        </h1>
        <p className="text-muted-foreground mt-2">
          Visualisasi alur penjualan mobil dari User ke Dealer
        </p>
      </div>

      {/* Database Status */}
      <Card className={dbStatus?.success ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}>
        <CardContent className="py-4">
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memeriksa database...
            </div>
          ) : dbStatus?.success ? (
            <div>
              <p className="font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                {dbStatus.message}
              </p>
              {dbStatus.summary && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(dbStatus.summary.tables || {}).map(([table, exists]: [string, any]) => (
                    <Badge key={table} variant={exists ? "default" : "destructive"} className="text-xs">
                      {table}: {exists ? '✓' : '✗'}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <p className="text-amber-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Database belum dikonfigurasi. Jalankan SQL schema di Supabase.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Current Settings */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Konfigurasi Saat Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat...
            </div>
          ) : settings ? (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-500">Public</p>
                <p className="text-xl font-bold">{settings.token_cost_public} Token</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-500">Dealer</p>
                <p className="text-xl font-bold">{settings.token_cost_dealer_marketplace} Token</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-500">Keduanya</p>
                <p className="text-xl font-bold">{settings.token_cost_both} Token</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-500">Durasi Offer</p>
                <p className="text-xl font-bold">{settings.default_offer_duration_hours} jam</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg">
                <p className="text-xs text-gray-500">Inspeksi</p>
                <p className="text-xl font-bold">Rp {settings.inspection_cost?.toLocaleString()}</p>
              </div>
            </div>
          ) : (
            <p className="text-amber-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Settings belum tersedia (gunakan default)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Workflow Diagram */}
      <div className="grid gap-6">
        {/* Phase 1 */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <span className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm">1</span>
              USER BUAT LISTING
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border-2 border-blue-200 rounded-lg p-4 text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-bold">Jual Langsung</h3>
                <Badge className="mt-2">{settings?.token_cost_public || 1} Token</Badge>
              </div>
              <div className="border-2 border-purple-200 rounded-lg p-4 text-center relative">
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-amber-500">Premium</Badge>
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                  <Store className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-bold">Tawar ke Dealer</h3>
                <Badge className="mt-2">{settings?.token_cost_dealer_marketplace || 2} Token</Badge>
              </div>
              <div className="border-2 border-green-200 rounded-lg p-4 text-center relative">
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-green-500">Best Value</Badge>
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-bold">Keduanya</h3>
                <Badge className="mt-2">{settings?.token_cost_both || 3} Token</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center"><ArrowRight className="h-8 w-8 text-gray-400 rotate-90 md:rotate-0" /></div>

        {/* Phase 2 */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <span className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm">2</span>
              DEALER LIHAT & BUAT PENAWARAN
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex gap-4 items-start">
                <div className="w-32 h-24 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                  <Car className="h-10 w-10 text-gray-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">Toyota Avanza 2020</h4>
                  <p className="text-xl font-bold text-green-600">Rp 180.000.000</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1" /> Detail</Button>
                    <Button size="sm" className="bg-purple-500"><Send className="h-4 w-4 mr-1" /> Buat Penawaran</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center"><ArrowRight className="h-8 w-8 text-gray-400 rotate-90 md:rotate-0" /></div>

        {/* Phase 3 */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <span className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm">3</span>
              USER RESPON PENAWARAN
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border-2 border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="h-10 w-10 text-green-500 mx-auto" />
                <h4 className="font-bold mt-2">TERIMA</h4>
                <p className="text-xs text-gray-500">Deal langsung</p>
              </div>
              <div className="border-2 border-purple-200 rounded-lg p-4 text-center">
                <MessageSquare className="h-10 w-10 text-purple-500 mx-auto" />
                <h4 className="font-bold mt-2">NEGOSIASI</h4>
                <p className="text-xs text-gray-500">Counter offer</p>
              </div>
              <div className="border-2 border-red-200 rounded-lg p-4 text-center">
                <Eye className="h-10 w-10 text-red-500 mx-auto" />
                <h4 className="font-bold mt-2">TOLAK</h4>
                <p className="text-xs text-gray-500">Penawaran ditolak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center"><ArrowRight className="h-8 w-8 text-gray-400 rotate-90 md:rotate-0" /></div>

        {/* Phase 4 */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <span className="bg-white/20 rounded-full w-8 h-8 flex items-center justify-center text-sm">4</span>
              TRANSAKSI SELESAI
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
                <p className="mt-2 font-semibold">Deal!</p>
              </div>
              <ArrowRight className="hidden md:block h-6 w-6 text-gray-400" />
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                  <Coins className="h-8 w-8 text-blue-600" />
                </div>
                <p className="mt-2 font-semibold">Pembayaran</p>
              </div>
              <ArrowRight className="hidden md:block h-6 w-6 text-gray-400" />
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto">
                  <Car className="h-8 w-8 text-purple-600" />
                </div>
                <p className="mt-2 font-semibold">Serah Terima</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100">
        <CardHeader>
          <CardTitle>Akses Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button asChild variant="outline" className="h-auto py-4 flex-col">
              <a href="/dealer/marketplace">
                <Store className="h-5 w-5 mb-1" />
                <span className="text-xs">Dealer Marketplace</span>
              </a>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col">
              <a href="/dashboard/offers">
                <Send className="h-5 w-5 mb-1" />
                <span className="text-xs">Penawaran Dealer</span>
              </a>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col">
              <a href="/admin/dealer-marketplace">
                <Settings className="h-5 w-5 mb-1" />
                <span className="text-xs">Admin Settings</span>
              </a>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col">
              <a href="/api/dealer-marketplace/check-db">
                <CheckCircle className="h-5 w-5 mb-1" />
                <span className="text-xs">Check Database</span>
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
