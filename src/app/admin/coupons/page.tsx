'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  Ticket, Search, Plus, Edit, Trash2, Loader2, ChevronLeft, ChevronRight,
  Percent, DollarSign, Calendar, Users, Tag, Clock, CheckCircle, XCircle
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

interface Coupon {
  id: string
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_discount: number | null
  min_purchase: number
  valid_from: string
  valid_until: string
  usage_limit: number | null
  usage_count: number
  applicable_to: string
  status: 'active' | 'expired' | 'disabled'
  created_at: string
  updated_at: string
}

interface CouponStats {
  activeCoupons: number
  totalUsage: number
  expiredCoupons: number
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

interface CouponFormData {
  code: string
  discount_type: 'percentage' | 'fixed'
  discount_value: number
  max_discount: number | null
  min_purchase: number
  valid_from: string
  valid_until: string
  usage_limit: number | null
  applicable_to: string
  status: 'active' | 'disabled'
}

const initialFormData: CouponFormData = {
  code: '',
  discount_type: 'percentage',
  discount_value: 0,
  max_discount: null,
  min_purchase: 0,
  valid_from: '',
  valid_until: '',
  usage_limit: null,
  applicable_to: 'all',
  status: 'active',
}

export default function AdminCouponsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [stats, setStats] = useState<CouponStats>({
    activeCoupons: 0,
    totalUsage: 0,
    expiredCoupons: 0,
  })
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showDialog, setShowDialog] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState<CouponFormData>(initialFormData)
  const [saving, setSaving] = useState(false)
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)

  useEffect(() => {
    fetchCoupons()
  }, [pagination.page, statusFilter])

  const fetchCoupons = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)

      const res = await fetch(`/api/admin/coupons?${params}`)
      const data = await res.json()

      if (data.success) {
        setCoupons(data.data || [])
        setPagination(data.pagination)
        setStats(data.stats || { activeCoupons: 0, totalUsage: 0, expiredCoupons: 0 })
      }
    } catch (error) {
      console.error('Error fetching coupons:', error)
      toast({
        title: 'Error',
        description: 'Failed to load coupon data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchCoupons()
  }

  const openCreateDialog = () => {
    setEditingCoupon(null)
    setFormData(initialFormData)
    setShowDialog(true)
  }

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      max_discount: coupon.max_discount,
      min_purchase: coupon.min_purchase,
      valid_from: coupon.valid_from ? coupon.valid_from.split('T')[0] : '',
      valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
      usage_limit: coupon.usage_limit,
      applicable_to: coupon.applicable_to,
      status: coupon.status === 'active' ? 'active' : 'disabled',
    })
    setShowDialog(true)
  }

  const handleSubmit = async () => {
    if (!formData.code || formData.discount_value <= 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      })
      return
    }

    setSaving(true)
    try {
      const url = '/api/admin/coupons'
      const method = editingCoupon ? 'PATCH' : 'POST'
      const body = editingCoupon
        ? { id: editingCoupon.id, ...formData }
        : formData

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: editingCoupon ? 'Coupon updated successfully' : 'Coupon created successfully',
        })
        setShowDialog(false)
        fetchCoupons()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: String(error),
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, {
        method: 'DELETE',
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Coupon deleted successfully',
        })
        setDeleteDialog(null)
        fetchCoupons()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: String(error),
        variant: 'destructive',
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string, validUntil?: string) => {
    // Check if expired based on date
    const isExpired = validUntil && new Date(validUntil) < new Date()
    
    if (status === 'expired' || isExpired) {
      return <Badge variant="secondary" className="bg-gray-600">Expired</Badge>
    }
    if (status === 'disabled') {
      return <Badge variant="secondary" className="bg-red-600/20 text-red-400">Disabled</Badge>
    }
    return <Badge className="bg-green-600">Active</Badge>
  }

  const getDiscountDisplay = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}%`
    }
    return formatCurrency(coupon.discount_value)
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Coupons</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.activeCoupons}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Usage</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.totalUsage}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Expired</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.expiredCoupons}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-600 to-slate-600 flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-orange-500/30 text-orange-400">
            {pagination.total} Total Coupons
          </Badge>
        </div>
        <Button
          onClick={openCreateDialog}
          className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search coupon code..."
                value={search}
                onChange={(e) => setSearch(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button onClick={handleSearch} className="bg-orange-600 hover:bg-orange-700">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No coupons found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-4 text-gray-400 font-medium">Code</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Discount</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Min Purchase</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Valid Until</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Usage</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                    <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center">
                            <Ticket className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-mono font-bold text-white">{coupon.code}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {coupon.discount_type === 'percentage' ? (
                            <Percent className="h-4 w-4 text-orange-400" />
                          ) : (
                            <DollarSign className="h-4 w-4 text-green-400" />
                          )}
                          <span className="text-white font-medium">{getDiscountDisplay(coupon)}</span>
                          {coupon.max_discount && coupon.discount_type === 'percentage' && (
                            <span className="text-xs text-gray-500">
                              (max {formatCurrency(coupon.max_discount)})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-gray-300">{formatCurrency(coupon.min_purchase)}</td>
                      <td className="p-4 text-gray-300">{formatDate(coupon.valid_until)}</td>
                      <td className="p-4">
                        <div className="text-sm">
                          <span className="text-white">{coupon.usage_count}</span>
                          {coupon.usage_limit && (
                            <span className="text-gray-500"> / {coupon.usage_limit}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">{getStatusBadge(coupon.status, coupon.valid_until)}</td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(coupon)}
                            className="text-gray-400 hover:text-white hover:bg-gray-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteDialog(coupon.id)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} coupons
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              className="border-gray-700 bg-gray-800 hover:bg-gray-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-gray-400">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              className="border-gray-700 bg-gray-800 hover:bg-gray-700"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingCoupon ? 'Update coupon details' : 'Fill in the coupon details below'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            {/* Code */}
            <div className="space-y-2 col-span-2 md:col-span-1">
              <Label className="text-gray-300">Coupon Code *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. SAVE20"
                className="bg-gray-800 border-gray-700 text-white font-mono"
              />
            </div>

            {/* Discount Type */}
            <div className="space-y-2">
              <Label className="text-gray-300">Discount Type</Label>
              <Select
                value={formData.discount_type}
                onValueChange={(v: 'percentage' | 'fixed') => setFormData(prev => ({ ...prev, discount_type: v }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount (IDR)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Discount Value */}
            <div className="space-y-2">
              <Label className="text-gray-300">
                Discount Value {formData.discount_type === 'percentage' ? '(%)' : '(IDR)'}
              </Label>
              <Input
                type="number"
                value={formData.discount_value}
                onChange={(e) => setFormData(prev => ({ ...prev, discount_value: Number(e.target.value) }))}
                placeholder={formData.discount_type === 'percentage' ? '20' : '50000'}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            {/* Max Discount */}
            {formData.discount_type === 'percentage' && (
              <div className="space-y-2">
                <Label className="text-gray-300">Max Discount (IDR)</Label>
                <Input
                  type="number"
                  value={formData.max_discount || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_discount: e.target.value ? Number(e.target.value) : null }))}
                  placeholder="Optional"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            )}

            {/* Min Purchase */}
            <div className="space-y-2">
              <Label className="text-gray-300">Min Purchase (IDR)</Label>
              <Input
                type="number"
                value={formData.min_purchase}
                onChange={(e) => setFormData(prev => ({ ...prev, min_purchase: Number(e.target.value) }))}
                placeholder="0"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            {/* Valid From */}
            <div className="space-y-2">
              <Label className="text-gray-300">Valid From</Label>
              <Input
                type="date"
                value={formData.valid_from}
                onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            {/* Valid Until */}
            <div className="space-y-2">
              <Label className="text-gray-300">Valid Until</Label>
              <Input
                type="date"
                value={formData.valid_until}
                onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            {/* Usage Limit */}
            <div className="space-y-2">
              <Label className="text-gray-300">Usage Limit</Label>
              <Input
                type="number"
                value={formData.usage_limit || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: e.target.value ? Number(e.target.value) : null }))}
                placeholder="Unlimited"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            {/* Applicable To */}
            <div className="space-y-2">
              <Label className="text-gray-300">Applicable To</Label>
              <Select
                value={formData.applicable_to}
                onValueChange={(v) => setFormData(prev => ({ ...prev, applicable_to: v }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="new_users">New Users Only</SelectItem>
                  <SelectItem value="dealers">Dealers Only</SelectItem>
                  <SelectItem value="verified">Verified Users Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2 flex items-center gap-3 pt-6">
              <Label className="text-gray-300">Active</Label>
              <Switch
                checked={formData.status === 'active'}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, status: checked ? 'active' : 'disabled' }))}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="border-gray-700 bg-gray-800 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingCoupon ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Delete Coupon</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this coupon? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(null)}
              className="border-gray-700 bg-gray-800 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={() => deleteDialog && handleDelete(deleteDialog)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
