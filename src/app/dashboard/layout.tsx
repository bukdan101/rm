'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { TokenWidget, TokenBadge } from '@/components/dashboard/TokenWidget'
import { useAuth } from '@/hooks/useAuth'
import { useActiveOffers, useNotifications } from '@/hooks/useNotifications'
import { useRouter } from 'next/navigation'
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
  Bell,
  ChevronLeft,
  ChevronRight,
  Coins,
  Sparkles,
  User,
  HelpCircle,
  Zap,
  ClipboardCheck,
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

// Menu items for regular user (buyer/seller)
const userMenuItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Iklan Saya',
    href: '/dashboard/listings',
    icon: Car,
    badge: 'new',
  },
  {
    title: 'Buat Iklan',
    href: '/dashboard/listings/create',
    icon: PlusCircle,
    highlight: true,
  },
  {
    title: 'Inspeksi',
    href: '/dashboard/inspeksi',
    icon: ClipboardCheck,
    badge: 'AI',
  },
  {
    title: 'Penawaran Dealer',
    href: '/dashboard/offers',
    icon: Store,
    badgeKey: 'offers', // Dynamic badge key
  },
  {
    title: 'Pesan',
    href: '/dashboard/messages',
    icon: MessageSquare,
    badgeKey: 'messages',
  },
  {
    title: 'Favorit',
    href: '/dashboard/favorites',
    icon: Heart,
  },
  {
    title: 'AI Prediction',
    href: '/dashboard/predictions',
    icon: Sparkles,
  },
  {
    title: 'Token Saya',
    href: '/dashboard/tokens',
    icon: Coins,
  },
  {
    title: 'Verifikasi KYC',
    href: '/dashboard/kyc',
    icon: Shield,
  },
]

// Additional menu items for dealers
const dealerMenuItems = [
  {
    title: 'Dealer Dashboard',
    href: '/dealer/dashboard',
    icon: Store,
  },
  {
    title: 'Inventori',
    href: '/dealer/inventory',
    icon: Car,
  },
  {
    title: 'Dealer Marketplace',
    href: '/dealer/marketplace',
    icon: Zap,
  },
  {
    title: 'Statistik',
    href: '/dealer/stats',
    icon: BarChart3,
  },
  {
    title: 'Tim & Staf',
    href: '/dealer/team',
    icon: Users,
  },
  {
    title: 'Profil Dealer',
    href: '/dealer/profile',
    icon: Store,
  },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Fetch active offers count for badge
  const { newCount: newOffersCount } = useActiveOffers({ pollingInterval: 30000 })
  // Fetch notifications for messages badge
  const { unreadCount: unreadNotifications } = useNotifications({ pollingInterval: 30000 })
  
  const isDealer = profile?.role === 'dealer'
  const isAdmin = profile?.role === 'admin'
  
  // Dynamic badges based on real data
  const dynamicBadges: Record<string, number | string> = {
    offers: newOffersCount > 0 ? newOffersCount : '',
    messages: unreadNotifications > 0 ? unreadNotifications : '',
  }
  
  // Process menu items to inject dynamic badges
  const processedMenuItems = userMenuItems.map(item => ({
    ...item,
    badge: item.badgeKey && dynamicBadges[item.badgeKey] 
      ? dynamicBadges[item.badgeKey] 
      : item.badge
  }))
  
  const allMenuItems = isDealer ? [...processedMenuItems, ...dealerMenuItems] : processedMenuItems

  const handleSignOut = async () => {
    await signOut()
  }

  const NavLink = ({ item, mobile = false }: { item: typeof userMenuItems[0]; mobile?: boolean }) => {
    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
    
    return (
      <Link
        href={item.href}
        onClick={() => mobile && setMobileMenuOpen(false)}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          item.highlight && !isActive && 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400',
          mobile && 'w-full'
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        <span className={cn(!sidebarOpen && !mobile && 'hidden')}>{item.title}</span>
        {item.badge && (sidebarOpen || mobile) && (
          <Badge 
            variant={typeof item.badge === 'number' && item.badge > 0 ? 'default' : 'secondary'} 
            className={cn(
              'ml-auto text-xs',
              typeof item.badge === 'number' && item.badge > 0 && 'bg-red-500 text-white hover:bg-red-600'
            )}
          >
            {item.badge}
          </Badge>
        )}
      </Link>
    )
  }

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth?redirect=' + encodeURIComponent(pathname))
    }
  }, [loading, user, router, pathname])

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted" />
          <div className="h-4 w-32 bg-muted rounded" />
        </div>
      </div>
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
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Car className="h-5 w-5 text-white" />
            </div>
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

        {/* Token Widget in Sidebar */}
        {sidebarOpen && (
          <div className="px-3 py-3">
            <TokenWidget compact />
          </div>
        )}

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-2">
          <nav className="space-y-1">
            {allMenuItems.map((item) => (
              <NavLink key={item.href} item={item} />
            ))}
          </nav>
        </ScrollArea>

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
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
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
                <Link href="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  Profil
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
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Pengaturan
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
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <Car className="h-5 w-5 text-white" />
                </div>
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
            
            {/* Token Widget Mobile */}
            <div className="p-3">
              <TokenWidget compact />
            </div>
            
            <ScrollArea className="flex-1 px-3">
              <nav className="space-y-1">
                {allMenuItems.map((item) => (
                  <NavLink key={item.href} item={item} mobile />
                ))}
              </nav>
            </ScrollArea>
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
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <Car className="h-5 w-5 text-white" />
          </div>
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
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
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
          {children}
        </div>
      </main>
    </div>
  )
}
