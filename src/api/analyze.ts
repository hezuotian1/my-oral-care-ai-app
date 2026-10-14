import request from './request'
import type { AnalyzeReport } from '@/types'

export function analyzeImages(tongue: File, teeth: File) {
  const form = new FormData()
  form.append('tongue', tongue)
  form.append('teeth', teeth)
  return request.post<AnalyzeReport>('/analyze', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 90000,
  })
}
