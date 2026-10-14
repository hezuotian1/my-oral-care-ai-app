const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const { maskPhone, validateRegister, PHONE_RE } = require('../utils/validators')

const router = express.Router()

/** 对外返回的用户信息（手机号脱敏） */
function publicUser(u) {
  return {
    id: u._id.toString(),
    realName: u.realName,
    phone: maskPhone(u.phone),
    avatar: u.avatar || '',
    gender: u.gender || 'unknown',
    age: u.age ?? null,
  }
}

/** 签发 token */
function signToken(userId) {
  return jwt.sign({ id: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  })
}

router.post('/register', async (req, res, next) => {
  try {
    const { realName, phone, password } = req.body || {}
    const invalid = validateRegister({ realName, phone, password })
    if (invalid) return res.status(400).json({ message: invalid })

    const exists = await User.findOne({ phone })
    if (exists) return res.status(409).json({ message: '该手机号已注册' })

    const hash = await bcrypt.hash(password, 10)
    const user = await User.create({ realName, phone, password: hash })
    return res.status(201).json({ message: '注册成功', userId: user._id.toString() })
  } catch (err) {
    return next(err)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { phone, password } = req.body || {}
    if (!phone || !PHONE_RE.test(phone)) return res.status(400).json({ message: '手机号格式不正确' })

    const user = await User.findOne({ phone })
    if (!user) return res.status(401).json({ message: '手机号或密码错误' })

    const ok = await bcrypt.compare(password || '', user.password)
    if (!ok) return res.status(401).json({ message: '手机号或密码错误' })

    return res.json({ message: '登录成功', token: signToken(user._id), user: publicUser(user) })
  } catch (err) {
    return next(err)
  }
})

module.exports = router
module.exports.publicUser = publicUser
module.exports.signToken = signToken
