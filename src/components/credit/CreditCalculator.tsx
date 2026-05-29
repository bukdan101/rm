'use client'

import { useState, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Calculator,
  CreditCard,
  TrendingDown,
  Calendar,
  Banknote,
  Percent,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

// ===== Helpers =====
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatCompact(amount: number): string {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}jt`
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}rb`
  return formatCurrency(amount)
}

// ===== Types =====
interface CreditCalculatorProps {
  vehiclePrice: number
  vehicleName?: string
  defaultDownPaymentPct?: number
  onApplyCredit?: (calculation: CreditCalculation) => void
}

interface CreditCalculation {
  vehiclePrice: number
  downPayment: number
  downPaymentPercent: number
  loanAmount: number
  interestRate: number
  tenorMonths: number
  totalInterest: number
  totalPayment: number
  monthlyInstallment: number
}

const TENOR_OPTIONS = [12, 24, 36, 48, 60, 72]
const RATE_OPTIONS = [3, 4, 5, 6, 7, 8]

export function CreditCalculator({
  vehiclePrice,
  vehicleName,
  defaultDownPaymentPct = 20,
  onApplyCredit,
}: CreditCalculatorProps) {
  const [downPaymentPct, setDownPaymentPct] = useState(defaultDownPaymentPct)
  const [tenor, setTenor] = useState(48)
  const [interestRate, setInterestRate] = useState(5)
  const [simulating, setSimulating] = useState(false)
  const [serverCalculation, setServerCalculation] = useState<CreditCalculation | null>(null)

  const downPayment = Math.round(vehiclePrice * (downPaymentPct / 100))

  // Client-side calculation for instant preview
  const calculation = useMemo<CreditCalculation>(() => {
    const loanAmount = vehiclePrice - downPayment
    const annualRate = interestRate / 100
    const totalInterest = Math.round(loanAmount * annualRate * tenor / 12)
    const totalPayment = loanAmount + totalInterest
    const monthlyInstallment = Math.round(totalPayment / tenor)

    return {
      vehiclePrice,
      downPayment,
      downPaymentPercent: downPaymentPct,
      loanAmount,
      interestRate,
      tenorMonths: tenor,
      totalInterest,
      totalPayment,
      monthlyInstallment,
    }
  }, [vehiclePrice, downPayment, downPaymentPct, interestRate, tenor])

  const displayCalc = serverCalculation || calculation

  const handleSimulate = useCallback(async () => {
    setSimulating(true)
    try {
      const res = await fetch('/api/credit/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehiclePrice,
          downPayment,
          tenorMonths: tenor,
          interestRate,
        }),
      })

      const data = await res.json()
      if (data.success && data.data?.calculation) {
        const c = data.data.calculation
        setServerCalculation({
          vehiclePrice: c.vehiclePrice,
          downPayment: c.downPayment,
          downPaymentPercent: c.downPaymentPercent,
          loanAmount: c.loanAmount,
          interestRate: c.interestRate,
          tenorMonths: c.tenorMonths,
          totalInterest: c.totalInterest,
          totalPayment: c.totalPayment,
          monthlyInstallment: c.monthlyInstallment,
        })
        toast.success('Simulasi kredit berhasil dihitung')
      } else {
        toast.error(data.error || 'Gagal menghitung simulasi')
      }
    } catch {
      toast.error('Gagal menghubungi server')
    } finally {
      setSimulating(false)
    }
  }, [vehiclePrice, downPayment, tenor, interestRate])

  const handleApply = useCallback(() => {
    if (onApplyCredit) {
      onApplyCredit(displayCalc)
    }
  }, [onApplyCredit, displayCalc])

  return (
    <Card className="overflow-hidden border-0 shadow-xl">
      {/* Header gradient */}
      <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 p-4 sm:p-6">
        <div className="flex items-center gap-3 text-white">
          <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Simulasi Kredit</h3>
            {vehicleName && (
              <p className="text-emerald-100 text-sm">{vehicleName}</p>
            )}
          </div>
        </div>
      </div>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Vehicle Price (read-only) */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Banknote className="h-4 w-4 text-emerald-600" />
            Harga Kendaraan
          </Label>
          <div className="h-12 rounded-lg border bg-muted/50 flex items-center px-4 text-lg font-bold text-emerald-700">
            {formatCurrency(vehiclePrice)}
          </div>
        </div>

        {/* Down Payment Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
              Uang Muka (DP)
            </Label>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-emerald-600">{downPaymentPct}%</span>
              <span className="text-xs text-muted-foreground">({formatCompact(downPayment)})</span>
            </div>
          </div>
          <Slider
            value={[downPaymentPct]}
            onValueChange={(v) => setDownPaymentPct(v[0])}
            min={10}
            max={70}
            step={5}
            className="[&_[data-slot=slider-range]]:bg-emerald-500 [&_[data-slot=slider-thumb]]:border-emerald-500"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>10%</span>
            <span>40%</span>
            <span>70%</span>
          </div>
        </div>

        {/* Tenor Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-600" />
            Tenor (bulan)
          </Label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {TENOR_OPTIONS.map((t) => (
              <button
                key={t}
                onClick={() => setTenor(t)}
                className={`py-2.5 rounded-lg text-sm font-semibold transition-all border-2 ${
                  tenor === t
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                }`}
              >
                {t} bln
              </button>
            ))}
          </div>
        </div>

        {/* Interest Rate Selection */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Percent className="h-4 w-4 text-emerald-600" />
            Suku Bunga / tahun (flat)
          </Label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {RATE_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => setInterestRate(r)}
                className={`py-2.5 rounded-lg text-sm font-semibold transition-all border-2 ${
                  interestRate === r
                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                }`}
              >
                {r}%
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Results */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${displayCalc.monthlyInstallment}-${displayCalc.tenorMonths}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Monthly Installment Hero */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-xl p-4 sm:p-6 text-center border border-emerald-100 dark:border-emerald-900">
              <p className="text-sm text-emerald-700 dark:text-emerald-300 font-medium mb-1">
                Cicilan per Bulan
              </p>
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(displayCalc.monthlyInstallment)}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                selama {displayCalc.tenorMonths} bulan
              </p>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border bg-white dark:bg-gray-900 p-3 sm:p-4 shadow-sm">
                <p className="text-xs text-muted-foreground mb-1">Pinjaman</p>
                <p className="text-sm sm:text-base font-bold">{formatCompact(displayCalc.loanAmount)}</p>
              </div>
              <div className="rounded-xl border bg-white dark:bg-gray-900 p-3 sm:p-4 shadow-sm">
                <p className="text-xs text-muted-foreground mb-1">Total Bunga</p>
                <p className="text-sm sm:text-base font-bold text-orange-600">{formatCompact(displayCalc.totalInterest)}</p>
              </div>
              <div className="rounded-xl border bg-white dark:bg-gray-900 p-3 sm:p-4 shadow-sm">
                <p className="text-xs text-muted-foreground mb-1">Uang Muka</p>
                <p className="text-sm sm:text-base font-bold">{formatCompact(displayCalc.downPayment)}</p>
              </div>
              <div className="rounded-xl border bg-white dark:bg-gray-900 p-3 sm:p-4 shadow-sm">
                <p className="text-xs text-muted-foreground mb-1">Total Bayar</p>
                <p className="text-sm sm:text-base font-bold text-emerald-700 dark:text-emerald-400">{formatCompact(displayCalc.totalPayment)}</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          <Button
            onClick={handleSimulate}
            disabled={simulating}
            variant="outline"
            className="w-full h-12 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
          >
            {simulating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Menghitung...
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 mr-2" />
                Simulasi Ulang
              </>
            )}
          </Button>
          <Button
            onClick={handleApply}
            className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg shadow-emerald-200 dark:shadow-none"
          >
            <CreditCard className="h-4 w-4 mr-2" />
            Ajukan Kredit
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
          * Simulasi ini hanya estimasi. Suku bunga dan cicilan akhir dapat berbeda
          berdasarkan penilaian kredit oleh AstraPay.
        </p>
      </CardContent>
    </Card>
  )
}
