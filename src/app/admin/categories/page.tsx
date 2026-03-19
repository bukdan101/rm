'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, Pencil, Trash2, FolderTree, Layers, Loader2, 
  Package, Star, Eye, EyeOff, RefreshCw 
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'
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

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon_url?: string | null
  parent_id?: string | null
  is_active: boolean
  is_featured?: boolean
  sort_order?: number
  listing_count?: number
  created_at: string
}

interface Brand {
  id: string
  name: string
  slug: string
  logo_url: string | null
  is_active: boolean
  listing_count?: number
}

const generateSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'body_types' | 'brands'>('body_types')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; item: Category | Brand | null }>({
    open: false,
    item: null,
  })
  const [editing, setEditing] = useState<Category | Brand | null>(null)
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    icon_url: '',
    parent_id: null as string | null,
    is_active: true,
    is_featured: false,
    sort_order: 0,
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/categories?type=${activeTab}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      
      const data = await response.json()
      
      if (activeTab === 'brands') {
        setBrands(data.brands || [])
        setCategories([])
      } else {
        setCategories(data.categories || data.bodyTypes || [])
        setBrands([])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat kategori',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [activeTab, toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const parentCategories = categories.filter((c) => !c.parent_id)
  const getSubcategories = (parentId: string) =>
    categories.filter((c) => c.parent_id === parentId)

  const currentData = activeTab === 'brands' ? brands : categories
  const stats = {
    total: currentData.length,
    active: currentData.filter(c => c.is_active).length,
    featured: currentData.filter(c => 'is_featured' in c && c.is_featured).length,
    totalListings: currentData.reduce((sum, c) => sum + (c.listing_count || 0), 0),
  }

  const openCreate = (parentId?: string) => {
    setEditing(null)
    setForm({
      name: '',
      slug: '',
      description: '',
      icon_url: '',
      parent_id: parentId || null,
      is_active: true,
      is_featured: false,
      sort_order: 0,
    })
    setDialogOpen(true)
  }

  const openEdit = (item: Category | Brand) => {
    setEditing(item)
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description || '',
      icon_url: ('icon_url' in item ? item.icon_url : '') || '',
      parent_id: ('parent_id' in item ? item.parent_id : null) || null,
      is_active: item.is_active,
      is_featured: ('is_featured' in item ? item.is_featured : false) || false,
      sort_order: ('sort_order' in item ? item.sort_order : 0) || 0,
    })
    setDialogOpen(true)
  }

  const handleNameChange = (name: string) => {
    setForm((f) => ({
      ...f,
      name,
      slug: editing ? f.slug : generateSlug(name),
    }))
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast({
        title: 'Error',
        description: 'Nama dan slug wajib diisi',
        variant: 'destructive',
      })
      return
    }

    try {
      setProcessing(true)
      
      const payload = {
        id: editing?.id,
        type: activeTab,
        ...form,
        parent_id: form.parent_id || null
      }

      const response = await fetch('/api/admin/categories', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save')
      }

      toast({
        title: 'Berhasil',
        description: editing ? 'Data berhasil diupdate' : 'Data berhasil ditambahkan',
      })

      setDialogOpen(false)
      fetchData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menyimpan',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.item) return

    try {
      setProcessing(true)
      const response = await fetch(`/api/admin/categories?id=${deleteDialog.item.id}&type=${activeTab}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete')
      }

      toast({
        title: 'Berhasil',
        description: 'Data berhasil dihapus',
      })
      setDeleteDialog({ open: false, item: null })
      fetchData()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Gagal menghapus',
        variant: 'destructive',
      })
    } finally {
      setProcessing(false)
    }
  }

  const toggleActive = async (item: Category | Brand) => {
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: item.id,
          type: activeTab,
          is_active: !item.is_active
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update')
      }

      if (activeTab === 'brands') {
        setBrands(prev => prev.map(b =>
          b.id === item.id ? { ...b, is_active: !b.is_active } : b
        ))
      } else {
        setCategories(prev => prev.map(c =>
          c.id === item.id ? { ...c, is_active: !c.is_active } : c
        ))
      }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <FolderTree className="h-5 w-5 text-white" />
            </div>
            Manajemen Kategori
          </h1>
          <p className="text-muted-foreground">Kelola kategori dan brand kendaraan</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => openCreate()} className="gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
            <Plus className="h-4 w-4" />
            Tambah {activeTab === 'brands' ? 'Brand' : 'Kategori'}
          </Button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'body_types' ? 'default' : 'outline'}
          onClick={() => setActiveTab('body_types')}
          className="gap-2"
        >
          <Layers className="h-4 w-4" />
          Body Types
        </Button>
        <Button
          variant={activeTab === 'brands' ? 'default' : 'outline'}
          onClick={() => setActiveTab('brands')}
          className="gap-2"
        >
          <Package className="h-4 w-4" />
          Brands
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Total {activeTab === 'brands' ? 'Brand' : 'Kategori'}
                </CardTitle>
                <FolderTree className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
                  Aktif
                </CardTitle>
                <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700 dark:text-green-400">{stats.active}</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-amber-700 dark:text-amber-400">
                  Featured
                </CardTitle>
                <Star className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-amber-700 dark:text-amber-400">{stats.featured}</div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-background">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-400">
                  Total Listing
                </CardTitle>
                <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-700 dark:text-purple-400">{stats.totalListings.toLocaleString()}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <Card>
          <CardContent className="flex justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : activeTab === 'brands' ? (
        // Brands List
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="text-center">Listings</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {brands.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Belum ada brand
                  </TableCell>
                </TableRow>
              ) : (
                brands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {brand.logo_url && (
                          <img src={brand.logo_url} alt={brand.name} className="h-8 w-8 object-contain" />
                        )}
                        {brand.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{brand.slug}</TableCell>
                    <TableCell className="text-center">{(brand.listing_count || 0).toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={brand.is_active}
                        onCheckedChange={() => toggleActive(brand)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(brand)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteDialog({ open: true, item: brand })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      ) : (
        // Body Types List
        parentCategories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <FolderTree className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Belum ada kategori</p>
              <p className="text-sm mt-1">Klik "Tambah Kategori" untuk memulai</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {parentCategories.map((parent) => {
              const subs = getSubcategories(parent.id)
              return (
                <Card key={parent.id} className="overflow-hidden">
                  <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/10 dark:to-teal-950/10">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Layers className="h-4 w-4 text-emerald-600" />
                        {parent.name}
                        {!parent.is_active && (
                          <Badge variant="secondary" className="text-xs">
                            <EyeOff className="h-3 w-3 mr-1" />
                            Nonaktif
                          </Badge>
                        )}
                        {parent.is_featured && (
                          <Badge className="text-xs bg-amber-500">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground font-normal">
                          ({(parent.listing_count || 0).toLocaleString()} listing)
                        </span>
                      </CardTitle>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openCreate(parent.id)}
                          className="gap-1 text-xs"
                        >
                          <Plus className="h-3 w-3" />
                          Sub
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(parent)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Switch
                          checked={parent.is_active}
                          onCheckedChange={() => toggleActive(parent)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteDialog({ open: true, item: parent })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  {subs.length > 0 && (
                    <CardContent className="pt-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead className="text-center">Listing</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subs.map((sub) => (
                            <TableRow key={sub.id}>
                              <TableCell className="font-medium">
                                {sub.name}
                                {sub.is_featured && (
                                  <Star className="h-3 w-3 inline ml-1 text-amber-500" />
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-xs">
                                {sub.slug}
                              </TableCell>
                              <TableCell className="text-center">{(sub.listing_count || 0).toLocaleString()}</TableCell>
                              <TableCell className="text-center">
                                <Switch
                                  checked={sub.is_active}
                                  onCheckedChange={() => toggleActive(sub)}
                                />
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEdit(sub)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => setDeleteDialog({ open: true, item: sub })}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        )
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing
                ? `Edit ${activeTab === 'brands' ? 'Brand' : 'Kategori'}`
                : form.parent_id
                ? 'Tambah Subkategori'
                : `Tambah ${activeTab === 'brands' ? 'Brand' : 'Kategori'}`}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nama *</Label>
              <Input
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Nama"
              />
            </div>
            <div>
              <Label>Slug *</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                placeholder="slug"
              />
            </div>
            {activeTab !== 'brands' && (
              <>
                <div>
                  <Label>Deskripsi</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Deskripsi"
                    rows={2}
                  />
                </div>
                <div>
                  <Label>Parent Kategori</Label>
                  <Select
                    value={form.parent_id || 'none'}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, parent_id: v === 'none' ? null : v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih parent (opsional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Tidak ada (Kategori utama)</SelectItem>
                      {parentCategories
                        .filter((c) => c.id !== editing?.id)
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div>
              <Label>{activeTab === 'brands' ? 'Logo URL' : 'Icon URL'}</Label>
              <Input
                value={form.icon_url}
                onChange={(e) => setForm((f) => ({ ...f, icon_url: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label>Urutan</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))
                }
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.is_active}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))}
                />
                <Label>Aktif</Label>
              </div>
              {activeTab !== 'brands' && (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.is_featured}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, is_featured: v }))}
                  />
                  <Label>Featured</Label>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={processing}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, item: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus {activeTab === 'brands' ? 'Brand' : 'Kategori'}?</AlertDialogTitle>
            <AlertDialogDescription>
              Yakin ingin menghapus "{deleteDialog.item?.name}"? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={processing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
