'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CreditPaymentSchedule } from '@/components/credit/CreditPaymentSchedule'
import { useAuth } from '@/hooks/useAuth'
import {
  Coins,
  Plus,
  Check,
  Sparkles,
  Car,
  MessageSquare,
  Zap,
  Shield,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Gift,
  History,
  CreditCard,
  Calendar,
  ChevronRight,
  AlertCircle,
} from 'lucide-react'

// Credit packages (tanpa harga Rp - market strategy)
const creditPackages = [
  { id: 1, credits: 50, bonus: 0, popular: false },
  { id: 2, credits: 100, bonus: 10, popular: true },
  { id: 3, credits: 250, bonus: 30, popular: false },
  { id: 4, credits: 500, bonus: 75, popular: false },
  { id: 5, credits: 1000, bonus: 200, popular: false },
]

// Credit usage costs
const creditUsage = [
  { feature: 'Pasang Iklan Umum', cost: 3, icon: Car, description: 'Public Marketplace, 30 hari' },
  { feature: 'Dealer Marketplace', cost: 5, icon: Zap, description: 'Khusus dealer, 7 hari' },
  { feature: 'Chat Platform', cost: 4, icon: MessageSquare, description: 'Chat dengan penjual' },
  { feature: 'Inspeksi 160 Titik', cost: 10, icon: Shield, description: 'Inspeksi lengkap' },
  { feature: 'Featured 7 Hari', cost: 5, icon: TrendingUp, description: 'Iklan ditayangkan' },
  { feature: 'AI Prediction', cost: 0, icon: Sparkles, description: 'Prediksi harga - GRATIS', free: true },
]

interface CreditTransaction {
  id: string
  type: 'purchase' | 'usage' | 'bonus'
  amount: number
  balance_after: number
  description: string
  created_at: string
}

interface CreditApplication {
  id: string
  application_number: string
  vehicle_price: number
  down_payment: number
  loan_amount: number
  tenor_months: number
  monthly_installment: number
  interest_rate: number
  total_payment: number
  status: string
  financing_partner: string
  created_at: string
  payments: CreditPayment[]
}

interface CreditPayment {
  id: string
  payment_number: number
  amount_due: number
  due_date: string
  status: string
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDateShort(dateString: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString))
}

