const zhipu = require('./zhipu')
const rules = require('../knowledge/rules')
const { cleanText } = require('../utils/json')

/**
 * 对话与文案生成。所有出口都做了降级：模型不可用时回落到本地模板，
 * 保证页面永远不会因为模型故障而空白或报错。
 */

const SYSTEM_PROMPT = `你是「观舌护齿」牙齿亚健康早筛系统的口腔健康咨询助手。
你的职责是提供口腔护理、中医舌诊养生方面的科普性建议。

必须遵守：
1. 只做健康科普与日常护理建议，不做疾病诊断、不给出处方或具体用药剂量。
2. 遇到出血严重、剧烈疼痛、牙齿松动等明显异常，应建议尽快到口腔科就诊。
3. 语气温和专业，回答简明，控制在 300 字以内，必要时用分点。
4. 不臆造检查数据；不确定时如实说明。`

const FALLBACK_REPLY =
  '抱歉，智能咨询暂时不可用。日常建议：早晚各刷牙 2 分钟、每天使用牙线、每半年到一年进行一次口腔检查与洁治。如出现牙龈出血、牙痛或牙齿松动，请及时到口腔科就诊。'

/**
 * 多轮对话。history 为既往消息（不含本轮用户输入）。
 */
async function reply(history, userContent) {
  if (!zhipu.isAvailable()) return FALLBACK_REPLY
  try {
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-20),
      { role: 'user', content: userContent },
    ]
    const text = await zhipu.chat(messages, { temperature: 0.6, maxTokens: 800 })
    return cleanText(text, 2000) || FALLBACK_REPLY
  } catch {
    return FALLBACK_REPLY
  }
}

/**
 * 依据单次分析结果生成个性化养护文案。
 */
async function generateCareAdvice({ tongue, teeth, fusion }) {
  const fallback = rules.fallbackCareAdvice(fusion)
  if (!zhipu.isAvailable()) return fallback
  try {
    const findings = (teeth.findings || []).map((f) => `${f.label}(${f.severity})`).join('、') || '未见明显异常'
    const prompt = `请根据以下口腔筛查结果，写一段 120 字以内的个性化日常养护建议，语气亲和，分点不超过 4 条，不使用医学诊断口吻：
- 舌象：${tongue.diagnosis}（${tongue.description}）
- 牙齿：${teeth.diagnosis}；异常项：${findings}
- 中医辨证倾向：${fusion.syndrome}
- 综合风险等级：${rules.LEVEL_LABEL[fusion.level]}，评分 ${fusion.score}`
    const text = await zhipu.chat([{ role: 'user', content: prompt }], {
      temperature: 0.5,
      maxTokens: 400,
    })
    return cleanText(text, 600) || fallback
  } catch {
    return fallback
  }
}

module.exports = { reply, generateCareAdvice, SYSTEM_PROMPT, FALLBACK_REPLY }
