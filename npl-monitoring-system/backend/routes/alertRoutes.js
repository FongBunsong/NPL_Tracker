const express = require('express')
const { triggerScan, testTelegram, acknowledgeAlert, resolveAlert } = require('../controllers/alertController')
const { authMiddleware } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/scan',             authMiddleware, triggerScan)
router.post('/telegram/test',    authMiddleware, testTelegram)
router.patch('/:id/acknowledge', authMiddleware, acknowledgeAlert)
router.patch('/:id/resolve',     authMiddleware, resolveAlert)

module.exports = router
