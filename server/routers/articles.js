const express = require('express')
const mongoose = require('mongoose')
const Article = require('../models/Article')
const { auth } = require('../middleware/auth')

const router = express.Router()

router.get('/', auth, async (req, res, next) => {
  try {
    const { category } = req.query
    const filter = category ? { category } : {}
    const rows = await Article.find(filter)
      .sort({ order: 1, publishedAt: -1 })
      .select('title summary category tags readCount publishedAt')
      .lean()

    const list = rows.map((a) => ({
      id: a._id.toString(),
      title: a.title,
      summary: a.summary,
      category: a.category,
      tags: a.tags,
      readCount: a.readCount,
      publishedAt: a.publishedAt,
    }))
    const categories = [...new Set(rows.map((a) => a.category))]
    return res.json({ list, categories })
  } catch (err) {
    return next(err)
  }
})

router.get('/:id', auth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: '文章 ID 不合法' })
    }
    const doc = await Article.findByIdAndUpdate(req.params.id, { $inc: { readCount: 1 } }, { new: true }).lean()
    if (!doc) return res.status(404).json({ message: '文章不存在' })
    return res.json({
      id: doc._id.toString(),
      title: doc.title,
      summary: doc.summary,
      category: doc.category,
      tags: doc.tags,
      content: doc.content,
      readCount: doc.readCount,
      publishedAt: doc.publishedAt,
    })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
