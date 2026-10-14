const express = require('express')
const Checkin = require('../models/Checkin')
const { auth } = require('../middleware/auth')
const { todayStr, computeStreak } = require('../utils/date')

const router = express.Router()

/** 查询该用户全部打卡日期（升序） */
async function listDates(userId) {
  const rows = await Checkin.find({ userId }).select('date').lean()
  return rows.map((r) => r.date).sort()
}

router.post('/', auth, async (req, res, next) => {
  try {
    const date = todayStr()
    // upsert：同一天重复打卡不会报错，也不会产生重复记录（唯一索引兜底）
    await Checkin.updateOne({ userId: req.userId, date }, { $setOnInsert: { userId: req.userId, date } }, { upsert: true })
    const dates = await listDates(req.userId)
    return res.json({ message: '打卡成功', date, streakDays: computeStreak(dates), dates })
  } catch (err) {
    return next(err)
  }
})

router.get('/streak', auth, async (req, res, next) => {
  try {
    const dates = await listDates(req.userId)
    return res.json({ streakDays: computeStreak(dates), dates })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
module.exports.listDates = listDates
