const express = require('express')
const {
  getSemuaAlert,
  tambahAlert,
  hapusAlert,
  hapusSemuaAlert,
} = require('../controllers/alertController')

const router = express.Router()

router.get('/',       getSemuaAlert)
router.post('/',      tambahAlert)
router.delete('/all', hapusSemuaAlert)
router.delete('/:id', hapusAlert)

module.exports = router