'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatRelativeTime } from '@/lib/utils'
import { 
  Calendar, 
  Gauge, 
  Fuel, 
  Settings2, 
  MapPin, 
  Eye,
  Sparkles,
  Tag,
  Clock,
  Store,
  CheckCircle
} from 'lucide-react'

interface ProductSpecsProps {
  condition: string
  priceType: string
  location: string
  viewCount: number
  createdAt: string
  isFeatured: boolean
  category: string
}

const conditionConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  new: { 
    label: 'Baru', 
    color: 'bg-emerald-500 text-white',
    icon: <Sparkles className="h-4 w-4" />
  },
  like_new: { 
    label: 'Seperti Baru', 
    color: 'bg-blue-500 text-white',
    icon: <CheckCircle className="h-4 w-4" />
  },
  good: { 
    label: 'Bagus', 
    color: 'bg-amber-500 text-white',
    icon: <CheckCircle className="h-4 w-4" />
  },
  fair: { 
    label: 'Cukup', 
    color: 'bg-gray-500 text-white',
    icon: <CheckCircle className="h-4 w-4" />
  },
}

const priceTypeConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  fixed: { label: 'Harga Pas', icon: <Tag className="h-4 w-4" /> },
  negotiable: { label: 'Bisa Nego', icon: <Sparkles className="h-4 w-4" /> },
  auction: { label: 'Lelang', icon: <Store className="h-4 w-4" /> },
}

export function ProductSpecs({ 
  condition, 
  priceType, 
  location, 
  viewCount, 
  createdAt, 
  isFeatured,
  category 
}: ProductSpecsProps) {
  const conditionData = conditionConfig[condition] || conditionConfig.good
  const priceTypeData = priceTypeConfig[priceType] || priceTypeConfig.fixed

  const specs = [
    {
      icon: <Calendar className="h-5 w-5 text-primary" />,
      label: 'Diposting',
      value: formatRelativeTime(createdAt)
    },
    {
      icon: <Eye className="h-5 w-5 text-primary" />,
      label: 'Dilihat',
      value: `${viewCount} kali`
    },
    {
      icon: <MapPin className="h-5 w-5 text-primary" />,
      label: 'Lokasi',
      value: location
    },
    {
      icon: <Store className="h-5 w-5 text-primary" />,
      label: 'Kategori',
      value: category
    }
  ]

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          Informasi Produk
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge className={conditionData.color}>
            {conditionData.icon}
            <span className="ml-1">{conditionData.label}</span>
          </Badge>
          <Badge variant="outline" className="gap-1">
            {priceTypeData.icon}
            <span>{priceTypeData.label}</span>
          </Badge>
          {isFeatured && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              Premium
            </Badge>
          )}
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {specs.map((spec, index) => (
            <div 
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="shrink-0 mt-0.5">{spec.icon}</div>
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">{spec.label}</p>
                <p className="font-medium truncate">{spec.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tips Section */}
        <div className="mt-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
          <h4 className="font-semibold text-emerald-800 dark:text-emerald-300 mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Tips Transaksi Aman
          </h4>
          <ul className="text-sm text-emerald-700 dark:text-emerald-400 space-y-1">
            <li>• Lakukan COD atau gunakan rekening bersama</li>
            <li>• Periksa kondisi barang sebelum membayar</li>
            <li>• Simpan bukti transaksi dan percakapan</li>
            <li>• Laporkan jika mencurigai penipuan</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
