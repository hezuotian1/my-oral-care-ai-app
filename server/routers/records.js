const express = require('express')
const mongoose = require('mongoose')
const Record = require('../models/Record')
const { auth } = require('../middleware/auth')
const { shiftDays } = require('../utils/date')

const router = express.Router()

/** 列表项摘要（不返回完整报告，减小体积） */
function toListItem(r) {
  return {
    id: r._id.toString(),
    createdAt: r.createdAt,
    level: r.level,
    levelClass: r.levelClass,
    score: r.score,
    syndrome: r.fusion && r.fusion.syndrome,
    tongueSummary: r.tongue && r.tongue.diagnosis,
    teethSummary: r.teeth && r.teeth.diagnosis,
    factors: (r.fusion && r.fusion.riskTags) || [],
  }
}

/** 趋势数据（必须放在 /:id 之前，否则会被当成 id 捕获） */
router.get('/trend', auth, async (req, res, next) => {
  try {
    const days = Math.min(180, Math.max(1, Number(req.query.days) || 30))
    const since = shiftDays(new Date(), -days)
    const rows = await Record.find({ userId: req.userId, createdAt: { $gte: since } })
      .select('createdAt score level')
      .sort({ createdAt: 1 })
      .lean()

    const points = rows.map((r) => ({
      date: new Date(r.createdAt).toISOString().slice(0, 10),
      score: r.score,
      level: r.level,
    }))
    return res.json({ days, points })
  } catch (err) {
    return next(err)
  }
})

router.get('/', auth, async (req, res, next) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize) || 10))
    const filter = { userId: req.userId }

    const [total, rows] = await Promise.all([
      Record.countDocuments(filter),
      Record.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
    ])

    return res.json({ list: rows.map(toListItem), total, page, pageSize })
  } catch (err) {
    return next(err)
  }
})

router.get('/:id', auth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: '记录 ID 不合法' })
    }
    const doc = await Record.findOne({ _id: req.params.id, userId: req.userId }).lean()
    if (!doc) return res.status(404).json({ message: '记录不存在' })
    return res.json({
      id: doc._id.toString(),
      createdAt: doc.createdAt,
      tongue: doc.tongue,
      teeth: doc.teeth,
      fusion: doc.fusion,
      level: doc.level,
      levelClass: doc.levelClass,
      score: doc.score,
      aiModel: doc.aiModel,
      aiEnhanced: doc.aiEnhanced,
      processingTime: doc.processingTime,
      disclaimer: doc.disclaimer,
      images: { tongue: doc.tongueImage, teeth: doc.teethImage },
    })
  } catch (err) {
    return next(err)
  }
})

router.delete('/:id', auth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: '记录 ID 不合法' })
    }
    const deleted = await Record.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!deleted) return res.status(404).json({ message: '记录不存在' })
    return res.json({ message: '已删除' })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
