const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, default: '' },
    category: { type: String, default: '科普', index: true },
    tags: { type: [String], default: [] },
    content: { type: String, default: '' },
    readCount: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

articleSchema.index({ order: 1, publishedAt: -1 })

module.exports = mongoose.model('Article', articleSchema)
