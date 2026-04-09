'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Coins, Sparkles, ArrowUp, Star, Check, ChevronRight, 
  CreditCard, Clock, TrendingUp, Gift, Info, AlertCircle,
  Copy, CheckCircle, Upload, X, Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

// Types
interface CreditPackage {
  id: string
  name: string
  description: string
  price: number
  credits: number
  bonus_credits: number
  total_credits: number
  is_for_dealer: boolean
  is_popular: boolean
}

interface BoostFeature {
  id: string
  name: string
  slug: string
  description: string
  credit_cost: number
  duration_days: number
  icon: string
  color: string
  benefits: string[]
}

interface UserCredit {
  id: string
  balance: number
  total_earned: number
  total_spent: number
}

interface Transaction {
  id: string
  type: string
  amount: number
  balance_before: number
  balance_after: number
  description: string
  created_at: string
}

interface Payment {
  id: string
  invoice_number: string
  amount: number
  credits_awarded: number
  va_number: string
  status: string
  proof_url?: string
  package?: CreditPackage
  created_at: string
  expires_at?: string
}

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Transaction type labels
const transactionLabels: Record<string, { label: string; color: string }> = {
  purchase: { label: 'Pembelian', color: 'text-green-600' },
  usage: { label: 'Penggunaan', color: 'text-red-600' },
  bonus: { label: 'Bonus', color: 'text-blue-600' },
  refund: { label: 'Pengembalian', color: 'text-purple-600' },
  registration_bonus: { label: 'Bonus Pendaftaran', color: 'text-amber-600' },
  admin_adjustment: { label: 'Penyesuaian Admin', color: 'text-gray-600' }
}

