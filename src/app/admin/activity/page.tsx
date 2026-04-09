'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  Activity,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  Shield,
  Eye,
} from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'


interface ActivityLog {
  id: string
  user_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  description: string | null
  metadata: Record<string, any> | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  user_name: string | null
  user_email: string | null
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

const ACTION_TYPES = [
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'register', label: 'Register' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'view', label: 'View' },
  { value: 'verify', label: 'Verify' },
  { value: 'approve', label: 'Approve' },
  { value: 'reject', label: 'Reject' },
  { value: 'purchase', label: 'Purchase' },
  { value: 'withdraw', label: 'Withdraw' },
]

const ACTION_COLORS: Record<string, string> = {
  login: 'bg-green-500',
  logout: 'bg-gray-500',
  register: 'bg-blue-500',
  create: 'bg-blue-500',
  update: 'bg-yellow-500',
  delete: 'bg-red-500',
  view: 'bg-gray-500',
  verify: 'bg-green-500',
  approve: 'bg-green-500',
  reject: 'bg-red-500',
  purchase: 'bg-purple-500',
  withdraw: 'bg-orange-500',
}

const ENTITY_COLORS: Record<string, string> = {
  user: 'bg-blue-500/20 text-blue-400',
  listing: 'bg-green-500/20 text-green-400',
  transaction: 'bg-yellow-500/20 text-yellow-400',
  withdrawal: 'bg-orange-500/20 text-orange-400',
  kyc: 'bg-purple-500/20 text-purple-400',
  report: 'bg-red-500/20 text-red-400',
  category: 'bg-cyan-500/20 text-cyan-400',
}

export default function AdminActivityPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  })
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchLogs()
  }, [pagination.page])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (search) params.append('search', search)
      if (actionFilter) params.append('action', actionFilter)
      if (dateFrom) params.append('dateFrom', dateFrom)
      if (dateTo) params.append('dateTo', dateTo)

      const res = await fetch(`/api/admin/activity?${params}`)
      const data = await res.json()

      if (data.success) {
        setLogs(data.data || [])
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching activity logs:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat log aktivitas',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchLogs()
  }

  const handleFilterApply = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchLogs()
    setShowFilters(false)
  }

  const handleClearFilters = () => {
    setActionFilter('')
    setDateFrom('')
    setDateTo('')
    setSearch('')
    setPagination(prev => ({ ...prev, page: 1 }))
    setTimeout(() => fetchLogs(), 100)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActionBadge = (action: string) => {
    const color = ACTION_COLORS[action] || 'bg-gray-500'
    return <Badge className={`${color} text-white`}>{action}</Badge>
  }

  const getEntityBadge = (entityType: string | null) => {
    if (!entityType) return <span className="text-gray-500">-</span>
    const color = ENTITY_COLORS[entityType] || 'bg-gray-500/20 text-gray-400'
    return <Badge className={color}>{entityType}</Badge>
  }

  const activeFiltersCount = [
    actionFilter,
    dateFrom,
    dateTo,
  ].filter(Boolean).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="h-6 w-6 text-orange-500" />
            Log Aktivitas
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Pantau semua aktivitas sistem dan pengguna
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-orange-500/30 text-orange-400">
            {pagination.total} Total Log
          </Badge>
        </div>
      </div>

      {/* Search & Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Cari deskripsi atau nama user..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-gray-800 border-gray-700 text-white"
              />
              <Button onClick={handleSearch} className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Filter Button */}
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="border-gray-700 bg-gray-800 text-white relative">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center bg-orange-500 text-white text-xs">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 bg-gray-900 border-gray-800" align="end">
                <div className="space-y-4">
                  <h4 className="font-medium text-white">Filter Aktivitas</h4>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Jenis Aksi</label>
                    <Select value={actionFilter} onValueChange={setActionFilter}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Semua Aksi" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Semua Aksi</SelectItem>
                        {ACTION_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Tanggal Mulai</label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Tanggal Akhir</label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      onClick={handleClearFilters}
                      className="flex-1 border-gray-700"
                    >
                      Reset
                    </Button>
                    <Button
                      onClick={handleFilterApply}
                      className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700"
                    >
                      Terapkan
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                onClick={handleClearFilters}
                className="text-gray-400 hover:text-white"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">Tidak ada log aktivitas ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left p-4 text-gray-400 font-medium">User</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Action</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Entity</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Description</th>
                    <th className="text-left p-4 text-gray-400 font-medium">IP Address</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-white text-sm">
                              {log.user_name || 'System'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {log.user_email || '-'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="p-4">
                        {getEntityBadge(log.entity_type)}
                        {log.entity_id && (
                          <p className="text-xs text-gray-500 mt-1 truncate max-w-[100px]">
                            {log.entity_id.slice(0, 8)}...
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="text-white text-sm max-w-[200px] truncate">
                          {log.description || '-'}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-400 text-sm font-mono">
                          {log.ip_address || '-'}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-400 text-sm">
                          {formatDate(log.created_at)}
                        </p>
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
            Menampilkan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} dari {pagination.total} log
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              className="border-gray-700 bg-gray-800 text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-gray-400 text-sm px-3">
              {pagination.page} / {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              className="border-gray-700 bg-gray-800 text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
