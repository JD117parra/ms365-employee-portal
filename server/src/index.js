require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') })

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const graphRoutes = require('./routes/graphRoutes')

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())

// CORS — allow requests from the Vite dev server
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))

// Request parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// HTTP request logging
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
app.use(morgan(morganFormat))

// Rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', apiLimiter)

// Routes
app.use('/api/graph', graphRoutes)

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: 'An unexpected error occurred',
  })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

module.exports = app
