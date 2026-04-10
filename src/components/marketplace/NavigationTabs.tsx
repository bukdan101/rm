'use client'

import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { Search, Car, Building2, Server, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { key: 'home', label: 'Home', icon: Home, href: '/' },
  { key: 'marketplace', label: 'Marketplace', icon: Car, href: '/?view=marketplace' },
  { key: 'dealers', label: 'Dealer', icon: Building2, href: '/?view=dealers' },
  { key: 'architecture', label: 'Architecture', icon: Server, href: '/?view=architecture' },
]

export function NavigationTabs() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const view = searchParams.get('view')

  const activeTab = view || 'home'

  const handleTabClick = (tab: typeof TABS[number]) => {
    if (tab.key === 'home') {
      router.push('/')
    } else {
      router.push(`/?view=${tab.key}`)
    }
  }

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2">
          {TABS.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                  isActive
                    ? 'bg-purple-100 text-purple-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
