/**
 * 中医舌齿辨证知识库与本地计算逻辑。
 *
 * 设计原则：
 *  - 分数与等级一律由本地规则计算，不让大模型决定，避免措辞波动导致的等级跳变；
 *  - 大模型只负责「看图描述」，融合推理与打分在这里完成；
 *  - 大模型不可用时，这里同时充当兜底数据源。
 */

const LEVEL_LABEL = {
  healthy: '健康',
  mild: '轻度异常',
  moderate: '中度异常',
  severe: '重度异常',
}

const LEVEL_CLASS = {
  healthy: 'excellent',
  mild: 'good',
  moderate: 'medium',
  severe: 'poor',
}

const LEVEL_ICON = {
  healthy: '✅',
  mild: '⚠️',
  moderate: '🔶',
  severe: '🔴',
}

const LEVELS = ['healthy', 'mild', 'moderate', 'severe']

/** 舌象等级对应的扣分 */
const TONGUE_PENALTY = { healthy: 0, mild: 6, moderate: 14, severe: 22 }

/** 牙齿异常项严重度对应的扣分 */
const FINDING_WEIGHT = { mild: 5, moderate: 11, severe: 18 }

/**
 * 舌齿辨证规则（源自作品说明的中医理论）：
 * 舌象特征 → 证型 → 对应牙齿/牙周风险
 */
const SYNDROME_RULES = [
  {
    id: 'spleen-damp',
    test: (t) => /齿痕/.test(t.features.shape || ''),
    syndrome: '脾虚湿盛',
    dental: '牙龈浮肿',
    basis: '齿痕舌多属脾虚湿盛、水湿不化，常伴随牙龈浮肿。',
  },
  {
    id: 'damp-heat',
    test: (t) => /厚|腻|黄/.test(t.features.coating || ''),
    syndrome: '口腔湿热',
    dental: '牙菌斑、牙结石',
    basis: '厚腻舌苔提示口腔湿热内蕴，更易滋生牙菌斑与牙结石。',
  },
  {
    id: 'qi-stasis',
    test: (t) => /暗红|紫|瘀/.test(t.features.tongueColor || ''),
    syndrome: '口腔气血淤滞',
    dental: '牙周循环差',
    basis: '舌色暗红提示气血运行不畅，牙周微循环欠佳。',
  },
  {
    id: 'yin-deficiency',
    test: (t) => /裂纹|干/.test(t.features.shape || ''),
    syndrome: '阴液亏虚',
    dental: '牙齿干涩敏感',
    basis: '舌面裂纹多属阴液亏虚，常伴牙面失润、牙齿敏感。',
  },
]

const DISCLAIMER = '本结果由 AI 图像识别与中医辨证规则综合生成，非医学诊断，仅供日常口腔健康参考。如有明显不适请及时就诊。'

const TIPS = [
  { title: '刷牙方法', content: '每天早晚各刷牙 2 分钟，采用改良 Bass 刷牙法，刷毛与牙面呈 45°，重点清洁牙龈沟。' },
  { title: '邻面清洁', content: '牙刷只能清洁约 60% 牙面，建议每天使用牙线或冲牙器清洁牙缝，减少邻面菌斑。' },
  { title: '舌苔清洁', content: '厚腻舌苔提示口腔湿热，可用软毛牙刷或舌苔清洁器轻刷舌面，改善口气与菌群环境。' },
  { title: '定期检查', content: '建议每半年到一年做一次口腔检查与洁治，牙结石靠刷牙无法去除，需专业超声洁牙。' },
  { title: '饮食调理', content: '减少高糖与碳酸饮料摄入，进食后漱口；脾虚湿盛者可适当食用薏米、山药等健脾食物。' },
]

/** 由等级返回展示用元数据 */
function levelMeta(level) {
  const safe = LEVELS.includes(level) ? level : 'moderate'
  return {
    level: safe,
    levelClass: LEVEL_CLASS[safe],
    levelLabel: LEVEL_LABEL[safe],
    icon: LEVEL_ICON[safe],
  }
}

/** 本地打分：100 分制，舌象扣分 + 牙齿异常项扣分 */
function computeScore(tongueLevel, findings = []) {
  const base = 100
  const tonguePenalty = TONGUE_PENALTY[tongueLevel] ?? TONGUE_PENALTY.moderate
  const teethPenalty = findings.reduce((sum, f) => sum + (FINDING_WEIGHT[f.severity] ?? 0), 0)
  return Math.max(20, Math.min(100, Math.round(base - tonguePenalty - teethPenalty)))
}

