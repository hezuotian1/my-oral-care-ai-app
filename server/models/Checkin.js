const mongoose = require('mongoose')

const checkinSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    // YYYY-MM-DD（本地日期），与 userId 组成唯一索引，天然防重复打卡
    date: { type: String, required: true },
  },
  { timestamps: true },
)

checkinSchema.index({ userId: 1, date: 1 }, { unique: true })

module.exports = mongoose.model('Checkin', checkinSchema)
