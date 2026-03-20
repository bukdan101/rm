'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { useAuth } from '@/hooks/useAuth'
import { TokenWidget, TokenBadge } from '@/components/dashboard/TokenWidget'
import { QuickActionsCompact } from '@/components/dashboard/QuickActions'
import { RecentActivityCompact } from '@/components/dashboard/RecentActivity'
import {
  LayoutDashboard,
  Car,
  PlusCircle,
  MessageSquare,
  Heart,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  Store,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Coins,
  Sparkles,
  Bell,
  Wallet,
  ShoppingCart,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

const menuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Iklan Saya',
    href: '/dashboard/listings',
    icon: Car,
  },
  {
    title: 'Buat Iklan',
    href: '/dashboard/listings/create',
    icon: PlusCircle,
    highlight: true,
  },
  {
    title: 'Pesanan',
    href: '/dashboard/orders',
    icon: ShoppingCart,
  },
  {
    title: 'Wallet',
    href: '/dashboard/wallet',
    icon: Wallet,
  },
  {
    title: 'Token Saya',
    href: '/dashboard/tokens',
    icon: Coins,
  },
  {
    title: 'AI Prediction',
    href: '/dashboard/predictions',
    icon: Sparkles,
  },
  {
    title: 'Pesan',
    href: '/dashboard/messages',
    icon: MessageSquare,
  },
  {
    title: 'Notifikasi',
    href: '/dashboard/notifications',
    icon: Bell,
  },
  {
    title: 'Favorit',
    href: '/dashboard/favorites',
    icon: Heart,
  },
  {
    title: 'Verifikasi KYC',
    href: '/dashboard/kyc',
    icon: Shield,
  },
  {
    title: 'Pengaturan',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

const dealerMenuItems = [
  {
    title: 'Dashboard Dealer',
    href: '/dealer/dashboard',
    icon: Store,
  },
  {
    title: 'Statistik',
    href: '/dealer/stats',
    icon: BarChart3,
  },
  {
    title: 'Tim',
    href: '/dealer/team',
    icon: Users,
  },
]

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [tokenBalance, setTokenBalance] = useState<number | null>(null)
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  const isDealer = profile?.role === 'dealer'
  const allMenuItems = isDealer ? [...menuItems, ...dealerMenuItems] : menuItems

  // Fetch token balance
  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const res = await fetch('/api/credits/balance')
        if (res.ok) {
          const data = await res.json()
          setTokenBalance(data.credits?.balance || 0)
        }
      } catch {
        // Silent fail
      }
    }

    if (user) {
      fetchTokens()
    }
  }, [user])

  // Fetch unread notifications
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/notifications?limit=1')
        if (res.ok) {
          const data = await res.json()
          setUnreadNotifications(data.unreadCount || 0)
        }
      } catch {
        // Silent fail
      }
    }

    if (user) {
      fetchUnread()
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
  }

  const NavLink = ({ item, mobile = false }: { item: typeof menuItems[0]; mobile?: boolean }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    
    // Add badge for notifications
    const showBadge = item.href === '/dashboard/notifications' && unreadNotifications > 0
    
    return (
      <Link
        href={item.href}
        onClick={() => mobile && setMobileMenuOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm'
            : item.highlight
              ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-primary hover:from-blue-500/20 hover:to-purple-500/20'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          mobile && 'w-full'
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        <span className={cn(!sidebarOpen && !mobile && 'hidden')}>{item.title}</span>
        {showBadge && sidebarOpen && (
          <Badge variant="destructive" className="ml-auto h-5 px-1.5 text-xs">
            {unreadNotifications > 9 ? '9+' : unreadNotifications}
          </Badge>
        )}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r bg-background transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600" />
            {sidebarOpen && (
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AutoMarket
              </span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="hidden lg:flex"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {/* Token Widget - For ALL users */}
        <div className="px-3 py-3 border-b">
          {sidebarOpen ? (
            <TokenWidget compact showActions={false} />
          ) : (
            <Link href="/dashboard/tokens">
              <div className="flex items-center justify-center h-10 w-10 mx-auto rounded-lg bg-gradient-to-br from-amber-400 to-orange-500">
                <Coins className="h-5 w-5 text-white" />
              </div>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-3">
            {allMenuItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
        </ScrollArea>

        {/* Quick Actions (only when expanded) */}
        {sidebarOpen && (
          <div className="px-3 py-3 border-t">
            <QuickActionsCompact />
          </div>
        )}

        {/* User Profile */}
        <div className="border-t p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start gap-3',
                  !sidebarOpen && 'justify-center px-2'
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback>
                    {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                {sidebarOpen && (
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium truncate max-w-[140px]">
                      {profile?.full_name || 'User'}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {profile?.role || 'buyer'}
                    </span>
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Pengaturan
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/kyc">
                  <Shield className="mr-2 h-4 w-4" />
                  Verifikasi KYC
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/tokens">
                  <Coins className="mr-2 h-4 w-4" />
                  Token Saya
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/wallet">
                  <Wallet className="mr-2 h-4 w-4" />
                  Wallet
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 lg:hidden">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600" />
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AutoMarket
                </span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {/* Token Widget - Mobile */}
            <div className="px-4 py-3 border-b">
              <TokenWidget compact showActions={false} />
            </div>

            <nav className="space-y-1 p-3">
              {allMenuItems.map((item) => (
                <NavLink key={item.href} item={item} mobile />
              ))}
            </nav>
            
            <div className="border-t p-3">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-destructive"
                onClick={handleSignOut}
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600" />
          <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            AutoMarket
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <TokenBadge />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback>
                    {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={cn(
          'min-h-screen transition-all duration-300',
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-16',
          'pt-16 lg:pt-0'
        )}
      >
        <div className="container mx-auto p-4 lg:p-6">
          {/* Page Header */}
          {(title || description) && (
            <div className="mb-6">
              {title && <h1 className="text-2xl font-bold">{title}</h1>}
              {description && (
                <p className="text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          )}

          {/* Page Content */}
          {children}
        </div>
      </main>
    </div>
  )
}
