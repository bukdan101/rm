'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import {
  Database, CheckCircle, XCircle, AlertCircle, RefreshCw,
  Server, Key, Link2, Table, FileCode, ExternalLink
} from 'lucide-react'

interface DbStatus {
  timestamp: string
  connection: {
    status: string
    message: string
  }
  envCheck: {
    hasSupabaseUrl: boolean
    hasSupabaseKey: boolean
    supabaseUrl: string
  }
  tables: {
    existing: string[]
    missing: string[]
    byCategory: Record<string, { exists: string[], missing: string[] }>
  }
  stats: {
    totalRequired: number
    totalExisting: number
    totalMissing: number
    percentageComplete: number
  }
  recommendations: string[]
}

export default function DbStatusPage() {
  const [status, setStatus] = useState<DbStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/db-check')
      const data = await res.json()
      setStatus(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch database status')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" />
              Database Status
            </h1>
            <p className="text-muted-foreground mt-1">
              Check database connection and table status
            </p>
          </div>
          <Button onClick={fetchStatus} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {loading && !status && (
          <Card className="mb-6">
            <CardContent className="py-12 text-center">
              <RefreshCw className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
              <p className="text-muted-foreground">Checking database connection...</p>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="py-6">
              <div className="flex items-center gap-3 text-red-600">
                <XCircle className="h-6 w-6" />
                <div>
                  <p className="font-semibold">Error</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {status && (
          <>
            {/* Connection Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Connection Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Server className="h-5 w-5" />
                    Connection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status.connection.status)}
                    <Badge variant={status.connection.status === 'connected' ? 'default' : 'destructive'}>
                      {status.connection.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    {status.connection.message}
                  </p>
                </CardContent>
              </Card>

              {/* Environment Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Key className="h-5 w-5" />
                    Environment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">SUPABASE_URL</span>
                      {status.envCheck.hasSupabaseUrl ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">SUPABASE_KEY</span>
                      {status.envCheck.hasSupabaseKey ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {status.envCheck.supabaseUrl}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Table className="h-5 w-5" />
                    Tables
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Complete</span>
                      <span className="font-bold">{status.stats.percentageComplete}%</span>
                    </div>
                    <Progress 
                      value={status.stats.percentageComplete} 
                      className="h-2"
                    />
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <p className="font-bold text-lg">{status.stats.totalRequired}</p>
                        <p className="text-muted-foreground">Required</p>
                      </div>
                      <div>
                        <p className="font-bold text-lg text-green-600">{status.stats.totalExisting}</p>
                        <p className="text-muted-foreground">Exist</p>
                      </div>
                      <div>
                        <p className="font-bold text-lg text-red-600">{status.stats.totalMissing}</p>
                        <p className="text-muted-foreground">Missing</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tables by Category */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Tables by Category</CardTitle>
                <CardDescription>
                  Detailed status of each table category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(status.tables.byCategory).map(([category, tables]) => (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold capitalize">{category}</h4>
                        <Badge variant="outline">
                          {tables.exists.length}/{tables.exists.length + tables.missing.length}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Existing Tables */}
                        {tables.exists.length > 0 && (
                          <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
                            <p className="text-xs font-medium text-green-700 dark:text-green-400 mb-2">
                              Exists ({tables.exists.length})
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {tables.exists.map(table => (
                                <Badge key={table} variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {table}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Missing Tables */}
                        {tables.missing.length > 0 && (
                          <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3">
                            <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-2">
                              Missing ({tables.missing.length})
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {tables.missing.map(table => (
                                <Badge key={table} variant="secondary" className="text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  {table}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <Separator className="mt-4" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {status.recommendations.map((rec, i) => (
                    <li key={i} className={`text-sm ${rec.startsWith('  -') ? 'ml-4 font-mono text-xs' : ''}`}>
                      {rec.startsWith('All required') ? (
                        <span className="text-green-600 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          {rec}
                        </span>
                      ) : rec.startsWith('  -') ? (
                        <code className="bg-muted px-1 rounded">{rec}</code>
                      ) : (
                        <span className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-yellow-500" />
                          {rec}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>

                {status.stats.totalMissing > 0 && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-semibold mb-2">Quick Setup</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Run these SQL files in your Supabase SQL Editor:
                    </p>
                    <ol className="list-decimal list-inside text-sm space-y-1">
                      <li>
                        <code className="bg-background px-1 rounded">supabase/schema-complete.sql</code>
                      </li>
                      <li>
                        <code className="bg-background px-1 rounded">supabase/schema-credit-system.sql</code>
                      </li>
                      <li>
                        <code className="bg-background px-1 rounded">supabase/schema-kyc-extension.sql</code>
                      </li>
                    </ol>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      asChild
                    >
                      <a 
                        href="https://supabase.com/dashboard" 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Supabase Dashboard
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
