'use client'

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, Plus, Calendar, CheckCircle, Clock } from 'lucide-react';

const MOCK_COUPONS = [
  { id: '1', code: 'HEMAT50K', discount: 50000, minPurchase: 200000, validUntil: '2024-02-28', status: 'active' },
  { id: '2', code: 'DISKON10', discount: '10%', minPurchase: 500000, validUntil: '2024-02-15', status: 'active' },
  { id: '3', code: 'NEWYEAR', discount: 100000, minPurchase: 1000000, validUntil: '2024-01-31', status: 'expired' },
  { id: '4', code: 'WEEKEND20', discount: '20%', minPurchase: 300000, validUntil: '2024-03-01', status: 'active' },
]

export default function CouponsPage() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <DashboardLayout title="Kupon" description="Kelola kupon dan promo Anda">
      <div className="space-y-6">
        {/* Header */}
        <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-purple-700 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Kupon Aktif</p>
                <p className="text-3xl font-bold mt-1">
                  {MOCK_COUPONS.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Ticket className="h-12 w-12 text-white/30" />
            </div>
          </CardContent>
        </Card>

        {/* Coupon List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Daftar Kupon</CardTitle>
                <CardDescription>Kupon promo yang tersedia</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Kupon
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {MOCK_COUPONS.map((coupon) => (
                <div 
                  key={coupon.id} 
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    coupon.status === 'expired' ? 'opacity-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${
                      coupon.status === 'active' ? 'bg-purple-100' : 'bg-gray-100'
                    }`}>
                      <Ticket className={`h-6 w-6 ${
                        coupon.status === 'active' ? 'text-purple-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-lg">{coupon.code}</p>
                        {coupon.status === 'active' ? (
                          <Badge className="bg-green-500">Aktif</Badge>
                        ) : (
                          <Badge variant="secondary">Expired</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Diskon {typeof coupon.discount === 'number' ? formatCurrency(coupon.discount) : coupon.discount}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Min. pembelian {formatCurrency(coupon.minPurchase)} • Berlaku s/d {coupon.validUntil}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {coupon.status === 'active' && (
                      <Button variant="outline" size="sm">
                        Gunakan
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
