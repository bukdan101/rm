'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { DealerOnboardingForm } from '@/components/onboarding/DealerOnboardingForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Building2,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Car
} from 'lucide-react'

type OnboardingStep = 'loading' | 'login' | 'choose-type' | 'dealer-form' | 'success'

export default function OnboardingPage() {
  const router = useRouter()
  const { user, profile, loading, signInWithGoogle, isDealer } = useAuth()
  const [step, setStep] = useState<OnboardingStep>('loading')
  const [registrationStatus, setRegistrationStatus] = useState<string | null>(null)

  // Check auth state and existing registration
  useEffect(() => {
    const checkState = async () => {
      if (loading) return

      if (!user) {
        setStep('login')
        return
      }

      // Check if already a dealer
      if (isDealer && profile?.role === 'dealer') {
        router.push('/dashboard/dealer')
        return
      }

      // Check existing registration
      try {
        const response = await fetch(`/api/dealer-registration?user_id=${user.id}`)
        const result = await response.json()

        if (result.success && result.registration) {
          const reg = result.registration
          
          if (reg.status === 'approved') {
            // Already approved, redirect to dashboard
            router.push('/dashboard/dealer')
            return
          } else if (reg.status === 'pending' || reg.status === 'under_review') {
            setRegistrationStatus(reg.status)
            setStep('success')
            return
          } else if (reg.status === 'rejected') {
            // Can resubmit
            setStep('dealer-form')
            return
          }
        }

        // No existing registration, show type selection
        setStep('choose-type')
      } catch (error) {
        console.error('Error checking registration:', error)
        setStep('choose-type')
      }
    }

    checkState()
  }, [user, profile, loading, isDealer, router])

  // Handle Google login
  const handleGoogleLogin = async () => {
    await signInWithGoogle()
  }

  // Handle type selection
  const handleSelectType = (type: 'personal' | 'dealer') => {
    if (type === 'personal') {
      // Redirect to user dashboard
      router.push('/dashboard')
    } else {
      setStep('dealer-form')
    }
  }

  // Handle form submission
  const handleFormSubmit = () => {
    setRegistrationStatus('pending')
    setStep('success')
  }

  // Loading state
  if (step === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Memuat...</p>
        </div>
      </div>
    )
  }

  // Login prompt
  if (step === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Car className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Selamat Datang</CardTitle>
            <CardDescription>
              Masuk untuk melanjutkan pendaftaran
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleGoogleLogin}
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-300"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Masuk dengan Google
            </Button>
            
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Dengan masuk, Anda menyetujui Syarat & Ketentuan kami
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Choose account type
  if (step === 'choose-type') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Pilih Jenis Akun
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Hi, {profile?.name || user?.email}! Pilih tipe akun yang sesuai dengan kebutuhan Anda
            </p>
          </div>

          {/* Account Type Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Account */}
            <Card 
              className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all group"
              onClick={() => handleSelectType('personal')}
            >
              <CardHeader>
                <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <User className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  Akun Personal
                  <Badge variant="secondary" className="text-xs">Pembeli</Badge>
                </CardTitle>
                <CardDescription>
                  Untuk mencari dan membeli mobil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    'Cari dan lihat listing mobil',
                    'Hubungi dealer/penjual',
                    'Simpan favorit',
                    'Buat penawaran',
                    'Review dealer',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Dealer Account */}
            <Card 
              className="cursor-pointer hover:shadow-lg hover:border-primary/50 transition-all group relative overflow-hidden"
              onClick={() => handleSelectType('dealer')}
            >
              <div className="absolute top-4 right-4">
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                  Rekomended
                </Badge>
              </div>
              <CardHeader>
                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Building2 className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                </div>
                <CardTitle className="flex items-center gap-2">
                  Akun Dealer
                  <Badge variant="secondary" className="text-xs">Penjual</Badge>
                </CardTitle>
                <CardDescription>
                  Untuk menjual mobil di platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    'Semua fitur Personal',
                    'Jual mobil unlimited',
                    'Dashboard analitik',
                    'Verifikasi dealer',
                    'Support prioritas',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Back Button */}
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="text-gray-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Dealer onboarding form
  if (step === 'dealer-form') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setStep('choose-type')}
            className="text-gray-500"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>

        <DealerOnboardingForm
          userId={user!.id}
          userEmail={user!.email || ''}
          userName={profile?.name || ''}
          onSubmit={handleFormSubmit}
        />
      </div>
    )
  }

  // Success state
  if (step === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md border-0 shadow-xl text-center">
          <CardHeader>
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              {registrationStatus === 'pending' ? (
                <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
              ) : (
                <CheckCircle className="w-10 h-10 text-green-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {registrationStatus === 'pending' || registrationStatus === 'under_review'
                ? 'Pendaftaran Diterima!'
                : 'Berhasil!'}
            </CardTitle>
            <CardDescription className="text-base mt-2">
              {registrationStatus === 'pending' || registrationStatus === 'under_review'
                ? 'Tim kami sedang mereview pendaftaran Anda. Proses ini biasanya membutuhkan 1-2 hari kerja.'
                : 'Pendaftaran Anda sedang diproses.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg text-left">
              <h4 className="font-medium text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Langkah Selanjutnya
              </h4>
              <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                <li>• Tim kami akan menghubungi Anda untuk verifikasi</li>
                <li>• Pastikan nomor HP aktif untuk dihubungi</li>
                <li>• Anda akan mendapat notifikasi email setelah disetujui</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="flex-1"
              >
                Ke Beranda
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                className="flex-1"
              >
                Ke Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}
