function errorHandler(err, req, res, _next) {
  const status = err.status || err.statusCode || 500
  const message = process.env.NODE_ENV === 'production' && status === 500
    ? 'Internal server error'
    : err.message || 'An unexpected error occurred'

  if (status >= 500) {
    console.error('[ERROR]', req.method, req.path, err.stack || err.message)
  }

  res.status(status).json({ error: message, ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }) })
}

module.exports = { errorHandler }
