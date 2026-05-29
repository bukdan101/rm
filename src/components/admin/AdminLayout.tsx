'use client'

import { ReactNode, useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  Users,
  Car,
  CreditCard,
  BarChart3,
  Settings,
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Coins,
  AlertTriangle,
  Activity,
  FileText,
  Ticket,
  Megaphone,
  Image,
  MessageSquare,
  FolderTree,
  Zap,
  DollarSign,
  ArrowDownCircle,
  Gift,
  HeadphonesIcon,
  FileCheck,
  ClipboardList,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Menu structure with categories
const menuCategories = [
  {
    title: 'Utama',
    items: [
      { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
      { title: 'Analitik', url: '/admin/analytics', icon: BarChart3 },
      { title: 'Log Aktivitas', url: '/admin/activity-logs', icon: Activity },
    ],
  },
  {
    title: 'Manajemen Pengguna',
    items: [
      { title: 'Pengguna', url: '/admin/users', icon: Users, badge: true },
      { title: 'Verifikasi KYC', url: '/admin/kyc', icon: FileCheck, badge: true },
    ],
  },
  {
    title: 'Marketplace',
    items: [
      { title: 'Iklan', url: '/admin/listings', icon: Car },
      { title: 'Laporan', url: '/admin/reports', icon: AlertTriangle, badge: true },
      { title: 'Pesanan', url: '/admin/orders', icon: ClipboardList },
    ],
  },
  {
    title: 'Keuangan',
    items: [
      { title: 'Penarikan', url: '/admin/withdrawals', icon: ArrowDownCircle, badge: true },
      { title: 'Kredit', url: '/admin/credits', icon: Coins },
      { title: 'Topup Request', url: '/admin/topup', icon: DollarSign, badge: true },
      { title: 'Kupon', url: '/admin/coupons', icon: Gift },
    ],
  },
  {
    title: 'Promosi',
    items: [
      { title: 'Banner', url: '/admin/banners', icon: Image },
      { title: 'Boost Settings', url: '/admin/boost-settings', icon: Zap },
      { title: 'Broadcast', url: '/admin/broadcasts', icon: Megaphone },
    ],
  },
  {
    title: 'Support',
    items: [
      { title: 'Tiket Support', url: '/admin/tickets', icon: HeadphonesIcon, badge: true },
    ],
  },
  {
    title: 'Pengaturan',
    items: [
      { title: 'Settings', url: '/admin/settings', icon: Settings },
      { title: 'Kategori', url: '/admin/categories', icon: FolderTree },
    ],
  },
]

function Logo({ size = 'md', showText = true }: { size?: 'sm' | 'md' | 'lg'; showText?: boolean }) {
  const sizes = {
    sm: { icon: 'h-6 w-6', text: 'text-sm' },
    md: { icon: 'h-8 w-8', text: 'text-lg' },
    lg: { icon: 'h-10 w-10', text: 'text-xl' },
  }

  return (
    <Link href="/admin" className="flex items-center gap-2">
      <div
        className={cn(
          'rounded-lg bg-gradient-to-br from-red-600 via-orange-600 to-amber-600 flex items-center justify-center',
          sizes[size].icon
        )}
      >
        <Shield className="text-white h-3/5 w-3/5" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span
            className={cn(
              'font-bold bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 bg-clip-text text-transparent',
              sizes[size].text
            )}
          >
            Admin Panel
          </span>
        </div>
      )}
    </Link>
  )
}

function AdminSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { state, toggleSidebar } = useSidebar()
  const { signOut, user, profile } = useAuth()
  const [pendingCounts, setPendingCounts] = useState({
    users: 0,
    kyc: 0,
    reports: 0,
    withdrawals: 0,
    topup: 0,
    tickets: 0,
  })

  const isCollapsed = state === 'collapsed'

  useEffect(() => {
    const fetchPendingCounts = async () => {
      try {
        const res = await fetch('/api/admin/stats')
        const data = await res.json()
        if (data.success) {
          setPendingCounts({
            users: data.data?.pendingUsers || 0,
            kyc: data.data?.pendingKyc || 0,
            reports: data.data?.pendingReports || 0,
            withdrawals: data.data?.pendingWithdrawals || 0,
            topup: data.data?.pendingTopup || 0,
            tickets: data.data?.openTickets || 0,
          })
        }
      } catch (error) {
        console.error('Error fetching pending counts:', error)
      }
    }
    
    fetchPendingCounts()
  }, [])

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(path)
  }

  const getBadgeCount = (title: string) => {
    switch (title) {
      case 'Pengguna': return pendingCounts.users
      case 'Verifikasi KYC': return pendingCounts.kyc
      case 'Laporan': return pendingCounts.reports
      case 'Penarikan': return pendingCounts.withdrawals
      case 'Topup Request': return pendingCounts.topup
      case 'Tiket Support': return pendingCounts.tickets
      default: return 0
    }
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-gray-800 bg-gray-950">
      <SidebarHeader className="border-b border-gray-800 p-4 bg-gray-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={!isCollapsed} />
          </div>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white hover:from-red-700 hover:via-orange-700 hover:to-amber-700"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
        {isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8 mt-2 mx-auto bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white hover:from-red-700 hover:via-orange-700 hover:to-amber-700"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </SidebarHeader>

      <SidebarContent className="bg-gray-950 overflow-y-auto">
        {/* Admin Badge */}
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-2 py-3">
              <div className={cn(
                "flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-red-600/20 via-orange-600/20 to-amber-600/20 border border-orange-600/30",
                isCollapsed && "justify-center"
              )}>
                <Shield className="h-5 w-5 text-orange-500" />
                {!isCollapsed && (
                  <div>
                    <p className="text-sm font-medium text-orange-400">Administrator</p>
                    <p className="text-xs text-gray-500">Full Access</p>
                  </div>
                )}
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Menu Categories */}
        {menuCategories.map((category) => (
          <SidebarGroup key={category.title}>
            <SidebarGroupLabel className="text-gray-500 text-xs">{category.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {category.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={isCollapsed ? item.title : undefined}
                      className={cn(
                        isActive(item.url)
                          ? 'bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white hover:from-red-700 hover:via-orange-700 hover:to-amber-700'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      )}
                    >
                      <Link href={item.url} className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                        {item.badge && getBadgeCount(item.title) > 0 && !isCollapsed && (
                          <Badge variant="destructive" className="ml-auto text-xs">
                            {getBadgeCount(item.title)}
                          </Badge>
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 text-xs">Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={isCollapsed ? 'Go to Dashboard' : undefined}
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <Link href="/dashboard" className="flex items-center gap-3">
                    <LayoutDashboard className="h-4 w-4" />
                    {!isCollapsed && <span>User Dashboard</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-800 p-2 bg-gray-950">
        <div className="flex items-center gap-2 p-2 mb-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || ''} />
            <AvatarFallback className="bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs">
              {profile?.full_name?.[0]?.toUpperCase() || 'A'}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile?.full_name || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            'text-red-400 hover:text-red-300 hover:bg-red-950/30 w-full transition-all',
            isCollapsed ? 'justify-center px-2' : 'justify-start'
          )}
          title={isCollapsed ? 'Keluar' : undefined}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Keluar</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}

interface AdminLayoutProps {
  children: ReactNode
  title?: string
  description?: string
}

export function AdminLayout({ children, title, description }: AdminLayoutProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      router.push('/auth')
    }
  }, [user, profile, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="space-y-4 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto" />
          <p className="text-sm text-gray-400">Memuat Admin Panel...</p>
        </div>
      </div>
    )
  }

  if (!user || profile?.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="space-y-4 text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto" />
          <p className="text-lg font-medium text-white">Access Denied</p>
          <p className="text-sm text-gray-400">Anda tidak memiliki akses ke halaman ini</p>
        </div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-900">
        <AdminSidebar />
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-gray-800 bg-gray-950/95 backdrop-blur px-6">
            <SidebarTrigger className="-ml-1 text-gray-400" />
            {title && (
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white">{title}</h1>
                {description && (
                  <p className="text-sm text-gray-400">{description}</p>
                )}
              </div>
            )}
          </header>
          <main className="flex-1 p-6 md:p-8">
            <div className="mx-auto max-w-7xl space-y-8">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
