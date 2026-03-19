'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Clock,
  Calendar,
  Coins,
  Plus,
  Pencil,
  Loader2,
  CheckCircle2,
  TrendingUp,
  Zap,
  Car,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DurationPricing {
  id: string
  days: number
  credit_cost: number
  name: string
  description: string | null
  is_active: boolean
  is_popular: boolean
  display_order: number
}

// Default pricing tiers
const defaultPricing: DurationPricing[] = [
  { id: '1', days: 7, credit_cost: 10, name: '7 Hari', description: 'Cocok untuk cepat terjual', is_active: true, is_popular: false, display_order: 1 },
  { id: '2', days: 15, credit_cost: 20, name: '15 Hari', description: 'Balance antara durasi dan biaya', is_active: true, is_popular: true, display_order: 2 },
  { id: '3', days: 30, credit_cost: 30, name: '30 Hari', description: 'Durasi maksimal untuk eksposur', is_active: true, is_popular: false, display_order: 3 },
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

const TOKEN_VALUE = 1000 // Rp 1.000 per token

export default function DurationPricingPage() {
  const [pricings, setPricings] = useState<DurationPricing[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<DurationPricing | null>(null)
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()

  const [form, setForm] = useState({
    days: 7,
    credit_cost: 10,
    name: '',
    description: '',
    is_active: true,
    is_popular: false,
  })

  useEffect(() => {
    fetchPricing()
  }, [])

  async function fetchPricing() {
    try {
      setLoading(true)
      // Simulate API call - in production, fetch from database
      await new Promise(resolve => setTimeout(resolve, 500))
      setPricings(defaultPricing)
    } catch (error) {
      console.error('Error fetching pricing:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat data pricing',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const openEdit = (pricing: DurationPricing) => {
    setEditing(pricing)
    setForm({
      days: pricing.days,
      credit_cost: pricing.credit_cost,
      name: pricing.name,
      description: pricing.description || '',
      is_active: pricing.is_active,
      is_popular: pricing.is_popular,
    })
    setDialogOpen(true)
  }

  const openCreate = () => {
    setEditing(null)
    setForm({
      days: 0,
      credit_cost: 0,
      name: '',
      description: '',
      is_active: true,
      is_popular: false,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (form.days <= 0 || form.credit_cost <= 0) {
      toast({
        title: 'Error',
        description: 'Durasi dan biaya token harus lebih dari 0',
        variant: 'destructive',
      })
      return
    }

    try {
      setProcessing(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      if (editing) {
        setPricings(prev => prev.map(p => 
          p.id === editing.id 
            ? { ...p, ...form }
            : p
        ))
      } else {
        const newPricing: DurationPricing = {
          id: Date.now().toString(),
          ...form,
          display_order: pricings.length + 1,
        }
        setPricings(prev => [...prev, newPricing])
      }

      toast({
        title: 'Berhasil',
        description: editing ? 'Pricing berhasil diupdate' : 'Pricing berhasil ditambahkan',
      })

      setDialogOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan pricing',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const toggleActive = async (pricing: DurationPricing) => {
    setPricings(prev => prev.map(p =>
      p.id === pricing.id ? { ...p, is_active: !p.is_active } : p
    ))
  }

  const stats = {
    totalOptions: pricings.length,
    activeOptions: pricings.filter(p => p.is_active).length,
    minCost: Math.min(...pricings.filter(p => p.is_active).map(p => p.credit_cost)),
    maxDays: Math.max(...pricings.filter(p => p.is_active).map(p => p.days)),
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Clock className="h-5 w-5 text-white" />
            </div>
            Duration Pricing
          </h1>
          <p className="text-muted-foreground mt-1">
            Atur biaya token berdasarkan durasi iklan
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
          <Plus className="h-4 w-4" />
          Tambah Durasi
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-violet-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Options</CardTitle>
            <Calendar className="h-5 w-5 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalOptions}</div>
            <p className="text-xs text-muted-foreground">Pilihan durasi</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeOptions}</div>
            <p className="text-xs text-muted-foreground">Durasi aktif</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Min. Cost</CardTitle>
            <Coins className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.minCost}</div>
            <p className="text-xs text-muted-foreground">Token minimal</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Max. Days</CardTitle>
            <TrendingUp className="h-5 w-5 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.maxDays}</div>
            <p className="text-xs text-muted-foreground">Hari maksimal</p>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Cards */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-24 mx-auto" />
                <Skeleton className="h-12 w-full mt-4" />
                <Skeleton className="h-6 w-full mt-4" />
                <Skeleton className="h-10 w-full mt-6" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {pricings.sort((a, b) => a.display_order - b.display_order).map((pricing) => (
            <Card 
              key={pricing.id} 
              className={`relative overflow-hidden transition-all ${
                pricing.is_popular 
                  ? 'border-2 border-violet-500 shadow-lg shadow-violet-500/20' 
                  : ''
              } ${!pricing.is_active ? 'opacity-60' : ''}`}
            >
              {pricing.is_popular && (
                <div className="absolute top-0 left-0 right-0">
                  <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-medium text-center py-1">
                    POPULER
                  </div>
                </div>
              )}
              <CardHeader className={pricing.is_popular ? 'pt-8' : ''}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{pricing.name}</CardTitle>
                  <Switch
                    checked={pricing.is_active}
                    onCheckedChange={() => toggleActive(pricing)}
                  />
                </div>
                <CardDescription>{pricing.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <Coins className="h-5 w-5 text-amber-500" />
                    <span className="text-4xl font-bold">{pricing.credit_cost}</span>
                    <span className="text-muted-foreground">token</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    ≈ {formatCurrency(pricing.credit_cost * TOKEN_VALUE)}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{pricing.days} hari durasi iklan</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span>Public Marketplace</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span>Auto-move setelah expired</span>
                  </div>
                </div>

                <Button 
                  variant={pricing.is_popular ? 'default' : 'outline'} 
                  className="w-full"
                  onClick={() => openEdit(pricing)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Pricing
                </Button>

                <div className="text-center text-xs text-muted-foreground">
                  Rp {(pricing.credit_cost * TOKEN_VALUE / pricing.days).toFixed(0)} per hari
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200 dark:border-violet-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
              <Coins className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Cara Kerja Duration Pricing</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Saat user memasang iklan, mereka dapat memilih durasi iklan. Biaya token akan 
                otomatis dihitung berdasarkan durasi yang dipilih. Semakin lama durasi, semakin 
                banyak token yang diperlukan, namun harga per hari menjadi lebih hemat.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg">
                  <p className="text-lg font-bold text-violet-600">7 Hari</p>
                  <p className="text-xs text-muted-foreground">≈ Rp 1.429/hari</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg">
                  <p className="text-lg font-bold text-violet-600">15 Hari</p>
                  <p className="text-xs text-muted-foreground">≈ Rp 1.333/hari</p>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg">
                  <p className="text-lg font-bold text-violet-600">30 Hari</p>
                  <p className="text-xs text-muted-foreground">≈ Rp 1.000/hari</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Duration Pricing' : 'Add New Duration'}
            </DialogTitle>
            <DialogDescription>
              Atur harga token untuk durasi iklan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Durasi (Hari) *</Label>
                <Input
                  type="number"
                  value={form.days}
                  onChange={(e) => setForm(f => ({ 
                    ...f, 
                    days: Number(e.target.value),
                    name: f.name || `${e.target.value} Hari`
                  }))}
                  placeholder="7"
                />
              </div>
              <div>
                <Label>Biaya Token *</Label>
                <Input
                  type="number"
                  value={form.credit_cost}
                  onChange={(e) => setForm(f => ({ ...f, credit_cost: Number(e.target.value) }))}
                  placeholder="10"
                />
              </div>
            </div>
            <div>
              <Label>Nama Paket</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g., 7 Hari, 15 Hari"
              />
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Deskripsi singkat"
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm(f => ({ ...f, is_active: v }))}
                />
                <Label>Aktif</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_popular}
                  onCheckedChange={(v) => setForm(f => ({ ...f, is_popular: v }))}
                />
                <Label>Populer</Label>
              </div>
            </div>
            {form.days > 0 && form.credit_cost > 0 && (
              <div className="p-3 rounded-lg bg-violet-50 dark:bg-violet-950/20">
                <div className="flex justify-between text-sm">
                  <span>Harga per hari:</span>
                  <span className="font-bold">
                    {formatCurrency(form.credit_cost * TOKEN_VALUE / form.days)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={processing}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
