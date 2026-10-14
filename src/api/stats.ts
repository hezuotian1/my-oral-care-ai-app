import request from './request'
import type { Overview } from '@/types'

export function getOverview() {
  return request.get<Overview>('/stats/overview')
}
