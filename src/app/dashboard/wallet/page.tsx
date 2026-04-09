'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Coins,
  CreditCard,
  Download,
  Filter,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Plus,
  Send,
} from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

interface WalletData {
  balance: number
  totalEarned: number
  totalSpent: number
}

interface Transaction {
  id: string
  type: 'credit' | 'debit'
  transactionType: string
  amount: number
  description: string
  balanceBefore: number
  balanceAfter: number
  createdAt: string
  referenceId?: string
  referenceType?: string
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function WalletPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<'all' | 'credit' | 'debit'>('all')

  useEffect(() => {
    async function fetchWalletData() {
      try {
        setLoading(true)
        const res = await fetch('/api/wallet/transactions?limit=20')
        if (res.ok) {
          const data = await res.json()
          setWallet({
            balance: data.balance || 0,
            totalEarned: 0,
            totalSpent: 0,
          })
          setTransactions(data.transactions || [])
        }
      } catch (error) {
        console.error('Error fetching wallet data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchWalletData()
    }
  }, [user])

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true
    return tx.type === filter
  })

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      purchase: 'Pembelian Token',
      usage: 'Penggunaan',
      bonus: 'Bonus',
      refund: 'Pengembalian',
      registration_bonus: 'Bonus Registrasi',
      admin_adjustment: 'Penyesuaian Admin',
    }
    return labels[type] || type
  }

  const getTypeIcon = (type: string) => {
    if (type === 'credit') return ArrowDownCircle
    return ArrowUpCircle
  }

  return (
    <DashboardLayout title="Wallet" description="Kelola saldo dan transaksi Anda">
      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total Saldo</p>
              {loading ? (
                <Skeleton className="h-12 w-48 bg-white/20" />
              ) : (
                <p className="text-4xl font-bold">
                  {formatCurrency(wallet?.balance || 0)}
                </p>
              )}
              <p className="text-blue-100 text-sm mt-2">Indonesian Rupiah (IDR)</p>
            </div>
            <div className="h-16 w-16 rounded-2xl bg-white/20 flex items-center justify-center">
              <Wallet className="h-8 w-8" />
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button 
              variant="secondary" 
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={() => router.push('/dashboard/tokens')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Top Up
            </Button>
            <Button 
              variant="secondary" 
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Send className="mr-2 h-4 w-4" />
              Transfer
            </Button>
            <Button 
              variant="secondary" 
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <Download className="mr-2 h-4 w-4" />
              Tarik
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                <ArrowDownRight className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Masuk</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(wallet?.totalEarned || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Keluar</p>
                <p className="text-xl font-bold text-red-600">
                  {formatCurrency(wallet?.totalSpent || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Coins className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Token Balance</p>
                <p className="text-xl font-bold">
                  <Button variant="link" className="p-0 h-auto" onClick={() => router.push('/dashboard/tokens')}>
                    Lihat Token <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Riwayat Transaksi</CardTitle>
              <CardDescription>Semua transaksi wallet Anda</CardDescription>
            </div>
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
              <TabsList>
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value="credit">Masuk</TabsTrigger>
                <TabsTrigger value="debit">Keluar</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Belum ada transaksi</p>
              <p className="text-sm mt-1">Transaksi Anda akan muncul di sini</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTransactions.map((tx) => {
                const Icon = getTypeIcon(tx.type)
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        tx.type === 'credit' ? 'bg-green-500/10' : 'bg-red-500/10'
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium">{getTypeLabel(tx.transactionType)}</p>
                        <p className="text-sm text-muted-foreground">
                          {tx.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {tx.createdAt ? format(new Date(tx.createdAt), 'dd MMM yyyy, HH:mm', { locale: idLocale }) : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Saldo: {formatCurrency(tx.balanceAfter)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  )
}
