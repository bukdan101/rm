'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Database, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

interface DbStatus {
  config?: {
    hasSupabaseUrl: boolean
    hasSupabaseAnonKey: boolean
    hasSupabaseServiceKey: boolean
    supabaseUrlValue: string
  }
  profiles_table?: { exists: boolean; error: string | null }
  user_settings_table?: { exists: boolean; error: string | null; columns?: string[] }
  wallets_table?: { exists: boolean; error: string | null; columns?: string[] }
  credit_packages_table?: { exists: boolean; error: string | null; data?: unknown[] }
  car_listings_table?: { exists: boolean; error: string | null; count?: number }
  dealers_table?: { exists: boolean; error: string | null; count?: number }
  brands_table?: { exists: boolean; error: string | null; data?: unknown[] }
  admin_client?: { available: boolean }
  fatalError?: string
}

export default function TestDbPage() {
  const [status, setStatus] = useState<DbStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStatus = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/test-db', { cache: 'no-store' })
      const data = await res.json()
      setStatus(data)
    } catch (error) {
      console.error('Error fetching DB status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const renderStatus = (exists: boolean | undefined, error: string | null | undefined) => {
    if (exists === undefined) return <Badge variant="outline">Checking...</Badge>
    if (exists) return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />OK</Badge>
    return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Database Status</h1>
          <p className="text-muted-foreground">Check Supabase connection and tables</p>
        </div>
        <Button onClick={fetchStatus} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p>Checking database...</p>
          </CardContent>
        </Card>
      ) : status ? (
        <div className="space-y-4">
          {/* Config Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5" />
                Supabase Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>SUPABASE_URL:</span>
                  {status.config?.hasSupabaseUrl ? 
                    <Badge className="bg-green-500">Set</Badge> : 
                    <Badge variant="destructive">NOT SET</Badge>
                  }
                </div>
                <div className="flex justify-between">
                  <span>ANON_KEY:</span>
                  {status.config?.hasSupabaseAnonKey ? 
                    <Badge className="bg-green-500">Set</Badge> : 
                    <Badge variant="destructive">NOT SET</Badge>
                  }
                </div>
                <div className="flex justify-between">
                  <span>SERVICE_KEY:</span>
                  {status.config?.hasSupabaseServiceKey ? 
                    <Badge className="bg-green-500">Set</Badge> : 
                    <Badge variant="destructive">NOT SET</Badge>
                  }
                </div>
                <div className="flex justify-between">
                  <span>URL Value:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {status.config?.supabaseUrlValue}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tables Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tables Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">profiles</p>
                    <p className="text-xs text-muted-foreground">User profiles</p>
                  </div>
                  {renderStatus(status.profiles_table?.exists, status.profiles_table?.error)}
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">user_settings</p>
                    <p className="text-xs text-muted-foreground">
                      Columns: {status.user_settings_table?.columns?.join(', ') || 'N/A'}
                    </p>
                  </div>
                  {renderStatus(status.user_settings_table?.exists, status.user_settings_table?.error)}
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">wallets</p>
                    <p className="text-xs text-muted-foreground">User wallets for tokens</p>
                  </div>
                  {renderStatus(status.wallets_table?.exists, status.wallets_table?.error)}
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">credit_packages</p>
                    <p className="text-xs text-muted-foreground">Token purchase packages</p>
                  </div>
                  {renderStatus(status.credit_packages_table?.exists, status.credit_packages_table?.error)}
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">car_listings</p>
                    <p className="text-xs text-muted-foreground">Count: {status.car_listings_table?.count || 0}</p>
                  </div>
                  {renderStatus(status.car_listings_table?.exists, status.car_listings_table?.error)}
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">dealers</p>
                    <p className="text-xs text-muted-foreground">Count: {status.dealers_table?.count || 0}</p>
                  </div>
                  {renderStatus(status.dealers_table?.exists, status.dealers_table?.error)}
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">brands</p>
                    <p className="text-xs text-muted-foreground">Car brands</p>
                  </div>
                  {renderStatus(status.brands_table?.exists, status.brands_table?.error)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Errors */}
          {(status.fatalError || Object.values(status).some((v: unknown) => v && typeof v === 'object' && 'error' in v && (v as {error?: string}).error)) && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-lg text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-destructive/10 p-4 rounded-lg overflow-auto max-h-60">
                  {JSON.stringify(status, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Raw Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Raw Response</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                {JSON.stringify(status, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <p>Failed to fetch database status</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
