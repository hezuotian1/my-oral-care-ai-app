const mongoose = require('mongoose')

const findingSchema = new mongoose.Schema(
  { label: String, severity: String, note: String },
  { _id: false },
)

const tongueSchema = new mongoose.Schema(
  {
    level: String,
    levelClass: String,
    icon: String,
    diagnosis: String,
    description: String,
    features: {
      tongueColor: String,
      coating: String,
      shape: String,
      sublingualVein: String,
    },
    advice: String,
    medicalBasis: String,
    confidence: Number,
    aiModel: String,
    aiEnhanced: Boolean,
  },
  { _id: false },
)

const teethSchema = new mongoose.Schema(
  {
    level: String,
    diagnosis: String,
    description: String,
    findings: [findingSchema],
    advice: String,
    confidence: Number,
    aiModel: String,
    aiEnhanced: Boolean,
  },
  { _id: false },
)

const fusionSchema = new mongoose.Schema(
  {
    level: String,
    levelClass: String,
    score: Number,
    syndrome: String,
    summary: String,
    advice: String,
    medicalBasis: String,
    riskTags: [String],
  },
  { _id: false },
)

const recordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tongueImage: { type: String, default: '' },
    teethImage: { type: String, default: '' },
    tongue: tongueSchema,
    teeth: teethSchema,
    fusion: fusionSchema,
    // 去范式化字段，供列表与趋势查询
    level: String,
    levelClass: String,
    score: Number,
    aiModel: String,
    aiEnhanced: { type: Boolean, default: false },
    processingTime: String,
    disclaimer: String,
  },
  { timestamps: true },
)

recordSchema.index({ userId: 1, createdAt: -1 })

module.exports = mongoose.model('Record', recordSchema)
