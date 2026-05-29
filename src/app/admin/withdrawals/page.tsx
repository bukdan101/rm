'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  ArrowDownCircle, Search, Filter, Eye, CheckCircle, XCircle,
  Clock, Loader2, ChevronLeft, ChevronRight, DollarSign
} from 'lucide-react'

interface Withdrawal {
  id: string
  withdrawal_number: string
  user_id: string | null
  dealer_id: string | null
  amount: number
  fee: number
  net_amount: number
  bank_name: string
  bank_account_number: string
  bank_account_name: string
  status: string
  rejection_reason: string | null
  created_at: string
  user: { full_name: string | null } | null
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-500',
  processing: 'bg-blue-500/20 text-blue-500',
  completed: 'bg-green-500/20 text-green-500',
  rejected: 'bg-red-500/20 text-red-500',
  cancelled: 'bg-gray-500/20 text-gray-500',
}

export default function AdminWithdrawalsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [selected, setSelected] = useState<Withdrawal | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [processing, setProcessing] = useState(false)
  
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchWithdrawals()
  }, [page, statusFilter])

  const fetchWithdrawals = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (statusFilter) params.append('status', statusFilter)

      const res = await fetch(`/api/admin/withdrawals?${params}`)
      const data = await res.json()

      if (data.success) {
        setWithdrawals(data.data || [])
        setTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat data penarikan',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    try {
      setProcessing(true)
      const res = await fetch('/api/admin/withdrawals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: 'completed' }),
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Berhasil', description: 'Penarikan berhasil diproses' })
        setDetailOpen(false)
        fetchWithdrawals()
      } else {
        throw new Error(data.error)
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal memproses penarikan', variant: 'destructive' })
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async () => {
    if (!selected || !rejectReason.trim()) {
      toast({ title: 'Error', description: 'Alasan penolakan wajib diisi', variant: 'destructive' })
      return
    }

    try {
      setProcessing(true)
      const res = await fetch('/api/admin/withdrawals', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, status: 'rejected', rejection_reason: rejectReason }),
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Berhasil', description: 'Penarikan ditolak' })
        setRejectOpen(false)
        setDetailOpen(false)
        setRejectReason('')
        fetchWithdrawals()
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal menolak penarikan', variant: 'destructive' })
    } finally {
      setProcessing(false)
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
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <ArrowDownCircle className="h-8 w-8 text-orange-500" />
          Penarikan
        </h1>
        <p className="text-gray-400 mt-1">Kelola permintaan penarikan dana</p>
      </div>

      {/* Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchWithdrawals} className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <ArrowDownCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tidak ada permintaan penarikan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">No. Withdrawal</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Jumlah</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Bank</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Tanggal</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((w) => (
                    <tr key={w.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-4 px-4 font-mono text-sm text-gray-300">{w.withdrawal_number}</td>
                      <td className="py-4 px-4 text-white">{w.user?.full_name || 'Unknown'}</td>
                      <td className="py-4 px-4 text-green-400 font-medium">{formatCurrency(w.amount)}</td>
                      <td className="py-4 px-4 text-gray-300">{w.bank_name} - {w.bank_account_number}</td>
                      <td className="py-4 px-4">
                        <Badge className={statusColors[w.status] || ''}>{w.status}</Badge>
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-sm">{formatDate(w.created_at)}</td>
                      <td className="py-4 px-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-white"
                          onClick={() => { setSelected(w); setDetailOpen(true) }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-800">
              <p className="text-sm text-gray-400">Halaman {page} dari {totalPages}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="border-gray-700 text-gray-300">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="border-gray-700 text-gray-300">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Detail Penarikan</DialogTitle>
          </DialogHeader>
          
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">No. Withdrawal</p>
                  <p className="text-white font-mono">{selected.withdrawal_number}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Jumlah</p>
                  <p className="text-green-400 font-bold">{formatCurrency(selected.amount)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Biaya</p>
                  <p className="text-red-400">{formatCurrency(selected.fee)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Net Amount</p>
                  <p className="text-white font-bold">{formatCurrency(selected.net_amount)}</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-gray-800 border border-gray-700">
                <p className="text-gray-400 text-sm mb-2">Rekening Tujuan</p>
                <p className="text-white font-medium">{selected.bank_name}</p>
                <p className="text-gray-300">{selected.bank_account_number}</p>
                <p className="text-gray-300">{selected.bank_account_name}</p>
              </div>

              {selected.status === 'pending' && (
                <div className="flex gap-3">
                  <Button onClick={() => handleApprove(selected.id)} disabled={processing} className="flex-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Proses
                  </Button>
                  <Button onClick={() => setRejectOpen(true)} disabled={processing} variant="destructive" className="flex-1">
                    <XCircle className="h-4 w-4 mr-2" />
                    Tolak
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">Tolak Penarikan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-400">Masukkan alasan penolakan:</p>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Alasan penolakan..."
              className="bg-gray-800 border-gray-700 text-white"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)} className="border-gray-700 text-gray-300">Batal</Button>
            <Button variant="destructive" onClick={handleReject} disabled={processing}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
