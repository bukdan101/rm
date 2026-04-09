'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowDownCircle, Building2, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

const BANKS = [
  { id: 'bca', name: 'Bank Central Asia (BCA)' },
  { id: 'mandiri', name: 'Bank Mandiri' },
  { id: 'bri', name: 'Bank Rakyat Indonesia (BRI)' },
  { id: 'bni', name: 'Bank Negara Indonesia (BNI)' },
  { id: 'cimb', name: 'Bank CIMB Niaga' },
  { id: 'danamon', name: 'Bank Danamon' },
]

export default function WithdrawPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [amount, setAmount] = useState('')
  const [bankId, setBankId] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')

  const balance = 1250000
  const minWithdraw = 50000

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const handleWithdraw = async () => {
    const withdrawAmount = parseInt(amount.replace(/\D/g, '')) || 0

    if (withdrawAmount < minWithdraw) {
      toast({
        title: 'Jumlah terlalu kecil',
        description: `Minimal penarikan ${formatCurrency(minWithdraw)}`,
        variant: 'destructive',
      })
      return
    }

    if (withdrawAmount > balance) {
      toast({
        title: 'Saldo tidak mencukupi',
        description: 'Jumlah penarikan melebihi saldo tersedia',
        variant: 'destructive',
      })
      return
    }

    if (!bankId || !accountNumber || !accountName) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Mohon lengkapi semua data bank',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: 'Penarikan berhasil diajukan',
        description: 'Dana akan ditransfer dalam 1-3 hari kerja',
      })

      setAmount('')
      setBankId('')
      setAccountNumber('')
      setAccountName('')
    } catch (error) {
      toast({
        title: 'Gagal mengajukan penarikan',
        description: 'Silakan coba lagi',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Penarikan" description="Tarik dana ke rekening bank Anda">
      <div className="max-w-xl space-y-6">
        {/* Balance Info */}
        <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Saldo Tersedia</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(balance)}</p>
              </div>
              <ArrowDownCircle className="h-12 w-12 text-white/30" />
            </div>
          </CardContent>
        </Card>

        {/* Withdraw Form */}
        <Card>
          <CardHeader>
            <CardTitle>Form Penarikan</CardTitle>
            <CardDescription>Masukkan detail penarikan dana</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Jumlah Penarikan</Label>
              <Input
                type="text"
                placeholder={`Minimal ${formatCurrency(minWithdraw)}`}
                value={amount}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  setAmount(value ? parseInt(value).toLocaleString('id-ID') : '')
                }}
              />
              <p className="text-xs text-muted-foreground">
                Minimal penarikan: {formatCurrency(minWithdraw)}
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Bank Tujuan</Label>
              <Select value={bankId} onValueChange={setBankId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih bank" />
                </SelectTrigger>
                <SelectContent>
                  {BANKS.map((bank) => (
                    <SelectItem key={bank.id} value={bank.id}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Nomor Rekening</Label>
              <Input
                type="text"
                placeholder="Masukkan nomor rekening"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <div className="space-y-2">
              <Label>Nama Pemilik Rekening</Label>
              <Input
                type="text"
                placeholder="Sesuai buku tabungan"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value.toUpperCase())}
              />
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Perhatian:</p>
                  <ul className="mt-1 space-y-1 text-yellow-700">
                    <li>• Pastikan data bank sudah benar</li>
                    <li>• Proses transfer 1-3 hari kerja</li>
                    <li>• Nama rekening harus sesuai dengan akun</li>
                  </ul>
                </div>
              </div>
            </div>

            <Button 
              className="w-full" 
              onClick={handleWithdraw}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <ArrowDownCircle className="mr-2 h-4 w-4" />
                  Ajukan Penarikan
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
