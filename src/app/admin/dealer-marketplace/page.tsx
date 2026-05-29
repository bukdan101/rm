'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Settings,
  Coins,
  Clock,
  Shield,
  DollarSign,
  Store,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react'
import type { DealerMarketplaceSettings } from '@/types/dealer-marketplace'

export default function AdminDealerMarketplaceSettingsPage() {
  const [settings, setSettings] = useState<DealerMarketplaceSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  
  // Form state
  const [tokenCostPublic, setTokenCostPublic] = useState(1)
  const [tokenCostDealerMarketplace, setTokenCostDealerMarketplace] = useState(2)
  const [tokenCostBoth, setTokenCostBoth] = useState(3)
  const [defaultOfferDuration, setDefaultOfferDuration] = useState(72)
  const [inspectionCost, setInspectionCost] = useState(250000)
  const [inspectionRequired, setInspectionRequired] = useState(false)
  const [platformFeeEnabled, setPlatformFeeEnabled] = useState(false)
  const [platformFeePercentage, setPlatformFeePercentage] = useState(0)

  // Fetch settings
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/dealer-marketplace/settings')
        const data = await res.json()
        
        if (data.success) {
          setSettings(data.settings)
          setTokenCostPublic(data.settings.token_cost_public || 1)
          setTokenCostDealerMarketplace(data.settings.token_cost_dealer_marketplace || 2)
          setTokenCostBoth(data.settings.token_cost_both || 3)
          setDefaultOfferDuration(data.settings.default_offer_duration_hours || 72)
          setInspectionCost(data.settings.inspection_cost || 250000)
          setInspectionRequired(data.settings.inspection_required_for_dealer_marketplace || false)
          setPlatformFeeEnabled(data.settings.platform_fee_enabled || false)
          setPlatformFeePercentage(data.settings.platform_fee_percentage || 0)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  // Save settings
  const saveSettings = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/dealer-marketplace/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token_cost_public: tokenCostPublic,
          token_cost_dealer_marketplace: tokenCostDealerMarketplace,
          token_cost_both: tokenCostBoth,
          default_offer_duration_hours: defaultOfferDuration,
          inspection_cost: inspectionCost,
          inspection_required_for_dealer_marketplace: inspectionRequired,
          platform_fee_enabled: platformFeeEnabled,
          platform_fee_percentage: platformFeePercentage
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setSuccessDialogOpen(true)
      } else {
        alert(data.error || 'Gagal menyimpan pengaturan')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Terjadi kesalahan saat menyimpan')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6 text-purple-500" />
          Pengaturan Dealer Marketplace
        </h1>
        <p className="text-muted-foreground">
          Konfigurasi biaya token, durasi penawaran, dan pengaturan lainnya
        </p>
      </div>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-blue-800">Tentang Dealer Marketplace</p>
              <p className="text-sm text-blue-700 mt-1">
                Dealer Marketplace adalah fitur untuk menghubungkan user (penjual) dengan dealer terverifikasi.
                User dapat memilih untuk menjual mobil mereka ke dealer dengan potongan token yang telah dikonfigurasi.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6">
        {/* Token Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-amber-500" />
              Konfigurasi Token
            </CardTitle>
            <CardDescription>
              Tentukan biaya token untuk setiap opsi marketplace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="token-public">Token - Public Marketplace</Label>
                <Input
                  id="token-public"
                  type="number"
                  value={tokenCostPublic}
                  onChange={(e) => setTokenCostPublic(parseInt(e.target.value) || 0)}
                  min={0}
                />
                <p className="text-xs text-gray-500">
                  Iklan tampil di marketplace publik
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="token-dealer">Token - Dealer Marketplace</Label>
                <Input
                  id="token-dealer"
                  type="number"
                  value={tokenCostDealerMarketplace}
                  onChange={(e) => setTokenCostDealerMarketplace(parseInt(e.target.value) || 0)}
                  min={0}
                />
                <p className="text-xs text-gray-500">
                  Iklan khusus untuk dealer terverifikasi
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="token-both">Token - Keduanya</Label>
                <Input
                  id="token-both"
                  type="number"
                  value={tokenCostBoth}
                  onChange={(e) => setTokenCostBoth(parseInt(e.target.value) || 0)}
                  min={0}
                />
                <p className="text-xs text-gray-500">
                  Tampil di public + dealer marketplace
                </p>
              </div>
            </div>
            
            <div className="p-3 bg-amber-50 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <p className="text-sm text-amber-700">
                Rekomendasi: Dealer Marketplace = 2x Public, Keduanya = Public + Dealer Marketplace
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Offer Duration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Durasi Penawaran
            </CardTitle>
            <CardDescription>
              Durasi default penawaran dari dealer ke user
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="offer-duration">Durasi Default (jam)</Label>
                <Input
                  id="offer-duration"
                  type="number"
                  value={defaultOfferDuration}
                  onChange={(e) => setDefaultOfferDuration(parseInt(e.target.value) || 72)}
                  min={1}
                />
                <p className="text-xs text-gray-500">
                  Setelah durasi habis, penawaran otomatis expired
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="py-2 px-4">
                  {defaultOfferDuration} jam = {(defaultOfferDuration / 24).toFixed(1)} hari
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inspection Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Pengaturan Inspeksi
            </CardTitle>
            <CardDescription>
              Konfigurasi inspeksi untuk listing di dealer marketplace
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="inspection-cost">Biaya Inspeksi (Rp)</Label>
                <Input
                  id="inspection-cost"
                  type="number"
                  value={inspectionCost}
                  onChange={(e) => setInspectionCost(parseInt(e.target.value) || 0)}
                  min={0}
                />
                <p className="text-xs text-gray-500">
                  Biaya yang dibayar user untuk inspeksi profesional
                </p>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Inspeksi Wajib</p>
                  <p className="text-sm text-gray-500">
                    Wajib inspeksi untuk listing di dealer marketplace
                  </p>
                </div>
                <Switch
                  checked={inspectionRequired}
                  onCheckedChange={setInspectionRequired}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Fee (Coming Soon) */}
        <Card className="border-gray-200 bg-gray-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gray-400" />
              Komisi Platform
              <Badge variant="outline" className="text-gray-500">Coming Soon</Badge>
            </CardTitle>
            <CardDescription>
              Pengaturan komisi platform untuk setiap transaksi
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-white">
              <div>
                <p className="font-medium">Aktifkan Komisi</p>
                <p className="text-sm text-gray-500">
                  Ambil persentase dari setiap transaksi berhasil
                </p>
              </div>
              <Switch
                checked={platformFeeEnabled}
                onCheckedChange={setPlatformFeeEnabled}
                disabled
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="platform-fee">Persentase Komisi (%)</Label>
              <Input
                id="platform-fee"
                type="number"
                value={platformFeePercentage}
                onChange={(e) => setPlatformFeePercentage(parseFloat(e.target.value) || 0)}
                min={0}
                max={100}
                step={0.5}
                disabled
              />
              <p className="text-xs text-gray-500">
                Persentase diambil dari sisi user (penjual)
              </p>
            </div>
            
            <div className="p-3 bg-gray-100 rounded-lg flex items-start gap-2">
              <Info className="h-4 w-4 text-gray-500 mt-0.5" />
              <p className="text-sm text-gray-600">
                Fitur komisi platform akan segera tersedia. Saat ini semua transaksi GRATIS.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-purple-500" />
              Ringkasan Pengaturan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-gray-500">Public</p>
                <p className="text-lg font-bold">{tokenCostPublic} Token</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-gray-500">Dealer</p>
                <p className="text-lg font-bold">{tokenCostDealerMarketplace} Token</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-gray-500">Keduanya</p>
                <p className="text-lg font-bold">{tokenCostBoth} Token</p>
              </div>
              <div className="p-3 bg-muted rounded-lg text-center">
                <p className="text-xs text-gray-500">Durasi Offer</p>
                <p className="text-lg font-bold">{defaultOfferDuration} jam</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => {
            // Reset to original values
            if (settings) {
              setTokenCostPublic(settings.token_cost_public)
              setTokenCostDealerMarketplace(settings.token_cost_dealer_marketplace)
              setTokenCostBoth(settings.token_cost_both)
              setDefaultOfferDuration(settings.default_offer_duration_hours)
              setInspectionCost(settings.inspection_cost)
              setInspectionRequired(settings.inspection_required_for_dealer_marketplace)
            }
          }}>
            Reset
          </Button>
          <Button
            onClick={saveSettings}
            disabled={saving}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Simpan Pengaturan
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Success Dialog */}
      <AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Berhasil Disimpan!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Pengaturan dealer marketplace telah berhasil diperbarui.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setSuccessDialogOpen(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
