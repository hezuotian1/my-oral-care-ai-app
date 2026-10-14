const PHONE_RE = /^1[3-9]\d{9}$/
const REAL_NAME_RE = /^[一-龥·]{2,20}$/

/** 手机号脱敏：138****8000 */
function maskPhone(phone) {
  if (typeof phone !== 'string' || phone.length < 7) return phone
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
}

/** 校验注册入参，返回错误信息或 null */
function validateRegister({ realName, phone, password }) {
  if (!realName || !REAL_NAME_RE.test(realName)) return '真实姓名需为 2-20 位中文'
  if (!phone || !PHONE_RE.test(phone)) return '手机号格式不正确'
  if (!password || password.length < 6) return '密码至少 6 位'
  return null
}

module.exports = { PHONE_RE, REAL_NAME_RE, maskPhone, validateRegister }
