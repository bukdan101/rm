'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
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
  Plus,
  Pencil,
  Trash2,
  Coins,
  Loader2,
  Star,
  Users,
  Building2,
  Sparkles,
  Check,
  ArrowUpRight,
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface CreditPackage {
  id: string
  name: string
  description: string | null
  price: number
  credits: number
  bonus_credits: number
  total_credits: number
  is_for_dealer: boolean
  is_popular: boolean
  is_active: boolean
  display_order: number
  created_at: string
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function TokenPackagesPage() {
  const [packages, setPackages] = useState<CreditPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; pkg: CreditPackage | null }>({
    open: false,
    pkg: null,
  })
  const [editing, setEditing] = useState<CreditPackage | null>(null)
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: 0,
    credits: 0,
    bonus_credits: 0,
    is_for_dealer: false,
    is_popular: false,
    is_active: true,
    display_order: 0,
  })

  useEffect(() => {
    fetchPackages()
  }, [])

  async function fetchPackages() {
    try {
      setLoading(true)
      const res = await fetch('/api/credits/packages?all=true')
      const data = await res.json()
      setPackages(data.packages || [])
    } catch (error) {
      console.error('Error fetching packages:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat paket token',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const userPackages = packages.filter(p => !p.is_for_dealer)
  const dealerPackages = packages.filter(p => p.is_for_dealer)

  const stats = {
    totalPackages: packages.length,
    activePackages: packages.filter(p => p.is_active).length,
    userPackages: userPackages.length,
    dealerPackages: dealerPackages.length,
  }

  const openCreate = (forDealer: boolean = false) => {
    setEditing(null)
    setForm({
      name: '',
      description: '',
      price: 0,
      credits: 0,
      bonus_credits: 0,
      is_for_dealer: forDealer,
      is_popular: false,
      is_active: true,
      display_order: packages.length + 1,
    })
    setDialogOpen(true)
  }

  const openEdit = (pkg: CreditPackage) => {
    setEditing(pkg)
    setForm({
      name: pkg.name,
      description: pkg.description || '',
      price: pkg.price,
      credits: pkg.credits,
      bonus_credits: pkg.bonus_credits,
      is_for_dealer: pkg.is_for_dealer,
      is_popular: pkg.is_popular,
      is_active: pkg.is_active,
      display_order: pkg.display_order,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || form.price <= 0 || form.credits <= 0) {
      toast({
        title: 'Error',
        description: 'Nama, harga, dan jumlah token wajib diisi',
        variant: 'destructive',
      })
      return
    }

    try {
      setProcessing(true)

      const payload = {
        ...form,
        total_credits: form.credits + form.bonus_credits,
      }

      const url = editing
        ? `/api/admin/credits/packages/${editing.id}`
        : '/api/admin/credits/packages'

      const method = editing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error('Failed to save package')

      toast({
        title: 'Berhasil',
        description: editing ? 'Paket berhasil diupdate' : 'Paket berhasil ditambahkan',
      })

      setDialogOpen(false)
      fetchPackages()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menyimpan paket',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.pkg) return

    try {
      setProcessing(true)
      const res = await fetch(`/api/admin/credits/packages/${deleteDialog.pkg.id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Failed to delete package')

      toast({
        title: 'Berhasil',
        description: 'Paket berhasil dihapus',
      })

      setDeleteDialog({ open: false, pkg: null })
      fetchPackages()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal menghapus paket',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const toggleActive = async (pkg: CreditPackage) => {
    try {
      const res = await fetch(`/api/admin/credits/packages/${pkg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !pkg.is_active }),
      })

      if (!res.ok) throw new Error('Failed to toggle status')

      fetchPackages()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal mengubah status',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Coins className="h-5 w-5 text-white" />
            </div>
            Token Packages
          </h1>
          <p className="text-muted-foreground mt-1">
            Kelola paket token untuk user dan dealer
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => openCreate(false)} className="gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
            <Plus className="h-4 w-4" />
            User Package
          </Button>
          <Button onClick={() => openCreate(true)} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            Dealer Package
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Packages</CardTitle>
            <Coins className="h-5 w-5 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalPackages}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            <Check className="h-5 w-5 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activePackages}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-violet-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">User Packages</CardTitle>
            <Users className="h-5 w-5 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.userPackages}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Dealer Packages</CardTitle>
            <Building2 className="h-5 w-5 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.dealerPackages}</div>
          </CardContent>
        </Card>
      </div>

      {/* Packages Tabs */}
      <Tabs defaultValue="user" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="user" className="gap-2">
            <Users className="h-4 w-4" />
            User Packages
          </TabsTrigger>
          <TabsTrigger value="dealer" className="gap-2">
            <Building2 className="h-4 w-4" />
            Dealer Packages
          </TabsTrigger>
        </TabsList>

        {/* User Packages */}
        <TabsContent value="user">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Package Name</TableHead>
                      <TableHead className="text-center">Credits</TableHead>
                      <TableHead className="text-center">Bonus</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userPackages.map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{pkg.name}</span>
                            {pkg.is_popular && (
                              <Badge className="bg-amber-500 text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Popular
                              </Badge>
                            )}
                          </div>
                          {pkg.description && (
                            <p className="text-xs text-muted-foreground">{pkg.description}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-center font-mono">{pkg.credits.toLocaleString()}</TableCell>
                        <TableCell className="text-center font-mono text-emerald-600">
                          {pkg.bonus_credits > 0 ? `+${pkg.bonus_credits}` : '-'}
                        </TableCell>
                        <TableCell className="text-center font-mono font-bold">
                          {pkg.total_credits.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(pkg.price)}</TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={pkg.is_active}
                            onCheckedChange={() => toggleActive(pkg)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(pkg)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteDialog({ open: true, pkg })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dealer Packages */}
        <TabsContent value="dealer">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Package Name</TableHead>
                      <TableHead className="text-center">Credits</TableHead>
                      <TableHead className="text-center">Bonus</TableHead>
                      <TableHead className="text-center">Total</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dealerPackages.map((pkg) => (
                      <TableRow key={pkg.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{pkg.name}</span>
                            {pkg.is_popular && (
                              <Badge className="bg-amber-500 text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Popular
                              </Badge>
                            )}
                          </div>
                          {pkg.description && (
                            <p className="text-xs text-muted-foreground">{pkg.description}</p>
                          )}
                        </TableCell>
                        <TableCell className="text-center font-mono">{pkg.credits.toLocaleString()}</TableCell>
                        <TableCell className="text-center font-mono text-emerald-600">
                          {pkg.bonus_credits > 0 ? `+${pkg.bonus_credits}` : '-'}
                        </TableCell>
                        <TableCell className="text-center font-mono font-bold">
                          {pkg.total_credits.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(pkg.price)}</TableCell>
                        <TableCell className="text-center">
                          <Switch
                            checked={pkg.is_active}
                            onCheckedChange={() => toggleActive(pkg)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(pkg)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleteDialog({ open: true, pkg })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Edit Package' : `New ${form.is_for_dealer ? 'Dealer' : 'User'} Package`}
            </DialogTitle>
            <DialogDescription>
              {editing ? 'Update package details' : 'Create a new token package'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Package Name *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g., Starter, Basic, Premium"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Short description"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Price (Rp) *</Label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                  placeholder="50000"
                />
              </div>
              <div>
                <Label>Credits *</Label>
                <Input
                  type="number"
                  value={form.credits}
                  onChange={(e) => setForm(f => ({ ...f, credits: Number(e.target.value) }))}
                  placeholder="50"
                />
              </div>
              <div>
                <Label>Bonus</Label>
                <Input
                  type="number"
                  value={form.bonus_credits}
                  onChange={(e) => setForm(f => ({ ...f, bonus_credits: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
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
            {form.credits > 0 && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20">
                <p className="text-sm">
                  <span className="font-medium">Total Credits:</span>{' '}
                  <span className="text-amber-700 dark:text-amber-400 font-bold">
                    {(form.credits + form.bonus_credits).toLocaleString()}
                  </span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Price per token: Rp {(form.price / (form.credits + form.bonus_credits) || 0).toFixed(0)}
                </p>
              </div>
            )}
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
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, pkg: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Package?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.pkg?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={processing} className="bg-destructive text-destructive-foreground">
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
