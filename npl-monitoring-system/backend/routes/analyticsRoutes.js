const express = require('express')
const { getKpis, getBranches } = require('../controllers/analyticsController')
const { authMiddleware } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/kpis',     authMiddleware, getKpis)
router.get('/branches', authMiddleware, getBranches)

module.exports = router
