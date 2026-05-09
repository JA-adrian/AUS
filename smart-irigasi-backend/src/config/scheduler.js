const cron       = require('node-cron')
const Jadwal     = require('../models/Jadwal')
const PompStatus = require('../models/PompStatus')
const Alert      = require('../models/Alert')
const { getMQTTClient } = require('./mqtt')

const startScheduler = () => {
  // Cek setiap menit
  cron.schedule('* * * * *', async () => {
    try {
      const sekarang = new Date()
      const jamSekarang = sekarang.getHours().toString().padStart(2, '0')
      const menitSekarang = sekarang.getMinutes().toString().padStart(2, '0')
      const waktuSekarang = `${jamSekarang}:${menitSekarang}`

      console.log(`Scheduler cek jadwal: ${waktuSekarang}`)

      // Cari jadwal yang waktunya cocok
      const jadwalAktif = await Jadwal.find({
        time:     waktuSekarang,
        isActive: true,
      })

      if (jadwalAktif.length === 0) return

      const client = getMQTTClient()
      if (!client) {
        console.log('MQTT client tidak tersedia!')
        return
      }

      for (const jadwal of jadwalAktif) {
        console.log(`Menjalankan jadwal: ${jadwal.zone} selama ${jadwal.duration} detik`)

        // Nyalakan pompa
        await PompStatus.findOneAndUpdate(
          { zone: jadwal.zone },
          { isActive: true, updatedAt: Date.now() },
          { new: true, upsert: true }
        )
        client.publish(`irigasi/pompa/${jadwal.zone}`, JSON.stringify({ isActive: true }))

        // Simpan alert
        await new Alert({
          type:  'info',
          judul: 'Jadwal Penyiraman Aktif',
          pesan: `Pompa ${jadwal.zone} dinyalakan sesuai jadwal pukul ${jadwal.time} selama ${jadwal.duration} detik`,
        }).save()

        // Matikan setelah durasi
        setTimeout(async () => {
          await PompStatus.findOneAndUpdate(
            { zone: jadwal.zone },
            { isActive: false, updatedAt: Date.now() },
            { new: true, upsert: true }
          )
          client.publish(`irigasi/pompa/${jadwal.zone}`, JSON.stringify({ isActive: false }))
          console.log(`Jadwal selesai: ${jadwal.zone}`)

          await new Alert({
            type:  'info',
            judul: 'Jadwal Penyiraman Selesai',
            pesan: `Pompa ${jadwal.zone} dimatikan setelah ${jadwal.duration} detik`,
          }).save()
        }, jadwal.duration * 1000)
      }
    } catch (err) {
      console.log('Scheduler error:', err.message)
    }
  })

  console.log('Scheduler berjalan!')
}

module.exports = { startScheduler }