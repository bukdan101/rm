export function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatMileage(km: number): string {
  if (km >= 1000) {
    const thousands = (km / 1000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return `${thousands}.000 km`
  }
  return `${km} km`
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num)
}

export function conditionLabel(c: string): string {
  const labels: Record<string, string> = {
    NEW: 'Baru',
    USED: 'Bekas',
    RECON: 'Rekondisi',
  }
  return labels[c] ?? c
}

export function conditionColor(c: string): string {
  const colors: Record<string, string> = {
    NEW: 'bg-emerald-500 text-white',
    USED: 'bg-amber-500 text-white',
    RECON: 'bg-blue-500 text-white',
  }
  return colors[c] ?? 'bg-muted text-muted-foreground'
}

export function transmissionLabel(t: string): string {
  const labels: Record<string, string> = {
    AUTOMATIC: 'Otomatis',
    MANUAL: 'Manual',
    CVT: 'CVT',
  }
  return labels[t] ?? t
}

export function fuelTypeLabel(f: string): string {
  const labels: Record<string, string> = {
    GASOLINE: 'Bensin',
    DIESEL: 'Diesel',
    HYBRID: 'Hibrida',
    ELECTRIC: 'Listrik',
  }
  return labels[f] ?? f
}

export function timeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffMonths = Math.floor(diffDays / 30)
  const diffYears = Math.floor(diffDays / 365)

  if (diffYears > 0) return `${diffYears} tahun lalu`
  if (diffMonths > 0) return `${diffMonths} bulan lalu`
  if (diffDays > 0) return `${diffDays} hari lalu`
  if (diffHours > 0) return `${diffHours} jam lalu`
  if (diffMinutes > 0) return `${diffMinutes} menit lalu`
  return 'Baru saja'
}
