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
  CreditCard,
  Gift,
  History,
} from 'lucide-react'

// Token packages
const tokenPackages = [
  { id: 1, tokens: 50, price: 50000, bonus: 0, popular: false },
  { id: 2, tokens: 100, price: 95000, bonus: 5, popular: true },
  { id: 3, tokens: 250, price: 225000, bonus: 15, popular: false },
  { id: 4, tokens: 500, price: 425000, bonus: 50, popular: false },
  { id: 5, tokens: 1000, price: 800000, bonus: 150, popular: false },
]

// Token usage costs
const tokenUsage = [
  { feature: 'AI Prediction', cost: 5, icon: Sparkles, description: 'Prediksi harga mobil dengan AI', free: false },
  { feature: 'Pasang Iklan Normal', cost: 10, icon: Car, description: 'Public Marketplace, 30 hari', free: false },
  { feature: 'Jual ke Dealer', cost: 20, icon: Zap, description: 'Dealer Marketplace, 7 hari', free: false },
  { feature: 'Dealer Kontak Penjual', cost: 5, icon: MessageSquare, description: 'Akses kontak di Dealer Marketplace', free: false },
  { feature: 'Chat Public Marketplace', cost: 0, icon: MessageSquare, description: 'Unlimited chat dengan pembeli', free: true },
  { feature: 'Inspeksi 160 Titik', cost: 0, icon: Shield, description: 'Wajib untuk prediksi akurat', free: true },
  { feature: 'Auto-move Dealer→Public', cost: 0, icon: TrendingUp, description: 'Gratis setelah expired', free: true },
]

interface TokenTransaction {
  id: string
  type: 'purchase' | 'usage' | 'bonus'
  amount: number
  balance_after: number
  description: string
  created_at: string
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
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

export default function TokensPage() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'balance'
  
  const { user } = useAuth()
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState<TokenTransaction[]>([])
  const [selectedPackage, setSelectedPackage] = useState<typeof tokenPackages[0] | null>(null)
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
        if (transData.success) {
          setTransactions(transData.transactions || [])
        }
      } catch (error) {
        console.error('Error fetching token data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handlePurchase = async () => {
    if (!selectedPackage) return
    
    setPurchasing(true)
    try {
      const res = await fetch('/api/token-purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId: selectedPackage.id }),
      })
      const data = await res.json()
      
      if (data.success) {
        setBalance(data.newBalance)
        setTransactions(prev => [data.transaction, ...prev])
        setSelectedPackage(null)
      }
    } catch (error) {
      console.error('Purchase error:', error)
    } finally {
      setPurchasing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold">Token Saya</h1>
        <p className="text-muted-foreground">Kelola token Anda untuk berbagai fitur AutoMarket</p>
      </div>

      {/* Balance Card */}
      <Card className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/30 dark:via-orange-950/30 dark:to-yellow-950/30 border-amber-200 dark:border-amber-800 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-200/30 to-orange-200/30 dark:from-amber-800/20 dark:to-orange-800/20 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-yellow-200/30 to-amber-200/30 dark:from-yellow-800/20 dark:to-amber-800/20 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <CardContent className="p-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl">
                <Coins className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">Saldo Token Anda</p>
                {loading ? (
                  <Skeleton className="h-10 w-32" />
                ) : (
                  <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">{balance.toLocaleString()}</p>
                )}
                <p className="text-sm text-muted-foreground">≈ Rp {(balance * 1000).toLocaleString('id-ID')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" onClick={() => setSelectedPackage(tokenPackages[1])}>
                <Plus className="h-4 w-4 mr-2" />
                Beli Token
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="balance">Beli Token</TabsTrigger>
          <TabsTrigger value="usage">Penggunaan</TabsTrigger>
          <TabsTrigger value="history">Riwayat</TabsTrigger>
        </TabsList>

        {/* Buy Tokens Tab */}
        <TabsContent value="balance" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {tokenPackages.map((pkg) => (
              <Card 
                key={pkg.id} 
                className={`relative cursor-pointer transition-all hover:shadow-lg ${
                  selectedPackage?.id === pkg.id ? 'ring-2 ring-primary' : ''
                } ${pkg.popular ? 'border-primary' : ''}`}
                onClick={() => setSelectedPackage(pkg)}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary to-primary/80">Populer</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto h-12 w-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-2">
                    <Coins className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl">{pkg.tokens.toLocaleString()}</CardTitle>
                  <CardDescription>Token</CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-xl font-bold">{formatCurrency(pkg.price)}</p>
                  {pkg.bonus > 0 && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                      +{pkg.bonus} bonus!
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Rp {(pkg.price / pkg.tokens).toFixed(0)}/token
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Payment Info */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Metode Pembayaran</p>
                  <p className="text-sm text-muted-foreground">
                    Transfer Bank, E-Wallet (GoPay, OVO, Dana), Kartu Kredit/Debit
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Paid Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fitur Berbayar</CardTitle>
                <CardDescription>Biaya token untuk setiap fitur</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {tokenUsage.filter(u => !u.free).map((item) => (
                  <div key={item.feature} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium">{item.feature}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      {item.cost} Token
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Free Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gift className="h-5 w-5 text-emerald-500" />
                  Fitur GRATIS
                </CardTitle>
                <CardDescription>Tidak membutuhkan token</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {tokenUsage.filter(u => u.free).map((item) => (
                  <div key={item.feature} className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                        <item.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="font-medium">{item.feature}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      GRATIS
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-5 w-5" />
                Riwayat Transaksi
              </CardTitle>
              <CardDescription>Semua transaksi token Anda</CardDescription>
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
                  <p className="text-sm">Beli token untuk mulai bertransaksi</p>
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
              Anda akan membeli paket token berikut
            </DialogDescription>
          </DialogHeader>
          
          {selectedPackage && (
            <div className="py-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
                <div>
                  <p className="font-medium">{selectedPackage.tokens.toLocaleString()} Token</p>
                  {selectedPackage.bonus > 0 && (
                    <p className="text-sm text-emerald-600">+{selectedPackage.bonus} bonus</p>
                  )}
                </div>
                <p className="text-xl font-bold">{formatCurrency(selectedPackage.price)}</p>
              </div>
              
              <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-sm">
                <p className="font-medium text-amber-800 dark:text-amber-200">Total Token: {(selectedPackage.tokens + selectedPackage.bonus).toLocaleString()}</p>
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
