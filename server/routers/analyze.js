const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const mongoose = require('mongoose')
const Record = require('../models/Record')
const { auth } = require('../middleware/auth')
const analyzeService = require('../services/analyzeService')

const router = express.Router()

// 用内存存储：既要把图片转 base64 送视觉模型，也要先校验再落盘
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 2 },
  fileFilter(req, file, cb) {
    if (file.mimetype && file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('仅支持图片文件'))
  },
})

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads')

function saveImage(buffer, userId, recordId, kind, mime) {
  const ext = /png/i.test(mime || '') ? 'png' : 'jpg'
  const dir = path.join(UPLOAD_ROOT, String(userId))
  fs.mkdirSync(dir, { recursive: true })
  const filename = `${recordId}-${kind}.${ext}`
  fs.writeFileSync(path.join(dir, filename), buffer)
  return `/uploads/${userId}/${filename}`
}

router.post(
  '/',
  auth,
  upload.fields([
    { name: 'tongue', maxCount: 1 },
    { name: 'teeth', maxCount: 1 },
  ]),
  async (req, res, next) => {
    try {
      const files = req.files || {}
      const tongueFile = files.tongue && files.tongue[0]
      const teethFile = files.teeth && files.teeth[0]
      if (!tongueFile || !teethFile) {
        return res.status(400).json({ message: '请同时上传舌象照片与牙齿照片' })
      }

      const report = await analyzeService.analyze({ tongueFile, teethFile })

      const recordId = new mongoose.Types.ObjectId()
      const tongueImage = saveImage(tongueFile.buffer, req.userId, recordId, 'tongue', tongueFile.mimetype)
      const teethImage = saveImage(teethFile.buffer, req.userId, recordId, 'teeth', teethFile.mimetype)

      const doc = await Record.create({
        _id: recordId,
        userId: req.userId,
        tongueImage,
        teethImage,
        tongue: report.tongue,
        teeth: report.teeth,
        fusion: report.fusion,
        level: report.fusion.level,
        levelClass: report.fusion.levelClass,
        score: report.fusion.score,
        aiModel: report.aiModel,
        aiEnhanced: report.aiEnhanced,
        processingTime: report.processingTime,
        disclaimer: report.disclaimer,
      })

      return res.status(201).json({
        recordId: doc._id.toString(),
        createdAt: doc.createdAt,
        processingTime: report.processingTime,
        tongue: report.tongue,
        teeth: report.teeth,
        fusion: report.fusion,
        aiModel: report.aiModel,
        aiEnhanced: report.aiEnhanced,
        disclaimer: report.disclaimer,
        notes: report.notes,
        images: { tongue: tongueImage, teeth: teethImage },
      })
    } catch (err) {
      return next(err)
    }
  },
)

module.exports = router
