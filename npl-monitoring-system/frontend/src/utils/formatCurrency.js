// ─── Currency ────────────────────────────────────────────────────────────────
export function formatCurrency(amount, currencyCode = 'USD', compact = false) {
  if (amount === null || amount === undefined || isNaN(amount)) return '—'
  if (compact) {
    if (Math.abs(amount) >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`
    if (Math.abs(amount) >= 1_000)     return `$${(amount / 1_000).toFixed(1)}K`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// ─── Numbers ─────────────────────────────────────────────────────────────────
export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '—'
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '—'
  return `${Number(value).toFixed(decimals)}%`
}

// ─── Dates ────────────────────────────────────────────────────────────────────
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return '—'
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (isNaN(d)) return '—'
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function timeAgo(dateStr) {
  if (!dateStr) return '—'
  const now  = new Date()
  const then = new Date(dateStr)
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60)     return `${diff}s ago`
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export function formatDPD(dpd) {
  if (!dpd) return 'Current'
  return `${dpd} days`
}
