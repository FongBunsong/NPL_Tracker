require('dotenv').config()
const express     = require('express')
const cors        = require('cors')
const helmet      = require('helmet')
const morgan      = require('morgan')
const rateLimit   = require('express-rate-limit')
const cron        = require('node-cron')

const loanRoutes      = require('./routes/loanRoutes')
const alertRoutes     = require('./routes/alertRoutes')
const analyticsRoutes = require('./routes/analyticsRoutes')
const { errorHandler } = require('./middleware/errorMiddleware')
const { runNplScan }   = require('./services/alertService')

const app  = express()
const PORT = process.env.PORT || 5000

// ── Security & middleware ─────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
}))
app.use(express.json({ limit: '1mb' }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

// Rate limiting — max 200 req/15 min per IP
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
}))

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/loans',     loanRoutes)
app.use('/api/alerts',    alertRoutes)
app.use('/api/analytics', analyticsRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' })
})

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ── Global error handler ──────────────────────────────────────────────────────
app.use(errorHandler)

// ── Scheduled NPL scan ────────────────────────────────────────────────────────
const cronSchedule = process.env.NPL_SCAN_CRON || '0 8 * * *'
if (cron.validate(cronSchedule)) {
  cron.schedule(cronSchedule, async () => {
    console.log(`[CRON] Running NPL scan at ${new Date().toISOString()}`)
    try {
      await runNplScan()
      console.log('[CRON] NPL scan completed')
    } catch (err) {
      console.error('[CRON] NPL scan failed:', err.message)
    }
  })
  console.log(`[CRON] Scheduled NPL scan: "${cronSchedule}"`)
}

// ── Start server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\nNPL Monitor API running on http://localhost:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}\n`)
})

module.exports = app