export default function CreditsPage() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'balance'
  
  const { user } = useAuth()
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [selectedPackage, setSelectedPackage] = useState<typeof creditPackages[0] | null>(null)
  const [purchasing, setPurchasing] = useState(false)
  const [creditApplications, setCreditApplications] = useState<CreditApplication[]>([])
  const [loadingCredit, setLoadingCredit] = useState(false)
  const [selectedCreditId, setSelectedCreditId] = useState<string | null>(null)

  const fetchCreditApplications = useCallback(async () => {
    if (!user) return
    setLoadingCredit(true)
    try {
      const res = await fetch('/api/credit/apply')
      const data = await res.json()
      if (data.success && data.data?.applications) {
        setCreditApplications(data.data.applications)
      }
    } catch (error) {
      console.error('Error fetching credit applications:', error)
    } finally {
      setLoadingCredit(false)
    }
  }, [user])

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch balance
        const balanceRes = await fetch('/api/user-tokens')
        const balanceData = await balanceRes.json()
        if (balanceData.success) {
          setBalance(balanceData.balance || 0)
        }

        // Fetch transactions
        const transRes = await fetch('/api/token-transactions')
        const transData = await transRes.json()
        setTransactions(transData.transactions || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchData()
      fetchCreditApplications()
    }
  }, [user, fetchCreditApplications])

  const handlePurchase = async () => {
    if (!selectedPackage) return
    
    setPurchasing(true)
    try {
      const res = await fetch('/api/token-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageId: selectedPackage.id,
          credits: selectedPackage.credits,
          bonus: selectedPackage.bonus,
        }),
      })
      
      const data = await res.json()
      if (data.success) {
        setBalance(data.newBalance)
        setSelectedPackage(null)
        // Refetch transactions
        const transRes = await fetch('/api/token-transactions')
        const transData = await transRes.json()
        setTransactions(transData.transactions || [])
      } else {
        alert(data.error || 'Gagal memproses pembelian')
      }
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Terjadi kesalahan')
    } finally {
      setPurchasing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Coins className="h-6 w-6 text-amber-500" />
            Credit Saya
          </h1>
          <p className="text-muted-foreground">
            Kelola credit untuk menggunakan fitur platform
          </p>
        </div>
      </div>

      <Tabs defaultValue={defaultTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="balance">Saldo</TabsTrigger>
          <TabsTrigger value="buy">Beli Credit</TabsTrigger>
          <TabsTrigger value="history">Riwayat</TabsTrigger>
          <TabsTrigger value="kredit" className="gap-1">
            <CreditCard className="h-3.5 w-3.5" />
            Kredit Aktif
          </TabsTrigger>
        </TabsList>

        {/* Balance Tab */}
        <TabsContent value="balance" className="space-y-6 mt-4">
          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-yellow-950/30 border-amber-200 dark:border-amber-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-700 dark:text-amber-300 font-medium mb-1">Saldo Credit</p>
                  {loading ? (
                    <Skeleton className="h-10 w-24" />
                  ) : (
                    <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                      {balance.toLocaleString()}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">credit tersedia</p>
                </div>
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <Coins className="h-8 w-8 text-white" />
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <Link href="/dashboard/credits?tab=buy" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Beli Credit
                  </Button>
                </Link>
                <Link href="/dashboard/credits?tab=history">
                  <Button variant="outline" className="border-amber-300 text-amber-700">
                    <History className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Usage Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Penggunaan Credit
              </CardTitle>
              <CardDescription>Biaya credit untuk setiap fitur</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {creditUsage.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="font-medium">{item.feature}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    {item.free ? (
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        GRATIS
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 dark:text-amber-400">
                        {item.cost} credit
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Buy Tab */}
        <TabsContent value="buy" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Plus className="h-5 w-5 text-amber-500" />
                Pilih Paket Credit
              </CardTitle>
              <CardDescription>Pilih paket yang sesuai kebutuhan Anda</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {creditPackages.map((pkg) => (
                  <Card 
                    key={pkg.id}
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      pkg.popular ? 'border-amber-500 ring-2 ring-amber-500/20' : ''
                    }`}
                    onClick={() => setSelectedPackage(pkg)}
                  >
                    <CardContent className="p-4 text-center">
                      {pkg.popular && (
                        <Badge className="mb-2 bg-amber-500">Populer</Badge>
                      )}
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mx-auto mb-3">
                        <Coins className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-2xl font-bold">{pkg.credits.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">credit</p>
                      {pkg.bonus > 0 && (
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2">
                          +{pkg.bonus} bonus
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Total: {(pkg.credits + pkg.bonus).toLocaleString()} credit
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* New User Bonus Info */}
          <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Gift className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-emerald-800 dark:text-emerald-200">Bonus User Baru</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  Daftar sekarang dan dapatkan 500 credit gratis!
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                Riwayat Transaksi
              </CardTitle>
              <CardDescription>Semua transaksi credit Anda</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((trans) => (
                    <div key={trans.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          trans.type === 'purchase' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          trans.type === 'bonus' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' :
                          'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {trans.type === 'purchase' ? <ArrowUpRight className="h-5 w-5" /> :
                           trans.type === 'bonus' ? <Gift className="h-5 w-5" /> :
                           <ArrowDownRight className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium">{trans.description}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(trans.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${trans.amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                          {trans.amount > 0 ? '+' : ''}{trans.amount}
                        </p>
                        <p className="text-xs text-muted-foreground">Saldo: {trans.balance_after}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Belum ada transaksi</p>
                  <p className="text-sm">Beli credit untuk mulai bertransaksi</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Kredit Aktif Tab */}
        <TabsContent value="kredit" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-500" />
                Kredit Aktif
              </CardTitle>
              <CardDescription>Pengajuan kredit dan cicilan kendaraan Anda</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCredit ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-28 w-full" />
                  ))}
                </div>
              ) : creditApplications.length > 0 ? (
                <div className="space-y-3">
                  {creditApplications.map((app) => {
                    const paidCount = app.payments?.filter((p) => p.status === 'paid').length || 0
                    const upcomingPayment = app.payments?.find((p) => p.status === 'upcoming' || p.status === 'overdue')
                    const isActive = !['completed', 'defaulted', 'rejected'].includes(app.status)

                    const statusConfig: Record<string, { label: string; color: string }> = {
                      submitted: { label: 'Menunggu Review', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
                      approved: { label: 'Disetujui', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
                      disbursed: { label: 'Danai', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
                      rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
                      completed: { label: 'Selesai', color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400' },
                      defaulted: { label: 'Gagal Bayar', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
                    }
                    const statusInfo = statusConfig[app.status] || statusConfig.submitted

                    return (
                      <div
                        key={app.id}
                        className={`p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer ${
                          isActive ? 'border-emerald-200 bg-gradient-to-r from-emerald-50/50 to-transparent dark:border-emerald-800 dark:from-emerald-950/20' : 'border-gray-200 dark:border-gray-700'
                        }`}
                        onClick={() => setSelectedCreditId(app.id)}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-sm truncate">
                                {app.application_number}
                              </p>
                              <Badge className={`${statusInfo.color} text-[10px]`}>
                                {statusInfo.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Pinjaman {formatCurrency(app.loan_amount)} &middot; {app.tenor_months} bulan
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </div>

                        <div className="mt-3 grid grid-cols-3 gap-2">
                          <div className="text-center p-2 rounded-lg bg-white/60 dark:bg-gray-800/40">
                            <p className="text-xs text-muted-foreground">Cicilan/Bulan</p>
                            <p className="text-sm font-bold text-emerald-600">{formatCurrency(app.monthly_installment)}</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-white/60 dark:bg-gray-800/40">
                            <p className="text-xs text-muted-foreground">Terbayar</p>
                            <p className="text-sm font-bold">{paidCount}/{app.tenor_months}</p>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-white/60 dark:bg-gray-800/40">
                            <p className="text-xs text-muted-foreground">Jatuh Tempo</p>
                            <p className="text-sm font-bold text-amber-600">
                              {upcomingPayment ? formatDateShort(upcomingPayment.due_date) : '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <CreditCard className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Belum ada kredit aktif</p>
                  <p className="text-sm">Ajukan kredit saat melihat listing kendaraan</p>
                  <Link href="/marketplace">
                    <Button variant="outline" className="mt-4 border-emerald-200 text-emerald-700">
                      <Car className="h-4 w-4 mr-2" />
                      Cari Kendaraan
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Purchase Dialog */}
      <Dialog open={!!selectedPackage} onOpenChange={() => setSelectedPackage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Pembelian</DialogTitle>
            <DialogDescription>
              Anda akan membeli paket credit berikut
            </DialogDescription>
          </DialogHeader>
          
          {selectedPackage && (
            <div className="py-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div>
                  <p className="font-medium">{selectedPackage.credits.toLocaleString()} Credit</p>
                  {selectedPackage.bonus > 0 && (
                    <p className="text-sm text-emerald-600">+{selectedPackage.bonus} bonus</p>
                  )}
                </div>
              </div>
              
              <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200">
                  Total Credit: {(selectedPackage.credits + selectedPackage.bonus).toLocaleString()}
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPackage(null)}>Batal</Button>
            <Button onClick={handlePurchase} disabled={purchasing}>
              {purchasing ? 'Memproses...' : 'Beli Sekarang'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Credit Detail Dialog */}
      <Dialog open={!!selectedCreditId} onOpenChange={() => setSelectedCreditId(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-emerald-600" />
              Detail Kredit
            </DialogTitle>
            <DialogDescription>
              Jadwal pembayaran dan status cicilan Anda
            </DialogDescription>
          </DialogHeader>
          {selectedCreditId && (
            <CreditPaymentSchedule creditApplicationId={selectedCreditId} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
