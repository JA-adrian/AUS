const Settings = require('../models/Settings')

// Ambil settings
const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne()

    // Kalau belum ada, buat default
    if (!settings) {
      settings = await Settings.create({ threshold: 35, durasiSiram: 10 })
    }

    res.json(settings)
  } catch (err) {
    res.status(500).json({ message: 'Gagal ambil settings', error: err.message })
  }
}

// Update settings
const updateSettings = async (req, res) => {
  try {
    const { threshold, durasiSiram } = req.body

    if (threshold < 10 || threshold > 80) {
      return res.status(400).json({ message: 'Threshold harus antara 10–80%!' })
    }

    if (durasiSiram < 1 || durasiSiram > 300) {
      return res.status(400).json({ message: 'Durasi harus antara 1–300 detik!' })
    }

    let settings = await Settings.findOne()
    if (!settings) {
      settings = new Settings({ threshold, durasiSiram })
    } else {
      settings.threshold   = threshold
      settings.durasiSiram = durasiSiram
      settings.updatedAt   = Date.now()
    }

    await settings.save()
    res.json({ message: 'Settings berhasil disimpan!', settings })
  } catch (err) {
    res.status(500).json({ message: 'Gagal update settings', error: err.message })
  }
}

module.exports = { getSettings, updateSettings }