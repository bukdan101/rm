'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from 'next-themes'
import { useToast } from '@/hooks/use-toast'
import {
  Bell,
  Shield,
  LogOut,
  Palette,
  Moon,
  Sun,
  Monitor,
  CreditCard,
  HelpCircle,
  Loader2,
  Save,
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'

interface UserSettings {
  email_notifications: boolean
  push_notifications: boolean
  sms_notifications: boolean
  promo_notifications: boolean
  chat_notifications: boolean
  price_drop_notifications: boolean
  language: string
  currency: string
}

export default function SettingsPage() {
  const { signOut } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [settings, setSettings] = useState<UserSettings>({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    promo_notifications: false,
    chat_notifications: true,
    price_drop_notifications: true,
    language: 'id',
    currency: 'IDR'
  })

  // Fetch settings from database
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/user-settings')
        if (response.ok) {
          const data = await response.json()
          if (data.settings) {
            setSettings(prev => ({
              ...prev,
              ...data.settings
            }))
          }
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // Save settings to database with debounce
  const saveSettings = useCallback(async (newSettings: UserSettings) => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/user-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSettings)
      })

      if (response.ok) {
        toast({
          title: 'Tersimpan',
          description: 'Pengaturan berhasil disimpan',
        })
      } else {
        toast({
          title: 'Gagal',
          description: 'Gagal menyimpan pengaturan',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast({
        title: 'Error',
        description: 'Terjadi kesalahan saat menyimpan',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }, [toast])

  // Handle switch change
  const handleSwitchChange = (key: keyof UserSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    saveSettings(newSettings)
  }

  const handleLogout = async () => {
    await signOut()
    window.location.href = '/'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pengaturan</h1>
          <p className="text-muted-foreground">Kelola preferensi akun Anda</p>
        </div>
        {isSaving && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Menyimpan...</span>
          </div>
        )}
      </div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Tampilan
          </CardTitle>
          <CardDescription>Pengaturan tema dan tampilan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Mode Tema</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih tema" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4" />
                    Light Mode
                  </div>
                </SelectItem>
                <SelectItem value="dark">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    Dark Mode
                  </div>
                </SelectItem>
                <SelectItem value="system">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    System (Auto)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifikasi
          </CardTitle>
          <CardDescription>Atur preferensi notifikasi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notif">Notifikasi Email</Label>
              <p className="text-sm text-muted-foreground">Terima update via email</p>
            </div>
            <Switch 
              id="email-notif" 
              checked={settings.email_notifications}
              onCheckedChange={(checked) => handleSwitchChange('email_notifications', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-notif">Notifikasi Push</Label>
              <p className="text-sm text-muted-foreground">Terima notifikasi push di browser</p>
            </div>
            <Switch 
              id="push-notif" 
              checked={settings.push_notifications}
              onCheckedChange={(checked) => handleSwitchChange('push_notifications', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="chat-notif">Notifikasi Chat</Label>
              <p className="text-sm text-muted-foreground">Pesan dari pembeli/penjual</p>
            </div>
            <Switch 
              id="chat-notif" 
              checked={settings.chat_notifications}
              onCheckedChange={(checked) => handleSwitchChange('chat_notifications', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="promo-notif">Promo & Penawaran</Label>
              <p className="text-sm text-muted-foreground">Info promo terbaru</p>
            </div>
            <Switch 
              id="promo-notif" 
              checked={settings.promo_notifications}
              onCheckedChange={(checked) => handleSwitchChange('promo_notifications', checked)}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="price-drop">Penurunan Harga</Label>
              <p className="text-sm text-muted-foreground">Notifikasi saat harga turun</p>
            </div>
            <Switch 
              id="price-drop" 
              checked={settings.price_drop_notifications}
              onCheckedChange={(checked) => handleSwitchChange('price_drop_notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Language & Currency */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bahasa & Mata Uang</CardTitle>
          <CardDescription>Pengaturan regional</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Bahasa</Label>
            <Select 
              value={settings.language} 
              onValueChange={(value) => handleSwitchChange('language', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih bahasa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Bahasa Indonesia</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Mata Uang</Label>
            <Select 
              value={settings.currency} 
              onValueChange={(value) => handleSwitchChange('currency', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih mata uang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IDR">IDR - Rupiah Indonesia</SelectItem>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tautan Cepat</CardTitle>
          <CardDescription>Akses fitur lainnya</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Link href="/dashboard/tokens">
            <Button variant="outline" className="w-full justify-start">
              <CreditCard className="mr-2 h-4 w-4" />
              Token Saya
            </Button>
          </Link>
          <Link href="/dashboard/kyc">
            <Button variant="outline" className="w-full justify-start">
              <Shield className="mr-2 h-4 w-4" />
              Verifikasi KYC
            </Button>
          </Link>
          <Link href="/help">
            <Button variant="outline" className="w-full justify-start">
              <HelpCircle className="mr-2 h-4 w-4" />
              Bantuan
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Zona Berbahaya</CardTitle>
          <CardDescription>Tindakan yang tidak bisa dibatalkan</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Keluar dari Akun
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
