import type { ProgressData } from './types'

const KEY = 'it0035-os-hub-v1'
export const defaultProgress: ProgressData = {
  xp: 0, completedLessons: [], quizHistory: [], mistakes: [], bookmarks: [], confusing: [], mastered: [], activity: {},
  settings: { reducedMotion: false, sound: false, simpleMode: false }, lastStudyDate: '', streak: 0, longestStreak: 0,
}

export function loadProgress(): ProgressData {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return structuredClone(defaultProgress)
    const value = JSON.parse(raw) as Partial<ProgressData>
    return {
      ...structuredClone(defaultProgress), ...value,
      settings: { ...defaultProgress.settings, ...(value.settings ?? {}) },
      completedLessons: array(value.completedLessons), quizHistory: array(value.quizHistory), mistakes: array(value.mistakes),
      bookmarks: array(value.bookmarks), confusing: array(value.confusing), mastered: array(value.mastered),
      activity: value.activity && typeof value.activity === 'object' ? value.activity : {},
      xp: finite(value.xp), streak: finite(value.streak), longestStreak: finite(value.longestStreak),
    }
  } catch { return structuredClone(defaultProgress) }
}

const array = <T,>(value: unknown): T[] => Array.isArray(value) ? value : []
const finite = (value: unknown) => Number.isFinite(value) ? Number(value) : 0
export function saveProgress(progress: ProgressData) { localStorage.setItem(KEY, JSON.stringify(progress)) }
export function todayKey() { return new Date().toISOString().slice(0, 10) }

export function recordStudy(progress: ProgressData, xp = 0): ProgressData {
  const today = todayKey()
  const next = { ...progress, xp: progress.xp + xp, activity: { ...progress.activity, [today]: (progress.activity[today] ?? 0) + 1 } }
  if (progress.lastStudyDate !== today) {
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1)
    next.streak = progress.lastStudyDate === yesterday.toISOString().slice(0, 10) ? progress.streak + 1 : 1
    next.longestStreak = Math.max(progress.longestStreak, next.streak)
    next.lastStudyDate = today
  }
  return next
}
