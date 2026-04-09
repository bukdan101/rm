'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MainLayout } from '@/components/layout/MainLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  User, 
  Store, 
  ArrowRight, 
  CheckCircle2, 
  Circle, 
  Clock,
  Coins,
  Eye,
  MessageSquare,
  Handshake,
  XCircle,
  AlertCircle,
  Shield,
  CreditCard,
  TrendingUp,
  Zap,
  Car,
  ArrowLeft
} from 'lucide-react'

// Workflow Steps Component
function WorkflowStep({ 
  step, 
  title, 
  description, 
  status,
  details 
}: { 
  step: number
  title: string
  description: string
  status: 'completed' | 'active' | 'pending'
  details?: string[]
}) {
  const statusIcons = {
    completed: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    active: <Clock className="h-5 w-5 text-blue-500 animate-pulse" />,
    pending: <Circle className="h-5 w-5 text-muted-foreground" />
  }

  const statusColors = {
    completed: 'border-emerald-200 bg-emerald-50',
    active: 'border-blue-200 bg-blue-50',
    pending: 'border-gray-200 bg-gray-50'
  }

  return (
    <div className={`relative p-4 rounded-lg border-2 transition-all ${statusColors[status]}`}>
      <div className="flex items-start gap-4">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2">
            {statusIcons[status]}
          </div>
          {step < 6 && (
            <div className="w-0.5 h-8 bg-gray-200 mt-2" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">{title}</h4>
            <Badge variant={status === 'completed' ? 'default' : 'secondary'}>
              Step {step}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
          {details && details.length > 0 && (
            <ul className="mt-2 space-y-1">
              {details.map((detail, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                  {detail}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

// Token Cost Card
function TokenCostCard({
  title,
  cost,
  features,
  recommended = false
}: {
  title: string
  cost: number
  features: string[]
  recommended?: boolean
}) {
  return (
    <Card className={`relative ${recommended ? 'border-blue-300 ring-2 ring-blue-100' : ''}`}>
      {recommended && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-blue-500">Recommended</Badge>
        </div>
      )}
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="flex items-center justify-center gap-1 mt-2">
          <Coins className="h-5 w-5 text-amber-500" />
          <span className="text-2xl font-bold">{cost}</span>
          <span className="text-muted-foreground">Token</span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

// Mode Card
function ModeCard({
  mode,
  title,
  description,
  status,
  features,
  icon: Icon
}: {
  mode: string
  title: string
  description: string
  status: 'active' | 'coming-soon'
  features: string[]
  icon: React.ElementType
}) {
  return (
    <Card className={`h-full ${status === 'active' ? 'border-emerald-200' : 'opacity-60'}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${status === 'active' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
              <Icon className={`h-5 w-5 ${status === 'active' ? 'text-emerald-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <p className="text-xs text-muted-foreground">Mode {mode}</p>
            </div>
          </div>
          <Badge variant={status === 'active' ? 'default' : 'secondary'}>
            {status === 'active' ? 'Aktif' : 'Segera Hadir'}
          </Badge>
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

export default function DealerMarketplacePage() {
  const [activeTab, setActiveTab] = useState('workflow')

  return (
    <MainLayout>
      <main className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>

          {/* Header */}
          <div className="text-center mb-8">
            <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-blue-500">Dealer Marketplace</Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">
              Workflow Penjualan User → Dealer
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Sistem penjualan mobil dari User ke Dealer melalui marketplace AutoMarket. 
              Pilih marketplace yang sesuai, dapatkan penawaran dari dealer terpercaya.
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
              <TabsTrigger value="modes">Mode Jual</TabsTrigger>
              <TabsTrigger value="tokens">Token</TabsTrigger>
              <TabsTrigger value="settings">Pengaturan</TabsTrigger>
            </TabsList>

            {/* Workflow Tab */}
            <TabsContent value="workflow" className="space-y-6">
              {/* Flow Diagram */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Alur Penjualan User → Dealer
                  </CardTitle>
                  <CardDescription>
                    Proses lengkap dari listing hingga transaksi selesai
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-muted/30 rounded-lg">
                    <div className="flex flex-col items-center">
                      <div className="p-3 rounded-full bg-blue-100">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium mt-2">User</p>
                      <p className="text-xs text-muted-foreground">Penjual</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-gray-400 hidden md:block" />
                      <div className="flex flex-col items-center">
                        <div className="p-2 rounded-lg bg-amber-100">
                          <Coins className="h-5 w-5 text-amber-600" />
                        </div>
                        <p className="text-xs mt-1">1-3 Token</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 hidden md:block" />
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="p-3 rounded-full bg-purple-100">
                        <Store className="h-6 w-6 text-purple-600" />
                      </div>
                      <p className="text-sm font-medium mt-2">Dealer</p>
                      <p className="text-xs text-muted-foreground">Pembeli</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-gray-400 hidden md:block" />
                      <div className="flex flex-col items-center">
                        <div className="p-2 rounded-lg bg-emerald-100">
                          <Handshake className="h-5 w-5 text-emerald-600" />
                        </div>
                        <p className="text-xs mt-1">Deal</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-400 hidden md:block" />
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="p-3 rounded-full bg-emerald-100">
                        <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                      </div>
                      <p className="text-sm font-medium mt-2">Selesai</p>
                      <p className="text-xs text-muted-foreground">Transaksi</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Detailed Steps */}
              <Card>
                <CardHeader>
                  <CardTitle>Langkah-Langkah Detail</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-0">
                    <WorkflowStep
                      step={1}
                      title="User Membuat Listing"
                      description="User membuat listing mobil dengan prediksi harga AI"
                      status="completed"
                      details={[
                        'Input data mobil (merk, model, tahun, kondisi)',
                        'AI memberikan estimasi harga pasar',
                        'User menentukan harga jual'
                      ]}
                    />
                    <WorkflowStep
                      step={2}
                      title="Pilih Marketplace"
                      description="User memilih marketplace untuk mempublikasikan listing"
                      status="active"
                      details={[
                        'Public Marketplace (1 Token) - 30 hari',
                        'Dealer Marketplace (2 Token) - 7 hari',
                        'Keduanya (3 Token) - kombinasi'
                      ]}
                    />
                    <WorkflowStep
                      step={3}
                      title="Dealer Melihat & Ajukan Penawaran"
                      description="Dealer yang tertarik mengajukan penawaran"
                      status="pending"
                      details={[
                        'Dealer browse listing di marketplace',
                        'Dealer ajukan harga penawaran',
                        'User menerima notifikasi penawaran'
                      ]}
                    />
                    <WorkflowStep
                      step={4}
                      title="Negosiasi (Opsional)"
                      description="Proses tawar-menawar antara User dan Dealer"
                      status="pending"
                      details={[
                        'Counter offer dari user atau dealer',
                        'Chat langsung untuk negosiasi',
                        'Persetujuan harga final'
                      ]}
                    />
                    <WorkflowStep
                      step={5}
                      title="Inspeksi (Opsional)"
                      description="Pemeriksaan kondisi mobil jika diperlukan"
                      status="pending"
                      details={[
                        'Inspeksi 160 titik oleh tim profesional',
                        'Biaya ditanggung user (opsional)',
                        'Hasil inspeksi meningkatkan kepercayaan'
                      ]}
                    />
                    <WorkflowStep
                      step={6}
                      title="Transaksi Selesai"
                      description="Deal final dan proses penjualan selesai"
                      status="pending"
                      details={[
                        'Pembayaran dari dealer ke platform',
                        'Platform teruskan ke user (potong komisi)',
                        'Komisi: GRATIS (promo periode awal)'
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Modes Tab */}
            <TabsContent value="modes" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ModeCard
                  mode="A"
                  title="Bidding System"
                  description="Sistem lelang dimana dealer saling bidding"
                  status="coming-soon"
                  features={[
                    'Multiple dealer bisa bid',
                    'Timer countdown',
                    'Highest bidder wins',
                    'Minimal bid increment'
                  ]}
                  icon={Zap}
                />
                <ModeCard
                  mode="B"
                  title="Best Offer"
                  description="User pilih penawaran terbaik dari dealer"
                  status="coming-soon"
                  features={[
                    'Dealer submit offer',
                    'User review semua penawaran',
                    'Deadline untuk memilih',
                    'Negosiasi langsung'
                  ]}
                  icon={TrendingUp}
                />
                <ModeCard
                  mode="C"
                  title="Direct Deal"
                  description="Transaksi langsung antara user dan dealer"
                  status="active"
                  features={[
                    'Dealer ajukan penawaran',
                    'Negosiasi 1-on-1',
                    'Proses cepat',
                    'Deal atau tidak'
                  ]}
                  icon={Handshake}
                />
              </div>

              {/* Status Legend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Status Offer</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" /> Pending
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Eye className="h-3 w-3" /> Viewed
                    </Badge>
                    <Badge variant="default" className="gap-1">
                      <MessageSquare className="h-3 w-3" /> Negotiating
                    </Badge>
                    <Badge variant="default" className="gap-1 bg-emerald-500">
                      <CheckCircle2 className="h-3 w-3" /> Accepted
                    </Badge>
                    <Badge variant="destructive" className="gap-1">
                      <XCircle className="h-3 w-3" /> Rejected
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" /> Expired
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tokens Tab */}
            <TabsContent value="tokens" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-amber-500" />
                    Biaya Token per Marketplace
                  </CardTitle>
                  <CardDescription>
                    User memilih salah satu atau kedua marketplace
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TokenCostCard
                      title="Public Marketplace"
                      cost={1}
                      features={[
                        'Tampil di Public Marketplace',
                        'Durasi 30 hari',
                        'Semua user bisa lihat',
                        'Chat langsung dengan pembeli'
                      ]}
                    />
                    <TokenCostCard
                      title="Dealer Marketplace"
                      cost={2}
                      features={[
                        'Tampil khusus untuk Dealer',
                        'Durasi 7 hari',
                        'Dealer verified only',
                        'Penawaran profesional'
                      ]}
                      recommended
                    />
                    <TokenCostCard
                      title="Keduanya"
                      cost={3}
                      features={[
                        'Tampil di semua marketplace',
                        'Public: 30 hari',
                        'Dealer: 7 hari',
                        'Maksimal eksposur'
                      ]}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Commission Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Komisi Platform
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="p-3 rounded-full bg-emerald-100">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-800">GRATIS - Promo Periode Awal</p>
                      <p className="text-sm text-emerald-600">
                        Tidak ada potongan komisi untuk transaksi User-Dealer selama periode promo
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    * Setelah periode promo, komisi akan diterapkan dari sisi User (persentase dari transaksi)
                  </p>
                </CardContent>
              </Card>

              {/* Inspection Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Inspeksi (Opsional)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium mb-2">Biaya</p>
                      <p className="text-2xl font-bold">User Tanggung</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Biaya inspeksi dibayar oleh User (opsional)
                      </p>
                    </div>
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="font-medium mb-2">Benefit</p>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Inspeksi 160 titik
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Rating kondisi mobil
                        </li>
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          Tingkatkan kepercayaan dealer
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Pengaturan Admin
                  </CardTitle>
                  <CardDescription>
                    Konfigurasi dealer marketplace yang bisa diubah oleh Admin
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Token Public Marketplace</p>
                          <p className="text-sm text-muted-foreground">Biaya untuk publish di public marketplace</p>
                        </div>
                        <Badge variant="outline" className="text-lg">1 Token</Badge>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Token Dealer Marketplace</p>
                          <p className="text-sm text-muted-foreground">Biaya untuk publish di dealer marketplace</p>
                        </div>
                        <Badge variant="outline" className="text-lg">2 Token</Badge>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Durasi Dealer Listing</p>
                          <p className="text-sm text-muted-foreground">Masa aktif listing di dealer marketplace</p>
                        </div>
                        <Badge variant="outline" className="text-lg">7 Hari</Badge>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Durasi Public Listing</p>
                          <p className="text-sm text-muted-foreground">Masa aktif listing di public marketplace</p>
                        </div>
                        <Badge variant="outline" className="text-lg">30 Hari</Badge>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Inspeksi Wajib</p>
                          <p className="text-sm text-muted-foreground">Apakah inspeksi wajib sebelum jual ke dealer</p>
                        </div>
                        <Badge variant="secondary">Opsional</Badge>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Komisi Platform</p>
                          <p className="text-sm text-muted-foreground">Persentase potongan dari transaksi</p>
                        </div>
                        <Badge variant="default" className="bg-emerald-500">GRATIS</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* CTA */}
          <div className="mt-8 text-center">
            <Link href="/auth">
              <Button size="lg" className="gap-2">
                <Car className="h-5 w-5" />
                Mulai Jual Mobil Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </MainLayout>
  )
}
