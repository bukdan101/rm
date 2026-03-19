import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, ArrowUpRight, ArrowDownRight, TrendingFlat } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// ==============================
// TYPES
// ==============================

export type StatsVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export type StatsFormat = 'none' | 'number' | 'currency' | 'short' | 'percentage';

export interface StatsTrend {
  value: number;
  isPositive: boolean;
  label?: string; // e.g., "dari bulan lalu", "dari minggu lalu"
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: StatsTrend;
  format?: StatsFormat;
  variant?: StatsVariant;
  className?: string;
  isLoading?: boolean;
  onClick?: () => void;
  href?: string;
  badge?: string;
  subtitle?: string;
}

// ==============================
// HELPERS
// ==============================

const variantStyles: Record<StatsVariant, {
  bg: string;
  iconBg: string;
  iconColor: string;
  border?: string;
}> = {
  default: {
    bg: 'bg-card',
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
  },
  primary: {
    bg: 'bg-card',
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  success: {
    bg: 'bg-card',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-600',
    border: 'border-green-500/20',
  },
  warning: {
    bg: 'bg-card',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600',
    border: 'border-amber-500/20',
  },
  danger: {
    bg: 'bg-card',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-600',
    border: 'border-red-500/20',
  },
  info: {
    bg: 'bg-card',
    iconBg: 'bg-sky-500/10',
    iconColor: 'text-sky-600',
    border: 'border-sky-500/20',
  },
};

function formatValue(value: string | number, format: StatsFormat): string {
  if (typeof value === 'string') return value;
  
  switch (format) {
    case 'currency':
      // Indonesian Rupiah format
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    
    case 'number':
      return new Intl.NumberFormat('id-ID').format(value);
    
    case 'short':
      // Short format: 1.5K, 2.3M, etc
      if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}M`;
      }
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}Jt`;
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}Rb`;
      }
      return new Intl.NumberFormat('id-ID').format(value);
    
    case 'percentage':
      return `${value}%`;
    
    case 'none':
    default:
      return String(value);
  }
}

function formatTrendValue(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(Math.abs(value) / 100);
}

// ==============================
// COMPONENT
// ==============================

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  format = 'none',
  variant = 'default',
  className,
  isLoading = false,
  onClick,
  href,
  badge,
  subtitle,
}: StatsCardProps) {
  const styles = variantStyles[variant];
  const formattedValue = formatValue(value, format);
  
  const cardContent = (
    <Card 
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        styles.bg,
        styles.border,
        (onClick || href) && 'cursor-pointer hover:shadow-md hover:scale-[1.02]',
        className
      )}
    >
      {/* Badge */}
      {badge && (
        <div className="absolute top-3 right-3">
          <span className={cn(
            'px-2 py-0.5 text-xs font-medium rounded-full',
            variant === 'success' && 'bg-green-100 text-green-700',
            variant === 'warning' && 'bg-amber-100 text-amber-700',
            variant === 'danger' && 'bg-red-100 text-red-700',
            variant === 'info' && 'bg-sky-100 text-sky-700',
            variant === 'primary' && 'bg-primary/10 text-primary',
            variant === 'default' && 'bg-muted text-muted-foreground',
          )}>
            {badge}
          </span>
        </div>
      )}
      
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          {title}
        </CardTitle>
        <div className={cn(
          'h-9 w-9 rounded-lg flex items-center justify-center transition-transform',
          styles.iconBg,
          (onClick || href) && 'group-hover:scale-110'
        )}>
          <Icon className={cn('h-4 w-4', styles.iconColor)} />
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Main Value */}
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-8 w-28 animate-pulse rounded bg-muted" />
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold tracking-tight">
              {formattedValue}
            </div>
            
            {/* Subtitle (secondary value) */}
            {subtitle && (
              <div className="text-sm text-muted-foreground mt-0.5">
                {subtitle}
              </div>
            )}
            
            {/* Description */}
            {description && (
              <p className="text-xs text-muted-foreground mt-1">
                {description}
              </p>
            )}
            
            {/* Trend */}
            {trend && (
              <div className="flex items-center gap-1.5 mt-2">
                <span className={cn(
                  'flex items-center text-xs font-medium',
                  trend.isPositive ? 'text-green-600' : 'text-red-600',
                  trend.value === 0 && 'text-muted-foreground'
                )}>
                  {trend.value === 0 ? (
                    <TrendingFlat className="h-3.5 w-3.5 mr-0.5" />
                  ) : trend.isPositive ? (
                    <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
                  )}
                  {formatTrendValue(trend.value)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {trend.label || 'dari bulan lalu'}
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
      
      {/* Clickable indicator */}
      {(onClick || href) && (
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
    </Card>
  );

  // Wrap with link if href provided
  if (href) {
    return (
      <Link href={href} className="group block">
        {cardContent}
      </Link>
    );
  }

  // Wrap with button if onClick provided
  if (onClick) {
    return (
      <button onClick={onClick} className="group block text-left w-full">
        {cardContent}
      </button>
    );
  }

  return cardContent;
}

// ==============================
// PRESET CARDS FOR AUTOMARKET
// ==============================

export interface QuickStatProps {
  value: string | number;
  trend?: StatsTrend;
  isLoading?: boolean;
  href?: string;
  badge?: string;
}

// Total Listings Card
export function TotalListingsCard({ value, trend, isLoading, href, badge }: QuickStatProps) {
  return (
    <StatsCard
      title="Total Iklan"
      value={value}
      icon={({ className }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M9 7h6M9 11h6M9 15h4" />
        </svg>
      )}
      format="number"
      variant="primary"
      description="Semua iklan mobil"
      trend={trend}
      isLoading={isLoading}
      href={href}
      badge={badge}
    />
  );
}

// Active Listings Card
export function ActiveListingsCard({ value, trend, isLoading, href }: QuickStatProps) {
  return (
    <StatsCard
      title="Iklan Aktif"
      value={value}
      icon={({ className }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      )}
      format="number"
      variant="success"
      description="Sedang ditayangkan"
      trend={trend}
      isLoading={isLoading}
      href={href}
    />
  );
}

// Sold Listings Card
export function SoldListingsCard({ value, trend, isLoading, href }: QuickStatProps) {
  return (
    <StatsCard
      title="Terjual"
      value={value}
      icon={({ className }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      )}
      format="number"
      variant="info"
      description="Mobil berhasil dijual"
      trend={trend}
      isLoading={isLoading}
      href={href}
    />
  );
}

// Views Card
export function ViewsCard({ value, trend, isLoading, href }: QuickStatProps) {
  return (
    <StatsCard
      title="Total Dilihat"
      value={value}
      icon={({ className }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
      format="short"
      variant="default"
      description="Pengunjung melihat iklan"
      trend={trend}
      isLoading={isLoading}
      href={href}
    />
  );
}

// Favorites Card
export function FavoritesCard({ value, trend, isLoading, href }: QuickStatProps) {
  return (
    <StatsCard
      title="Favorit"
      value={value}
      icon={({ className }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )}
      format="number"
      variant="danger"
      description="Iklan disimpan user"
      trend={trend}
      isLoading={isLoading}
      href={href}
    />
  );
}

// Revenue Card (for dealers)
export function RevenueCard({ value, trend, isLoading, href, subtitle }: QuickStatProps & { subtitle?: string }) {
  return (
    <StatsCard
      title="Estimasi Revenue"
      value={value}
      subtitle={subtitle}
      icon={({ className }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      )}
      format="currency"
      variant="success"
      description="Total nilai iklan aktif"
      trend={trend}
      isLoading={isLoading}
      href={href}
    />
  );
}

// Inquiry Card
export function InquiryCard({ value, trend, isLoading, href }: QuickStatProps) {
  return (
    <StatsCard
      title="Pertanyaan"
      value={value}
      icon={({ className }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      )}
      format="number"
      variant="warning"
      description="Pesan dari pembeli"
      trend={trend}
      isLoading={isLoading}
      href={href}
    />
  );
}

// Conversion Rate Card
export function ConversionCard({ value, trend, isLoading }: QuickStatProps) {
  return (
    <StatsCard
      title="Conversion Rate"
      value={value}
      icon={({ className }) => (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M23 6l-9.5 9.5-5-5L1 18" />
          <path d="M17 6h6v6" />
        </svg>
      )}
      format="percentage"
      variant="info"
      description="Rasio penjualan vs iklan"
      trend={trend}
      isLoading={isLoading}
    />
  );
}
