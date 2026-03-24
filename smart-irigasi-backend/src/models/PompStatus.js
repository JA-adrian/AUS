const mongoose = require('mongoose')

const pompStatusSchema = new mongoose.Schema({
  zone: {
    type: String,
    required: true,
    enum: ['zona-a', 'zona-b', 'zona-c'],
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('PompStatus', pompStatusSchema)