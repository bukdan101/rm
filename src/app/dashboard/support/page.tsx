'use client'

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { HelpCircle, MessageCircle, Phone, Mail, FileText, Loader2, Send } from 'lucide-react';
import { useState } from 'react';

const FAQS = [
  { q: 'Bagaimana cara menjual mobil?', a: 'Klik tombol "Jual Mobil" di sidebar dan isi form dengan lengkap.' },
  { q: 'Berapa lama proses verifikasi?', a: 'Proses verifikasi biasanya memakan waktu 1-2 hari kerja.' },
  { q: 'Bagaimana cara menarik dana?', a: 'Kunjungi halaman Wallet dan klik "Tarik Dana" untuk mengajukan penarikan.' },
  { q: 'Apakah ada biaya admin?', a: 'Biaya admin sebesar 1% dari nilai transaksi untuk setiap penjualan.' },
]

export default function SupportPage() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    category: '',
    subject: '',
    message: '',
  })

  const handleSubmit = async () => {
    if (!formData.category || !formData.subject || !formData.message) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Mohon lengkapi semua field',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast({
        title: 'Pesan terkirim',
        description: 'Tim support akan menghubungi Anda dalam 24 jam',
      })
      setFormData({ category: '', subject: '', message: '' })
    } catch (error) {
      toast({
        title: 'Gagal mengirim pesan',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Bantuan" description="Pusat bantuan dan dukungan">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* FAQ Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5" />
                Pertanyaan Umum
              </CardTitle>
              <CardDescription>Jawaban untuk pertanyaan yang sering diajukan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {FAQS.map((faq, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg">
                    <p className="font-medium">{faq.q}</p>
                    <p className="text-sm text-muted-foreground mt-1">{faq.a}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Hubungi Kami</CardTitle>
              <CardDescription>Cara lain untuk menghubungi tim support</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Telepon</p>
                  <p className="text-sm text-muted-foreground">+62 21 1234 5678</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Mail className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">support@automarket.id</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <MessageCircle className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Live Chat</p>
                  <p className="text-sm text-muted-foreground">Tersedia 09:00 - 18:00 WIB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Kirim Pertanyaan
            </CardTitle>
            <CardDescription>Isi form di bawah untuk mengirim pertanyaan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account">Akun & Profil</SelectItem>
                  <SelectItem value="listing">Iklan & Penjualan</SelectItem>
                  <SelectItem value="payment">Pembayaran & Penarikan</SelectItem>
                  <SelectItem value="technical">Masalah Teknis</SelectItem>
                  <SelectItem value="other">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Subjek</Label>
              <Input
                placeholder="Judul pertanyaan Anda"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Pesan</Label>
              <Textarea
                placeholder="Jelaskan pertanyaan atau masalah Anda secara detail"
                rows={5}
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>

            <Separator />

            <Button className="w-full" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Kirim Pertanyaan
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
