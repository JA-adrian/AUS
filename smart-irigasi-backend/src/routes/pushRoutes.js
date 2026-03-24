const express         = require('express')
const { subscribe }   = require('../controllers/pushController')
const { protect }     = require('../middleware/auth')

const router = express.Router()

router.post('/subscribe', protect, subscribe)

module.exports = router