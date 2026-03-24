const mongoose = require('mongoose')

const jadwalSchema = new mongoose.Schema({
  zone: {
    type: String,
    required: true,
    enum: ['zona-a', 'zona-b', 'zona-c'],
  },
  time: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 60,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('Jadwal', jadwalSchema)