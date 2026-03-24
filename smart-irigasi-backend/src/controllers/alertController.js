const Alert = require('../models/Alert')

// Ambil semua alert
const getSemuaAlert = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 })
    res.json(alerts)
  } catch (err) {
    res.status(500).json({ message: 'Gagal ambil alert', error: err.message })
  }
}

// Tambah alert baru (nanti dipanggil otomatis dari sistem)
const tambahAlert = async (req, res) => {
  try {
    const { type, judul, pesan } = req.body
    const alert = new Alert({ type, judul, pesan })
    await alert.save()
    res.status(201).json({ message: 'Alert ditambahkan!', alert })
  } catch (err) {
    res.status(500).json({ message: 'Gagal tambah alert', error: err.message })
  }
}

// Hapus satu alert
const hapusAlert = async (req, res) => {
  try {
    const { id } = req.params
    await Alert.findByIdAndDelete(id)
    res.json({ message: 'Alert dihapus!' })
  } catch (err) {
    res.status(500).json({ message: 'Gagal hapus alert', error: err.message })
  }
}

// Hapus semua alert
const hapusSemuaAlert = async (req, res) => {
  try {
    await Alert.deleteMany({})
    res.json({ message: 'Semua alert dihapus!' })
  } catch (err) {
    res.status(500).json({ message: 'Gagal hapus semua alert', error: err.message })
  }
}

module.exports = { getSemuaAlert, tambahAlert, hapusAlert, hapusSemuaAlert }