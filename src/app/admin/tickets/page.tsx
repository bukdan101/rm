'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import {
  HeadphonesIcon, Search, Filter, Eye, Clock, Loader2,
  ChevronLeft, ChevronRight, MessageSquare, CheckCircle
} from 'lucide-react'

interface Ticket {
  id: string
  ticket_number: string
  user_id: string | null
  subject: string
  category: string | null
  priority: string
  status: string
  created_at: string
  user: { full_name: string | null; email: string | null } | null
}

const statusColors: Record<string, string> = {
  open: 'bg-blue-500/20 text-blue-500',
  in_progress: 'bg-yellow-500/20 text-yellow-500',
  waiting_customer: 'bg-purple-500/20 text-purple-500',
  resolved: 'bg-green-500/20 text-green-500',
  closed: 'bg-gray-500/20 text-gray-500',
}

const priorityColors: Record<string, string> = {
  low: 'bg-gray-500/20 text-gray-400',
  normal: 'bg-blue-500/20 text-blue-400',
  high: 'bg-orange-500/20 text-orange-400',
  urgent: 'bg-red-500/20 text-red-400',
}

export default function AdminTicketsPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchTickets()
  }, [page, statusFilter])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: '20' })
      if (statusFilter) params.append('status', statusFilter)

      const res = await fetch(`/api/admin/tickets?${params}`)
      const data = await res.json()

      if (data.success) {
        setTickets(data.data || [])
        setTotalPages(data.pagination?.totalPages || 1)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Gagal memuat tiket',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async () => {
    if (!selected || !reply.trim()) return

    try {
      setSending(true)
      const res = await fetch('/api/admin/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: selected.id, message: reply }),
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Berhasil', description: 'Balasan terkirim' })
        setReply('')
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal mengirim balasan', variant: 'destructive' })
    } finally {
      setSending(false)
    }
  }

  const updateStatus = async (status: string) => {
    if (!selected) return

    try {
      const res = await fetch('/api/admin/tickets', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selected.id, status }),
      })
      const data = await res.json()

      if (data.success) {
        toast({ title: 'Berhasil', description: 'Status diperbarui' })
        setDetailOpen(false)
        fetchTickets()
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Gagal mengubah status', variant: 'destructive' })
    }
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
          <HeadphonesIcon className="h-8 w-8 text-orange-500" />
          Tiket Support
        </h1>
        <p className="text-gray-400 mt-1">Kelola tiket bantuan pelanggan</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'].map((status) => (
          <Card key={status} className="bg-gray-900 border-gray-800">
            <CardContent className="pt-4">
              <p className="text-gray-400 text-sm capitalize">{status.replace('_', ' ')}</p>
              <p className="text-2xl font-bold text-white">
                {tickets.filter(t => t.status === status).length}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Cari tiket..."
                className="pl-10 bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="waiting_customer">Waiting</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchTickets} className="bg-gradient-to-r from-red-600 via-orange-600 to-amber-600">
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
          ) : tickets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <HeadphonesIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Tidak ada tiket</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">No. Tiket</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Subject</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">User</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Priority</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Tanggal</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="py-4 px-4 font-mono text-sm text-gray-300">{ticket.ticket_number}</td>
                      <td className="py-4 px-4 text-white">{ticket.subject}</td>
                      <td className="py-4 px-4 text-gray-300">{ticket.user?.full_name || ticket.user?.email || 'Unknown'}</td>
                      <td className="py-4 px-4">
                        <Badge className={priorityColors[ticket.priority] || ''}>{ticket.priority}</Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={statusColors[ticket.status] || ''}>{ticket.status.replace('_', ' ')}</Badge>
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-sm">{formatDate(ticket.created_at)}</td>
                      <td className="py-4 px-4">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-white"
                          onClick={() => { setSelected(ticket); setDetailOpen(true) }}
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
        <DialogContent className="max-w-lg bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle className="text-white">{selected?.subject}</DialogTitle>
          </DialogHeader>
          
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={statusColors[selected.status]}>{selected.status.replace('_', ' ')}</Badge>
                <Badge className={priorityColors[selected.priority]}>{selected.priority}</Badge>
                <span className="text-gray-500 text-sm">{selected.ticket_number}</span>
              </div>

              <div className="p-3 rounded-lg bg-gray-800 border border-gray-700">
                <p className="text-gray-400 text-sm">Dari:</p>
                <p className="text-white">{selected.user?.full_name || selected.user?.email || 'Unknown'}</p>
              </div>

              <div>
                <p className="text-gray-400 text-sm mb-2">Balas:</p>
                <Textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Tulis balasan..."
                  className="bg-gray-800 border-gray-700 text-white"
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleReply} disabled={sending || !reply.trim()} className="flex-1 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Kirim Balasan
                </Button>
                {selected.status !== 'resolved' && (
                  <Button onClick={() => updateStatus('resolved')} variant="outline" className="border-green-600 text-green-500">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Selesai
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
