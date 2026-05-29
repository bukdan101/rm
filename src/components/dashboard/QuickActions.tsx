'use client'

import Link from 'next/link'
import { 
  Plus, 
  Coins, 
  MessageSquare, 
  Heart, 
  TrendingUp,
  Car,
  Sparkles,
  FileText,
  Shield
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface QuickAction {
  title: string
  description: string
  href: string
  icon: React.ElementType
  variant: 'default' | 'primary' | 'success' | 'warning' | 'accent'
  token?: number
}

const quickActions: QuickAction[] = [
  {
    title: 'Buat Iklan',
    description: 'Pasang iklan mobil baru',
    href: '/dashboard/listings/create',
    icon: Plus,
    variant: 'primary',
    token: 10,
  },
  {
    title: 'Beli Token',
    description: 'Tambah saldo token',
    href: '/dashboard/tokens',
    icon: Coins,
    variant: 'warning',
  },
  {
    title: 'AI Prediction',
    description: 'Prediksi harga mobil',
    href: '/dashboard/predictions',
    icon: Sparkles,
    variant: 'accent',
    token: 5,
  },
  {
    title: 'Pesan',
    description: 'Lihat percakapan',
    href: '/dashboard/messages',
    icon: MessageSquare,
    variant: 'success',
  },
]

const variantStyles = {
  default: {
    button: 'bg-muted hover:bg-muted/80',
    icon: 'bg-muted-foreground/10 text-muted-foreground',
  },
  primary: {
    button: 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white',
    icon: 'bg-white/20 text-white',
  },
  success: {
    button: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white',
    icon: 'bg-white/20 text-white',
  },
  warning: {
    button: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white',
    icon: 'bg-white/20 text-white',
  },
  accent: {
    button: 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white',
    icon: 'bg-white/20 text-white',
  },
}

export function QuickActions({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Aksi Cepat</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const styles = variantStyles[action.variant]
            return (
              <Link key={action.href} href={action.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full h-auto p-4 flex flex-col items-start gap-2 transition-all',
                    action.variant !== 'default' && styles.button
                  )}
                >
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted shrink-0">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className={cn(
                      'text-xs',
                      action.variant === 'default' ? 'text-muted-foreground' : 'text-white/80'
                    )}>
                      {action.description}
                    </div>
                    {action.token && (
                      <div className={cn(
                        'text-xs mt-1 flex items-center gap-1',
                        action.variant === 'default' ? 'text-amber-600' : 'text-white/70'
                      )}>
                        <Coins className="h-3 w-3" />
                        {action.token} token
                      </div>
                    )}
                  </div>
                </Button>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// Compact quick actions for sidebar
export function QuickActionsCompact({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      <Link href="/dashboard/listings/create">
        <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
          <Plus className="h-4 w-4 mr-2" />
          Buat Iklan
        </Button>
      </Link>
      <Link href="/dashboard/tokens">
        <Button variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/50">
          <Coins className="h-4 w-4 mr-2" />
          Beli Token
        </Button>
      </Link>
    </div>
  )
}

// Quick stats row
export function QuickStats({ 
  listings = 0, 
  messages = 0, 
  favorites = 0,
  views = 0 
}: {
  listings?: number
  messages?: number
  favorites?: number
  views?: number
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      <Link href="/dashboard/listings">
        <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
          <Car className="h-5 w-5 text-primary mb-1" />
          <span className="text-lg font-bold">{listings}</span>
          <span className="text-xs text-muted-foreground">Iklan</span>
        </div>
      </Link>
      <Link href="/dashboard/messages">
        <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
          <MessageSquare className="h-5 w-5 text-green-500 mb-1" />
          <span className="text-lg font-bold">{messages}</span>
          <span className="text-xs text-muted-foreground">Pesan</span>
        </div>
      </Link>
      <Link href="/dashboard/favorites">
        <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
          <Heart className="h-5 w-5 text-red-500 mb-1" />
          <span className="text-lg font-bold">{favorites}</span>
          <span className="text-xs text-muted-foreground">Favorit</span>
        </div>
      </Link>
      <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50">
        <TrendingUp className="h-5 w-5 text-amber-500 mb-1" />
        <span className="text-lg font-bold">{views}</span>
        <span className="text-xs text-muted-foreground">Views</span>
      </div>
    </div>
  )
}

// Action cards for dashboard home
export function ActionCards() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Create Listing Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Pasang Iklan Baru</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Jual mobil Anda dengan cepat dan mudah
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-amber-500" />
                  10 token
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  30 hari
                </span>
              </div>
              <Link href="/dashboard/listings/create">
                <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                  Buat Iklan
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Prediction Card */}
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 border-pink-200 dark:border-pink-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">AI Prediction</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Prediksi harga pasar mobil Anda
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-amber-500" />
                  5 token
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Akurat
                </span>
              </div>
              <Link href="/dashboard/predictions">
                <Button size="sm" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                  Prediksi Sekarang
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Buy Tokens Card */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-amber-200 dark:border-amber-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500">
              <Coins className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Beli Token</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Dapatkan bonus hingga 70% untuk dealer
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  Rp 1.000/token
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5" />
                  BNI VA
                </span>
              </div>
              <Link href="/dashboard/tokens">
                <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                  Beli Token
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
