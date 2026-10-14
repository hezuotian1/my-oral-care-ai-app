const axios = require('axios')

/**
 * 智谱 GLM 客户端（多模态）。
 * 密钥一律从环境变量读取，绝不硬编码；所有调用只发生在服务端。
 */

function config() {
  return {
    key: process.env.ZHIPU_API_KEY || '',
    url: process.env.ZHIPU_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    visionModel: process.env.ZHIPU_VISION_MODEL || 'glm-4v',
    chatModel: process.env.ZHIPU_CHAT_MODEL || 'glm-4',
    timeout: Number(process.env.ZHIPU_TIMEOUT_MS || 45000),
    enabled: process.env.ZHIPU_ENABLED !== 'false',
  }
}

function isAvailable() {
  const c = config()
  return c.enabled && Boolean(c.key)
}

function shouldRetry(err) {
  if (!err) return false
  if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') return true
  const status = err.response && err.response.status
  return status === 429 || (status >= 500 && status < 600)
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function toDataUri(buffer, mime) {
  const safeMime = mime && mime.startsWith('image/') ? mime : 'image/jpeg'
  return `data:${safeMime};base64,${buffer.toString('base64')}`
}

async function callOnce({ model, messages, temperature, topP, maxTokens }) {
  const c = config()
  const res = await axios.post(
    c.url,
    {
      model,
      messages,
      temperature: temperature ?? 0.3,
      top_p: topP ?? 0.7,
      max_tokens: maxTokens ?? 1024,
    },
    {
      headers: {
        Authorization: `Bearer ${c.key}`,
        'Content-Type': 'application/json',
      },
      timeout: c.timeout,
    },
  )
  const choices = (res.data && res.data.choices) || []
  const first = choices[0]
  return (first && first.message && first.message.content) || ''
}

/** 带一次退避重试的模型调用 */
async function callModel(opts) {
  try {
    return await callOnce(opts)
  } catch (err) {
    if (shouldRetry(err)) {
      await sleep(1200)
      return await callOnce(opts)
    }
    throw err
  }
}

/**
 * 视觉分析：返回模型原始文本（由调用方负责 JSON 解析与校验）。
 */
async function analyzeImage({ buffer, mime, prompt, maxTokens = 1024 }) {
  if (!isAvailable()) throw new Error('智谱服务未启用或缺少 API Key')
  const c = config()
  const messages = [
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: toDataUri(buffer, mime) } },
      ],
    },
  ]
  return callModel({ model: c.visionModel, messages, temperature: 0.3, topP: 0.7, maxTokens })
}

/**
 * 文本对话：messages 为标准的 [{role, content}] 数组。
 */
async function chat(messages, { temperature = 0.6, maxTokens = 800 } = {}) {
  if (!isAvailable()) throw new Error('智谱服务未启用或缺少 API Key')
  const c = config()
  return callModel({ model: c.chatModel, messages, temperature, topP: 0.7, maxTokens })
}

function modelNames() {
  const c = config()
  return { vision: c.visionModel, chat: c.chatModel }
}

module.exports = { isAvailable, analyzeImage, chat, modelNames }
