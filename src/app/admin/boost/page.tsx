'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sparkles,
  ArrowUp,
  Star,
  Zap,
  Crown,
  BadgeCheck,
  Flame,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Coins,
  Calendar,
  Check,
  Eye,
  TrendingUp,
  RefreshCw,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface BoostFeature {
  id: string
  name: string
  slug: string
  description: string | null
  credit_cost: number
  duration_days: number
  icon: string
  color: string
  benefits: string[]
  is_active: boolean
  is_popular: boolean
  display_order: number
  active_listings_count?: number
  total_usage_count?: number
  total_credits_spent?: number
}

const ICON_OPTIONS = [
  { value: 'Sparkles', label: 'Sparkles', icon: Sparkles },
  { value: 'ArrowUp', label: 'Arrow Up', icon: ArrowUp },
  { value: 'Star', label: 'Star', icon: Star },
  { value: 'Zap', label: 'Zap', icon: Zap },
  { value: 'Crown', label: 'Crown', icon: Crown },
  { value: 'BadgeCheck', label: 'Badge Check', icon: BadgeCheck },
  { value: 'Flame', label: 'Flame', icon: Flame },
  { value: 'TrendingUp', label: 'Trending Up', icon: TrendingUp },
]

const COLOR_OPTIONS = [
  { value: 'amber', label: 'Amber', class: 'bg-amber-500' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'emerald', label: 'Emerald', class: 'bg-emerald-500' },
  { value: 'rose', label: 'Rose', class: 'bg-rose-500' },
  { value: 'cyan', label: 'Cyan', class: 'bg-cyan-500' },
]

const IconComponent = ({ name }: { name: string }) => {
  const icon = ICON_OPTIONS.find(i => i.value === name)
  if (!icon) return <Sparkles className="h-5 w-5" />
  return <icon.icon className="h-5 w-5" />
}

