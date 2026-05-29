'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Coins, Save, RefreshCw, CheckCircle, AlertCircle, Settings, Package,
  Sparkles, Car, Users, Eye, Zap, Star, Search, Shield, Clock
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface TokenSettings {
  id: string
  token_price_base: number
  token_price_currency: string
  ai_prediction_tokens: number
  ai_prediction_duration_hours: number
  listing_normal_tokens: number
  listing_normal_duration_days: number
  listing_normal_chat_free: boolean
  listing_dealer_tokens: number
  listing_dealer_duration_days: number
  listing_dealer_multiplier: number
  dealer_contact_tokens: number
  dealer_contact_multiplier: number
  boost_tokens: number
  boost_duration_days: number
  highlight_tokens: number
  highlight_duration_days: number
  featured_tokens: number
  featured_duration_days: number
  premium_badge_tokens: number
  premium_badge_duration_days: number
  top_search_tokens: number
  top_search_duration_days: number
  inspection_tokens: number
  inspection_mandatory: boolean
  auto_move_to_public: boolean
  auto_move_gratis: boolean
  remind_before_expire_days: number
  is_active: boolean
}

interface TokenPackage {
  id: string
  name: string
  description: string
  tokens: number
  price: number
  discount_percentage: number
  bonus_tokens: number
  is_popular: boolean
  is_recommended: boolean
  badge_text: string | null
  target_user: string
  is_active: boolean
  display_order: number
}

const defaultSettings: TokenSettings = {
  id: '',
  token_price_base: 1000,
  token_price_currency: 'IDR',
  ai_prediction_tokens: 5,
  ai_prediction_duration_hours: 24,
  listing_normal_tokens: 10,
  listing_normal_duration_days: 30,
  listing_normal_chat_free: true,
  listing_dealer_tokens: 20,
  listing_dealer_duration_days: 7,
  listing_dealer_multiplier: 2.00,
  dealer_contact_tokens: 5,
  dealer_contact_multiplier: 0.50,
  boost_tokens: 3,
  boost_duration_days: 7,
  highlight_tokens: 2,
  highlight_duration_days: 7,
  featured_tokens: 5,
  featured_duration_days: 7,
  premium_badge_tokens: 10,
  premium_badge_duration_days: 30,
  top_search_tokens: 5,
  top_search_duration_days: 7,
  inspection_tokens: 0,
  inspection_mandatory: true,
  auto_move_to_public: true,
  auto_move_gratis: true,
  remind_before_expire_days: 2,
  is_active: true
}

