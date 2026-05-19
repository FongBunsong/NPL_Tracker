import { ALERT_TYPES, PRIORITY_ORDER } from '../utils/constants'

// ─── Styling helpers ──────────────────────────────────────────────────────────
const PRIORITY_STYLES = {
  critical: { bg: 'bg-red-50',    border: 'border-red-200',    text: 'text-red-700',    badge: 'bg-red-100 text-red-700 border border-red-200',    dot: 'bg-red-500'    },
  high:     { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', badge: 'bg-orange-100 text-orange-700 border border-orange-200', dot: 'bg-orange-500' },
  medium:   { bg: 'bg-amber-50',  border: 'border-amber-200',  text: 'text-amber-700',  badge: 'bg-amber-100 text-amber-700 border border-amber-200',  dot: 'bg-amber-500'  },
  low:      { bg: 'bg-blue-50',   border: 'border-blue-200',   text: 'text-blue-700',   badge: 'bg-blue-100 text-blue-700 border border-blue-200',   dot: 'bg-blue-400'   },
}

export function getAlertStyles(priority) {
  return PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.low
}

export function getAlertTypeLabel(type) {
  return ALERT_TYPES[type]?.label ?? type
}

export function sortAlertsByPriority(alerts) {
  return [...alerts].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 9) - (PRIORITY_ORDER[b.priority] ?? 9)
  )
}

export function groupAlertsByDate(alerts) {
  return alerts.reduce((groups, alert) => {
    const date = new Date(alert.createdAt).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })
    return { ...groups, [date]: [...(groups[date] ?? []), alert] }
  }, {})
}

// ─── Telegram integration (client-side via proxy / direct) ───────────────────
export async function sendTelegramAlert(message, botToken, chatId) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'HTML' }),
  })
  if (!response.ok) throw new Error('Telegram API error')
  return response.json()
}

export function formatTelegramMessage(alert) {
  const emoji = { critical: '🔴', high: '🟠', medium: '🟡', low: '🔵' }[alert.priority] ?? '⚪'
  return (
    `${emoji} <b>NPL ALERT — ${(alert.priority ?? '').toUpperCase()}</b>\n\n` +
    `📋 <b>Type:</b> ${getAlertTypeLabel(alert.type)}\n` +
    (alert.customerName ? `👤 <b>Customer:</b> ${alert.customerName}\n` : '') +
    (alert.loanId       ? `🔑 <b>Loan ID:</b> ${alert.loanId}\n`       : '') +
    `\n${alert.message}\n\n` +
    `⏰ <i>${new Date(alert.createdAt).toLocaleString()}</i>`
  )
}
