/**
 * 从大模型返回的自由文本中稳健地提取 JSON。
 * 顺序：```json 围栏 → ``` 围栏 → 首个平衡匹配的 { ... }
 * 解析失败一律返回 null，绝不把原始文本当作结构体使用。
 */
function extractJson(text) {
  if (!text || typeof text !== 'string') return null

  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const candidates = []
  if (fenced && fenced[1]) candidates.push(fenced[1])

  const braced = scanBalancedBraces(text)
  if (braced) candidates.push(braced)

  candidates.push(text)

  for (const raw of candidates) {
    const parsed = safeParse(raw)
    if (parsed && typeof parsed === 'object') return parsed
  }
  return null
}

/** 扫描出第一个括号平衡的 {...} 片段，跳过字符串内的花括号与转义字符 */
function scanBalancedBraces(text) {
  const start = text.indexOf('{')
  if (start === -1) return null

  let depth = 0
  let inString = false
  let escaped = false

  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (escaped) {
      escaped = false
      continue
    }
    if (ch === '\\') {
      escaped = true
      continue
    }
    if (ch === '"') {
      inString = !inString
      continue
    }
    if (inString) continue
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return text.slice(start, i + 1)
    }
  }
  return null
}

function safeParse(raw) {
  try {
    return JSON.parse(raw.trim())
  } catch {
    return null
  }
}

// 控制字符（U+0000–U+001F 与 U+007F），用转义构造避免字面控制字符污染源码
const CONTROL_RE = new RegExp('[\\u0000-\\u001F\\u007F]', 'g')

/** 去掉控制字符并截断，避免模型输出污染入库与渲染 */
function cleanText(value, maxLen = 1000) {
  if (typeof value !== 'string') return ''
  return value.replace(CONTROL_RE, '').trim().slice(0, maxLen)
}

/** 限定枚举取值，非法时回退默认值 */
function pickEnum(value, allowed, fallback) {
  return allowed.includes(value) ? value : fallback
}

/** 数值裁剪到 [min, max]，非数字返回 fallback */
function clampNumber(value, min, max, fallback) {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

module.exports = { extractJson, cleanText, pickEnum, clampNumber }
