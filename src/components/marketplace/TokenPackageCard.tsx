'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/format'
import { Check, Sparkles, Zap } from 'lucide-react'

interface TokenPackage {
  id: string
  name: string
  price: number
  tokens: number
  features: string[]
  popular: boolean
}

interface TokenPackageCardProps {
  pkg: TokenPackage
  onSelect?: (pkg: TokenPackage) => void
  className?: string
}

export function TokenPackageCard({ pkg, onSelect, className }: TokenPackageCardProps) {
  return (
    <Card
      className={cn(
        'relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl p-0 gap-0',
        pkg.popular && 'border-primary shadow-lg scale-[1.02]',
        className
      )}
    >
      {/* Popular Ribbon */}
      {pkg.popular && (
        <div className="absolute top-0 right-0 overflow-hidden">
          <div className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg flex items-center gap-1">
            <Sparkles className="size-3" />
            Populer
          </div>
        </div>
      )}

      <CardContent className="flex flex-col gap-5 p-6 flex-1">
        {/* Package Name */}
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-foreground">{pkg.name}</h3>
        </div>

        {/* Price */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-primary">{formatPrice(pkg.price)}</span>
            <span className="text-sm text-muted-foreground">/bulan</span>
          </div>
        </div>

        {/* Token Count */}
        <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/10 p-3">
          <Zap className="size-5 text-primary shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Token</span>
            <span className="text-xl font-bold text-primary">{pkg.tokens.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Features */}
        <ul className="flex flex-col gap-2.5 flex-1">
          {pkg.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="size-4 text-emerald-500 shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Button
          className={cn(
            'w-full mt-2',
            pkg.popular
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
              : ''
          )}
          variant={pkg.popular ? 'default' : 'outline'}
          onClick={() => onSelect?.(pkg)}
        >
          {pkg.popular ? 'Pilih Paket Ini' : 'Pilih Paket'}
        </Button>
      </CardContent>
    </Card>
  )
}
