const Jadwal = require('../models/Jadwal')

// Ambil semua jadwal
const getSemuaJadwal = async (req, res) => {
  try {
    const jadwal = await Jadwal.find().sort({ createdAt: -1 })
    res.json(jadwal)
  } catch (err) {
    res.status(500).json({ message: 'Gagal ambil jadwal', error: err.message })
  }
}

// Tambah jadwal baru
const tambahJadwal = async (req, res) => {
  try {
    const { zone, time, duration } = req.body

    const jadwal = new Jadwal({ zone, time, duration })
    await jadwal.save()

    res.status(201).json({ message: 'Jadwal ditambahkan!', jadwal })
  } catch (err) {
    res.status(500).json({ message: 'Gagal tambah jadwal', error: err.message })
  }
}

// Hapus jadwal
const hapusJadwal = async (req, res) => {
  try {
    const { id } = req.params

    await Jadwal.findByIdAndDelete(id)

    res.json({ message: 'Jadwal dihapus!' })
  } catch (err) {
    res.status(500).json({ message: 'Gagal hapus jadwal', error: err.message })
  }
}

module.exports = { getSemuaJadwal, tambahJadwal, hapusJadwal }