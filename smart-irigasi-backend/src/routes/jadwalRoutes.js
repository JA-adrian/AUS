const express                                      = require('express')
const { getSemuaJadwal, tambahJadwal, hapusJadwal } = require('../controllers/jadwalController')

const router = express.Router()

router.get('/',       getSemuaJadwal)
router.post('/',      tambahJadwal)
router.delete('/:id', hapusJadwal)

module.exports = router