export default function BoostFeaturesPage() {
  const [boosts, setBoosts] = useState<BoostFeature[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; boost: BoostFeature | null }>({
    open: false,
    boost: null,
  })
  const [editing, setEditing] = useState<BoostFeature | null>(null)
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    credit_cost: 3,
    duration_days: 7,
    icon: 'Sparkles',
    color: 'amber',
    benefits: '',
    is_active: true,
    is_popular: false,
  })

  const fetchBoosts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/boost')
      
      if (!response.ok) {
        throw new Error('Failed to fetch boost features')
      }
      
      const data = await response.json()
      setBoosts(data.boosts || [])
    } catch (error) {
      console.error('Error fetching boosts:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat boost features',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchBoosts()
  }, [fetchBoosts])

  const stats = {
    totalBoosts: boosts.length,
    activeBoosts: boosts.filter(b => b.is_active).length,
    totalUsage: boosts.reduce((sum, b) => sum + (b.total_usage_count || 0), 0),
    totalRevenue: boosts.reduce((sum, b) => sum + (b.total_credits_spent || 0) * 1000, 0),
  }

  const openCreate = () => {
    setEditing(null)
    setForm({
      name: '',
      slug: '',
      description: '',
      credit_cost: 3,
      duration_days: 7,
      icon: 'Sparkles',
      color: 'amber',
      benefits: '',
      is_active: true,
      is_popular: false,
    })
    setDialogOpen(true)
  }

  const openEdit = (boost: BoostFeature) => {
    setEditing(boost)
    setForm({
      name: boost.name,
      slug: boost.slug,
      description: boost.description || '',
      credit_cost: boost.credit_cost,
      duration_days: boost.duration_days,
      icon: boost.icon || 'Sparkles',
      color: boost.color || 'amber',
      benefits: Array.isArray(boost.benefits) ? boost.benefits.join('\n') : '',
      is_active: boost.is_active,
      is_popular: boost.is_popular,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim() || form.credit_cost <= 0) {
      toast({
        title: 'Error',
        description: 'Nama, slug, dan biaya token wajib diisi',
        variant: 'destructive',
      })
      return
    }

    try {
      setProcessing(true)
      const benefits = form.benefits.split('\n').filter(b => b.trim())

      if (editing) {
        const response = await fetch('/api/admin/boost', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editing.id,
            ...form,
            benefits
          })
        })

        if (!response.ok) {
          throw new Error('Failed to update boost')
        }

        toast({
          title: 'Berhasil',
          description: 'Boost berhasil diupdate',
        })
      } else {
        const response = await fetch('/api/admin/boost', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            benefits
          })
        })

        if (!response.ok) {
          throw new Error('Failed to create boost')
        }

        toast({
          title: 'Berhasil',
          description: 'Boost berhasil ditambahkan',
        })
      }

      setDialogOpen(false)
      fetchBoosts()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan boost',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.boost) return

    try {
      setProcessing(true)
      const response = await fetch(`/api/admin/boost?id=${deleteDialog.boost.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete boost')
      }

      toast({
        title: 'Berhasil',
        description: 'Boost berhasil dihapus',
      })
      setDeleteDialog({ open: false, boost: null })
      fetchBoosts()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus boost',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const toggleActive = async (boost: BoostFeature) => {
    try {
      const response = await fetch('/api/admin/boost', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: boost.id,
          is_active: !boost.is_active
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update boost')
      }

      setBoosts(prev => prev.map(b =>
        b.id === boost.id ? { ...b, is_active: !b.is_active } : b
      ))
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mengubah status boost',
        variant: 'destructive',
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Zap className="h-5 w-5 text-white" />
            </div>
            Boost Features
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola fitur boost untuk meningkatkan visibilitas iklan
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchBoosts} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={openCreate} className="gap-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700">
            <Plus className="h-4 w-4" />
            Add Boost
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-10 w-16 mt-2" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Boosts</CardTitle>
                <Zap className="h-5 w-5 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalBoosts}</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
                <Check className="h-5 w-5 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.activeBoosts}</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Usage</CardTitle>
                <Eye className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalUsage.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Revenue</CardTitle>
                <Coins className="h-5 w-5 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Boost Cards Grid */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-6 w-32 mt-4" />
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-20 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : boosts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Zap className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="font-medium">Belum ada boost feature</p>
            <p className="text-sm mt-1">Klik "Add Boost" untuk membuat fitur boost pertama</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {boosts.sort((a, b) => (a.display_order || 0) - (b.display_order || 0)).map((boost) => (
            <Card 
              key={boost.id}
              className={`relative overflow-hidden transition-all hover:shadow-lg ${
                boost.is_popular ? 'border-2 border-amber-500 shadow-amber-500/10' : ''
              } ${!boost.is_active ? 'opacity-60' : ''}`}
            >
              {boost.is_popular && (
                <div className="absolute top-0 left-0 right-0">
                  <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium text-center py-1">
                    POPULER
                  </div>
                </div>
              )}
              <CardHeader className={boost.is_popular ? 'pt-8' : ''}>
                <div className="flex items-start justify-between">
                  <div className={`h-12 w-12 rounded-xl bg-${boost.color || 'amber'}-100 dark:bg-${boost.color || 'amber'}-900/30 flex items-center justify-center`}>
                    <IconComponent name={boost.icon || 'Sparkles'} />
                  </div>
                  <Switch
                    checked={boost.is_active}
                    onCheckedChange={() => toggleActive(boost)}
                  />
                </div>
                <CardTitle className="text-xl mt-4">{boost.name}</CardTitle>
                <CardDescription>{boost.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-amber-500" />
                    <span className="font-bold text-lg">{boost.credit_cost}</span>
                    <span className="text-muted-foreground">token</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{boost.duration_days} hari</span>
                  </div>
                </div>

                {Array.isArray(boost.benefits) && boost.benefits.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Benefits:</p>
                    <ul className="space-y-1">
                      {boost.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-2 border-t flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {(boost.total_usage_count || 0).toLocaleString()} used
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(boost)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteDialog({ open: true, boost })}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Boost Card */}
      <Card 
        className="border-2 border-dashed cursor-pointer hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-amber-950/20 transition-colors"
        onClick={openCreate}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-medium">Add New Boost Feature</p>
          <p className="text-sm text-muted-foreground">Create a new boost option for listings</p>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Boost Feature' : 'Add New Boost'}
            </DialogTitle>
            <DialogDescription>
              Configure boost feature details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm(f => ({
                    ...f,
                    name: e.target.value,
                    slug: editing ? f.slug : e.target.value.toLowerCase().replace(/\s+/g, '-')
                  }))}
                  placeholder="Highlight"
                />
              </div>
              <div>
                <Label>Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))}
                  placeholder="highlight"
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of the boost"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Token Cost *</Label>
                <Input
                  type="number"
                  value={form.credit_cost}
                  onChange={(e) => setForm(f => ({ ...f, credit_cost: Number(e.target.value) }))}
                  placeholder="3"
                />
              </div>
              <div>
                <Label>Duration (days) *</Label>
                <Input
                  type="number"
                  value={form.duration_days}
                  onChange={(e) => setForm(f => ({ ...f, duration_days: Number(e.target.value) }))}
                  placeholder="7"
                />
              </div>
              <div>
                <Label>Icon</Label>
                <Select value={form.icon} onValueChange={(v) => setForm(f => ({ ...f, icon: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICON_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <opt.icon className="h-4 w-4" />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-2">
                {COLOR_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, color: opt.value }))}
                    className={`h-8 w-8 rounded-lg ${opt.class} transition-all ${
                      form.color === opt.value ? 'ring-2 ring-offset-2 ring-offset-background' : ''
                    }`}
                  />
                ))}
              </div>
            </div>
            <div>
              <Label>Benefits (one per line)</Label>
              <Textarea
                value={form.benefits}
                onChange={(e) => setForm(f => ({ ...f, benefits: e.target.value }))}
                placeholder="Background kuning highlight&#10;Lebih mudah dilihat&#10;Cocok untuk iklan prioritas"
                rows={3}
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm(f => ({ ...f, is_active: v }))}
                />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_popular}
                  onCheckedChange={(v) => setForm(f => ({ ...f, is_popular: v }))}
                />
                <Label>Popular</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={processing}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, boost: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Boost Feature?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.boost?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={processing}
              className="bg-destructive text-destructive-foreground"
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
