'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MicroserviceStatus } from '@/components/dashboard/MicroserviceStatus'
import { SERVICES, checkAllServices, type ServiceHealth } from '@/lib/api/client'
import { SERVICE_INFO, TOTAL_ENDPOINTS } from '@/lib/api/services'
import {
  Server, Database, Zap, ArrowDown,
  CheckCircle2, XCircle, Activity, Code,
  Box, Layers, Network
} from 'lucide-react'

const TECH_STACK = [
  { name: 'Go 1.22', icon: '🔷', desc: 'Backend Language' },
  { name: 'Fiber v3', icon: '⚡', desc: 'HTTP Framework' },
  { name: 'GORM', icon: '🗄️', desc: 'ORM' },
  { name: 'PostgreSQL 16', icon: '🐘', desc: 'Database' },
  { name: 'Redis 7', icon: '🔴', desc: 'Cache & Sessions' },
  { name: 'Docker', icon: '🐳', desc: 'Containerization' },
  { name: 'JWT + OAuth', icon: '🔐', desc: 'Authentication' },
  { name: 'WebSocket', icon: '🔗', desc: 'Real-time Chat' },
]

export function ArchitectureDashboard() {
  const [health, setHealth] = useState<ServiceHealth[]>([])
  const [expanded, setExpanded] = useState(true)

  useEffect(() => {
    checkAllServices().then(setHealth)
  }, [])

  const healthyCount = health.filter(h => h.healthy).length

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500">
            <Server className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-bold">Microservice Architecture</h1>
          <Badge variant="outline" className="text-purple-600 border-purple-300">
            v2.0
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          6 microservices &middot; {TOTAL_ENDPOINTS} API endpoints &middot; {healthyCount}/6 services online
        </p>
      </div>

      {/* Live Status */}
      <MicroserviceStatus />

      {/* Architecture Overview */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-500" />
            Service Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Visual Diagram */}
          <div className="relative">
            {/* Client Layer */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100 mb-4">
              <p className="text-xs font-medium text-purple-600 mb-2 flex items-center gap-1">
                <Box className="w-3 h-3" /> CLIENT LAYER
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">Next.js 16</Badge>
                <Badge variant="outline" className="text-xs">React 19</Badge>
                <Badge variant="outline" className="text-xs">TypeScript</Badge>
                <Badge variant="outline" className="text-xs">Tailwind CSS</Badge>
                <Badge variant="outline" className="text-xs">shadcn/ui</Badge>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center mb-4">
              <ArrowDown className="w-5 h-5 text-purple-400" />
            </div>

            {/* Gateway Layer */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100 mb-4">
              <p className="text-xs font-medium text-amber-600 mb-2 flex items-center gap-1">
                <Network className="w-3 h-3" /> API GATEWAY
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs bg-white">Caddy Reverse Proxy</Badge>
                <Badge variant="outline" className="text-xs bg-white">XTransformPort Routing</Badge>
                <Badge variant="outline" className="text-xs bg-white">JWT Auth Middleware</Badge>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center mb-4">
              <ArrowDown className="w-5 h-5 text-amber-400" />
            </div>

            {/* Microservices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SERVICE_INFO.map((service) => {
                const h = health.find(he => he.service === service.key)
                const isHealthy = h?.healthy ?? false
                return (
                  <div
                    key={service.key}
                    className={`rounded-xl border p-3 transition-all ${
                      isHealthy
                        ? 'border-emerald-200 bg-emerald-50/50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold">{service.name}</p>
                      {isHealthy ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mb-2">{service.description}</p>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground">Port {service.port}</span>
                      <Badge variant="secondary" className="text-[10px] h-5">
                        {service.endpoints} endpoints
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Arrow */}
            <div className="flex justify-center my-4">
              <ArrowDown className="w-5 h-5 text-gray-400" />
            </div>

            {/* Infrastructure */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-blue-500" />
                  <p className="text-xs font-medium text-blue-600">PostgreSQL 16</p>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  6 schemas &middot; 101+ tables &middot; UUID primary keys
                </p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 border border-red-100">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-red-500" />
                  <p className="text-xs font-medium text-red-600">Redis 7</p>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Session cache &middot; Rate limiting &middot; Pub/Sub
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Code className="w-4 h-4 text-emerald-500" />
            Technology Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TECH_STACK.map(tech => (
              <div key={tech.name} className="text-center p-3 rounded-lg border hover:border-purple-200 transition">
                <span className="text-2xl mb-1 block">{tech.icon}</span>
                <p className="text-xs font-semibold">{tech.name}</p>
                <p className="text-[10px] text-muted-foreground">{tech.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Database Schema Info */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-500" />
            Database Schema Design
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { schema: 'user_schema', tables: 12, color: 'bg-blue-500' },
              { schema: 'listing_schema', tables: 18, color: 'bg-emerald-500' },
              { schema: 'interaction_schema', tables: 10, color: 'bg-amber-500' },
              { schema: 'transaction_schema', tables: 15, color: 'bg-red-500' },
              { schema: 'business_schema', tables: 22, color: 'bg-purple-500' },
              { schema: 'system_schema', tables: 14, color: 'bg-cyan-500' },
            ].map(s => (
              <div key={s.schema} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${s.color}`} />
                <span className="text-xs font-medium w-40">{s.schema}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${s.color}`}
                    style={{ width: `${(s.tables / 22) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-16 text-right">{s.tables} tables</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground border-t mt-2">
              <span>Total: 101+ tables</span>
              <span>No Foreign Keys (UUID string refs only)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Endpoints Summary */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-500" />
            API Endpoints Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium">Service</th>
                  <th className="text-left py-2 pr-4 font-medium">Port</th>
                  <th className="text-center py-2 px-2 font-medium">Public</th>
                  <th className="text-center py-2 px-2 font-medium">Auth</th>
                  <th className="text-center py-2 px-2 font-medium">Admin</th>
                  <th className="text-right py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'User Service', port: 8001, pub: 3, auth: 10, admin: 4 },
                  { name: 'Listing Service', port: 8002, pub: 10, auth: 6, admin: 0 },
                  { name: 'Interaction Service', port: 8003, pub: 4, auth: 8, admin: 3 },
                  { name: 'Transaction Service', port: 8004, pub: 4, auth: 9, admin: 12 },
                  { name: 'Business Service', port: 8005, pub: 5, auth: 14, admin: 12 },
                  { name: 'System Service', port: 8006, pub: 7, auth: 8, admin: 10 },
                ].map(row => (
                  <tr key={row.port} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{row.name}</td>
                    <td className="py-2 pr-4 text-muted-foreground">:{row.port}</td>
                    <td className="py-2 px-2 text-center text-emerald-600">{row.pub}</td>
                    <td className="py-2 px-2 text-center text-amber-600">{row.auth}</td>
                    <td className="py-2 px-2 text-center text-red-600">{row.admin}</td>
                    <td className="py-2 text-right font-semibold">{row.pub + row.auth + row.admin}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td className="pt-2">Total</td>
                  <td />
                  <td className="pt-2 text-center text-emerald-600">33</td>
                  <td className="pt-2 text-center text-amber-600">55</td>
                  <td className="pt-2 text-center text-red-600">41</td>
                  <td className="pt-2 text-right">{TOTAL_ENDPOINTS}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Migration Status */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-blue-50">
        <CardContent className="p-6">
          <h3 className="text-sm font-semibold mb-3">Frontend Migration Status</h3>
          <div className="space-y-2">
            {[
              { step: 'API Gateway Client', status: 'done', desc: 'Dual-mode: microservice + demo fallback' },
              { step: 'Service Layer', status: 'done', desc: '6 service modules with typed interfaces' },
              { step: 'Proxy Routes', status: 'done', desc: '/api/v1/[...path] catch-all proxy' },
              { step: 'Marketplace Browser', status: 'done', desc: 'Full browse with filters, sort, pagination' },
              { step: 'Dealers Directory', status: 'done', desc: 'Dealer cards with search and stats' },
              { step: 'Architecture Dashboard', status: 'done', desc: 'Live service status and endpoint mapping' },
              { step: 'Auth Migration', status: 'in_progress', desc: 'Zustand store + JWT token management' },
              { step: 'WebSocket Chat', status: 'pending', desc: 'Real-time chat via system-service' },
              { step: 'GraphQL Gateway', status: 'pending', desc: 'Unified GraphQL API gateway (Phase 2)' },
            ].map(item => (
              <div key={item.step} className="flex items-center gap-3 text-xs">
                {item.status === 'done' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : item.status === 'in_progress' ? (
                  <Activity className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 shrink-0" />
                )}
                <div className="flex-1">
                  <span className="font-medium">{item.step}</span>
                  <span className="text-muted-foreground ml-2">{item.desc}</span>
                </div>
                <Badge
                  variant={item.status === 'done' ? 'default' : item.status === 'in_progress' ? 'secondary' : 'outline'}
                  className={item.status === 'done' ? 'bg-emerald-500 text-xs' : 'text-xs'}
                >
                  {item.status === 'done' ? 'Done' : item.status === 'in_progress' ? 'In Progress' : 'Pending'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
