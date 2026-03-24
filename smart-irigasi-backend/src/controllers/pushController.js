const webpush          = require('web-push')
const PushSubscription = require('../models/PushSubscription')

// Setup VAPID
webpush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

// Simpan subscription dari browser
const subscribe = async (req, res) => {
  try {
    const { endpoint, keys } = req.body

    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { endpoint, keys },
      { upsert: true, new: true }
    )

    res.status(201).json({ message: 'Subscription berhasil!' })
  } catch (err) {
    res.status(500).json({ message: 'Gagal subscribe', error: err.message })
  }
}

// Kirim notifikasi ke semua subscriber
const kirimNotifikasi = async (judul, pesan, tipe = 'info') => {
  try {
    const subscriptions = await PushSubscription.find()

    const payload = JSON.stringify({
      judul,
      pesan,
      tipe,
      waktu: new Date().toLocaleTimeString('id-ID'),
    })

    const promises = subscriptions.map(sub =>
      webpush.sendNotification({
        endpoint: sub.endpoint,
        keys:     sub.keys,
      }, payload).catch(err => {
        // Hapus subscription yang tidak valid
        if (err.statusCode === 410) {
          PushSubscription.deleteOne({ endpoint: sub.endpoint })
        }
      })
    )

    await Promise.all(promises)
    console.log(`Push notification terkirim: ${judul}`)
  } catch (err) {
    console.log('Gagal kirim push notification:', err.message)
  }
}

module.exports = { subscribe, kirimNotifikasi }