require('dotenv').config()

const path = require('path')
const fs = require('fs')
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const multer = require('multer')

const zhipu = require('./services/zhipu')

const app = express()

// 上传目录需存在，static 才能正常提供图片
const UPLOAD_ROOT = path.join(__dirname, 'uploads')
fs.mkdirSync(UPLOAD_ROOT, { recursive: true })

// 前端构建产物目录（执行过 npm run build 后存在）
const DIST_DIR = path.join(__dirname, '..', 'dist')

const origins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)

app.use(cors({ origin: origins }))
app.use(express.json({ limit: '10mb' }))
app.use('/uploads', express.static(UPLOAD_ROOT))

app.use('/api/auth', require('./routers/auth'))
app.use('/api/me', require('./routers/profile'))
app.use('/api/stats', require('./routers/stats'))
app.use('/api/analyze', require('./routers/analyze'))
app.use('/api/records', require('./routers/records'))
app.use('/api/articles', require('./routers/articles'))
app.use('/api/conversations', require('./routers/assistant'))
app.use('/api/checkins', require('./routers/checkin'))

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    aiEnabled: zhipu.isAvailable(),
    models: zhipu.modelNames(),
    time: new Date().toISOString(),
  })
})

// 若已构建前端，则由本服务一并托管：单进程即可访问 http://localhost:3000
if (fs.existsSync(path.join(DIST_DIR, 'index.html'))) {
  app.use(express.static(DIST_DIR))
  // SPA 回退：非 /api、/uploads 的路由统一返回 index.html，交给前端路由处理
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next()
    return res.sendFile(path.join(DIST_DIR, 'index.html'))
  })
}

app.use((req, res) => res.status(404).json({ message: '接口不存在' }))

// 统一错误处理
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const map = {
      LIMIT_FILE_SIZE: '图片过大（单张上限 8MB）',
      LIMIT_FILE_COUNT: '文件数量超出限制',
      LIMIT_UNEXPECTED_FILE: '上传字段不正确，应为 tongue 与 teeth',
    }
    return res.status(400).json({ message: map[err.code] || '上传失败' })
  }
  if (err && err.message === '仅支持图片文件') {
    return res.status(400).json({ message: err.message })
  }
  const status = err.status || 500
  if (status >= 500) console.error('[error]', err)
  return res.status(status).json({ message: status >= 500 ? '服务器错误，请稍后重试' : err.message })
})

const PORT = Number(process.env.PORT || 3000)

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected:', process.env.MONGO_URI)
    const aiState = zhipu.isAvailable()
      ? `已启用（${zhipu.modelNames().vision} / ${zhipu.modelNames().chat}）`
      : '未启用（将使用本地规则兜底）'
    console.log('智谱 GLM:', aiState)
    app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`))
  })
  .catch((err) => {
    console.error('MongoDB 连接失败:', err.message)
    process.exit(1)
  })
