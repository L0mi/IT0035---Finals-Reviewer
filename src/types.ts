export type ModuleId = 1 | 2 | 3 | 4
export type NavId = 'dashboard' | 'path' | 'module1' | 'module2' | 'module3' | 'module4' | 'materials' | 'lab' | 'formulas' | 'reviewers' | 'quiz' | 'mistakes' | 'achievements' | 'progress' | 'settings'

export interface Lesson {
  id: string
  module: ModuleId
  title: string
  objective: string
  explanation: string
  simpler: string
  terms: { term: string; meaning: string }[]
  analogy: string
  rules: string[]
  worked: string[]
  check: { prompt: string; answer: string }
  source: string
}

export type QuestionType = 'single' | 'multiple' | 'boolean' | 'input' | 'order'
export interface Question {
  id: string
  module: ModuleId
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  type: QuestionType
  prompt: string
  options?: string[]
  correct: string | string[]
  hint: string
  explanation: string
  source: string
  steps?: string[]
}

export interface ProgressData {
  xp: number
  completedLessons: string[]
  quizHistory: { date: string; score: number; total: number; mode: string }[]
  mistakes: { id: string; questionId: string; topic: string; response: string; correct: string; explanation: string; date: string; understood: boolean; note: string }[]
  bookmarks: string[]
  confusing: string[]
  mastered: string[]
  activity: Record<string, number>
  settings: { reducedMotion: boolean; sound: boolean; simpleMode: boolean }
  lastStudyDate: string
  streak: number
  longestStreak: number
}
