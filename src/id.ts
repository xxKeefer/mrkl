export const TASKS_DIR = '.tasks'

const MS_PER_DAY = 86_400_000

export function generateId(): string {
  const now = Date.now()
  const days = Math.floor(now / MS_PER_DAY).toString(36)
  const midnightUtc = Math.floor(now / MS_PER_DAY) * MS_PER_DAY
  const millisSinceMidnight = now - midnightUtc
  const millis = millisSinceMidnight.toString(36).padStart(6, '0')
  return `${days}-${millis}`
}
