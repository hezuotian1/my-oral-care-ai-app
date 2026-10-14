export type Level = 'healthy' | 'mild' | 'moderate' | 'severe'
export type Severity = 'mild' | 'moderate' | 'severe'

export interface UserInfo {
  id: string
  realName: string
  phone: string
  avatar: string
  gender: 'male' | 'female' | 'unknown'
  age: number | null
}

export interface TongueFeatures {
  tongueColor: string
  coating: string
  shape: string
  sublingualVein: string
}

export interface TongueResult {
  level: Level
  levelClass: string
  icon: string
  diagnosis: string
  description: string
  features: TongueFeatures
  advice: string
  medicalBasis: string
  confidence: number
  aiEnhanced: boolean
}

export interface Finding {
  label: string
  severity: Severity
  note: string
}

export interface TeethResult {
  level: Level
  diagnosis: string
  description: string
  findings: Finding[]
  advice: string
  confidence: number
  aiEnhanced: boolean
}

export interface FusionResult {
  level: Level
  levelClass: string
  score: number
  syndrome: string
  summary: string
  advice: string
  medicalBasis: string
  riskTags: string[]
}

export interface AnalyzeReport {
  recordId: string
  createdAt: string
  processingTime: string
  tongue: TongueResult
  teeth: TeethResult
  fusion: FusionResult
  aiModel: string
  aiEnhanced: boolean
  disclaimer: string
  notes: string[]
  images: { tongue: string; teeth: string }
}

export interface RecordListItem {
  id: string
  createdAt: string
  level: Level
  levelClass: string
  score: number
  syndrome: string
  tongueSummary: string
  teethSummary: string
  factors: string[]
}

export interface RecordDetail extends Omit<AnalyzeReport, 'notes'> {
  id: string
  level: Level
  levelClass: string
  score: number
  images: { tongue: string; teeth: string }
}

export interface TrendPoint {
  date: string
  score: number
  level: Level
}

export interface TodoItem {
  text: string
  type: 'scan' | 'checkin' | 'read' | string
  done: boolean
}

export interface Overview {
  today: {
    hasRecord: boolean
    level: Level | null
    levelClass: string | null
    score: number | null
    abnormalCount: number
  }
  streakDays: number
  todos: TodoItem[]
  tip: { title: string; content: string }
  recent: { id: string; date: string; score: number; level: Level }[]
  articleCount: number
}

export interface ArticleListItem {
  id: string
  title: string
  summary: string
  category: string
  tags: string[]
  readCount: number
  publishedAt: string
}

export interface ArticleDetail extends ArticleListItem {
  content: string
}

export interface ConversationListItem {
  id: string
  title: string
  preview: string
  updatedAt: string
  messageCount: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  createdAt?: string
}