/** 分数 → 等级 */
function levelFromScore(score) {
  if (score >= 85) return 'healthy'
  if (score >= 70) return 'mild'
  if (score >= 50) return 'moderate'
  return 'severe'
}

/** 匹配到的辨证规则 */
function matchSyndromes(tongue) {
  const t = { features: (tongue && tongue.features) || {} }
  return SYNDROME_RULES.filter((rule) => {
    try {
      return rule.test(t)
    } catch {
      return false
    }
  })
}

/**
 * 融合舌象与牙齿结果，产出最终报告主体。
 * 分数等级本地计算；证型与风险标签由规则匹配。
 */
function buildFusion(tongue, teeth) {
  const findings = Array.isArray(teeth.findings) ? teeth.findings : []
  const matched = matchSyndromes(tongue)

  const score = computeScore(tongue.level, findings)
  const level = levelFromScore(score)
  const meta = levelMeta(level)

  const riskTags = []
  for (const m of matched) riskTags.push(m.dental)
  for (const f of findings) if (f.severity !== 'mild') riskTags.push(f.label)
  const uniqueTags = [...new Set(riskTags)].slice(0, 6)

  const syndrome = matched.length ? matched.map((m) => m.syndrome).join('、') : '未见明显偏颇'
  const basis = matched.length
    ? matched.map((m) => m.basis).join(' ')
    : '舌象与牙齿外观未见明显异常，提示口腔状态基本良好。'

  const summaryParts = []
  summaryParts.push(`舌象：${tongue.diagnosis || '未见明显异常'}`)
  summaryParts.push(`牙齿：${teeth.diagnosis || '未见明显异常'}`)
  if (matched.length) summaryParts.push(`辨证倾向：${syndrome}`)
  summaryParts.push(`综合评分 ${score} 分，风险等级「${meta.levelLabel}」`)

  return {
    level: meta.level,
    levelClass: meta.levelClass,
    score,
    syndrome,
    summary: summaryParts.join('；'),
    advice: '',
    medicalBasis: basis,
    riskTags: uniqueTags,
  }
}

/** 大模型不可用时的兜底舌象结果（如实标注） */
function fallbackTongue(reason) {
  return {
    level: 'moderate',
    levelClass: LEVEL_CLASS.moderate,
    icon: LEVEL_ICON.moderate,
    diagnosis: '暂未能识别舌象',
    description: `AI 视觉模型当前不可用（${reason}），以下为通用建议，未对舌象做实际识别。`,
    features: { tongueColor: '未知', coating: '未知', shape: '未知', sublingualVein: '未知' },
    advice: '请在光线充足处重新拍摄清晰舌象照片后重试，或稍后再试。',
    medicalBasis: '（未执行图像识别）',
    confidence: 0,
    aiEnhanced: false,
  }
}

/** 大模型不可用时的兜底牙齿结果（如实标注） */
function fallbackTeeth(reason) {
  return {
    level: 'moderate',
    diagnosis: '暂未能识别牙齿图像',
    description: `AI 视觉模型当前不可用（${reason}），未对牙齿图像做实际识别。`,
    findings: [],
    advice: '请重新拍摄清晰牙齿照片后重试。日常建议：改良 Bass 刷牙法 + 每日牙线 + 每半年洁牙。',
    confidence: 0,
    aiEnhanced: false,
  }
}

/** 无大模型时的养护文案兜底 */
function fallbackCareAdvice(fusion) {
  const parts = ['保持早晚刷牙 2 分钟、每日使用牙线、每半年到一年进行口腔检查与洁治。']
  if (fusion.riskTags.includes('牙菌斑、牙结石')) parts.push('厚腻苔提示湿热，建议注意舌面清洁并减少高糖饮食。')
  if (fusion.riskTags.includes('牙龈浮肿')) parts.push('牙龈浮肿者可选用软毛牙刷，避免横向用力刷牙。')
  if (fusion.riskTags.includes('牙齿干涩敏感')) parts.push('牙齿敏感者避免过冷过热刺激，可使用抗敏牙膏。')
  return parts.join('')
}

/** 随机取一条小贴士 */
function randomTip() {
  return TIPS[Math.floor(Math.random() * TIPS.length)]
}

module.exports = {
  LEVELS,
  LEVEL_LABEL,
  LEVEL_CLASS,
  LEVEL_ICON,
  DISCLAIMER,
  TIPS,
  levelMeta,
  computeScore,
  levelFromScore,
  matchSyndromes,
  buildFusion,
  fallbackTongue,
  fallbackTeeth,
  fallbackCareAdvice,
  randomTip,
}
