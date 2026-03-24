const mongoose = require('mongoose')

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['warning', 'info'],
    required: true,
  },
  judul: {
    type: String,
    required: true,
  },
  pesan: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('Alert', alertSchema)