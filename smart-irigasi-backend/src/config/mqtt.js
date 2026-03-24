const mqtt                = require('mqtt')
const SensorData          = require('../models/SensorData')
const Alert               = require('../models/Alert')
const PompStatus          = require('../models/PompStatus')
const Settings            = require('../models/Settings')
const { kirimNotifikasi } = require('../controllers/pushController')

let mqttClient = null

const getMQTTClient = () => mqttClient

const connectMQTT = () => {
  const client = mqtt.connect({
    host:     process.env.MQTT_HOST,
    port:     process.env.MQTT_PORT,
    protocol: 'mqtts',
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
  })

  client.on('connect', () => {
    console.log('MQTT terhubung ke HiveMQ!')
    client.subscribe('irigasi/sensor/zona-a')
    client.subscribe('irigasi/sensor/zona-b')
    client.subscribe('irigasi/sensor/zona-c')
    client.subscribe('irigasi/pompa/status')
    console.log('Subscribe ke topic irigasi/sensor & irigasi/pompa berhasil!')
    mqttClient = client
  })

  client.on('message', async (topic, message) => {
    try {
      const data = JSON.parse(message.toString())
      console.log(`Pesan dari topic ${topic}:`, data)

      if (topic.startsWith('irigasi/sensor/')) {
        const zone = topic.split('/')[2]

        // Simpan data sensor
        const sensor = new SensorData({
          moisture:    data.moisture,
          temperature: data.temperature,
          humidity:    data.humidity,
          zone,
        })
        await sensor.save()
        console.log(`Data sensor ${zone} tersimpan!`)

        // ── Auto siram ──────────────────────────────
        // Ambil settings dari database
        let settings = await Settings.findOne()
        if (!settings) settings = { threshold: 35, durasiSiram: 10 }
        const THRESHOLD    = settings.threshold
        const DURASI_SIRAM = settings.durasiSiram

        if (data.moisture < THRESHOLD) {
          const statusPompa = await PompStatus.findOne({ zone })
          if (!statusPompa || !statusPompa.isActive) {
            console.log(`Auto siram ${zone} — moisture ${data.moisture}% < ${THRESHOLD}%`)

            // Nyalakan pompa
            await PompStatus.findOneAndUpdate(
              { zone },
              { isActive: true, updatedAt: Date.now() },
              { new: true, upsert: true }
            )
            client.publish(`irigasi/pompa/${zone}`, JSON.stringify({ isActive: true }))

            // Alert + push notification nyala
            await new Alert({
              type:  'info',
              judul: 'Auto Siram Aktif',
              pesan: `Pompa ${zone} dinyalakan otomatis — moisture ${data.moisture}%`,
            }).save()

            await kirimNotifikasi(
              'Auto Siram Aktif',
              `Pompa ${zone} dinyalakan otomatis — moisture ${data.moisture}%`,
              'info'
            )

            // Matikan setelah durasi
            setTimeout(async () => {
              await PompStatus.findOneAndUpdate(
                { zone },
                { isActive: false, updatedAt: Date.now() },
                { new: true, upsert: true }
              )
              client.publish(`irigasi/pompa/${zone}`, JSON.stringify({ isActive: false }))
              console.log(`Auto siram ${zone} selesai!`)

              // Alert + push notification selesai
              await new Alert({
                type:  'info',
                judul: 'Auto Siram Selesai',
                pesan: `Pompa ${zone} dimatikan otomatis setelah ${DURASI_SIRAM} detik`,
              }).save()

              await kirimNotifikasi(
                'Auto Siram Selesai',
                `Pompa ${zone} dimatikan otomatis setelah ${DURASI_SIRAM} detik`,
                'info'
              )
            }, DURASI_SIRAM * 1000)
          }
        }

        // ── Alert kelembapan rendah ─────────────────
        if (data.moisture < 30) {
          await new Alert({
            type:  'warning',
            judul: 'Kelembapan Terlalu Rendah',
            pesan: `Kelembapan tanah ${zone} turun ke ${data.moisture}% — di bawah threshold!`,
          }).save()

          await kirimNotifikasi(
            'Kelembapan Terlalu Rendah ⚠️',
            `Kelembapan tanah ${zone} turun ke ${data.moisture}%!`,
            'warning'
          )
        }

        // ── Alert suhu tinggi ───────────────────────
        if (data.temperature > 35) {
          await new Alert({
            type:  'warning',
            judul: 'Suhu Udara Terlalu Tinggi',
            pesan: `Suhu udara di ${zone} mencapai ${data.temperature}°C!`,
          }).save()

          await kirimNotifikasi(
            'Suhu Udara Tinggi ⚠️',
            `Suhu udara di ${zone} mencapai ${data.temperature}°C!`,
            'warning'
          )
        }
      }
    } catch (err) {
      console.log('Gagal proses pesan MQTT:', err.message)
    }
  })

  client.on('error', (err) => {
    console.log('MQTT error:', err.message)
  })

  client.on('disconnect', () => {
    console.log('MQTT terputus!')
  })

  return client
}

module.exports = { connectMQTT, getMQTTClient }