const express = require('express')
const Record = require('../models/Record')
const Checkin = require('../models/Checkin')
const Article = require('../models/Article')
const { auth } = require('../middleware/auth')
const { todayStr, computeStreak } = require('../utils/date')
const rules = require('../knowledge/rules')

const router = express.Router()

/** 判定异常项数量：中度及以上的牙齿异常 + 非健康的舌象 */
function countAbnormal(record) {
  if (!record) return 0
  const findings = (record.teeth && record.teeth.findings) || []
  const teethAbnormal = findings.filter((f) => f.severity === 'moderate' || f.severity === 'severe').length
  const tongueAbnormal = record.tongue && record.tongue.level !== 'healthy' ? 1 : 0
  return teethAbnormal + tongueAbnormal
}

router.get('/overview', auth, async (req, res, next) => {
  try {
    const today = todayStr()
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const [todayRecord, checkinDates, recentRows, articleCount] = await Promise.all([
      Record.findOne({ userId: req.userId, createdAt: { $gte: startOfToday } })
        .sort({ createdAt: -1 })
        .lean(),
      Checkin.find({ userId: req.userId }).select('date').lean(),
      Record.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('createdAt score level')
        .lean(),
      Article.countDocuments({}),
    ])

    const dates = checkinDates.map((c) => c.date)
    const streakDays = computeStreak(dates)
    const checkedToday = dates.includes(today)

    const todos = [
      {
        text: '今日拍照自查',
        type: 'scan',
        done: Boolean(todayRecord || recentRows.some((r) => toDateStr(r.createdAt) === today)),
      },
      { text: '每日健康打卡', type: 'checkin', done: checkedToday },
      { text: '阅读健康科普', type: 'read', done: false },
    ]

    return res.json({
      today: todayRecord
        ? {
            hasRecord: true,
            level: todayRecord.level,
            levelClass: todayRecord.levelClass,
            score: todayRecord.score,
            abnormalCount: countAbnormal(todayRecord),
          }
        : { hasRecord: false, level: null, levelClass: null, score: null, abnormalCount: 0 },
      streakDays,
      todos,
      tip: rules.randomTip(),
      recent: recentRows.map((r) => ({
        id: r._id.toString(),
        date: toDateStr(r.createdAt),
        score: r.score,
        level: r.level,
      })),
      articleCount,
    })
  } catch (err) {
    return next(err)
  }
})

function toDateStr(d) {
  return new Date(d).toISOString().slice(0, 10)
}

module.exports = router
