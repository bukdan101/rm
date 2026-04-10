'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Server, CheckCircle2, XCircle, Clock, Activity,
  ChevronDown, ChevronUp, Users, Car, MessageSquare, 
  ShoppingCart, Building2, Settings, Zap
} from 'lucide-react'
import { checkAllServices, type ServiceHealth, SERVICES } from '@/lib/api/client'
import { TOTAL_ENDPOINTS, SERVICE_INFO } from '@/lib/api/services'

const SERVICE_ICONS: Record<string, React.ReactNode> = {
  USER: <Users className="w-4 h-4" />,
  LISTING: <Car className="w-4 h-4" />,
  INTERACTION: <MessageSquare className="w-4 h-4" />,
  TRANSACTION: <ShoppingCart className="w-4 h-4" />,
  BUSINESS: <Building2 className="w-4 h-4" />,
  SYSTEM: <Settings className="w-4 h-4" />,
}

const SERVICE_COLORS: Record<string, string> = {
  USER: 'text-blue-500',
  LISTING: 'text-emerald-500',
  INTERACTION: 'text-amber-500',
  TRANSACTION: 'text-red-500',
  BUSINESS: 'text-purple-500',
  SYSTEM: 'text-cyan-500',
}

const SERVICE_BG: Record<string, string> = {
  USER: 'bg-blue-50 dark:bg-blue-950',
  LISTING: 'bg-emerald-50 dark:bg-emerald-950',
  INTERACTION: 'bg-amber-50 dark:bg-amber-950',
  TRANSACTION: 'bg-red-50 dark:bg-red-950',
  BUSINESS: 'bg-purple-50 dark:bg-purple-950',
  SYSTEM: 'bg-cyan-50 dark:bg-cyan-950',
}

export function MicroserviceStatus() {
  const [health, setHealth] = useState<ServiceHealth[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      const results = await checkAllServices()
      if (!cancelled) {
        setHealth(results)
        setLastChecked(new Date())
        setLoading(false)
      }
    }
    load()
    // Auto-refresh every 30s
    const interval = setInterval(load, 30000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  const healthyCount = health.filter(h => h.healthy).length
  const totalCount = health.length
  const allHealthy = healthyCount === totalCount

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
              <Server className="w-4 h-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">Microservice Gateway</CardTitle>
              <p className="text-xs text-muted-foreground">
                {allHealthy ? 'All services connected' : `${healthyCount}/${totalCount} services online`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge 
              variant={allHealthy ? 'default' : 'secondary'} 
              className={allHealthy ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'}
            >
              {allHealthy ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
              {allHealthy ? 'Online' : 'Partial'}
            </Badge>
            <button 
              onClick={() => setExpanded(!expanded)}
              className="p-1 hover:bg-gray-100 rounded transition"
            >
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Compact status bar */}
        <div className="flex gap-1.5 mb-3">
          {loading ? (
            <>
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-2 flex-1 rounded-full" />
              ))}
            </>
          ) : (
            health.map((h) => (
              <div
                key={h.service}
                className={`h-2 flex-1 rounded-full transition-all ${
                  h.healthy ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
                title={`${h.service}: ${h.healthy ? 'Online' : 'Offline'}`}
              />
            ))
          )}
        </div>

        {/* Expanded view */}
        {expanded && (
          <div className="space-y-2 pt-2 border-t">
            {loading ? (
              <>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </>
            ) : (
              <>
                {health.map((h) => (
                  <div
                    key={h.service}
                    className={`flex items-center justify-between p-2.5 rounded-lg ${SERVICE_BG[h.service]}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={SERVICE_COLORS[h.service]}>
                        {SERVICE_ICONS[h.service]}
                      </span>
                      <div>
                        <p className="text-xs font-medium">{SERVICE_INFO.find(s => s.key === h.service)?.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Port {h.port} &middot; {SERVICE_INFO.find(s => s.key === h.service)?.endpoints} endpoints
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {h.latency !== undefined && h.healthy && (
                        <span className="text-[10px] text-muted-foreground">
                          {h.latency}ms
                        </span>
                      )}
                      {h.healthy ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Summary */}
                <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    <span>{TOTAL_ENDPOINTS} total API endpoints across {totalCount} services</span>
                  </div>
                  {lastChecked && (
                    <span>
                      Updated {lastChecked.toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