export default function AdminTokenSettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<TokenSettings>(defaultSettings)
  const [packages, setPackages] = useState<TokenPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('pricing')

  // Load token settings
  useEffect(() => {
    loadSettings()
    loadPackages()
  }, [])

  const loadSettings = async () => {
    try {
      const res = await fetch('/api/admin/token-settings?active_only=true')
      const data = await res.json()
      
      if (data.success && data.data) {
        setSettings(data.data)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadPackages = async () => {
    try {
      const res = await fetch('/api/token-packages')
      const data = await res.json()
      
      if (data.success) {
        setPackages(data.data || [])
      }
    } catch (error) {
      console.error('Error loading packages:', error)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/token-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      
      const data = await res.json()
      
      if (data.success) {
        toast({
          title: 'Berhasil!',
          description: 'Pengaturan token berhasil disimpan'
        })
        loadSettings()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Gagal menyimpan',
        description: String(error),
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof TokenSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
          <span>Memuat pengaturan...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Coins className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Token Settings</h1>
              <p className="text-white/80">Kelola harga token dan biaya fitur</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="pricing">Harga Token</TabsTrigger>
            <TabsTrigger value="features">Biaya Fitur</TabsTrigger>
            <TabsTrigger value="packages">Paket Token</TabsTrigger>
            <TabsTrigger value="settings">Pengaturan</TabsTrigger>
          </TabsList>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-emerald-600" />
                  Harga Dasar Token
                </CardTitle>
                <CardDescription>
                  Harga per token yang dibeli user
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Harga per Token (Rp)</Label>
                    <Input
                      type="number"
                      value={settings.token_price_base}
                      onChange={(e) => updateSetting('token_price_base', parseInt(e.target.value))}
                    />
                    <p className="text-sm text-gray-500">
                      Contoh: 1.000 berarti Rp 1.000/token
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Mata Uang</Label>
                    <Input
                      value={settings.token_price_currency}
                      onChange={(e) => updateSetting('token_price_currency', e.target.value)}
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Kalkulasi:</strong> Jika harga token = Rp 1.000 dan AI Prediction = 5 token,
                    maka biaya AI Prediction = Rp 5.000
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI Prediction Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  AI Price Prediction
                </CardTitle>
                <CardDescription>
                  Biaya untuk menggunakan fitur AI Price Prediction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Jumlah Token</Label>
                    <Input
                      type="number"
                      value={settings.ai_prediction_tokens}
                      onChange={(e) => updateSetting('ai_prediction_tokens', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Durasi Valid (Jam)</Label>
                    <Input
                      type="number"
                      value={settings.ai_prediction_duration_hours}
                      onChange={(e) => updateSetting('ai_prediction_duration_hours', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="font-medium">Biaya AI Prediction:</span>
                  <Badge variant="default" className="text-lg px-4 py-2">
                    {formatPrice(settings.token_price_base * settings.ai_prediction_tokens)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            {/* Listing Normal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="w-5 h-5 text-blue-600" />
                  Pasang Iklan Normal (Public Marketplace)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Token</Label>
                    <Input
                      type="number"
                      value={settings.listing_normal_tokens}
                      onChange={(e) => updateSetting('listing_normal_tokens', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Durasi (Hari)</Label>
                    <Input
                      type="number"
                      value={settings.listing_normal_duration_days}
                      onChange={(e) => updateSetting('listing_normal_duration_days', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Chat Gratis?</Label>
                    <div className="flex items-center h-10">
                      <Switch
                        checked={settings.listing_normal_chat_free}
                        onCheckedChange={(checked) => updateSetting('listing_normal_chat_free', checked)}
                      />
                      <span className="ml-2 text-sm">
                        {settings.listing_normal_chat_free ? 'Ya' : 'Tidak'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Listing Dealer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-600" />
                  Jual ke Dealer (Dealer Marketplace)
                </CardTitle>
                <CardDescription>
                  2x lipat dari iklan normal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Token</Label>
                    <Input
                      type="number"
                      value={settings.listing_dealer_tokens}
                      onChange={(e) => updateSetting('listing_dealer_tokens', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Durasi (Hari)</Label>
                    <Input
                      type="number"
                      value={settings.listing_dealer_duration_days}
                      onChange={(e) => updateSetting('listing_dealer_duration_days', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Multiplier</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.listing_dealer_multiplier}
                      onChange={(e) => updateSetting('listing_dealer_multiplier', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-700">
                    <strong>Perhitungan:</strong> {settings.listing_dealer_multiplier}x dari iklan normal
                    ({settings.listing_normal_tokens} x {settings.listing_dealer_multiplier} = {settings.listing_dealer_tokens} token)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Dealer Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-green-600" />
                  Dealer Kontak Penjual
                </CardTitle>
                <CardDescription>
                  1/2 dari harga iklan normal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Token</Label>
                    <Input
                      type="number"
                      value={settings.dealer_contact_tokens}
                      onChange={(e) => updateSetting('dealer_contact_tokens', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Multiplier</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.dealer_contact_multiplier}
                      onChange={(e) => updateSetting('dealer_contact_multiplier', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Boost Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-600" />
                  Fitur Boost & Promosi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Boost */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-600" />
                        Boost Token
                      </Label>
                      <Input
                        type="number"
                        value={settings.boost_tokens}
                        onChange={(e) => updateSetting('boost_tokens', parseInt(e.target.value))}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Durasi (Hari)</Label>
                      <Input
                        type="number"
                        value={settings.boost_duration_days}
                        onChange={(e) => updateSetting('boost_duration_days', parseInt(e.target.value))}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {/* Highlight */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-600" />
                        Highlight Token
                      </Label>
                      <Input
                        type="number"
                        value={settings.highlight_tokens}
                        onChange={(e) => updateSetting('highlight_tokens', parseInt(e.target.value))}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Durasi (Hari)</Label>
                      <Input
                        type="number"
                        value={settings.highlight_duration_days}
                        onChange={(e) => updateSetting('highlight_duration_days', parseInt(e.target.value))}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {/* Featured */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-purple-600" />
                        Featured Token
                      </Label>
                      <Input
                        type="number"
                        value={settings.featured_tokens}
                        onChange={(e) => updateSetting('featured_tokens', parseInt(e.target.value))}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Durasi (Hari)</Label>
                      <Input
                        type="number"
                        value={settings.featured_duration_days}
                        onChange={(e) => updateSetting('featured_duration_days', parseInt(e.target.value))}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {/* Top Search */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-blue-600" />
                        Top Search Token
                      </Label>
                      <Input
                        type="number"
                        value={settings.top_search_tokens}
                        onChange={(e) => updateSetting('top_search_tokens', parseInt(e.target.value))}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Durasi (Hari)</Label>
                      <Input
                        type="number"
                        value={settings.top_search_duration_days}
                        onChange={(e) => updateSetting('top_search_duration_days', parseInt(e.target.value))}
                        className="mt-2"
                      />
                    </div>
                  </div>

                  {/* Premium Badge */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-indigo-600" />
                        Premium Badge Token
                      </Label>
                      <Input
                        type="number"
                        value={settings.premium_badge_tokens}
                        onChange={(e) => updateSetting('premium_badge_tokens', parseInt(e.target.value))}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>Durasi (Hari)</Label>
                      <Input
                        type="number"
                        value={settings.premium_badge_duration_days}
                        onChange={(e) => updateSetting('premium_badge_duration_days', parseInt(e.target.value))}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Packages Tab */}
          <TabsContent value="packages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-600" />
                  Paket Token Tersedia
                </CardTitle>
                <CardDescription>
                  Paket token yang dapat dibeli user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className={`p-4 rounded-lg border-2 ${
                        pkg.is_popular ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-bold text-lg">{pkg.name}</h3>
                          {pkg.badge_text && (
                            <Badge className="mt-1">{pkg.badge_text}</Badge>
                          )}
                        </div>
                        {pkg.is_popular && (
                          <Badge variant="default">Popular</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Token:</span>{' '}
                          <span className="font-bold">{pkg.tokens}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Harga:</span>{' '}
                          <span className="font-bold">{formatPrice(pkg.price)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Diskon:</span>{' '}
                          <span className="font-bold">{pkg.discount_percentage}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Bonus:</span>{' '}
                          <span className="font-bold">{pkg.bonus_tokens}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-600" />
                  Pengaturan Lainnya
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Inspection */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="font-medium">Inspeksi 160 Titik</Label>
                    <p className="text-sm text-gray-500">
                      Token untuk inspeksi kendaraan
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      value={settings.inspection_tokens}
                      onChange={(e) => updateSetting('inspection_tokens', parseInt(e.target.value))}
                      className="w-24"
                    />
                    <span className="text-sm">token</span>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={settings.inspection_mandatory}
                        onCheckedChange={(checked) => updateSetting('inspection_mandatory', checked)}
                      />
                      <span className="text-sm">Wajib</span>
                    </div>
                  </div>
                </div>

                {/* Auto Move */}
                <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                  <Label className="font-medium">Auto-move ke Public Marketplace</Label>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={settings.auto_move_to_public}
                        onCheckedChange={(checked) => updateSetting('auto_move_to_public', checked)}
                      />
                      <span className="text-sm">Aktif</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={settings.auto_move_gratis}
                        onCheckedChange={(checked) => updateSetting('auto_move_gratis', checked)}
                      />
                      <span className="text-sm">Gratis</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Setelah listing dealer expired, otomatis pindah ke public marketplace
                  </p>
                </div>

                {/* Reminder */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="font-medium">Reminder Sebelum Expired</Label>
                    <p className="text-sm text-gray-500">
                      Kirim notifikasi H-X sebelum listing expired
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={settings.remind_before_expire_days}
                      onChange={(e) => updateSetting('remind_before_expire_days', parseInt(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm">hari</span>
                  </div>
                </div>

                <Separator />

                {/* Summary */}
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <h3 className="font-bold mb-4">Ringkasan Biaya Token</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span>AI Prediction:</span>
                      <span className="font-bold">{settings.ai_prediction_tokens} token</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Iklan Normal:</span>
                      <span className="font-bold">{settings.listing_normal_tokens} token</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Jual ke Dealer:</span>
                      <span className="font-bold">{settings.listing_dealer_tokens} token</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dealer Kontak:</span>
                      <span className="font-bold">{settings.dealer_contact_tokens} token</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Inspeksi:</span>
                      <span className="font-bold">{settings.inspection_tokens} token (GRATIS)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="sticky bottom-4 flex justify-end">
          <Button
            onClick={saveSettings}
            disabled={saving}
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Simpan Pengaturan
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
