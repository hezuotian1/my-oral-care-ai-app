import request from './request'

export function doCheckin() {
  return request.post<{ message: string; date: string; streakDays: number; dates: string[] }>('/checkins')
}

export function getStreak() {
  return request.get<{ streakDays: number; dates: string[] }>('/checkins/streak')
}
