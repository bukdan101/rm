'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, ExternalLink, Clock, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

// ===== Types =====
interface AstraPayPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paymentUrl: string
  merchantTrxId: string
  onPaymentComplete: () => void
}

type PaymentState = 'loading' | 'paying' | 'success' | 'failed' | 'timeout'

const POLL_INTERVAL = 3000 // 3 seconds
const TIMEOUT_MS = 600000 // 10 minutes

export function AstraPayPaymentModal({
  open,
  onOpenChange,
  paymentUrl,
  merchantTrxId,
  onPaymentComplete,
}: AstraPayPaymentModalProps) {
  const [paymentState, setPaymentState] = useState<PaymentState>('loading')
  const [elapsed, setElapsed] = useState(0)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)

  // Clean up intervals
  const cleanup = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
    if (timeoutRef.current) {
      clearInterval(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // Poll transaction status
  const checkStatus = useCallback(async () => {
    if (!merchantTrxId) return

    try {
      const res = await fetch(`/api/astrapay/transaction-status?merchantTrxId=${encodeURIComponent(merchantTrxId)}`)
      const data = await res.json()

      if (data.success && data.data?.transaction) {
        const status = data.data.transaction.status
        if (status === 'approved' || status === 'paid' || status === 'success') {
          setPaymentState('success')
          cleanup()
          toast.success('Pembayaran berhasil!')
        } else if (status === 'rejected' || status === 'failed' || status === 'expired' || status === 'cancelled') {
          setPaymentState('failed')
          cleanup()
          toast.error('Pembayaran gagal atau dibatalkan')
        }
      }
    } catch {
      // Silently retry on next poll
    }
  }, [merchantTrxId, cleanup])

  // Compute the effective payment state based on props
  const effectiveState: PaymentState = paymentState === 'loading' && open && paymentUrl && merchantTrxId
    ? 'paying'
    : paymentState

  // Start polling when modal opens with a payment URL
  useEffect(() => {
    if (open && paymentUrl && merchantTrxId) {
      startTimeRef.current = Date.now()

      // Start polling
      pollRef.current = setInterval(checkStatus, POLL_INTERVAL)

      // Start elapsed timer
      timeoutRef.current = setInterval(() => {
        const elapsedMs = Date.now() - startTimeRef.current
        setElapsed(elapsedMs)

        if (elapsedMs >= TIMEOUT_MS) {
          setPaymentState('timeout')
          cleanup()
          toast.error('Waktu pembayaran habis')
        }
      }, 1000)
    }

    return () => {
      cleanup()
    }
  }, [open, paymentUrl, merchantTrxId, checkStatus, cleanup])

  // Reset state when modal closes
  const handleClose = useCallback(() => {
    cleanup()
    setPaymentState('loading')
    setElapsed(0)
    onOpenChange(false)
    if (effectiveState === 'success') {
      onPaymentComplete()
    }
  }, [cleanup, onOpenChange, onPaymentComplete, effectiveState])

  const formatElapsed = (ms: number) => {
    const totalSec = Math.floor(ms / 1000)
    const min = Math.floor(totalSec / 60)
    const sec = totalSec % 60
    return `${min}:${sec.toString().padStart(2, '0')}`
  }

  const remainingTime = Math.max(0, TIMEOUT_MS - elapsed)
  const remainingPercent = Math.max(0, (remainingTime / TIMEOUT_MS) * 100)

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-600" />
            Pembayaran AstraPay
          </DialogTitle>
          <DialogDescription>
            Selesaikan pembayaran melalui AstraPay
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {/* Loading State */}
          {effectiveState === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center space-y-4"
            >
              <Loader2 className="h-12 w-12 mx-auto text-emerald-500 animate-spin" />
              <p className="text-muted-foreground">Mempersiapkan pembayaran...</p>
            </motion.div>
          )}

          {/* Paying State */}
          {effectiveState === 'paying' && (
            <motion.div
              key="paying"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Countdown */}
              <div className="text-center space-y-2">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${remainingPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Sisa waktu: {formatElapsed(remainingTime)}</span>
                </div>
              </div>

              {/* Payment URL redirect button */}
              <div className="space-y-3">
                <Button
                  onClick={() => window.open(paymentUrl, '_blank')}
                  className="w-full h-14 text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                >
                  <ExternalLink className="h-5 w-5 mr-2" />
                  Buka Halaman Pembayaran
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  Klik tombol di atas untuk membuka halaman pembayaran AstraPay.
                  Jendela ini akan otomatis memperbarui status pembayaran.
                </p>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                <Loader2 className="h-4 w-4 text-amber-600 animate-spin shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Menunggu pembayaran... Status akan diperbarui otomatis.
                </p>
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {effectiveState === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-6 text-center space-y-4"
            >
              <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none">
                <CheckCircle className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                  Pembayaran Berhasil!
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Transaksi Anda telah dikonfirmasi
                </p>
              </div>
              <Button onClick={handleClose} className="w-full bg-emerald-600 hover:bg-emerald-700">
                Selesai
              </Button>
            </motion.div>
          )}

          {/* Failed State */}
          {effectiveState === 'failed' && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-6 text-center space-y-4"
            >
              <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center shadow-lg shadow-red-200 dark:shadow-none">
                <XCircle className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-700 dark:text-red-400">
                  Pembayaran Gagal
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Transaksi gagal atau dibatalkan. Silakan coba lagi.
                </p>
              </div>
              <Button onClick={handleClose} variant="outline" className="w-full">
                Tutup
              </Button>
            </motion.div>
          )}

          {/* Timeout State */}
          {effectiveState === 'timeout' && (
            <motion.div
              key="timeout"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="py-6 text-center space-y-4"
            >
              <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200 dark:shadow-none">
                <Clock className="h-10 w-10 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-amber-700 dark:text-amber-400">
                  Waktu Habis
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Sesi pembayaran telah berakhir. Silakan ajukan ulang pembayaran.
                </p>
              </div>
              <Button onClick={handleClose} variant="outline" className="w-full">
                Tutup
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
