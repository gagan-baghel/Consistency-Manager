export interface Sprint {
  id: string
  goal: string
  startDate: Date
  endDate: Date
  status: "active" | "completed" | "terminated"
  outcome?: "achieved" | "failed"
  completedAt?: Date
  dailyLogs: Record<number, string>
  secondaryGoals: { id: string; text: string; completed: boolean }[]
  executionChecklist: Record<number, boolean> // day index (0-14)
  dailySyncUps: Record<string, boolean> // ISO date string -> boolean
  completed: boolean
  completionStatus: "in-progress" | "completed" | "failed"
  endedEarly: boolean
  lastSyncDate: Date | null // Track last sync to ensure daily check-in
}

export interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  isExpired: boolean
  totalSeconds: number
}

// Utility function to ensure we have a Date object
function ensureDate(date: Date | string): Date {
  if (date instanceof Date) {
    return date
  }
  return new Date(date)
}

export function calculateTimeRemaining(endDate: Date | string): TimeRemaining {
  const now = new Date()
  const end = ensureDate(endDate)
  const diff = end.getTime() - now.getTime()

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
      totalSeconds: 0,
    }
  }

  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / (24 * 60 * 60))
  const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
  const seconds = totalSeconds % 60

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
    totalSeconds,
  }
}

export function getCurrentSprintDay(startDate: Date | string): number {
  const now = new Date()
  const start = ensureDate(startDate)
  const diff = now.getTime() - start.getTime()
  const dayIndex = Math.floor(diff / (24 * 60 * 60 * 1000))
  return Math.min(Math.max(dayIndex, 0), 14)
}

export function formatTimeUnit(value: number): string {
  return value.toString().padStart(2, "0")
}

export function getProgressPercentage(startDate: Date | string, endDate: Date | string): number {
  const now = new Date()
  const start = ensureDate(startDate)
  const end = ensureDate(endDate)
  const total = end.getTime() - start.getTime()
  const elapsed = now.getTime() - start.getTime()
  const percentage = (elapsed / total) * 100
  return Math.min(Math.max(percentage, 0), 100)
}

export function getAllSprintDays(startDate: Date | string): { dayNumber: number; date: Date; isPast: boolean }[] {
  const days: { dayNumber: number; date: Date; isPast: boolean }[] = []
  const now = new Date()
  now.setHours(0, 0, 0, 0) // Reset to start of day for comparison
  const start = ensureDate(startDate)

  for (let i = 0; i < 15; i++) {
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    date.setHours(0, 0, 0, 0)

    days.push({
      dayNumber: i + 1,
      date,
      isPast: date <= now,
    })
  }

  return days
}

export function getSprintDays(startDate: Date | string, endDate: Date | string): { dayIndex: number; date: Date; isPast: boolean }[] {
  const days: { dayIndex: number; date: Date; isPast: boolean }[] = []
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const start = ensureDate(startDate)
  const end = ensureDate(endDate)

  // Calculate total days in sprint
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const sprintDays = Math.min(totalDays, 15)

  for (let i = 0; i < sprintDays; i++) {
    const date = new Date(start)
    date.setDate(date.getDate() + i)
    date.setHours(0, 0, 0, 0)

    days.push({
      dayIndex: i + 1,
      date,
      isPast: date <= now,
    })
  }

  return days
}

export function getCurrentDayNumber(startDate: Date | string): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const start = ensureDate(startDate)
  start.setHours(0, 0, 0, 0)

  const diffTime = now.getTime() - start.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  return Math.min(Math.max(diffDays + 1, 1), 15)
}

export function hasSyncedToday(lastSyncDate: Date | string | null): boolean {
  if (!lastSyncDate) return false

  const now = new Date()
  const sync = ensureDate(lastSyncDate)

  // Reset hours to compare dates only
  now.setHours(0, 0, 0, 0)
  sync.setHours(0, 0, 0, 0)

  return now.getTime() === sync.getTime()
}

export function getExecutionCount(executionChecklist: Record<number, boolean>): number {
  return Object.values(executionChecklist).filter(Boolean).length
}
