const mongoose = require('mongoose')

const settingsSchema = new mongoose.Schema({
  threshold:   { type: Number, default: 35  },
  durasiSiram: { type: Number, default: 10  },
  updatedAt:   { type: Date,   default: Date.now },
})

module.exports = mongoose.model('Settings', settingsSchema)