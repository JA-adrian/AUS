const express                          = require('express')
const { getSemuaStatus, updateStatus } = require('../controllers/pompController')

const router = express.Router()

router.get('/',           getSemuaStatus)
router.put('/:zone',      updateStatus)

module.exports = router