export const PHONE_RE = /^1[3-9]\d{9}$/
export const REAL_NAME_RE = /^[一-龥·]{2,20}$/

/** 校验登录/注册表单，返回错误信息或空字符串 */
export function validateLogin(phone: string, password: string): string {
  if (!phone) return '请输入手机号'
  if (!PHONE_RE.test(phone)) return '手机号格式不正确'
  if (!password) return '请输入密码'
  if (password.length < 6) return '密码至少 6 位'
  return ''
}

export function validateRegister(realName: string, phone: string, password: string): string {
  if (!realName || !REAL_NAME_RE.test(realName)) return '真实姓名需为 2-20 位中文'
  return validateLogin(phone, password)
}
