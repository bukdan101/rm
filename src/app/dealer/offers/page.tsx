'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { formatPrice, formatRelativeTime } from '@/lib/utils'
import {
  Store,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  ArrowRightLeft,
  Calendar,
  Gauge,
  MapPin,
  Loader2,
  AlertCircle,
  Building2,
  ChevronRight,
  Timer,
  Send,
  User,
  RefreshCw,
} from 'lucide-react'
import type { DealerOffer } from '@/types/dealer-marketplace'

export default function DealerOffersPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [dealerId, setDealerId] = useState<string | null>(null)
  const [offers, setOffers] = useState<DealerOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('outgoing')
  
  // Dialogs
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [counterDialogOpen, setCounterDialogOpen] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<DealerOffer | null>(null)
  const [counterPrice, setCounterPrice] = useState('')
  const [counterMessage, setCounterMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  // Success dialog
  const [successDialogOpen, setSuccessDialogOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // Fetch dealer ID
  useEffect(() => {
    async function fetchDealerId() {
      if (!user || profile?.role !== 'dealer') return
      
      try {
        const res = await fetch(`/api/dealers?owner_id=${user.id}`)
        const data = await res.json()
        if (data.success && data.dealers?.length > 0) {
          setDealerId(data.dealers[0].id)
        }
      } catch (error) {
        console.error('Error fetching dealer:', error)
      }
    }
    
    if (!authLoading) {
      fetchDealerId()
    }
  }, [user, profile, authLoading])

  // Fetch offers
  const fetchOffers = async () => {
    if (!dealerId) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/dealer-marketplace/offers?dealer_id=${dealerId}`)
      const data = await res.json()
      
      if (data.success) {
        setOffers(data.offers)
      }
    } catch (error) {
      console.error('Error fetching offers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (dealerId) {
      fetchOffers()
    }
  }, [dealerId])

  // Filter offers by status
  const outgoingOffers = offers.filter(o => ['pending', 'viewed', 'negotiating'].includes(o.status))
  const acceptedOffers = offers.filter(o => o.status === 'accepted')
  const rejectedOffers = offers.filter(o => ['rejected', 'expired', 'withdrawn'].includes(o.status))

  // View offer
  const viewOffer = (offer: DealerOffer) => {
    setSelectedOffer(offer)
    setDetailDialogOpen(true)
  }

  // Withdraw offer
  const withdrawOffer = async (offer: DealerOffer) => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/dealer-marketplace/offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: offer.id,
          action: 'withdraw',
          actor_id: dealerId,
          actor_type: 'dealer'
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setSuccessMessage('Penawaran berhasil ditarik')
        setSuccessDialogOpen(true)
        setDetailDialogOpen(false)
        fetchOffers()
      } else {
        alert(data.error || 'Gagal menarik penawaran')
      }
    } catch (error) {
      console.error('Error withdrawing offer:', error)
      alert('Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  // Counter offer from dealer (when seller counter)
  const dealerCounterOffer = async () => {
    if (!selectedOffer || !counterPrice) return
    
    setSubmitting(true)
    try {
      const res = await fetch('/api/dealer-marketplace/offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: selectedOffer.id,
          action: 'dealer_counter',
          offer_price: parseInt(counterPrice), // Update dealer's offer price
          message: counterMessage,
          actor_id: dealerId,
          actor_type: 'dealer'
        })
      })
      
      const data = await res.json()
      
      if (data.success) {
        setSuccessMessage('Counter offer terkirim!')
        setSuccessDialogOpen(true)
        setCounterDialogOpen(false)
        setDetailDialogOpen(false)
        fetchOffers()
      } else {
        alert(data.error || 'Gagal mengirim counter offer')
      }
    } catch (error) {
      console.error('Error counter offering:', error)
      alert('Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  // Open counter dialog
  const openCounterDialog = () => {
    if (selectedOffer) {
      // Use counter_offer_price if exists, otherwise use current offer_price
      setCounterPrice((selectedOffer.counter_offer_price || selectedOffer.offer_price).toString())
      setCounterMessage('')
      setCounterDialogOpen(true)
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-amber-100 text-amber-700', label: 'Menunggu' },
      viewed: { color: 'bg-blue-100 text-blue-700', label: 'Dilihat' },
      negotiating: { color: 'bg-purple-100 text-purple-700', label: 'Negosiasi' },
      accepted: { color: 'bg-green-100 text-green-700', label: 'Diterima' },
      rejected: { color: 'bg-red-100 text-red-700', label: 'Ditolak' },
      expired: { color: 'bg-gray-100 text-gray-700', label: 'Kedaluwarsa' },
      withdrawn: { color: 'bg-gray-100 text-gray-700', label: 'Ditarik' },
    }
    const badge = badges[status] || badges.pending
    return <Badge className={badge.color}>{badge.label}</Badge>
  }

  // Calculate time remaining
  const getTimeRemaining = (expiresAt: string | null) => {
    if (!expiresAt) return null
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry.getTime() - now.getTime()
    
    if (diff <= 0) return 'Kedaluwarsa'
    
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days} hari tersisa`
    if (hours > 0) return `${hours} jam tersisa`
    return 'Segera berakhir'
  }

  // Auth loading
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  // Not logged in or not dealer
  if (!user || profile?.role !== 'dealer') {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-8 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Akses Ditolak</h2>
            <p className="text-gray-600">
              Halaman ini hanya untuk dealer terverifikasi.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No dealer record
  if (!dealerId && !loading) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-8 text-center">
            <Store className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Dealer Tidak Ditemukan</h2>
            <p className="text-gray-600">
              Akun Anda belum terdaftar sebagai dealer.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Send className="h-6 w-6 text-purple-500" />
          Penawaran Saya
        </h1>
        <p className="text-muted-foreground">
          Kelola penawaran yang Anda kirim ke seller
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Aktif</p>
                <p className="text-2xl font-bold">{outgoingOffers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Diterima</p>
                <p className="text-2xl font-bold">{acceptedOffers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Selesai</p>
                <p className="text-2xl font-bold">{rejectedOffers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Offers List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="outgoing">
            Aktif ({outgoingOffers.length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Diterima ({acceptedOffers.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            Riwayat ({rejectedOffers.length})
          </TabsTrigger>
        </TabsList>

        {/* Outgoing Offers */}
        <TabsContent value="outgoing" className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
            </div>
          ) : outgoingOffers.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <Send className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Belum ada penawaran</h3>
                <p className="text-gray-500 mb-4">
                  Kirim penawaran ke seller dari Dealer Marketplace
                </p>
                <Button onClick={() => router.push('/dealer/marketplace')}>
                  Browse Marketplace
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {outgoingOffers.map((offer) => (
                <Card key={offer.id} className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => viewOffer(offer)}>
                  <CardContent className="py-4">
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="w-24 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {offer.listing?.primary_image_url ? (
                          <img src={offer.listing.primary_image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Store className="h-6 w-6 text-gray-300" />
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold line-clamp-1">{offer.listing?.title}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              {offer.user?.name}
                            </p>
                          </div>
                          {getStatusBadge(offer.status)}
                        </div>
                        
                        <div className="flex items-center gap-4 mt-2">
                          <div>
                            <p className="text-xs text-gray-500">Harga Seller</p>
                            <p className="font-semibold">{formatPrice(offer.original_price)}</p>
                          </div>
                          <ArrowRightLeft className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-xs text-gray-500">Penawaran Anda</p>
                            <p className="font-bold text-purple-600">{formatPrice(offer.offer_price)}</p>
                          </div>
                        </div>
                        
                        {/* Counter offer indicator */}
                        {offer.counter_offer_price && (
                          <div className="mt-2 p-2 bg-purple-50 rounded-lg">
                            <p className="text-xs text-purple-600 flex items-center gap-1">
                              <RefreshCw className="h-3 w-3" />
                              Counter: {formatPrice(offer.counter_offer_price)}
                            </p>
                          </div>
                        )}
                        
                        {offer.expires_at && (
                          <div className="flex items-center gap-1 text-xs text-amber-600 mt-2">
                            <Timer className="h-3 w-3" />
                            {getTimeRemaining(offer.expires_at)}
                          </div>
                        )}
                      </div>
                      
                      <ChevronRight className="h-5 w-5 text-gray-400 shrink-0 self-center" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Accepted Offers */}
        <TabsContent value="accepted" className="mt-4">
          {acceptedOffers.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Belum ada penawaran diterima</h3>
                <p className="text-gray-500">
                  Penawaran yang diterima seller akan muncul di sini
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {acceptedOffers.map((offer) => (
                <Card key={offer.id} className="border-green-200 bg-green-50/50">
                  <CardContent className="py-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {offer.listing?.primary_image_url ? (
                          <img src={offer.listing.primary_image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Store className="h-6 w-6 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{offer.listing?.title}</h3>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <p className="text-sm text-gray-500">{offer.user?.name}</p>
                        <p className="font-bold text-green-600 mt-1">{formatPrice(offer.offer_price)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Diterima pada {new Date(offer.accepted_at!).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="mt-4">
          {rejectedOffers.length === 0 ? (
            <Card className="border-0 shadow-md">
              <CardContent className="py-12 text-center">
                <XCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">Tidak ada riwayat</h3>
                <p className="text-gray-500">
                  Penawaran yang ditolak, kedaluwarsa, atau ditarik akan muncul di sini
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {rejectedOffers.map((offer) => (
                <Card key={offer.id} className="border-gray-200 bg-gray-50/50">
                  <CardContent className="py-4">
                    <div className="flex gap-4">
                      <div className="w-24 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                        {offer.listing?.primary_image_url ? (
                          <img src={offer.listing.primary_image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Store className="h-6 w-6 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{offer.listing?.title}</h3>
                          {getStatusBadge(offer.status)}
                        </div>
                        <p className="text-sm text-gray-500">{offer.user?.name}</p>
                        <p className="font-semibold text-gray-600 mt-1">{formatPrice(offer.offer_price)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Penawaran</DialogTitle>
            <DialogDescription>
              Penawaran Anda untuk mobil ini
            </DialogDescription>
          </DialogHeader>

          {selectedOffer && (
            <div className="space-y-4">
              {/* Listing */}
              <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-20 h-14 rounded bg-gray-200 overflow-hidden shrink-0">
                  {selectedOffer.listing?.primary_image_url ? (
                    <img src={selectedOffer.listing.primary_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Store className="h-5 w-5 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{selectedOffer.listing?.title}</p>
                  <div className="flex gap-2 text-xs text-gray-500 mt-1">
                    <span>{selectedOffer.listing?.year}</span>
                    <span>•</span>
                    <span>{selectedOffer.listing?.mileage?.toLocaleString()} km</span>
                    <span>•</span>
                    <span>{selectedOffer.listing?.city}</span>
                  </div>
                </div>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Harga Seller</p>
                  <p className="text-lg font-bold">{formatPrice(selectedOffer.original_price)}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-gray-500">Penawaran Anda</p>
                  <p className="text-lg font-bold text-purple-600">{formatPrice(selectedOffer.offer_price)}</p>
                </div>
              </div>

              {/* Counter offer from seller */}
              {selectedOffer.counter_offer_price && (
                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-600 font-medium mb-1">Counter Offer dari Seller</p>
                  <p className="text-lg font-bold text-amber-700">{formatPrice(selectedOffer.counter_offer_price)}</p>
                  {selectedOffer.counter_offer_message && (
                    <p className="text-sm text-gray-600 mt-1">{selectedOffer.counter_offer_message}</p>
                  )}
                </div>
              )}

              {/* Seller info */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <User className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">{selectedOffer.user?.name}</p>
                  <p className="text-xs text-gray-500">Seller</p>
                </div>
              </div>

              {/* Message */}
              {selectedOffer.message && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Pesan Anda</p>
                  <p className="p-3 bg-gray-50 rounded-lg text-sm">{selectedOffer.message}</p>
                </div>
              )}

              {/* Options */}
              <div className="flex flex-wrap gap-2">
                {selectedOffer.financing_available && (
                  <Badge variant="outline" className="text-green-600">✓ Financing Tersedia</Badge>
                )}
                {selectedOffer.pickup_service && (
                  <Badge variant="outline" className="text-blue-600">✓ Pickup Service</Badge>
                )}
              </div>

              {/* Time remaining */}
              {selectedOffer.expires_at && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <Timer className="h-4 w-4" />
                  {getTimeRemaining(selectedOffer.expires_at)}
                </div>
              )}

              {/* Actions */}
              {['pending', 'viewed', 'negotiating'].includes(selectedOffer.status) && (
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => withdrawOffer(selectedOffer)}
                    disabled={submitting}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Tarik
                  </Button>
                  
                  {/* Show counter button only if seller has countered */}
                  {selectedOffer.counter_offer_price && (
                    <Button
                      className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                      onClick={openCounterDialog}
                      disabled={submitting}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Counter
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => router.push(`/dashboard/messages?user=${selectedOffer.user_id}`)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Counter Offer Dialog */}
      <Dialog open={counterDialogOpen} onValueChange={setCounterDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Counter Offer</DialogTitle>
            <DialogDescription>
              Ajukan harga baru untuk penawaran ini
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Harga Baru (Rp)</Label>
              <Input
                type="number"
                value={counterPrice}
                onChange={(e) => setCounterPrice(e.target.value)}
                placeholder="Masukkan harga"
                className="mt-1"
              />
              {counterPrice && (
                <p className="text-sm text-gray-500 mt-1">{formatPrice(parseInt(counterPrice))}</p>
              )}
            </div>

            <div>
              <Label>Pesan (Opsional)</Label>
              <Textarea
                value={counterMessage}
                onChange={(e) => setCounterMessage(e.target.value)}
                placeholder="Tambahkan pesan untuk seller..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCounterDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500"
                onClick={dealerCounterOffer}
                disabled={!counterPrice || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  'Kirim Counter'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <AlertDialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Berhasil!</AlertDialogTitle>
            <AlertDialogDescription>
              {successMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setSuccessDialogOpen(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
