const mongoose = require('mongoose')

const sensorDataSchema = new mongoose.Schema({
  moisture: {
    type: Number,
    required: true,
  },
  temperature: {
    type: Number,
    required: true,
  },
  humidity: {
    type: Number,
    required: true,
  },
  zone: {
    type: String,
    required: true,
    enum: ['zona-a', 'zona-b', 'zona-c'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('SensorData', sensorDataSchema)