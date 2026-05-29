'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Car, Loader2, Shield, CheckCircle, Zap, Users } from 'lucide-react'

function AuthForm() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const [loading, setLoading] = useState(false)

  const { signInWithGoogle } = useAuth()
  const router = useRouter()

  const handleGoogleLogin = async () => {
    setLoading(true)
    
    try {
      const { error } = await signInWithGoogle(redirect)

      if (error) {
        toast.error(error.message || 'Login dengan Google gagal')
        setLoading(false)
        return
      }

      // Google OAuth will redirect automatically
    } catch (err) {
      toast.error('Terjadi kesalahan saat login dengan Google')
      setLoading(false)
    }
  }

  const benefits = [
    { icon: Shield, text: 'Inspeksi 160 titik gratis' },
    { icon: CheckCircle, text: 'Transaksi aman dengan escrow' },
    { icon: Zap, text: 'Listing gratis tanpa biaya' },
    { icon: Users, text: '500+ dealer terpercaya' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md border-0 shadow-2xl shadow-purple-500/10">
        <CardHeader className="text-center space-y-4 pb-2">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center justify-center">
            <Image 
              src="/logo.png" 
              alt="AutoMarket" 
              width={180} 
              height={50}
              className="h-12 w-auto object-contain"
              priority
            />
          </Link>
          
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Selamat Datang
            </CardTitle>
            <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
              Masuk atau daftar untuk mulai jual beli mobil
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Promo Box */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-500 to-blue-600 p-4 text-white">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjMCAwLTItMi0yLTRzMi00IDItNCAyIDQgMiA0IDItMiA0LTJjMCAwIDItMiAyLTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30"></div>
            <div className="relative flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Car className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">Gratis Inspeksi!</h3>
                <p className="text-sm text-white/90">
                  Dapatkan inspeksi <span className="font-bold">160 titik gratis</span> untuk mobil pertama Anda
                </p>
              </div>
            </div>
          </div>

          {/* Google Sign In Button */}
          <Button 
            variant="outline" 
            className="w-full h-12 text-base font-semibold border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-all duration-300" 
            type="button" 
            onClick={handleGoogleLogin} 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Lanjutkan dengan Google
              </>
            )}
          </Button>

          {/* Benefits List */}
          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm font-semibold text-center text-gray-500 dark:text-gray-400">
              Keuntungan bergabung:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                >
                  <benefit.icon className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {benefit.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30">
              <p className="text-xl font-bold text-purple-600 dark:text-purple-400">10K+</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Mobil Tersedia</p>
            </div>
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30">
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">8.5K+</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Inspeksi</p>
            </div>
            <div className="p-2 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30">
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">500+</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">Dealer</p>
            </div>
          </div>

          {/* Terms */}
          <p className="text-xs text-center text-gray-400 dark:text-gray-500 px-4">
            Dengan melanjutkan, Anda menyetujui{' '}
            <Link href="/terms" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 hover:underline">
              Syarat & Ketentuan
            </Link>
            {' '}dan{' '}
            <Link href="/privacy" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 hover:underline">
              Kebijakan Privasi
            </Link>
          </p>

          {/* Back to home */}
          <div className="text-center pt-2">
            <Link 
              href="/" 
              className="text-sm text-gray-500 hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="text-gray-500 dark:text-gray-400">Memuat...</span>
      </div>
    </div>
  )
}

export default function AuthPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AuthForm />
    </Suspense>
  )
}
