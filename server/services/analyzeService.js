const zhipu = require('./zhipu')
const chatService = require('./chatService')
const { extractJson, cleanText, pickEnum, clampNumber } = require('../utils/json')
const rules = require('../knowledge/rules')

/**
 * 分析编排层。
 *
 * 抽象出「双分支提取」的形态：extractTongue / extractTeeth。
 * 当前实现由视觉大模型承担，未来若替换为本地 CNN 微服务，只需替换这两个函数，
 * 对外接口协议（{tongue, teeth, fusion}）保持不变。
 */

const TONGUE_PROMPT = `你是一位专业的中医舌诊专家。请仔细观察这张舌象照片，完成以下判断：
1. 舌质颜色（淡白 / 淡红 / 红 / 绛 / 紫暗）
2. 舌苔（薄白 / 白厚 / 薄黄 / 黄厚 / 厚腻 / 剥脱）
3. 舌体形态（正常 / 胖大 / 瘦薄 / 齿痕 / 裂纹）
4. 舌下络脉（正常 / 迂曲 / 青紫）
5. 综合判断健康程度
6. 给出 1-2 句调理建议
7. 简要中医依据

只输出一个 JSON 对象，不要输出任何解释性文字、不要使用代码块以外的内容。格式如下：
{
  "level": "healthy 或 mild 或 moderate 或 severe",
  "diagnosis": "不超过 12 字的诊断名，如 齿痕舌、厚腻苔",
  "description": "一段客观的观察描述",
  "features": {
    "tongueColor": "舌质颜色",
    "coating": "舌苔",
    "shape": "舌体形态",
    "sublingualVein": "舌下络脉"
  },
  "advice": "调理建议",
  "medicalBasis": "中医依据",
  "confidence": 0.85
}`

const TEETH_PROMPT = `你是一位专业口腔科医生。请仔细观察这张牙齿/牙龈实拍照片，识别以下外观特征并给出判断：
- 牙结石、牙菌斑、牙龈红肿、牙龈退缩、牙面色素/黑斑、牙间隙发黑、牙齿磨损等

只输出一个 JSON 对象，不要输出任何解释性文字、不要使用代码块以外的内容。格式如下：
{
  "level": "healthy 或 mild 或 moderate 或 severe",
  "diagnosis": "不超过 15 字的诊断名",
  "description": "一段客观的观察描述",
  "findings": [
    { "label": "牙结石", "severity": "mild 或 moderate 或 severe", "note": "位置与程度简述" }
  ],
  "advice": "口腔护理建议",
  "confidence": 0.85
}
若未见明显异常，findings 返回空数组 []。`

const ALLOWED_LEVELS = rules.LEVELS
const ALLOWED_SEVERITY = ['mild', 'moderate', 'severe']

/** 由图片提取舌象结果（兼容模型返回非严格 JSON） */
async function extractTongue(buffer, mime) {
  const text = await zhipu.analyzeImage({ buffer, mime, prompt: TONGUE_PROMPT })
  const raw = extractJson(text)
  if (!raw) throw new Error('模型未返回可解析的 JSON')
  return normalizeTongue(raw)
}

/** 由图片提取牙齿结果 */
async function extractTeeth(buffer, mime) {
  const text = await zhipu.analyzeImage({ buffer, mime, prompt: TEETH_PROMPT })
  const raw = extractJson(text)
  if (!raw) throw new Error('模型未返回可解析的 JSON')
  return normalizeTeeth(raw)
}

function normalizeTongue(raw) {
  const level = pickEnum(raw.level, ALLOWED_LEVELS, 'moderate')
  const meta = rules.levelMeta(level)
  const f = raw.features || {}
  return {
    level: meta.level,
    levelClass: meta.levelClass,
    icon: meta.icon,
    diagnosis: cleanText(raw.diagnosis, 40) || '舌象分析',
    description: cleanText(raw.description, 300),
    features: {
      tongueColor: cleanText(f.tongueColor, 20),
      coating: cleanText(f.coating, 20),
      shape: cleanText(f.shape, 20),
      sublingualVein: cleanText(f.sublingualVein, 20),
    },
    advice: cleanText(raw.advice, 300),
    medicalBasis: cleanText(raw.medicalBasis, 200),
    confidence: clampNumber(raw.confidence, 0, 1, 0.6),
    aiEnhanced: true,
  }
}

function normalizeTeeth(raw) {
  const level = pickEnum(raw.level, ALLOWED_LEVELS, 'moderate')
  const list = Array.isArray(raw.findings) ? raw.findings : []
  const findings = list
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      label: cleanText(item.label, 20) || '异常',
      severity: pickEnum(item.severity, ALLOWED_SEVERITY, 'mild'),
      note: cleanText(item.note, 120),
    }))
    .slice(0, 8)

  return {
    level,
    diagnosis: cleanText(raw.diagnosis, 40) || '牙齿外观分析',
    description: cleanText(raw.description, 300),
    findings,
    advice: cleanText(raw.advice, 300),
    confidence: clampNumber(raw.confidence, 0, 1, 0.6),
    aiEnhanced: true,
  }
}

function reasonOf(err) {
  if (!err) return '未知原因'
  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') return '请求超时'
  const status = err.response && err.response.status
  if (status === 401) return 'API Key 无效'
  if (status === 429) return '调用频率超限'
  if (status) return `接口返回 ${status}`
  return cleanText(err.message, 60) || '未知原因'
}

/**
 * 完整分析流程：双分支并行提取 → 本地辨证融合与打分 → 生成养护文案。
 * 返回面向前端的报告对象，不含图片路径（由路由层补充）。
 */
async function analyze({ teethFile, tongueFile }) {
  const startedAt = Date.now()
  const { vision } = zhipu.modelNames()

  const [tongueSettled, teethSettled] = await Promise.allSettled([
    extractTongue(tongueFile.buffer, tongueFile.mimetype),
    extractTeeth(teethFile.buffer, teethFile.mimetype),
  ])

  let tongue
  let tongueReason = ''
  if (tongueSettled.status === 'fulfilled') {
    tongue = tongueSettled.value
  } else {
    tongueReason = reasonOf(tongueSettled.reason)
    tongue = rules.fallbackTongue(tongueReason)
  }

  let teeth
  let teethReason = ''
  if (teethSettled.status === 'fulfilled') {
    teeth = teethSettled.value
  } else {
    teethReason = reasonOf(teethSettled.reason)
    teeth = rules.fallbackTeeth(teethReason)
  }

  const aiEnhanced = Boolean(tongue.aiEnhanced || teeth.aiEnhanced)

  const fusion = rules.buildFusion(tongue, teeth)
  fusion.advice = await chatService.generateCareAdvice({ tongue, teeth, fusion })

  const processingTime = `${((Date.now() - startedAt) / 1000).toFixed(1)}s`

  return {
    tongue,
    teeth,
    fusion,
    aiModel: vision,
    aiEnhanced,
    processingTime,
    disclaimer: rules.DISCLAIMER,
    notes: [tongueReason, teethReason].filter(Boolean),
  }
}

module.exports = { analyze, extractTongue, extractTeeth }
