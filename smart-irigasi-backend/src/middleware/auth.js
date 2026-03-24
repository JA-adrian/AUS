const jwt  = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  try {
    // Cek token di header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Akses ditolak! Silakan login.' })
    }

    const token = authHeader.split(' ')[1]

    // Verifikasi token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Cek user masih ada di database
    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).json({ message: 'User tidak ditemukan!' })
    }

    req.user = user
    next()
  } catch (err) {
    res.status(401).json({ message: 'Token tidak valid atau sudah expired!' })
  }
}

module.exports = { protect }