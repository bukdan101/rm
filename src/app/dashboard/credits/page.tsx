'use client'

import { useState, useEffect } from 'react'
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

export default function CreditsPage() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'balance'
  
  const { user } = useAuth()
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<CreditTransaction[]>([])
  const [selectedPackage, setSelectedPackage] = useState<typeof creditPackages[0] | null>(null)
  const [purchasing, setPurchasing] = useState(false)

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
    }
  }, [user])

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="balance">Saldo</TabsTrigger>
          <TabsTrigger value="buy">Beli Credit</TabsTrigger>
          <TabsTrigger value="history">Riwayat</TabsTrigger>
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
    </div>
  )
}
