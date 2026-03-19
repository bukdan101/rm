'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAuth } from '@/hooks/useAuth'
import {
  Store,
  MapPin,
  Phone,
  Mail,
  Globe,
  Instagram,
  Camera,
  Save,
  Edit,
  Shield,
  CheckCircle,
  Clock,
  Calendar,
  Users,
  Car,
  Star,
  Upload,
  Loader2,
} from 'lucide-react'

export default function DealerProfilePage() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [editMode, setEditMode] = useState(false)
  
  const [formData, setFormData] = useState({
    dealer_name: 'Auto Prima Jakarta',
    description: 'Dealer mobil terpercaya dengan pengalaman lebih dari 10 tahun. Menyediakan mobil berkualitas dengan harga kompetitif dan layanan after-sales terbaik.',
    phone: '021-7654321',
    whatsapp: '08123456789',
    email: 'info@autoprima.co.id',
    website: 'https://autoprima.co.id',
    instagram: '@autoprimajakarta',
    province: 'DKI Jakarta',
    city: 'Jakarta Selatan',
    address: 'Jl. Otomotif Raya No. 123, Kebayoran Baru',
    operating_hours: 'Sen-Sab: 09:00 - 18:00, Minggu: 10:00 - 16:00',
  })

  const handleSave = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setLoading(false)
    setEditMode(false)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Store className="h-6 w-6 text-purple-500" />
            Profil Dealer
          </h1>
          <p className="text-muted-foreground">
            Kelola informasi profil dealer Anda
          </p>
        </div>
        <Button
          variant={editMode ? 'default' : 'outline'}
          onClick={() => editMode ? handleSave() : setEditMode(true)}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : editMode ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Simpan Perubahan
            </>
          ) : (
            <>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profil
            </>
          )}
        </Button>
      </div>

      {/* Cover & Logo */}
      <Card className="overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 relative">
          <div className="absolute inset-0 bg-black/20" />
          {editMode && (
            <Button variant="secondary" size="sm" className="absolute top-4 right-4">
              <Camera className="h-4 w-4 mr-2" />
              Ganti Cover
            </Button>
          )}
        </div>
        <CardContent className="relative pt-0">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 relative z-10">
            <div className="relative">
              <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                <AvatarImage src="" />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl font-bold">
                  AP
                </AvatarFallback>
              </Avatar>
              {editMode && (
                <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow">
                  <Camera className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold">{formData.dealer_name}</h2>
                <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <Shield className="h-3 w-3 mr-1" />
                  Terverifikasi
                </Badge>
                <Badge variant="secondary">Premium Dealer</Badge>
              </div>
              <p className="text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {formData.city}, {formData.province}
              </p>
            </div>
            <div className="flex gap-2 pb-2">
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-1" />
                Hubungi
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dealer/auto-prima-jakarta" target="_blank">
                  Lihat Profil Publik
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dealer Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 text-center">
          <Car className="h-8 w-8 mx-auto text-purple-500 mb-2" />
          <p className="text-2xl font-bold">24</p>
          <p className="text-sm text-muted-foreground">Total Mobil</p>
        </Card>
        <Card className="p-4 text-center">
          <Users className="h-8 w-8 mx-auto text-blue-500 mb-2" />
          <p className="text-2xl font-bold">4</p>
          <p className="text-sm text-muted-foreground">Tim Staf</p>
        </Card>
        <Card className="p-4 text-center">
          <Star className="h-8 w-8 mx-auto text-amber-500 mb-2" />
          <p className="text-2xl font-bold">4.8</p>
          <p className="text-sm text-muted-foreground">Rating</p>
        </Card>
        <Card className="p-4 text-center">
          <Calendar className="h-8 w-8 mx-auto text-emerald-500 mb-2" />
          <p className="text-2xl font-bold">2021</p>
          <p className="text-sm text-muted-foreground">Bergabung</p>
        </Card>
      </div>

      {/* Main Info */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informasi Dasar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nama Dealer</Label>
              {editMode ? (
                <Input
                  value={formData.dealer_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, dealer_name: e.target.value }))}
                />
              ) : (
                <p className="font-medium">{formData.dealer_name}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              {editMode ? (
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                />
              ) : (
                <p className="text-sm text-muted-foreground">{formData.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Jam Operasional</Label>
              {editMode ? (
                <Input
                  value={formData.operating_hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, operating_hours: e.target.value }))}
                />
              ) : (
                <p className="text-sm text-muted-foreground">{formData.operating_hours}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kontak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Telepon</Label>
              {editMode ? (
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              ) : (
                <p className="text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {formData.phone}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>WhatsApp</Label>
              {editMode ? (
                <Input
                  value={formData.whatsapp}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                />
              ) : (
                <p className="text-sm flex items-center gap-2">
                  <Phone className="h-4 w-4 text-green-500" />
                  {formData.whatsapp}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              {editMode ? (
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              ) : (
                <p className="text-sm flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {formData.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Website</Label>
              {editMode ? (
                <Input
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                />
              ) : (
                <p className="text-sm flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href={formData.website} target="_blank" className="text-primary hover:underline">
                    {formData.website}
                  </a>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Instagram</Label>
              {editMode ? (
                <Input
                  value={formData.instagram}
                  onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                />
              ) : (
                <p className="text-sm flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-pink-500" />
                  {formData.instagram}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alamat</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Provinsi</Label>
              {editMode ? (
                <Select value={formData.province} onValueChange={(v) => setFormData(prev => ({ ...prev, province: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DKI Jakarta">DKI Jakarta</SelectItem>
                    <SelectItem value="Jawa Barat">Jawa Barat</SelectItem>
                    <SelectItem value="Jawa Tengah">Jawa Tengah</SelectItem>
                    <SelectItem value="Jawa Timur">Jawa Timur</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm">{formData.province}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Kota</Label>
              {editMode ? (
                <Select value={formData.city} onValueChange={(v) => setFormData(prev => ({ ...prev, city: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Jakarta Selatan">Jakarta Selatan</SelectItem>
                    <SelectItem value="Jakarta Pusat">Jakarta Pusat</SelectItem>
                    <SelectItem value="Jakarta Barat">Jakarta Barat</SelectItem>
                    <SelectItem value="Jakarta Timur">Jakarta Timur</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm">{formData.city}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Alamat Lengkap</Label>
            {editMode ? (
              <Textarea
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                rows={2}
              />
            ) : (
              <p className="text-sm text-muted-foreground">{formData.address}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Verification Status */}
      <Card className="border-emerald-200 dark:border-emerald-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-500" />
            Status Verifikasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="font-medium">Email Terverifikasi</p>
                <p className="text-xs text-muted-foreground">{formData.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="font-medium">Telepon Terverifikasi</p>
                <p className="text-xs text-muted-foreground">{formData.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="font-medium">KTP Pemilik Terverifikasi</p>
                <p className="text-xs text-muted-foreground">Ahmad Susanto</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="font-medium">Dokumen Usaha Terverifikasi</p>
                <p className="text-xs text-muted-foreground">NPWP, NIB, SIUP</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
