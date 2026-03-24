const jwt    = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User   = require('../models/User')

const buatToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  })
}

const register = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib diisi!' })
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password minimal 6 karakter!' })
    }

    const sudahAda = await User.findOne({ username })
    if (sudahAda) {
      return res.status(400).json({ message: 'Username sudah dipakai!' })
    }

    // Enkripsi password langsung di controller
    const salt           = await bcrypt.genSalt(10)
    const passwordHashed = await bcrypt.hash(password, salt)

    const user = new User({ username, password: passwordHashed })
    await user.save()

    const token = buatToken(user._id)

    res.status(201).json({
      message: 'Registrasi berhasil!',
      token,
      user: { id: user._id, username: user.username },
    })
  } catch (err) {
    res.status(500).json({ message: 'Gagal register', error: err.message })
  }
}

const login = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ message: 'Username dan password wajib diisi!' })
    }

    const user = await User.findOne({ username })
    if (!user) {
      return res.status(401).json({ message: 'Username atau password salah!' })
    }

    const cocok = await bcrypt.compare(password, user.password)
    if (!cocok) {
      return res.status(401).json({ message: 'Username atau password salah!' })
    }

    const token = buatToken(user._id)

    res.json({
      message: 'Login berhasil!',
      token,
      user: { id: user._id, username: user.username },
    })
  } catch (err) {
    res.status(500).json({ message: 'Gagal login', error: err.message })
  }
}

module.exports = { register, login }