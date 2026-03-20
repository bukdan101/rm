'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Settings, Save, Loader2, Globe, Shield, DollarSign } from 'lucide-react'

interface SystemSettings {
  site_name: string
  site_tagline: string
  site_description: string
  contact_email: string
  contact_phone: string
  maintenance_mode: boolean
  allow_registration: boolean
  allow_listing: boolean
  max_listings_per_user: number
  max_images_per_listing: number
  require_listing_approval: boolean
  email_notifications_enabled: boolean
}

interface FeeSettings {
  platform_fee_percent: number
  transaction_fee: number
  withdrawal_fee: number
  min_withdrawal: number
  max_withdrawal_per_day: number
  dealer_subscription_monthly: number
  dealer_subscription_yearly: number
}

export default function AdminSettingsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    site_name: 'AutoMarket',
    site_tagline: '',
    site_description: '',
    contact_email: 'support@automarket.id',
    contact_phone: '',
    maintenance_mode: false,
    allow_registration: true,
    allow_listing: true,
    max_listings_per_user: 10,
    max_images_per_listing: 10,
    require_listing_approval: false,
    email_notifications_enabled: true,
  })

  const [feeSettings, setFeeSettings] = useState<FeeSettings>({
    platform_fee_percent: 2.5,
    transaction_fee: 5000,
    withdrawal_fee: 10000,
    min_withdrawal: 50000,
    max_withdrawal_per_day: 10000000,
    dealer_subscription_monthly: 100000,
    dealer_subscription_yearly: 1000000,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/settings')
      const data = await res.json()

      if (data.success) {
        if (data.data?.systemSettings) {
          setSystemSettings(prev => ({ ...prev, ...data.data.systemSettings }))
        }
        if (data.data?.feeSettings) {
          setFeeSettings(prev => ({ ...prev, ...data.data.feeSettings }))
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat pengaturan',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSystem = async () => {
    try {
      setSaving(true)
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'system', settings: systemSettings }),
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Berhasil', description: 'Pengaturan berhasil disimpan' })
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan pengaturan',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveFees = async () => {
    try {
      setSaving(true)
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'fee', settings: feeSettings }),
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Berhasil', description: 'Pengaturan biaya berhasil disimpan' })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan pengaturan',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Settings className="h-8 w-8 text-orange-500" />
          Pengaturan
        </h1>
        <p className="text-gray-400 mt-1">Konfigurasi sistem platform</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger value="general" className="data-[state=active]:bg-gray-800">
            <Globe className="h-4 w-4 mr-2" />
            Umum
          </TabsTrigger>
          <TabsTrigger value="features" className="data-[state=active]:bg-gray-800">
            <Shield className="h-4 w-4 mr-2" />
            Fitur
          </TabsTrigger>
          <TabsTrigger value="fees" className="data-[state=active]:bg-gray-800">
            <DollarSign className="h-4 w-4 mr-2" />
            Biaya
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="mt-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Informasi Situs</CardTitle>
              <CardDescription className="text-gray-400">Pengaturan dasar platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Nama Situs</Label>
                  <Input
                    value={systemSettings.site_name}
                    onChange={(e) => setSystemSettings(s => ({ ...s, site_name: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-400">Tagline</Label>
                  <Input
                    value={systemSettings.site_tagline}
                    onChange={(e) => setSystemSettings(s => ({ ...s, site_tagline: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Marketplace Mobil Terpercaya"
                  />
                </div>
                <div>
                  <Label className="text-gray-400">Email Kontak</Label>
                  <Input
                    value={systemSettings.contact_email}
                    onChange={(e) => setSystemSettings(s => ({ ...s, contact_email: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-400">Telepon Kontak</Label>
                  <Input
                    value={systemSettings.contact_phone}
                    onChange={(e) => setSystemSettings(s => ({ ...s, contact_phone: e.target.value }))}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
              <div>
                <Label className="text-gray-400">Deskripsi</Label>
                <Input
                  value={systemSettings.site_description}
                  onChange={(e) => setSystemSettings(s => ({ ...s, site_description: e.target.value }))}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="Deskripsi singkat tentang platform"
                />
              </div>

              <Button onClick={handleSaveSystem} disabled={saving} className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Simpan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="mt-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Fitur Platform</CardTitle>
              <CardDescription className="text-gray-400">Aktifkan/nonaktifkan fitur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                <div>
                  <p className="text-white font-medium">Mode Maintenance</p>
                  <p className="text-gray-400 text-sm">Situs hanya bisa diakses admin</p>
                </div>
                <Switch
                  checked={systemSettings.maintenance_mode}
                  onCheckedChange={(v) => setSystemSettings(s => ({ ...s, maintenance_mode: v }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                <div>
                  <p className="text-white font-medium">Registrasi User</p>
                  <p className="text-gray-400 text-sm">Izinkan user baru mendaftar</p>
                </div>
                <Switch
                  checked={systemSettings.allow_registration}
                  onCheckedChange={(v) => setSystemSettings(s => ({ ...s, allow_registration: v }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                <div>
                  <p className="text-white font-medium">Buat Iklan</p>
                  <p className="text-gray-400 text-sm">Izinkan user membuat listing</p>
                </div>
                <Switch
                  checked={systemSettings.allow_listing}
                  onCheckedChange={(v) => setSystemSettings(s => ({ ...s, allow_listing: v }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                <div>
                  <p className="text-white font-medium">Approval Listing</p>
                  <p className="text-gray-400 text-sm">Listing perlu disetujui admin</p>
                </div>
                <Switch
                  checked={systemSettings.require_listing_approval}
                  onCheckedChange={(v) => setSystemSettings(s => ({ ...s, require_listing_approval: v }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                <div>
                  <p className="text-white font-medium">Email Notifikasi</p>
                  <p className="text-gray-400 text-sm">Kirim notifikasi via email</p>
                </div>
                <Switch
                  checked={systemSettings.email_notifications_enabled}
                  onCheckedChange={(v) => setSystemSettings(s => ({ ...s, email_notifications_enabled: v }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Max Listing per User</Label>
                  <Input
                    type="number"
                    value={systemSettings.max_listings_per_user}
                    onChange={(e) => setSystemSettings(s => ({ ...s, max_listings_per_user: Number(e.target.value) }))}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-400">Max Gambar per Listing</Label>
                  <Input
                    type="number"
                    value={systemSettings.max_images_per_listing}
                    onChange={(e) => setSystemSettings(s => ({ ...s, max_images_per_listing: Number(e.target.value) }))}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <Button onClick={handleSaveSystem} disabled={saving} className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Simpan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fees Tab */}
        <TabsContent value="fees" className="mt-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Pengaturan Biaya</CardTitle>
              <CardDescription className="text-gray-400">Biaya platform dan transaksi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400">Platform Fee (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={feeSettings.platform_fee_percent}
                    onChange={(e) => setFeeSettings(s => ({ ...s, platform_fee_percent: Number(e.target.value) }))}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-400">Biaya Transaksi (Rp)</Label>
                  <Input
                    type="number"
                    value={feeSettings.transaction_fee}
                    onChange={(e) => setFeeSettings(s => ({ ...s, transaction_fee: Number(e.target.value) }))}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-400">Biaya Penarikan (Rp)</Label>
                  <Input
                    type="number"
                    value={feeSettings.withdrawal_fee}
                    onChange={(e) => setFeeSettings(s => ({ ...s, withdrawal_fee: Number(e.target.value) }))}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-400">Min. Penarikan (Rp)</Label>
                  <Input
                    type="number"
                    value={feeSettings.min_withdrawal}
                    onChange={(e) => setFeeSettings(s => ({ ...s, min_withdrawal: Number(e.target.value) }))}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-400">Max. Penarikan/Hari (Rp)</Label>
                  <Input
                    type="number"
                    value={feeSettings.max_withdrawal_per_day}
                    onChange={(e) => setFeeSettings(s => ({ ...s, max_withdrawal_per_day: Number(e.target.value) }))}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-400">Langganan Dealer/Bulan (Rp)</Label>
                  <Input
                    type="number"
                    value={feeSettings.dealer_subscription_monthly}
                    onChange={(e) => setFeeSettings(s => ({ ...s, dealer_subscription_monthly: Number(e.target.value) }))}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-400">Langganan Dealer/Tahun (Rp)</Label>
                  <Input
                    type="number"
                    value={feeSettings.dealer_subscription_yearly}
                    onChange={(e) => setFeeSettings(s => ({ ...s, dealer_subscription_yearly: Number(e.target.value) }))}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <Button onClick={handleSaveFees} disabled={saving} className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600">
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Simpan
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
