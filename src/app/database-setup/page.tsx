import { Suspense } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Database, Play, CheckCircle, XCircle, Loader2, Car, Building, MapPin } from 'lucide-react'

async function DatabaseStatus() {
  let status = {
    connected: false,
    brands: 0,
    models: 0,
    listings: 0,
    images: 0,
    provinces: 0,
    cities: 0,
    error: null as string | null
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/db-status`, {
      cache: 'no-store'
    })
    const data = await res.json()
    status = { ...status, ...data }
  } catch (e) {
    status.error = String(e)
  }

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex items-center gap-3">
        {status.connected ? (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="w-3 h-3 mr-1" />
            Terhubung
          </Badge>
        ) : (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Tidak Terhubung
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{status.brands}</p>
                <p className="text-sm text-muted-foreground">Brands</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Car className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{status.models}</p>
                <p className="text-sm text-muted-foreground">Models</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Car className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{status.listings}</p>
                <p className="text-sm text-muted-foreground">Listings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Database className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{status.images}</p>
                <p className="text-sm text-muted-foreground">Images</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <MapPin className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{status.provinces}</p>
                <p className="text-sm text-muted-foreground">Provinces</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <MapPin className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{status.cities}</p>
                <p className="text-sm text-muted-foreground">Cities</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {status.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-4">
            <p className="text-red-600 text-sm">{status.error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default function DatabaseSetupPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Database Setup</h1>
          <p className="text-muted-foreground">
            Kelola database dan seed data untuk AutoMarket
          </p>
        </div>

        {/* Database Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Status Database
            </CardTitle>
            <CardDescription>
              Koneksi ke Supabase PostgreSQL
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Memeriksa database...</span>
              </div>
            }>
              <DatabaseStatus />
            </Suspense>
          </CardContent>
        </Card>

        {/* Seed Data */}
        <Card>
          <CardHeader>
            <CardTitle>Seed Data</CardTitle>
            <CardDescription>
              Tambahkan data sample mobil ke database
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Klik tombol di bawah untuk menambahkan:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>10 Brand mobil populer (Toyota, Honda, dll)</li>
              <li>50+ Model mobil</li>
              <li>30 Listing mobil sample</li>
              <li>Gambar untuk setiap listing</li>
              <li>Province dan City data</li>
            </ul>
            
            <Link href="/api/seed-data" target="_blank">
              <Button className="w-full" size="lg">
                <Play className="w-4 h-4 mr-2" />
                Jalankan Seed Data
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* SQL Schema */}
        <Card>
          <CardHeader>
            <CardTitle>SQL Schema</CardTitle>
            <CardDescription>
              Jalankan SQL schema di Supabase SQL Editor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
              <pre>{`-- 1. Jalankan di Supabase SQL Editor
-- File: supabase/part1-drop-all.sql
-- File: supabase/part2-full-72-tables.sql

-- Atau gunakan API seed data di atas
-- untuk insert data secara otomatis`}</pre>
            </div>
            
            <div className="flex gap-2">
              <Link href="/api/seed-data" target="_blank">
                <Button variant="outline">
                  <Play className="w-4 h-4 mr-2" />
                  API Seed Data
                </Button>
              </Link>
              <Link href="/">
                <Button variant="secondary">
                  Kembali ke Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-amber-50 border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-800">Petunjuk</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-amber-700 space-y-2">
            <p><strong>1. Pastikan database schema sudah dibuat</strong></p>
            <p>Jalankan SQL schema di Supabase SQL Editor</p>
            
            <p className="pt-2"><strong>2. Klik "Jalankan Seed Data"</strong></p>
            <p>Ini akan menambahkan sample data mobil ke database</p>
            
            <p className="pt-2"><strong>3. Refresh halaman home</strong></p>
            <p>Data mobil akan muncul di halaman utama</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
