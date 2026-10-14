const jwt = require('jsonwebtoken')

/**
 * JWT Bearer 鉴权中间件：校验通过后把用户 id 写入 req.userId
 */
function auth(req, res, next) {
  const header = req.headers.authorization || ''
  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未登录或登录已过期' })
  }
  const token = header.slice(7).trim()
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = payload.id
    next()
  } catch (err) {
    return res.status(401).json({ message: '未登录或登录已过期' })
  }
}

module.exports = { auth }
