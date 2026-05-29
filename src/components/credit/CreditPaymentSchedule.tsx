'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  CreditCard,
  Banknote,
  TrendingDown,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { AstraPayPaymentModal } from './AstraPayPaymentModal'

// ===== Helpers =====
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateString))
}

// ===== Types =====
interface CreditPaymentScheduleProps {
  creditApplicationId: string
}

interface PaymentItem {
  id: string
  payment_number: number
  amount_due: number
  principal_amount: number
  interest_amount: number
  due_date: string
  status: 'upcoming' | 'paid' | 'overdue' | 'partial'
  amount_paid?: number
  paid_at?: string
  late_fee?: number
  astrapay_trx_id?: string
  payment_method?: string
}

interface ApplicationData {
  id: string
  application_number: string
  vehicle_price: number
  down_payment: number
  loan_amount: number
  interest_rate: number
  tenor_months: number
  monthly_installment: number
  total_payment: number
  status: string
  financing_partner: string
  payments: PaymentItem[]
  created_at: string
}

interface SummaryData {
  totalPayments: number
  paidCount: number
  upcomingCount: number
  overdueCount: number
  totalPaid: number
  remainingBalance: number
  nextPaymentDue: {
    paymentNumber: number
    amount: number
    dueDate: string
  } | null
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle; bgClass: string }> = {
  paid: { label: 'Lunas', color: 'text-emerald-600', icon: CheckCircle, bgClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  upcoming: { label: 'Akan Jatuh Tempo', color: 'text-blue-600', icon: Clock, bgClass: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  overdue: { label: 'Terlambat', color: 'text-red-600', icon: AlertCircle, bgClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  partial: { label: 'Sebagian', color: 'text-amber-600', icon: Clock, bgClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
}

export function CreditPaymentSchedule({ creditApplicationId }: CreditPaymentScheduleProps) {
  const [application, setApplication] = useState<ApplicationData | null>(null)
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedPayment, setExpandedPayment] = useState<number | null>(null)

  // AstraPay payment modal state
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState<string>('')
  const [merchantTrxId, setMerchantTrxId] = useState<string>('')
  const [payingPaymentNumber, setPayingPaymentNumber] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/credit/${creditApplicationId}`)
      const data = await res.json()
      if (data.success && data.data) {
        setApplication(data.data.application)
        setSummary(data.data.summary)
      } else {
        toast.error(data.error || 'Gagal memuat jadwal pembayaran')
      }
    } catch {
      toast.error('Gagal menghubungi server')
    } finally {
      setLoading(false)
    }
  }, [creditApplicationId])

  useEffect(() => {
    if (creditApplicationId) {
      fetchData()
    }
  }, [creditApplicationId, fetchData])

  const handlePay = useCallback(async (paymentNumber: number) => {
    setPayingPaymentNumber(paymentNumber)
    try {
      const res = await fetch('/api/credit/pay-monthly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creditApplicationId,
          paymentNumber,
          paymentMethod: 'push_to_payment',
        }),
      })

      const data = await res.json()
      if (data.success && data.data?.payment) {
        const p = data.data.payment
        if (p.urlRedirect) {
          setPaymentUrl(p.urlRedirect)
          setMerchantTrxId(p.merchantTrxId)
          setPaymentModalOpen(true)
        } else {
          toast.success('Pembayaran sedang diproses')
          fetchData()
        }
      } else {
        toast.error(data.error || 'Gagal memproses pembayaran')
      }
    } catch {
      toast.error('Gagal menghubungi server')
    } finally {
      setPayingPaymentNumber(null)
    }
  }, [creditApplicationId, fetchData])

  const handlePaymentComplete = useCallback(() => {
    setPaymentModalOpen(false)
    setPaymentUrl('')
    setMerchantTrxId('')
    fetchData()
    toast.success('Status pembayaran diperbarui')
  }, [fetchData])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!application || !summary) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Data pembayaran tidak ditemukan</p>
        </CardContent>
      </Card>
    )
  }

  const progressPercent = summary.totalPayments > 0
    ? Math.round((summary.paidCount / summary.totalPayments) * 100)
    : 0

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-100 dark:border-emerald-900">
          <CardContent className="p-3 sm:p-4 text-center">
            <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
            <p className="text-lg sm:text-xl font-bold text-emerald-700 dark:text-emerald-400">{summary.paidCount}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Terbayar</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/20 border-blue-100 dark:border-blue-900">
          <CardContent className="p-3 sm:p-4 text-center">
            <Clock className="h-5 w-5 text-blue-500 mx-auto mb-1" />
            <p className="text-lg sm:text-xl font-bold text-blue-700 dark:text-blue-400">{summary.upcomingCount}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Akan Jatuh Tempo</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-950/30 dark:to-red-900/20 border-red-100 dark:border-red-900">
          <CardContent className="p-3 sm:p-4 text-center">
            <AlertCircle className="h-5 w-5 text-red-500 mx-auto mb-1" />
            <p className="text-lg sm:text-xl font-bold text-red-700 dark:text-red-400">{summary.overdueCount}</p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Terlambat</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/20 border-amber-100 dark:border-amber-900">
          <CardContent className="p-3 sm:p-4 text-center">
            <TrendingDown className="h-5 w-5 text-amber-500 mx-auto mb-1" />
            <p className="text-lg sm:text-xl font-bold text-amber-700 dark:text-amber-400">
              {formatCurrency(summary.remainingBalance).replace('Rp', '').trim()}
            </p>
            <p className="text-[10px] sm:text-xs text-muted-foreground">Sisa (jt)</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progres Pembayaran</span>
            <span className="text-sm font-bold text-emerald-600">{progressPercent}%</span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{summary.paidCount} terbayar</span>
            <span>{summary.totalPayments - summary.paidCount} tersisa</span>
          </div>
        </CardContent>
      </Card>

      {/* Next Payment */}
      {summary.nextPaymentDue && (
        <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 dark:border-emerald-900">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Pembayaran Berikutnya</p>
                <p className="text-lg font-bold">
                  {formatCurrency(summary.nextPaymentDue.amount)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Jatuh tempo: {formatDate(summary.nextPaymentDue.dueDate)}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => handlePay(summary.nextPaymentDue!.paymentNumber)}
              disabled={payingPaymentNumber === summary.nextPaymentDue.paymentNumber}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {payingPaymentNumber === summary.nextPaymentDue.paymentNumber ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-1" />
                  Bayar
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payment Schedule Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Banknote className="h-5 w-5 text-emerald-600" />
            Jadwal Pembayaran
          </CardTitle>
          <CardDescription>
            {application.application_number} &middot; {application.tenor_months} bulan
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-semibold">Bulan</th>
                  <th className="px-4 py-3 text-left font-semibold">Jatuh Tempo</th>
                  <th className="px-4 py-3 text-right font-semibold">Pokok</th>
                  <th className="px-4 py-3 text-right font-semibold">Bunga</th>
                  <th className="px-4 py-3 text-right font-semibold">Total</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                  <th className="px-4 py-3 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {application.payments.map((payment, idx) => {
                  const sc = statusConfig[payment.status] || statusConfig.upcoming
                  const StatusIcon = sc.icon
                  return (
                    <tr
                      key={payment.id}
                      className={`border-b transition-colors hover:bg-muted/30 ${
                        idx % 2 === 0 ? '' : 'bg-muted/20'
                      }`}
                    >
                      <td className="px-4 py-3 font-medium">{payment.payment_number}</td>
                      <td className="px-4 py-3 text-muted-foreground">{formatDate(payment.due_date)}</td>
                      <td className="px-4 py-3 text-right">{formatCurrency(payment.principal_amount)}</td>
                      <td className="px-4 py-3 text-right text-orange-600">{formatCurrency(payment.interest_amount)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{formatCurrency(payment.amount_due)}</td>
                      <td className="px-4 py-3 text-center">
                        <Badge className={`${sc.bgClass} text-xs`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {sc.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {(payment.status === 'upcoming' || payment.status === 'overdue') && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePay(payment.payment_number)}
                            disabled={payingPaymentNumber === payment.payment_number}
                            className="h-8 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400"
                          >
                            {payingPaymentNumber === payment.payment_number ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <>
                                <CreditCard className="h-3 w-3 mr-1" />
                                Bayar
                              </>
                            )}
                          </Button>
                        )}
                        {payment.status === 'paid' && (
                          <span className="text-emerald-600 text-xs font-medium flex items-center justify-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                            Lunas
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden">
            <ScrollArea className="max-h-96">
              <div className="divide-y">
                {application.payments.map((payment) => {
                  const sc = statusConfig[payment.status] || statusConfig.upcoming
                  const StatusIcon = sc.icon
                  const isExpanded = expandedPayment === payment.payment_number

                  return (
                    <div key={payment.id} className="p-3">
                      <button
                        onClick={() => setExpandedPayment(isExpanded ? null : payment.payment_number)}
                        className="w-full flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            payment.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : payment.status === 'overdue'
                              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {payment.payment_number}
                          </div>
                          <div className="text-left">
                            <p className="font-semibold text-sm">{formatCurrency(payment.amount_due)}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(payment.due_date)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${sc.bgClass} text-[10px]`}>
                            <StatusIcon className="h-3 w-3 mr-0.5" />
                            {sc.label}
                          </Badge>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 pl-11 space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Pokok</span>
                                <span>{formatCurrency(payment.principal_amount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Bunga</span>
                                <span className="text-orange-600">{formatCurrency(payment.interest_amount)}</span>
                              </div>
                              {payment.late_fee ? (
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Denda</span>
                                  <span className="text-red-600">{formatCurrency(payment.late_fee)}</span>
                                </div>
                              ) : null}
                              <Separator />
                              {(payment.status === 'upcoming' || payment.status === 'overdue') && (
                                <Button
                                  size="sm"
                                  onClick={() => handlePay(payment.payment_number)}
                                  disabled={payingPaymentNumber === payment.payment_number}
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 h-9"
                                >
                                  {payingPaymentNumber === payment.payment_number ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <>
                                      <CreditCard className="h-4 w-4 mr-1" />
                                      Bayar via AstraPay
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* AstraPay Payment Modal */}
      <AstraPayPaymentModal
        open={paymentModalOpen}
        onOpenChange={setPaymentModalOpen}
        paymentUrl={paymentUrl}
        merchantTrxId={merchantTrxId}
        onPaymentComplete={handlePaymentComplete}
      />
    </div>
  )
}
