const express = require('express')
const { getLoans, getLoanById } = require('../controllers/loanController')
const { authMiddleware } = require('../middleware/authMiddleware')

const router = express.Router()

router.get('/',    authMiddleware, getLoans)
router.get('/:id', authMiddleware, getLoanById)

module.exports = router
