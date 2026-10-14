const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    realName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    avatar: { type: String, default: '' },
    gender: { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
    age: { type: Number, min: 0, max: 150, default: null },
  },
  { timestamps: true },
)

module.exports = mongoose.model('User', userSchema)
