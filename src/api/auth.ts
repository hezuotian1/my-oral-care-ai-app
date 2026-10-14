import request from './request'
import type { UserInfo } from '@/types'

export interface LoginResult {
  message: string
  token: string
  user: UserInfo
}

export function login(phone: string, password: string) {
  return request.post<LoginResult>('/auth/login', { phone, password })
}

export function register(realName: string, phone: string, password: string) {
  return request.post<{ message: string; userId: string }>('/auth/register', {
    realName,
    phone,
    password,
  })
}
