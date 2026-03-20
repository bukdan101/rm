'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/MainLayout'
import { ListingForm, type ListingFormData } from '@/components/listing/ListingForm'
import { KYCForm } from '@/components/kyc/KYCForm'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useAuth } from '@/hooks/useAuth'
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  ArrowLeft,
  Loader2,
  Coins,
  CreditCard,
  Info
} from 'lucide-react'
import Link from 'next/link'
import { v4 as uuidv4 } from 'uuid'

type KycStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected'

interface KycData {
  id: string
  user_id: string
  full_name: string | null
  ktp_number: string | null
  status: KycStatus
  rejection_reason: string | null
}

interface UserCredits {
  id: string
  balance: number
  total_earned: number
  total_spent: number
}

// Credit cost for creating a listing
const LISTING_CREDIT_COST = 1

export default function CreateListingPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  
  // State
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [kycStatus, setKycStatus] = useState<KycStatus>('not_submitted')
  const [kycData, setKycData] = useState<KycData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Credit state
  const [credits, setCredits] = useState<UserCredits | null>(null)
  const [creditLoading, setCreditLoading] = useState(true)
  
  // Check auth and redirect if needed
  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      // Not logged in - redirect to auth with callback
      router.push(`/auth?redirect=/listing/create`)
      return
    }
    
    // Check if user needs onboarding (new user without complete profile)
    if (!profile?.full_name && !profile?.phone) {
      router.push(`/onboarding?redirect=/listing/create`)
      return
    }
    
    setCheckingAuth(false)
  }, [user, profile, authLoading, router])
  
  // Check KYC status
  useEffect(() => {
    async function checkKycStatus() {
      if (!user?.id || checkingAuth) return
      
      try {
        const res = await fetch(`/api/kyc?user_id=${user.id}`)
        const data = await res.json()
        
        if (data.success && data.kyc) {
          setKycData(data.kyc)
          setKycStatus(data.kyc.status)
        } else {
          setKycStatus('not_submitted')
        }
      } catch (error) {
        console.error('Error checking KYC status:', error)
        setKycStatus('not_submitted')
      }
    }
    
    checkKycStatus()
  }, [user?.id, checkingAuth])
  
  // Fetch credits
  useEffect(() => {
    async function fetchCredits() {
      if (!user?.id || checkingAuth) return
      
      try {
        setCreditLoading(true)
        const res = await fetch('/api/credits/balance')
        
        if (res.ok) {
          const data = await res.json()
          setCredits(data.credits)
        }
      } catch (error) {
        console.error('Error fetching credits:', error)
      } finally {
        setCreditLoading(false)
      }
    }
    
    fetchCredits()
  }, [user?.id, checkingAuth])

  // Handle KYC submit
  const handleKycSubmit = async (data: unknown) => {
    try {
      const res = await fetch('/api/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, user_id: user?.id })
      })
      
      const result = await res.json()
      
      if (result.success) {
        setKycData(result.kyc)
        setKycStatus('pending')
        return true
      } else {
        throw new Error(result.error || 'Failed to submit KYC')
      }
    } catch (error) {
      console.error('Error submitting KYC:', error)
      throw error
    }
  }

  // Handle listing submit
  const handleListingSubmit = async (data: ListingFormData) => {
    // Check credits first
    if (!credits || credits.balance < LISTING_CREDIT_COST) {
      router.push('/credits?insufficient=true')
      return null
    }
    
    setIsSubmitting(true)
    
    try {
      // Deduct credits first
      const deductRes = await fetch('/api/credits/deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: LISTING_CREDIT_COST,
          description: 'Pembuatan iklan baru',
          reference_type: 'listing'
        })
      })
      
      if (!deductRes.ok) {
        const errorData = await deductRes.json()
        throw new Error(errorData.error || 'Insufficient credits')
      }
      
      // Create listing
      const listingId = uuidv4()
      const listingNumber = `CAR-${Date.now().toString(36).toUpperCase()}`
      
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: listingId,
          listing_number: listingNumber,
          user_id: user?.id,
          ...data,
          status: 'pending'
        })
      })
      
      const result = await res.json()
      
      if (result.success) {
        // Refresh credits
        const creditRes = await fetch('/api/credits/balance')
        if (creditRes.ok) {
          const creditData = await creditRes.json()
          setCredits(creditData.credits)
        }
        
        return result.data?.id || listingId
      } else {
        // Refund credits if listing creation failed
        await fetch('/api/credits/deduct', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: -LISTING_CREDIT_COST,
            description: 'Refund - Gagal membuat iklan',
            reference_type: 'refund'
          })
        })
        
        throw new Error(result.error || 'Failed to create listing')
      }
    } catch (error) {
      console.error('Error creating listing:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Check if user can post
  const hasKyc = kycStatus === 'approved'
  const hasCredits = (credits?.balance || 0) >= LISTING_CREDIT_COST

  // Loading state
  if (authLoading || checkingAuth || creditLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Card className="border-0 shadow-lg max-w-2xl mx-auto">
            <CardContent className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
              <p className="text-gray-500">Memverifikasi akun...</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Back button */}
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Button>
        </Link>
        
        {/* Credit Balance Card */}
        {hasKyc && (
          <Card className="border-0 shadow-lg mb-4 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Coins className="w-6 h-6" />
                  <div>
                    <h2 className="font-bold">Saldo Kredit Anda</h2>
                    <p className="text-white/80 text-sm">
                      1 Kredit = 1 Iklan selama 30 hari
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold">{credits?.balance || 0}</p>
                  <p className="text-white/80 text-sm">Kredit</p>
                </div>
              </div>
            </div>
            
            {!hasCredits && (
              <CardContent className="p-4 bg-red-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div>
                      <p className="font-medium text-red-700">Saldo Tidak Cukup</p>
                      <p className="text-sm text-red-600">
                        Anda membutuhkan {LISTING_CREDIT_COST} kredit untuk memasang iklan
                      </p>
                    </div>
                  </div>
                  <Link href="/credits">
                    <Button className="bg-red-500 hover:bg-red-600">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Beli Kredit
                    </Button>
                  </Link>
                </div>
              </CardContent>
            )}
            
            {hasCredits && (
              <CardContent className="p-4 bg-green-50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium text-green-700">Siap Memasang Iklan</p>
                    <p className="text-sm text-green-600">
                      {LISTING_CREDIT_COST} kredit akan dipotong saat iklan dipublikasikan
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* KYC Required Banner */}
        {!hasKyc && (
          <Card className="border-0 shadow-lg mb-4 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-white">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6" />
                <div>
                  <h2 className="font-bold">Verifikasi KYC Diperlukan</h2>
                  <p className="text-white/80 text-sm">
                    Untuk menjual mobil, Anda perlu melakukan verifikasi identitas terlebih dahulu
                  </p>
                </div>
              </div>
            </div>
            
            <CardContent className="p-4">
              {/* KYC Status */}
              <div className="flex items-center gap-4">
                {kycStatus === 'not_submitted' && (
                  <>
                    <AlertTriangle className="w-8 h-8 text-amber-500" />
                    <div className="flex-1">
                      <p className="font-medium">Belum terverifikasi</p>
                      <p className="text-sm text-gray-500">
                        Silakan lengkapi form KYC di bawah untuk mulai berjualan
                      </p>
                    </div>
                    <Badge className="bg-amber-100 text-amber-700">
                      Perlu Verifikasi
                    </Badge>
                  </>
                )}
                
                {kycStatus === 'pending' && (
                  <>
                    <Clock className="w-8 h-8 text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium">Menunggu Verifikasi</p>
                      <p className="text-sm text-gray-500">
                        Dokumen Anda sedang dalam proses verifikasi (1-2 hari kerja)
                      </p>
                    </div>
                    <Badge className="bg-blue-100 text-blue-700">
                      Sedang Diproses
                    </Badge>
                  </>
                )}
                
                {kycStatus === 'rejected' && (
                  <>
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                    <div className="flex-1">
                      <p className="font-medium">Verifikasi Ditolak</p>
                      <p className="text-sm text-gray-500">
                        {kycData?.rejection_reason || 'Silakan perbaiki dokumen dan ajukan ulang'}
                      </p>
                    </div>
                    <Badge className="bg-red-100 text-red-700">
                      Ditolak
                    </Badge>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* KYC Approved Banner */}
        {hasKyc && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <AlertTitle className="text-green-800">Akun Terverifikasi</AlertTitle>
            <AlertDescription className="text-green-700">
              Identitas Anda sudah diverifikasi. {hasCredits ? 'Anda dapat mulai memasang iklan.' : 'Silakan beli kredit untuk memasang iklan.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Content based on KYC status */}
        {hasKyc ? (
          // Show listing form
          <div className="space-y-4">
            {/* Info Card */}
            <Card className="border-0 shadow-lg bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Informasi Pembuatan Iklan</p>
                    <ul className="space-y-1 text-blue-600">
                      <li>• Biaya: <strong>{LISTING_CREDIT_COST} Kredit</strong> per iklan</li>
                      <li>• Durasi: Iklan aktif selama <strong>30 hari</strong></li>
                      <li>• Perpanjangan: <strong>1 Kredit</strong> per 30 hari</li>
                      <li>• Kredit tidak akan dipotong jika iklan ditolak</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <ListingForm
              userId={user?.id || ''}
              onSubmit={handleListingSubmit}
              isSubmitting={isSubmitting}
              disabled={!hasCredits}
            />
          </div>
        ) : (
          // Show KYC form
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* KYC Form */}
            <div className="lg:col-span-2">
              <KYCForm
                userId={user?.id || ''}
                existingKyc={kycData}
                onSubmit={handleKycSubmit}
              />
            </div>
            
            {/* Info Panel */}
            <div className="space-y-4">
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-500" />
                    Mengapa KYC Diperlukan?
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      Meningkatkan kepercayaan pembeli
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      Melindungi dari penipuan
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      Memenuhi regulasi pemerintah
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      Akses fitur premium dealer
                    </li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Dokumen yang Diperlukan</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">Wajib</Badge>
                      <span className="text-sm">KTP (Kartu Tanda Penduduk)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700">Wajib</Badge>
                      <span className="text-sm">Foto Selfie dengan KTP</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Bonus Info */}
              <Card className="border-0 shadow-lg bg-amber-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Coins className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-amber-800">Bonus Pendaftaran!</h3>
                  </div>
                  <p className="text-sm text-amber-700">
                    500 pendaftar pertama mendapat <strong>500 Kredit GRATIS</strong> untuk pasang iklan!
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
