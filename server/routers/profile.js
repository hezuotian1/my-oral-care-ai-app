const express = require('express')
const User = require('../models/User')
const { auth } = require('../middleware/auth')
const { publicUser } = require('./auth')

const router = express.Router()

const ALLOWED_GENDER = ['male', 'female', 'unknown']

router.get('/', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: '用户不存在' })
    return res.json(publicUser(user))
  } catch (err) {
    return next(err)
  }
})

router.put('/', auth, async (req, res, next) => {
  try {
    const { realName, avatar, gender, age } = req.body || {}
    const user = await User.findById(req.userId)
    if (!user) return res.status(404).json({ message: '用户不存在' })

    if (typeof realName === 'string' && realName.trim()) user.realName = realName.trim().slice(0, 20)
    if (typeof avatar === 'string') user.avatar = avatar.slice(0, 500)
    if (ALLOWED_GENDER.includes(gender)) user.gender = gender
    if (age === null) user.age = null
    else if (age !== undefined) {
      const n = Number(age)
      if (Number.isFinite(n) && n >= 0 && n <= 150) user.age = Math.round(n)
    }

    await user.save()
    return res.json({ message: '保存成功', user: publicUser(user) })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
