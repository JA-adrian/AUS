const express                                    = require('express')
const { simpanData, getDataTerbaru, getHistori } = require('../controllers/sensorController')

const router = express.Router()

router.post('/',                    simpanData)
router.get('/terbaru/:zone',        getDataTerbaru)
router.get('/histori/:zone',        getHistori)

module.exports = router