const SensorData = require('../models/SensorData')

// Simpan data sensor baru (dipanggil dari ESP32)
const simpanData = async (req, res) => {
  try {
    const { moisture, temperature, humidity, zone } = req.body

    const data = new SensorData({ moisture, temperature, humidity, zone })
    await data.save()

    res.status(201).json({ message: 'Data sensor tersimpan!', data })
  } catch (err) {
    res.status(500).json({ message: 'Gagal simpan data', error: err.message })
  }
}

// Ambil data sensor terbaru per zona
const getDataTerbaru = async (req, res) => {
  try {
    const { zone } = req.params

    const data = await SensorData
      .findOne({ zone })
      .sort({ createdAt: -1 })

    if (!data) {
      return res.status(404).json({ message: 'Data tidak ditemukan' })
    }

    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Gagal ambil data', error: err.message })
  }
}

// Ambil histori data sensor (24 jam terakhir)
const getHistori = async (req, res) => {
  try {
    const { zone } = req.params
    const kemarin = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const data = await SensorData
      .find({ zone, createdAt: { $gte: kemarin } })
      .sort({ createdAt: 1 })

    res.json(data)
  } catch (err) {
    res.status(500).json({ message: 'Gagal ambil histori', error: err.message })
  }
}

module.exports = { simpanData, getDataTerbaru, getHistori }