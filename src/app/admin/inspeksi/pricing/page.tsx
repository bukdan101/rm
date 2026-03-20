'use client'

import { useState, useEffect } from 'react'
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import {
  FileCheck, Wrench, DollarSign, Plus, Pencil, Trash2, 
  CheckCircle2, X, Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface PricingPlan {
  id: string
  name: string
  description: string
  type: 'self' | 'professional' | 'certificate'
  token_cost: number
  includes_inspector: boolean
  includes_certificate: boolean
  includes_ai_analysis: boolean
  certificate_validity_days: number
  is_popular: boolean
  is_active: boolean
  display_order: number
}

export default function AdminInspectionPricingPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pricing, setPricing] = useState<PricingPlan[]>([])
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'self' as 'self' | 'professional' | 'certificate',
    token_cost: 0,
    includes_inspector: false,
    includes_certificate: false,
    includes_ai_analysis: true,
    certificate_validity_days: 90,
    is_popular: false,
    is_active: true,
    display_order: 0
  })

  useEffect(() => {
    fetchPricing()
  }, [])

  const fetchPricing = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/inspections/pricing')
      const data = await res.json()
      
      if (data.success) {
        setPricing(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching pricing:', error)
      toast.error('Gagal memuat data pricing')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDialog = (plan?: PricingPlan) => {
    if (plan) {
      setEditingPlan(plan)
      setFormData({
        name: plan.name,
        description: plan.description || '',
        type: plan.type,
        token_cost: plan.token_cost,
        includes_inspector: plan.includes_inspector,
        includes_certificate: plan.includes_certificate,
        includes_ai_analysis: plan.includes_ai_analysis,
        certificate_validity_days: plan.certificate_validity_days,
        is_popular: plan.is_popular,
        is_active: plan.is_active,
        display_order: plan.display_order
      })
    } else {
      setEditingPlan(null)
      setFormData({
        name: '',
        description: '',
        type: 'self',
        token_cost: 0,
        includes_inspector: false,
        includes_certificate: false,
        includes_ai_analysis: true,
        certificate_validity_days: 90,
        is_popular: false,
        is_active: true,
        display_order: 0
      })
    }
    setDialogOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const url = '/api/inspections/pricing'
      const method = editingPlan ? 'PUT' : 'POST'
      const body = editingPlan 
        ? { ...formData, id: editingPlan.id }
        : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await res.json()

      if (data.success) {
        toast.success(editingPlan ? 'Pricing berhasil diupdate' : 'Pricing berhasil ditambahkan')
        setDialogOpen(false)
        fetchPricing()
      } else {
        toast.error(data.error || 'Gagal menyimpan pricing')
      }
    } catch (error) {
      console.error('Error saving pricing:', error)
      toast.error('Terjadi kesalahan saat menyimpan')
    } finally {
      setSaving(false)
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'self':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Mandiri</Badge>
      case 'professional':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700">Profesional</Badge>
      case 'certificate':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Sertifikat</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'self':
        return <FileCheck className="h-5 w-5" />
      case 'professional':
        return <Wrench className="h-5 w-5" />
      case 'certificate':
        return <FileCheck className="h-5 w-5" />
      default:
        return <DollarSign className="h-5 w-5" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Memuat data pricing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Pengaturan Harga Inspeksi</h1>
          <p className="text-muted-foreground">
            Kelola harga dan paket inspeksi kendaraan
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Tambah Paket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? 'Edit Paket Inspeksi' : 'Tambah Paket Inspeksi Baru'}
              </DialogTitle>
              <DialogDescription>
                {editingPlan 
                  ? 'Ubah detail paket inspeksi' 
                  : 'Buat paket inspeksi baru untuk pengguna'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nama Paket</Label>
                  <Input 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Inspeksi Mandiri"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipe</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: 'self' | 'professional' | 'certificate') => 
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="self">Mandiri</SelectItem>
                      <SelectItem value="professional">Profesional</SelectItem>
                      <SelectItem value="certificate">Sertifikat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Deskripsi</Label>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Deskripsi paket inspeksi..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Biaya (Token)</Label>
                  <Input 
                    type="number"
                    value={formData.token_cost}
                    onChange={(e) => setFormData({ ...formData, token_cost: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Masa Berlaku Sertifikat (Hari)</Label>
                  <Input 
                    type="number"
                    value={formData.certificate_validity_days}
                    onChange={(e) => setFormData({ ...formData, certificate_validity_days: parseInt(e.target.value) || 90 })}
                    placeholder="90"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <Label>Fitur Termasuk</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="inspector" className="text-sm">Inspector Profesional</Label>
                    <Switch 
                      id="inspector"
                      checked={formData.includes_inspector}
                      onCheckedChange={(checked) => setFormData({ ...formData, includes_inspector: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="certificate" className="text-sm">Sertifikat</Label>
                    <Switch 
                      id="certificate"
                      checked={formData.includes_certificate}
                      onCheckedChange={(checked) => setFormData({ ...formData, includes_certificate: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ai" className="text-sm">AI Analytics</Label>
                    <Switch 
                      id="ai"
                      checked={formData.includes_ai_analysis}
                      onCheckedChange={(checked) => setFormData({ ...formData, includes_ai_analysis: checked })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="popular" className="text-sm">Tandai Populer</Label>
                  <Switch 
                    id="popular"
                    checked={formData.is_popular}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_popular: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="active" className="text-sm">Aktif</Label>
                  <Switch 
                    id="active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {pricing.map((plan) => (
          <Card 
            key={plan.id} 
            className={cn(
              "relative",
              plan.is_popular && "border-primary",
              !plan.is_active && "opacity-60"
            )}
          >
            {plan.is_popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-orange-500 text-white">Populer</Badge>
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(plan.type)}
                  <CardTitle>{plan.name}</CardTitle>
                </div>
                {getTypeBadge(plan.type)}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="text-3xl font-bold">
                  {plan.token_cost === 0 ? (
                    <span className="text-green-600">GRATIS</span>
                  ) : (
                    <span>{plan.token_cost} Token</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {plan.includes_ai_analysis ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span>AI Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  {plan.includes_inspector ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span>Inspector Profesional</span>
                </div>
                <div className="flex items-center gap-2">
                  {plan.includes_certificate ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-red-500" />
                  )}
                  <span>Sertifikat ({plan.certificate_validity_days} hari)</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleOpenDialog(plan)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table View */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Lengkap Paket</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Inspector</TableHead>
                <TableHead>Sertifikat</TableHead>
                <TableHead>AI</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricing.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {plan.name}
                      {plan.is_popular && (
                        <Badge variant="outline" className="text-xs">Populer</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(plan.type)}</TableCell>
                  <TableCell>
                    {plan.token_cost === 0 ? 'Gratis' : `${plan.token_cost} Token`}
                  </TableCell>
                  <TableCell>
                    {plan.includes_inspector ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell>
                    {plan.includes_certificate ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell>
                    {plan.includes_ai_analysis ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                      {plan.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleOpenDialog(plan)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
