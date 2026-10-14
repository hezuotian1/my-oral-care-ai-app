import request from './request'
import type { UserInfo } from '@/types'

export function getProfile() {
  return request.get<UserInfo>('/me')
}

export function updateProfile(payload: Partial<Pick<UserInfo, 'realName' | 'avatar' | 'gender' | 'age'>>) {
  return request.put<{ message: string; user: UserInfo }>('/me', payload)
}
