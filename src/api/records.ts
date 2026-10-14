import request from './request'
import type { RecordDetail, RecordListItem, TrendPoint } from '@/types'

export function listRecords(page = 1, pageSize = 10) {
  return request.get<{ list: RecordListItem[]; total: number; page: number; pageSize: number }>(
    '/records',
    { params: { page, pageSize } },
  )
}

export function getRecord(id: string) {
  return request.get<RecordDetail>(`/records/${id}`)
}

export function getTrend(days = 30) {
  return request.get<{ days: number; points: TrendPoint[] }>('/records/trend', { params: { days } })
}

export function deleteRecord(id: string) {
  return request.delete<{ message: string }>(`/records/${id}`)
}
