'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { 
  ClipboardList, Search, Eye, Loader2, ChevronLeft, ChevronRight, 
  CreditCard, DollarSign, Wallet, ArrowUpDown, CheckCircle, XCircle, 
  Clock, Ban, RefreshCw
} from 'lucide-react'

interface Transaction {
  id: string
  user_id: string
  type: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  payment_method: string
  reference_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
  user: {
    id: string
    full_name: string | null
    email: string
    avatar_url: string | null
  } | null
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

const statusConfig = {
  pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
  completed: { label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
  failed: { label: 'Failed', color: 'bg-red-500', icon: XCircle },
  cancelled: { label: 'Cancelled', color: 'bg-gray-500', icon: Ban },
}

const typeConfig: Record<string, { label: string; color: string }> = {
  token_purchase: { label: 'Token Purchase', color: 'text-blue-400' },
  token_spent: { label: 'Token Spent', color: 'text-orange-400' },
  withdrawal: { label: 'Withdrawal', color: 'text-red-400' },
  deposit: { label: 'Deposit', color: 'text-green-400' },
  refund: { label: 'Refund', color: 'text-purple-400' },
  payment: { label: 'Payment', color: 'text-cyan-400' },
}

const paymentMethodConfig: Record<string, { label: string; icon: typeof CreditCard }> = {
  bank_transfer: { label: 'Bank Transfer', icon: DollarSign },
  e_wallet: { label: 'E-Wallet', icon: Wallet },
  credit_card: { label: 'Credit Card', icon: CreditCard },
  token: { label: 'Token', icon: CreditCard },
  manual: { label: 'Manual', icon: DollarSign },
}

export default function AdminOrdersPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showDetail, setShowDetail] = useState(false)
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)
  const [newStatus, setNewStatus] = useState<string>('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [pagination.page, statusFilter, typeFilter])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })

      if (search) params.append('search', search)
      if (statusFilter) params.append('status', statusFilter)
      if (typeFilter) params.append('type', typeFilter)

      const res = await fetch(`/api/admin/orders?${params}`)
      const data = await res.json()

      if (data.success) {
        setTransactions(data.data || [])
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0,
        }))
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast({
        title: 'Error',
        description: 'Failed to load transaction data',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchTransactions()
  }

  const handleUpdateStatus = async () => {
    if (!selectedTransaction || !newStatus) return

    setSaving(true)
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedTransaction.id,
          status: newStatus,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast({
          title: 'Success',
          description: 'Transaction status updated successfully',
        })
        setShowStatusUpdate(false)
        setSelectedTransaction(null)
        fetchTransactions()
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

  const openStatusUpdate = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setNewStatus(transaction.status)
    setShowStatusUpdate(true)
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

  const getStatusBadge = (status: keyof typeof statusConfig) => {
    const config = statusConfig[status] || statusConfig.pending
    const Icon = config.icon
    return (
      <Badge className={`${config.color} text-white gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const config = typeConfig[type] || { label: type, color: 'text-gray-400' }
    return <span className={`font-medium ${config.color}`}>{config.label}</span>
  }

  const getPaymentMethodDisplay = (method: string) => {
    const config = paymentMethodConfig[method] || { label: method, icon: CreditCard }
    const Icon = config.icon
    return (
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-400" />
        <span>{config.label}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-orange-500" />
            Orders & Transactions
          </h1>
          <p className="text-gray-400 mt-1">Manage all orders and transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-orange-500/30 text-orange-400">
            {pagination.total} Total
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search by Order ID or Reference..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              />
              <Button 
                onClick={handleSearch} 
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="token_purchase">Token Purchase</SelectItem>
                <SelectItem value="token_spent">Token Spent</SelectItem>
                <SelectItem value="withdrawal">Withdrawal</SelectItem>
                <SelectItem value="deposit">Deposit</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800 hover:bg-gray-800/50">
                    <TableHead className="text-gray-400 font-medium">Order ID</TableHead>
                    <TableHead className="text-gray-400 font-medium">User</TableHead>
                    <TableHead className="text-gray-400 font-medium">Type</TableHead>
                    <TableHead className="text-gray-400 font-medium">Amount</TableHead>
                    <TableHead className="text-gray-400 font-medium">Status</TableHead>
                    <TableHead className="text-gray-400 font-medium">Payment Method</TableHead>
                    <TableHead className="text-gray-400 font-medium">Date</TableHead>
                    <TableHead className="text-right text-gray-400 font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow 
                      key={transaction.id} 
                      className="border-gray-800 hover:bg-gray-800/50 cursor-pointer"
                      onClick={() => {
                        setSelectedTransaction(transaction)
                        setShowDetail(true)
                      }}
                    >
                      <TableCell className="font-mono text-sm text-white">
                        {transaction.id.slice(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={transaction.user?.avatar_url || ''} />
                            <AvatarFallback className="bg-gradient-to-r from-orange-600 to-amber-600 text-white text-xs">
                              {transaction.user?.full_name?.[0]?.toUpperCase() || 
                               transaction.user?.email?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-white text-sm">
                              {transaction.user?.full_name || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {transaction.user?.email || 'No email'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                      <TableCell className="font-medium text-white">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="text-gray-300">
                        {getPaymentMethodDisplay(transaction.payment_method)}
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">
                        {formatDate(transaction.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedTransaction(transaction)
                              setShowDetail(true)
                            }}
                            className="text-gray-400 hover:text-white hover:bg-gray-800"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openStatusUpdate(transaction)}
                            className="text-gray-400 hover:text-orange-400 hover:bg-gray-800"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} transactions
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page === 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              className="border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-gray-400 px-4">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              className="border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-orange-500" />
              Transaction Details
            </DialogTitle>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedTransaction.user?.avatar_url || ''} />
                  <AvatarFallback className="bg-gradient-to-r from-orange-600 to-amber-600 text-white">
                    {selectedTransaction.user?.full_name?.[0]?.toUpperCase() || 
                     selectedTransaction.user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-white">
                    {selectedTransaction.user?.full_name || 'Unknown User'}
                  </p>
                  <p className="text-sm text-gray-400">{selectedTransaction.user?.email}</p>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">Order ID</span>
                  <span className="font-mono text-white text-sm">{selectedTransaction.id}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">Type</span>
                  {getTypeBadge(selectedTransaction.type)}
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">Amount</span>
                  <span className="font-bold text-white text-lg">
                    {formatCurrency(selectedTransaction.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">Status</span>
                  {getStatusBadge(selectedTransaction.status)}
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">Payment Method</span>
                  {getPaymentMethodDisplay(selectedTransaction.payment_method)}
                </div>
                {selectedTransaction.reference_id && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-800">
                    <span className="text-gray-400">Reference ID</span>
                    <span className="font-mono text-white text-sm">
                      {selectedTransaction.reference_id}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-gray-800">
                  <span className="text-gray-400">Created At</span>
                  <span className="text-white">{formatDate(selectedTransaction.created_at)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">Updated At</span>
                  <span className="text-white">{formatDate(selectedTransaction.updated_at)}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedTransaction.notes && (
                <div className="p-3 bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Notes</p>
                  <p className="text-white">{selectedTransaction.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDetail(false)}
              className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
            >
              Close
            </Button>
            {selectedTransaction && (
              <Button
                onClick={() => {
                  setShowDetail(false)
                  openStatusUpdate(selectedTransaction)
                }}
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Status
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Update Dialog */}
      <Dialog open={showStatusUpdate} onOpenChange={setShowStatusUpdate}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Update Transaction Status</DialogTitle>
            <DialogDescription className="text-gray-400">
              Change the status for order {selectedTransaction?.id.slice(0, 8)}...
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">New Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-500" />
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Completed
                    </div>
                  </SelectItem>
                  <SelectItem value="failed">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      Failed
                    </div>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <div className="flex items-center gap-2">
                      <Ban className="h-4 w-4 text-gray-500" />
                      Cancelled
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowStatusUpdate(false)
                setSelectedTransaction(null)
              }}
              className="border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={saving}
              className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
            >
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
