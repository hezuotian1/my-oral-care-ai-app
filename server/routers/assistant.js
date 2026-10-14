const express = require('express')
const mongoose = require('mongoose')
const Conversation = require('../models/Conversation')
const { auth } = require('../middleware/auth')
const chatService = require('../services/chatService')

const router = express.Router()

function preview(messages) {
  const last = messages[messages.length - 1]
  if (!last) return ''
  return last.content.slice(0, 40)
}

router.get('/', auth, async (req, res, next) => {
  try {
    const rows = await Conversation.find({ userId: req.userId })
      .sort({ updatedAt: -1 })
      .select('title messages updatedAt')
      .lean()
    const list = rows.map((c) => ({
      id: c._id.toString(),
      title: c.title,
      preview: preview(c.messages || []),
      updatedAt: c.updatedAt,
      messageCount: (c.messages || []).length,
    }))
    return res.json({ list })
  } catch (err) {
    return next(err)
  }
})

router.post('/', auth, async (req, res, next) => {
  try {
    const title = (req.body && req.body.title) || '新的咨询'
    const doc = await Conversation.create({ userId: req.userId, title: title.slice(0, 30), messages: [] })
    return res.status(201).json({ id: doc._id.toString(), title: doc.title, messages: [] })
  } catch (err) {
    return next(err)
  }
})

router.get('/:id', auth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: '会话 ID 不合法' })
    }
    const doc = await Conversation.findOne({ _id: req.params.id, userId: req.userId }).lean()
    if (!doc) return res.status(404).json({ message: '会话不存在' })
    return res.json({ id: doc._id.toString(), title: doc.title, messages: doc.messages || [] })
  } catch (err) {
    return next(err)
  }
})

router.post('/:id/messages', auth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: '会话 ID 不合法' })
    }
    const content = (req.body && req.body.content ? String(req.body.content) : '').trim()
    if (!content) return res.status(400).json({ message: '请输入内容' })
    if (content.length > 2000) return res.status(400).json({ message: '内容过长（上限 2000 字）' })

    const doc = await Conversation.findOne({ _id: req.params.id, userId: req.userId })
    if (!doc) return res.status(404).json({ message: '会话不存在' })

    const history = (doc.messages || []).map((m) => ({ role: m.role, content: m.content }))
    const answer = await chatService.reply(history, content)

    doc.messages.push({ role: 'user', content })
    doc.messages.push({ role: 'assistant', content: answer })
    // 首轮对话用用户的话作为标题
    if (doc.messages.length <= 2 && (doc.title === '新的咨询' || !doc.title)) {
      doc.title = content.slice(0, 20)
    }
    await doc.save()

    const saved = doc.messages.slice(-2)
    return res.json({ userMessage: saved[0], assistantMessage: saved[1] })
  } catch (err) {
    return next(err)
  }
})

router.delete('/:id', auth, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: '会话 ID 不合法' })
    }
    const deleted = await Conversation.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!deleted) return res.status(404).json({ message: '会话不存在' })
    return res.json({ message: '已删除' })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