export default function CreditsPage() {
  const [packages, setPackages] = useState<CreditPackage[]>([])
  const [boostFeatures, setBoostFeatures] = useState<BoostFeature[]>([])
  const [credits, setCredits] = useState<UserCredit | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [isDealer, setIsDealer] = useState(false)
  
  // Payment modal state
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null)
  const [paymentDialog, setPaymentDialog] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'select' | 'payment' | 'upload'>('select')
  const [currentPayment, setCurrentPayment] = useState<Payment | null>(null)
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  
  // Bonus notification
  const [bonusReceived, setBonusReceived] = useState(0)
  const [showBonusDialog, setShowBonusDialog] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Check if user is dealer
      const userRes = await fetch('/api/auth/user')
      if (userRes.ok) {
        const userData = await userRes.json()
        setIsDealer(userData.isDealer || false)
      }
      
      // Fetch packages
      const packagesRes = await fetch(`/api/credits/packages?dealer=${isDealer}`)
      if (packagesRes.ok) {
        const data = await packagesRes.json()
        setPackages(data.packages)
      }
      
      // Fetch boost features
      const boostRes = await fetch('/api/boost-features')
      if (boostRes.ok) {
        const data = await boostRes.json()
        setBoostFeatures(data.features)
      }
      
      // Fetch credit balance
      const creditsRes = await fetch('/api/credits/balance')
      if (creditsRes.ok) {
        const data = await creditsRes.json()
        setCredits(data.credits)
        if (data.bonusReceived > 0) {
          setBonusReceived(data.bonusReceived)
          setShowBonusDialog(true)
        }
      }
      
      // Fetch transactions
      const transRes = await fetch('/api/credits/transactions?limit=10')
      if (transRes.ok) {
        const data = await transRes.json()
        setTransactions(data.transactions)
      }
      
      // Fetch payments
      const paymentsRes = await fetch('/api/credits/payments?limit=5')
      if (paymentsRes.ok) {
        const data = await paymentsRes.json()
        setPayments(data.payments)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (pkg: CreditPackage) => {
    setSelectedPackage(pkg)
    setPaymentStep('select')
    setPaymentDialog(true)
  }

  const createPayment = async () => {
    if (!selectedPackage) return
    
    try {
      const res = await fetch('/api/credits/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ package_id: selectedPackage.id })
      })
      
      if (res.ok) {
        const data = await res.json()
        setCurrentPayment(data.payment)
        setPaymentStep('payment')
      } else {
        const error = await res.json()
        toast.error(error.error || 'Gagal membuat pembayaran')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Disalin ke clipboard')
  }

  const handleProofUpload = async () => {
    if (!proofFile || !currentPayment) return
    
    setUploading(true)
    try {
      // Upload file
      const formData = new FormData()
      formData.append('file', proofFile)
      formData.append('type', 'payment_proof')
      
      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!uploadRes.ok) {
        throw new Error('Upload failed')
      }
      
      const uploadData = await uploadRes.json()
      
      // Update payment with proof
      const res = await fetch('/api/credits/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payment_id: currentPayment.id,
          action: 'upload_proof',
          proof_url: uploadData.url
        })
      })
      
      if (res.ok) {
        toast.success('Bukti pembayaran berhasil diunggah')
        setPaymentDialog(false)
        fetchData()
      } else {
        toast.error('Gagal mengunggah bukti')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan saat upload')
    } finally {
      setUploading(false)
    }
  }

  // Get icon for boost feature
  const getBoostIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      'Sparkles': <Sparkles className="h-5 w-5" />,
      'ArrowUp': <ArrowUp className="h-5 w-5" />,
      'Star': <Star className="h-5 w-5" />,
      'Zap': <Zap className="h-5 w-5" />
    }
    return icons[iconName] || <Sparkles className="h-5 w-5" />
  }

  // Get color class for boost
  const getBoostColorClass = (color: string) => {
    const colors: Record<string, string> = {
      amber: 'bg-amber-100 text-amber-600 border-amber-200',
      blue: 'bg-blue-100 text-blue-600 border-blue-200',
      purple: 'bg-purple-100 text-purple-600 border-purple-200'
    }
    return colors[color] || 'bg-gray-100 text-gray-600 border-gray-200'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Coins className="h-8 w-8" />
                Kredit AutoMarket
              </h1>
              <p className="text-white/80 mt-1">
                Beli kredit untuk pasang iklan dan boost visibility
              </p>
            </div>
            
            {/* Balance Card */}
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <p className="text-white/80 text-sm">Saldo Kredit</p>
                  <p className="text-4xl font-bold text-white flex items-center justify-center gap-2">
                    <Coins className="h-8 w-8" />
                    {credits?.balance || 0}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-white/60">
                    <span>Terpakai: {credits?.total_spent || 0}</span>
                    <span>Total: {credits?.total_earned || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <Tabs defaultValue="packages" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="packages">Beli Kredit</TabsTrigger>
            <TabsTrigger value="boost">Boost Iklan</TabsTrigger>
            <TabsTrigger value="history">Riwayat</TabsTrigger>
            <TabsTrigger value="payments">Pembayaran</TabsTrigger>
          </TabsList>

          {/* Credit Packages */}
          <TabsContent value="packages" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Pilih Paket Kredit</h2>
              <p className="text-muted-foreground">
                {isDealer ? 'Paket khusus Dealer dengan bonus lebih besar' : 'Paket kredit untuk kebutuhan Anda'}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {packages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={cn(
                    "relative overflow-hidden transition-all hover:shadow-lg",
                    pkg.is_popular && "border-primary ring-2 ring-primary/20"
                  )}>
                    {pkg.is_popular && (
                      <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1 rounded-bl-lg">
                        Populer
                      </div>
                    )}
                    <CardHeader className="text-center pb-2">
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                      <CardDescription>{pkg.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      <div className="text-3xl font-bold text-primary mb-2">
                        {formatCurrency(pkg.price)}
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-center gap-1">
                          <Coins className="h-4 w-4 text-amber-500" />
                          <span className="font-semibold">{pkg.credits} Kredit</span>
                        </div>
                        {pkg.bonus_credits > 0 && (
                          <div className="flex items-center justify-center gap-1 text-green-600">
                            <Gift className="h-4 w-4" />
                            <span>+{pkg.bonus_credits} Bonus</span>
                          </div>
                        )}
                        <Badge variant="secondary" className="mt-2">
                          Total: {pkg.total_credits} Kredit
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={() => handlePurchase(pkg)}
                        variant={pkg.is_popular ? "default" : "outline"}
                      >
                        Beli Sekarang
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
            
            {/* FAQ Section */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  FAQ Kredit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">Apa itu Kredit AutoMarket?</p>
                  <p className="text-muted-foreground text-sm">
                    Kredit digunakan untuk pasang iklan dan boost visibility kendaraan Anda. 
                    1 Kredit = 1 Iklan selama 30 hari.
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="font-medium">Apakah kredit bisa kadaluarsa?</p>
                  <p className="text-muted-foreground text-sm">
                    Tidak! Kredit Anda tidak akan kadaluarsa dan bisa digunakan kapan saja.
                  </p>
                </div>
                <Separator />
                <div>
                  <p className="font-medium">Bagaimana cara pembayaran?</p>
                  <p className="text-muted-foreground text-sm">
                    Pembayaran dilakukan via Transfer Bank BNI Virtual Account. 
                    Setelah transfer, admin akan verifikasi dan kredit masuk ke saldo Anda.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Boost Features */}
          <TabsContent value="boost" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Boost Iklan Anda</h2>
              <p className="text-muted-foreground">
                Tingkatkan visibilitas iklan dengan fitur boost
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {boostFeatures.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden h-full">
                    <CardHeader className={cn("p-4", getBoostColorClass(feature.color))}>
                      <div className="flex items-center gap-3">
                        {getBoostIcon(feature.icon)}
                        <div>
                          <CardTitle className="text-lg">{feature.name}</CardTitle>
                          <CardDescription className="text-inherit opacity-80">
                            {feature.duration_days} hari
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                      <ul className="space-y-1">
                        {feature.benefits.map((benefit, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Coins className="h-5 w-5 text-amber-500" />
                        <span className="font-bold text-lg">{feature.credit_cost}</span>
                        <span className="text-muted-foreground text-sm">kredit</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Pilih
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          {/* Transaction History */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Riwayat Transaksi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Belum ada transaksi
                  </div>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {transactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center",
                              tx.amount > 0 ? "bg-green-100" : "bg-red-100"
                            )}>
                              {tx.amount > 0 ? (
                                <TrendingUp className="h-5 w-5 text-green-600" />
                              ) : (
                                <TrendingUp className="h-5 w-5 text-red-600 rotate-180" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{tx.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatDate(tx.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={cn(
                              "font-bold",
                              tx.amount > 0 ? "text-green-600" : "text-red-600"
                            )}>
                              {tx.amount > 0 ? '+' : ''}{tx.amount}
                            </p>
                            <Badge variant="outline" className={transactionLabels[tx.type]?.color}>
                              {transactionLabels[tx.type]?.label || tx.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Belum ada pembayaran
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div>
                          <p className="font-medium">{payment.invoice_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {payment.package?.name} • {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(payment.created_at)}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            payment.status === 'verified' ? 'default' :
                            payment.status === 'paid' ? 'secondary' :
                            payment.status === 'pending' ? 'outline' : 'destructive'
                          }>
                            {payment.status === 'pending' && 'Menunggu'}
                            {payment.status === 'paid' && 'Sudah Bayar'}
                            {payment.status === 'verified' && 'Terverifikasi'}
                            {payment.status === 'cancelled' && 'Dibatalkan'}
                          </Badge>
                          {payment.credits_awarded && (
                            <p className="text-sm text-green-600 mt-1">
                              +{payment.credits_awarded} kredit
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {paymentStep === 'select' && 'Konfirmasi Pembelian'}
              {paymentStep === 'payment' && 'Instruksi Pembayaran'}
              {paymentStep === 'upload' && 'Upload Bukti Pembayaran'}
            </DialogTitle>
            <DialogDescription>
              {paymentStep === 'select' && 'Periksa detail paket Anda'}
              {paymentStep === 'payment' && 'Transfer ke Virtual Account berikut'}
              {paymentStep === 'upload' && 'Upload bukti transfer untuk verifikasi'}
            </DialogDescription>
          </DialogHeader>
          
          <AnimatePresence mode="wait">
            {paymentStep === 'select' && selectedPackage && (
              <motion.div
                key="select"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="p-4 rounded-lg bg-muted">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{selectedPackage.name}</span>
                    <Badge>{selectedPackage.total_credits} Kredit</Badge>
                  </div>
                  <Separator className="my-3" />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Harga</span>
                      <span>{formatCurrency(selectedPackage.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kredit</span>
                      <span>{selectedPackage.credits}</span>
                    </div>
                    {selectedPackage.bonus_credits > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Bonus</span>
                        <span>+{selectedPackage.bonus_credits}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total Kredit</span>
                      <span>{selectedPackage.total_credits}</span>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full" onClick={createPayment}>
                  Lanjutkan ke Pembayaran
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}
            
            {paymentStep === 'payment' && currentPayment && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Penting!</AlertTitle>
                  <AlertDescription>
                    Transfer sesuai nominal exact untuk verifikasi otomatis
                  </AlertDescription>
                </Alert>
                
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <p className="text-sm text-blue-800 mb-2">Bank BNI Virtual Account</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-mono font-bold text-blue-900">
                      {currentPayment.va_number}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(currentPayment.va_number)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-muted">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Jumlah Transfer</span>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(currentPayment.amount)}
                    </span>
                  </div>
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  <p>a.n. AUTOMARKET INDONESIA</p>
                  {currentPayment.expires_at && (
                    <p className="mt-1">
                      Berlaku hingga: {formatDate(currentPayment.expires_at)}
                    </p>
                  )}
                </div>
                
                <Button
                  className="w-full"
                  onClick={() => setPaymentStep('upload')}
                >
                  Saya Sudah Transfer
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}
            
            {paymentStep === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="proof-upload"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  />
                  <label htmlFor="proof-upload" className="cursor-pointer">
                    {proofFile ? (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span>{proofFile.name}</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Klik untuk upload bukti transfer
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG hingga 5MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setPaymentStep('payment')}
                  >
                    Kembali
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={!proofFile || uploading}
                    onClick={handleProofUpload}
                  >
                    {uploading ? 'Mengupload...' : 'Upload Bukti'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Bonus Dialog */}
      <Dialog open={showBonusDialog} onOpenChange={setShowBonusDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">🎉 Selamat!</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
            >
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <Gift className="h-10 w-10 text-amber-600" />
              </div>
            </motion.div>
            <h3 className="text-xl font-bold mb-2">Bonus Pendaftaran!</h3>
            <p className="text-muted-foreground mb-4">
              Anda mendapat <span className="font-bold text-primary">{bonusReceived} Kredit</span> gratis sebagai pendaftar awal AutoMarket!
            </p>
            <p className="text-sm text-muted-foreground">
              Gunakan kredit untuk pasang iklan kendaraan Anda
            </p>
          </div>
          <Button onClick={() => setShowBonusDialog(false)}>
            Mulai Berjualan
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
