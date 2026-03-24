const PompStatus  = require('../models/PompStatus')
const { getMQTTClient } = require('../config/mqtt')

// Ambil status semua pompa
const getSemuaStatus = async (req, res) => {
  try {
    const status = await PompStatus.find()
    res.json(status)
  } catch (err) {
    res.status(500).json({ message: 'Gagal ambil status', error: err.message })
  }
}

// Update status pompa (on/off)
const updateStatus = async (req, res) => {
  try {
    const { zone }     = req.params
    const { isActive } = req.body

    // Update database
    const status = await PompStatus.findOneAndUpdate(
      { zone },
      { isActive, updatedAt: Date.now() },
      { new: true, upsert: true }
    )

    // Publish ke MQTT supaya ESP32 terima perintah
    const client = getMQTTClient()
    if (client) {
      const topic   = `irigasi/pompa/${zone}`
      const payload = JSON.stringify({ isActive })
      client.publish(topic, payload)
      console.log(`MQTT publish ke ${topic}:`, payload)
    }

    res.json({ message: `Pompa ${zone} ${isActive ? 'dinyalakan' : 'dimatikan'}`, status })
  } catch (err) {
    res.status(500).json({ message: 'Gagal update status', error: err.message })
  }
}

module.exports = { getSemuaStatus, updateStatus }