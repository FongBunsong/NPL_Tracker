/**
 * Simple API key middleware.
 * Pass Authorization: Bearer <JWT_SECRET> or x-api-key: <JWT_SECRET> header.
 * In production, replace this with proper JWT verification.
 */
function authMiddleware(req, res, next) {
  const secret = process.env.JWT_SECRET

  // Skip auth in development if no secret is set
  if (!secret || process.env.NODE_ENV === 'development') return next()

  const authHeader = req.headers['authorization']
  const apiKey     = req.headers['x-api-key']
  const token      = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : apiKey

  if (!token || token !== secret) {
    return res.status(401).json({ error: 'Unauthorized — invalid or missing API key' })
  }

  next()
}

module.exports = { authMiddleware }
