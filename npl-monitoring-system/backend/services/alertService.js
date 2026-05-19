const TelegramBot = require('node-telegram-bot-api')
const { fetchLoansFromSheets } = require('./googleSheetsService')
const { classifyLoan } = require('./riskCalculationService')

// Lazy bot instance — created only when token is available
let bot = null
function getBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return null
  if (!bot) bot = new TelegramBot(token)
  return bot
}

const chatId = () => process.env.TELEGRAM_CHAT_ID

// ── Telegram message templates ────────────────────────────────────────────────

function buildTelegramMessage({ type, loan, extra }) {
  const emojis = { LOSS: '🔴', DOUBTFUL: '🟠', SUBSTANDARD: '🟡', SPECIAL_MENTION: '⚠️', PORTFOLIO: '📊' }
  const emoji  = emojis[type] ?? '🔔'

  if (type === 'PORTFOLIO') {
    return (
      `${emoji} *NPL Monitor — Portfolio Alert*\n\n` +
      `📌 NPL Ratio: *${extra.nplRatio.toFixed(2)}%* (threshold: ${extra.threshold}%)\n` +
      `💰 Total NPL: *$${Number(extra.nplAmount).toLocaleString()}*\n` +
      `📋 Active NPL Loans: *${extra.nplCount}*\n` +
      `🕐 Scanned: ${new Date().toLocaleString()}`
    )
  }

  return (
    `${emoji} *NPL Monitor — ${loan.classification} Alert*\n\n` +
    `🆔 Loan: \`${loan.id}\`\n` +
    `👤 Customer: ${loan.customerName}\n` +
    `📅 DPD: *${loan.dpd} days*\n` +
    `💵 Outstanding: $${Number(loan.outstanding).toLocaleString()}\n` +
    `🏢 Branch: ${loan.branch}\n` +
    `👔 Officer: ${loan.loanOfficer}\n` +
    `📞 Phone: ${loan.phone || 'N/A'}\n` +
    `⚠️ Classification: *${loan.classification}*\n` +
    `🕐 ${new Date().toLocaleString()}`
  )
}

/**
 * Send a Telegram message to the configured chat.
 * @param {string} message — Markdown-formatted message text
 * @returns {Promise<void>}
 */
async function sendTelegramMessage(message) {
  const b  = getBot()
  const id = chatId()
  if (!b || !id) {
    console.warn('[Telegram] Bot token or chat ID not configured — skipping notification')
    return
  }
  await b.sendMessage(id, message, { parse_mode: 'Markdown' })
}

// ── NPL Scan (called by cron) ─────────────────────────────────────────────────

/**
 * Fetch loans from Google Sheets, classify them, and send Telegram alerts
 * for any NPL (60+ DPD) loans that meet trigger conditions.
 */
async function runNplScan() {
  let loans
  try {
    loans = await fetchLoansFromSheets()
  } catch (err) {
    console.error('[NPL Scan] Could not fetch loans:', err.message)
    return { success: false, error: err.message }
  }

  const nplLoans = loans.filter(l => l.dpd >= 60)
  const totalPortfolio = loans.reduce((s, l) => s + (l.outstanding || 0), 0)
  const nplAmount      = nplLoans.reduce((s, l) => s + (l.outstanding || 0), 0)
  const nplRatio       = totalPortfolio > 0 ? (nplAmount / totalPortfolio) * 100 : 0
  const NPL_THRESHOLD  = Number(process.env.NPL_RATIO_THRESHOLD || 5)

  const alertsSent = []

  // Portfolio-level alert if NPL ratio exceeds threshold
  if (nplRatio > NPL_THRESHOLD) {
    const msg = buildTelegramMessage({
      type: 'PORTFOLIO',
      extra: { nplRatio, nplAmount, nplCount: nplLoans.length, threshold: NPL_THRESHOLD },
    })
    await sendTelegramMessage(msg)
    alertsSent.push({ type: 'PORTFOLIO', nplRatio })
  }

  // Loan-level alerts for Loss and Doubtful
  for (const loan of nplLoans) {
    if (loan.classification === 'Loss' || loan.classification === 'Doubtful') {
      const msg = buildTelegramMessage({ type: loan.classification.toUpperCase(), loan })
      await sendTelegramMessage(msg)
      alertsSent.push({ type: loan.classification, loanId: loan.id })
      // Small delay to avoid hitting Telegram rate limits
      await new Promise(r => setTimeout(r, 300))
    }
  }

  console.log(`[NPL Scan] Done — ${nplLoans.length} NPL loans, ${alertsSent.length} alerts sent`)
  return { success: true, nplLoans: nplLoans.length, alertsSent: alertsSent.length }
}

module.exports = { sendTelegramMessage, buildTelegramMessage, runNplScan }
