import {
  intervalToDuration,
  format,
  differenceInDays,
  parseISO,
} from 'date-fns'

export const formatDuration = (totalSeconds: number): string => {
  if (totalSeconds < 0) return '00:00'

  const duration = intervalToDuration({ start: 0, end: totalSeconds * 1000 })

  const daysVal = duration.days || 0
  const weeks = Math.floor(daysVal / 7)
  const days = daysVal % 7
  const { years, months } = duration

  const dateParts = [
    years ? `${years}г` : '',
    months ? `${months}мес` : '',
    weeks ? `${weeks}н` : '',
    days ? `${days}д` : '',
  ]
    .filter(Boolean)
    .join(' ')

  const h = duration.hours || 0
  const m = duration.minutes || 0
  const s = duration.seconds || 0

  const timeStr = [
    h > 0 || dateParts ? h.toString().padStart(2, '0') : null,
    m.toString().padStart(2, '0'),
    s.toString().padStart(2, '0'),
  ]
    .filter((x) => x !== null)
    .join(':')

  return dateParts ? `${dateParts} ${timeStr}` : timeStr
}

export const getDiffInDays = (
  start: string | Date,
  end: string | Date
): number => {
  const d1 = typeof start === 'string' ? parseISO(start) : start
  const d2 = typeof end === 'string' ? parseISO(end) : end
  return differenceInDays(d2, d1) + 1
}

export const formatDate = (
  date: string | Date,
  formatStr = 'dd.MM.yyyy'
): string => {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, formatStr)
}
