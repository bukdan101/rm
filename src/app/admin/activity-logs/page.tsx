'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  Activity, Search, Filter, Loader2, ChevronLeft, ChevronRight,
  User, Car, CreditCard, Settings, Shield
} from 'lucide-react'

interface ActivityLog {
  id: string
  user_id: string | null
  user_role: string | null
  user_email: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  description: string | null
  metadata: any
  ip_address: string | null
  status: string
  created_at: string
}

const actionIcons: Record<string, typeof User> = {
  login: User,
  logout: User,
  create_listing: Car,
  update_listing: Car,
  delete_listing: Car,
  purchase: CreditCard,
  withdrawal: CreditCard,
  settings: Settings,
  admin: Shield,
}

const statusColors: Record<string, string> = {
  success: 'bg-green-500/20 text-green-500',
  failed: 'bg-red-500/20 text-red-500',
  pending: 'bg-yellow-500/20 text-yellow-500',
}

export default function AdminActivityLogsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchLogs()
  }, [page, actionFilter])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '50' })
      if (actionFilter) params.append('action', actionFilter)
      if (search) params.append('search', search)

      const res = await fetch(`/api/admin/activity-logs?${params}`)
      const data = await res.json()

      if (data.success) {
        setLogs(data.data || [])
        setTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (error) {
      console.error('Error fetching logs:', error)
      toast({
        title: 'Error',
        description: 'Gagal memuat log aktivitas',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getActionIcon = (action: string) => {
    for (const [key, icon] of Object.entries(actionIcons)) {
      if (action.includes(key)) return icon
    }
    return Activity
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Activity className="h-8 w-8 text-orange-500" />
          Log Aktivitas
        </h1>
        <p className="text-gray-400 mt-1">Riwayat semua aktivitas sistem</p>
      </div>

      {/* Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Cari user, action, atau deskripsi..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-full md:w-48 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Semua Aksi" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Aksi</SelectItem>
                <SelectItem value="login">Login/Logout</SelectItem>
                <SelectItem value="listing">Listing</SelectItem>
                <SelectItem value="purchase">Pembelian</SelectItem>
                <SelectItem value="withdrawal">Penarikan</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchLogs} className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tidak ada log aktivitas</p>
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => {
                const Icon = getActionIcon(log.action)
                return (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-gray-700">
                      <Icon className="h-4 w-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-medium">{log.action}</span>
                        <Badge className={statusColors[log.status] || ''}>
                          {log.status}
                        </Badge>
                        {log.user_role === 'admin' && (
                          <Badge className="bg-orange-500/20 text-orange-500">Admin</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 truncate">{log.description || log.user_email || 'System'}</p>
                      {log.ip_address && (
                        <p className="text-xs text-gray-500 mt-1">IP: {log.ip_address}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{formatDate(log.created_at)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-800">
              <p className="text-sm text-gray-400">Halaman {page} dari {totalPages}</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="border-gray-700 text-gray-300"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="border-gray-700 text-gray-300"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
