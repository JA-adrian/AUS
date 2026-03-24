const express   = require('express')
const mongoose  = require('mongoose')
const cors      = require('cors')
require('dotenv').config()

const authRoutes   = require('./src/routes/authRoutes')
const sensorRoutes = require('./src/routes/sensorRoutes')
const pompRoutes   = require('./src/routes/pompRoutes')
const jadwalRoutes = require('./src/routes/jadwalRoutes')
const alertRoutes  = require('./src/routes/alertRoutes')
const pushRoutes = require('./src/routes/pushRoutes')
const settingsRoutes = require('./src/routes/settingsRoutes')
const { protect }  = require('./src/middleware/auth')
const { connectMQTT } = require('./src/config/mqtt')


const app = express()

app.use(cors())
app.use(express.json())

// Public routes (tanpa login)
app.use('/api/auth', authRoutes)
app.use('/api/push', pushRoutes)

// Protected routes (wajib login)
app.use('/api/sensor', protect, sensorRoutes)
app.use('/api/pompa',  protect, pompRoutes)
app.use('/api/jadwal', protect, jadwalRoutes)
app.use('/api/alert',  protect, alertRoutes)
app.use('/api/settings', settingsRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'Smart Irigasi API berjalan!' })
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB terhubung!')
    connectMQTT()
    app.listen(process.env.PORT, () => {
      console.log(`Server berjalan di port ${process.env.PORT}`)
    })
  })
  .catch(err => console.log('Error koneksi MongoDB:', err))