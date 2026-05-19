const { runNplScan, sendTelegramMessage, buildTelegramMessage } = require('../services/alertService')

// Simple in-memory store for acknowledged/resolved alerts (replace with DB in production)
const alertStates = {}

/** POST /api/alerts/scan — trigger manual NPL scan */
async function triggerScan(req, res, next) {
  try {
    const result = await runNplScan()
    res.json({ ...result, timestamp: new Date().toISOString() })
  } catch (err) {
    next(err)
  }
}

/** POST /api/alerts/telegram/test — send a test Telegram message */
async function testTelegram(req, res, next) {
  try {
    const msg = '🔔 *NPL Monitor — Test*\n\nYour Telegram bot integration is working correctly!'
    await sendTelegramMessage(msg)
    res.json({ success: true, message: 'Test message sent' })
  } catch (err) {
    next(err)
  }
}

/** PATCH /api/alerts/:id/acknowledge */
async function acknowledgeAlert(req, res) {
  const { id } = req.params
  alertStates[id] = { status: 'acknowledged', updatedAt: new Date().toISOString() }
  res.json({ success: true, id, status: 'acknowledged' })
}

/** PATCH /api/alerts/:id/resolve */
async function resolveAlert(req, res) {
  const { id } = req.params
  alertStates[id] = { status: 'resolved', updatedAt: new Date().toISOString() }
  res.json({ success: true, id, status: 'resolved' })
}

module.exports = { triggerScan, testTelegram, acknowledgeAlert, resolveAlert }
