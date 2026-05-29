'use client'

import { useState, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CreditCard,
  User,
  Phone,
  FileText,
  CheckCircle,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  Calendar,
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

// ===== Types =====
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

interface CreditApplicationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  calculation: CreditCalculation | null
  vehicleName?: string
  listingId?: string
  dealerId?: string
}

interface FormData {
  ktpNumber: string
  monthlyIncome: string
  employmentType: string
  workExperienceYears: string
  emergencyContactName: string
  emergencyContactPhone: string
}

const EMPLOYMENT_TYPES = [
  { value: 'Karyawan', label: 'Karyawan' },
  { value: 'Wiraswasta', label: 'Wiraswasta' },
  { value: 'PNS', label: 'PNS' },
  { value: 'Profesional', label: 'Profesional' },
  { value: 'Lainnya', label: 'Lainnya' },
]

const STEPS = [
  { id: 1, label: 'Ringkasan', icon: FileText },
  { id: 2, label: 'Data Pribadi', icon: User },
  { id: 3, label: 'Kontak Darurat', icon: Phone },
  { id: 4, label: 'Konfirmasi', icon: CheckCircle },
]

export function CreditApplicationDialog({
  open,
  onOpenChange,
  calculation,
  vehicleName,
  listingId,
  dealerId,
}: CreditApplicationDialogProps) {
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [applicationNumber, setApplicationNumber] = useState('')
  const [formError, setFormError] = useState('')

  const [form, setForm] = useState<FormData>({
    ktpNumber: '',
    monthlyIncome: '',
    employmentType: '',
    workExperienceYears: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  })

  const updateForm = useCallback((field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFormError('')
  }, [])

  const resetAndClose = useCallback(() => {
    setStep(1)
    setSubmitted(false)
    setApplicationNumber('')
    setFormError('')
    setForm({
      ktpNumber: '',
      monthlyIncome: '',
      employmentType: '',
      workExperienceYears: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
    })
    onOpenChange(false)
  }, [onOpenChange])

  const validateStep = useCallback((): boolean => {
    if (step === 2) {
      if (!form.ktpNumber || form.ktpNumber.length < 16) {
        setFormError('Nomor KTP harus 16 digit')
        return false
      }
      if (!form.monthlyIncome || Number(form.monthlyIncome) <= 0) {
        setFormError('Penghasilan per bulan wajib diisi')
        return false
      }
      if (!form.employmentType) {
        setFormError('Jenis pekerjaan wajib dipilih')
        return false
      }
    }
    if (step === 3) {
      if (!form.emergencyContactName.trim()) {
        setFormError('Nama kontak darurat wajib diisi')
        return false
      }
      if (!form.emergencyContactPhone || form.emergencyContactPhone.length < 10) {
        setFormError('Nomor telepon kontak darurat tidak valid')
        return false
      }
    }
    setFormError('')
    return true
  }, [step, form])

  const handleNext = useCallback(() => {
    if (validateStep()) {
      setStep((s) => Math.min(s + 1, 4))
    }
  }, [validateStep])

  const handlePrev = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!calculation) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/credit/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          dealerId,
          vehiclePrice: calculation.vehiclePrice,
          downPayment: calculation.downPayment,
          tenorMonths: calculation.tenorMonths,
          interestRate: calculation.interestRate,
          ktpNumber: form.ktpNumber,
          monthlyIncome: Number(form.monthlyIncome),
          employmentType: form.employmentType,
          workExperienceYears: form.workExperienceYears ? Number(form.workExperienceYears) : undefined,
          emergencyContactName: form.emergencyContactName,
          emergencyContactPhone: form.emergencyContactPhone,
        }),
      })

      const data = await res.json()
      if (data.success && data.data?.application) {
        setApplicationNumber(data.data.application.application_number || '')
        setSubmitted(true)
        toast.success('Pengajuan kredit berhasil dikirim!')
      } else {
        toast.error(data.error || 'Gagal mengajukan kredit')
      }
    } catch {
      toast.error('Gagal menghubungi server')
    } finally {
      setSubmitting(false)
    }
  }, [calculation, listingId, dealerId, form])

  if (!calculation) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-emerald-600" />
            Pengajuan Kredit
          </DialogTitle>
          <DialogDescription>
            Isi formulir berikut untuk mengajukan pembiayaan kredit kendaraan
          </DialogDescription>
        </DialogHeader>

        {!submitted ? (
          <>
            {/* Step Indicator */}
            <div className="flex items-center gap-1 mb-4">
              {STEPS.map((s, idx) => (
                <div key={s.id} className="flex items-center flex-1">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      step >= s.id
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <s.icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{s.label}</span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-1 ${step > s.id ? 'bg-emerald-400' : 'bg-muted'}`} />
                  )}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {/* Step 1: Credit Summary */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-100 dark:border-emerald-900">
                    <CardContent className="p-4 space-y-3">
                      <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <Banknote className="h-4 w-4" />
                        Ringkasan Kredit
                      </h4>
                      {vehicleName && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Kendaraan</span>
                          <span className="font-medium">{vehicleName}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Harga Kendaraan</span>
                        <span className="font-medium">{formatCurrency(calculation.vehiclePrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Uang Muka ({calculation.downPaymentPercent}%)</span>
                        <span className="font-medium">{formatCurrency(calculation.downPayment)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Pinjaman</span>
                        <span className="font-medium">{formatCurrency(calculation.loanAmount)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Bunga ({calculation.interestRate}%/thn)</span>
                        <span className="font-medium text-orange-600">{formatCurrency(calculation.totalInterest)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Cicilan/Bulan</span>
                        <div className="text-right">
                          <p className="text-xl font-bold text-emerald-600">{formatCurrency(calculation.monthlyInstallment)}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {calculation.tenorMonths} bulan
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total Pembayaran</span>
                        <span className="text-emerald-700 dark:text-emerald-400">{formatCurrency(calculation.totalPayment)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Personal Info */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="ktp" className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-emerald-600" />
                        Nomor KTP <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="ktp"
                        placeholder="16 digit nomor KTP"
                        value={form.ktpNumber}
                        onChange={(e) => updateForm('ktpNumber', e.target.value.replace(/\D/g, '').slice(0, 16))}
                        maxLength={16}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="income" className="flex items-center gap-2">
                        <Banknote className="h-4 w-4 text-emerald-600" />
                        Penghasilan per Bulan (Rp) <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="income"
                        type="number"
                        placeholder="contoh: 10000000"
                        value={form.monthlyIncome}
                        onChange={(e) => updateForm('monthlyIncome', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <User className="h-4 w-4 text-emerald-600" />
                        Jenis Pekerjaan <span className="text-red-500">*</span>
                      </Label>
                      <Select value={form.employmentType} onValueChange={(v) => updateForm('employmentType', v)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis pekerjaan" />
                        </SelectTrigger>
                        <SelectContent>
                          {EMPLOYMENT_TYPES.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-600" />
                        Lama Bekerja (tahun)
                      </Label>
                      <Input
                        id="experience"
                        type="number"
                        placeholder="contoh: 3"
                        value={form.workExperienceYears}
                        onChange={(e) => updateForm('workExperienceYears', e.target.value)}
                        min={0}
                        max={50}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Emergency Contact */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3 mb-2">
                    <p className="text-xs text-amber-700 dark:text-amber-400 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      Kontak darurat akan dihubungi jika Anda tidak bisa dihubungi terkait pembayaran cicilan.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergencyName" className="flex items-center gap-2">
                        <User className="h-4 w-4 text-emerald-600" />
                        Nama Kontak Darurat <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="emergencyName"
                        placeholder="Nama lengkap"
                        value={form.emergencyContactName}
                        onChange={(e) => updateForm('emergencyContactName', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="emergencyPhone" className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-emerald-600" />
                        Nomor Telepon <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="emergencyPhone"
                        placeholder="08xxxxxxxxxx"
                        value={form.emergencyContactPhone}
                        onChange={(e) => updateForm('emergencyContactPhone', e.target.value.replace(/\D/g, ''))}
                        maxLength={15}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Review & Submit */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-100 dark:border-emerald-900">
                    <CardContent className="p-4 space-y-3">
                      <h4 className="font-semibold text-emerald-800 dark:text-emerald-300">
                        Ringkasan Pengajuan
                      </h4>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Kendaraan</span>
                          <span className="font-medium">{vehicleName || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Harga</span>
                          <span className="font-medium">{formatCurrency(calculation.vehiclePrice)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">DP</span>
                          <span className="font-medium">{formatCurrency(calculation.downPayment)} ({calculation.downPaymentPercent}%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Tenor</span>
                          <span className="font-medium">{calculation.tenorMonths} bulan</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-base">
                          <span>Cicilan/Bulan</span>
                          <span className="text-emerald-600">{formatCurrency(calculation.monthlyInstallment)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 space-y-2 text-sm">
                      <h4 className="font-semibold flex items-center gap-2">
                        <User className="h-4 w-4 text-emerald-600" />
                        Data Pribadi
                      </h4>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">No. KTP</span>
                        <span className="font-mono">{form.ktpNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Penghasilan</span>
                        <span>{formatCurrency(Number(form.monthlyIncome))}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Pekerjaan</span>
                        <span>{form.employmentType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lama Kerja</span>
                        <span>{form.workExperienceYears ? `${form.workExperienceYears} tahun` : '-'}</span>
                      </div>
                      <Separator />
                      <h4 className="font-semibold flex items-center gap-2">
                        <Phone className="h-4 w-4 text-emerald-600" />
                        Kontak Darurat
                      </h4>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Nama</span>
                        <span>{form.emergencyContactName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Telepon</span>
                        <span>{form.emergencyContactPhone}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3">
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Dengan mengajukan kredit, Anda menyetujui syarat dan ketentuan pembiayaan melalui AstraPay.
                      Pengajuan akan diproses dalam 1-3 hari kerja.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form Error */}
            {formError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {formError}
              </div>
            )}

            {/* Navigation */}
            <DialogFooter className="flex-row gap-2 sm:gap-2">
              {step > 1 ? (
                <Button variant="outline" onClick={handlePrev} className="flex-1" disabled={submitting}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Kembali
                </Button>
              ) : (
                <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                  Batal
                </Button>
              )}

              {step < 4 ? (
                <Button onClick={handleNext} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  Lanjut
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Kirim Pengajuan
                    </>
                  )}
                </Button>
              )}
            </DialogFooter>
          </>
        ) : (
          /* Success State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-6 text-center space-y-4"
          >
            <div className="h-20 w-20 mx-auto rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                Pengajuan Berhasil!
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Pengajuan kredit Anda telah dikirim dan sedang diproses
              </p>
            </div>
            <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900">
              <CardContent className="p-4 space-y-2">
                <p className="text-xs text-muted-foreground">Nomor Pengajuan</p>
                <p className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                  {applicationNumber || 'KRT-XXXXXXXX'}
                </p>
                <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  Menunggu Review
                </Badge>
              </CardContent>
            </Card>
            <p className="text-xs text-muted-foreground">
              Simpan nomor pengajuan ini untuk mengecek status. Proses review membutuhkan 1-3 hari kerja.
            </p>
            <Button onClick={resetAndClose} className="w-full bg-emerald-600 hover:bg-emerald-700">
              Tutup
            </Button>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  )
}
