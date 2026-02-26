export interface Week {
  id: string
  weekNumber: number
  startDate: Date
  endDate: Date
  label: string
}

export function generateWeeksFromRange(startDate: Date, endDate: Date): Week[] {
  const weeks: Week[] = []
  if (startDate > endDate) return weeks

  const rangeStart = new Date(startDate)
  rangeStart.setHours(0, 0, 0, 0)
  const rangeEnd = new Date(endDate)
  rangeEnd.setHours(0, 0, 0, 0)

  const makeDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

  let currentStart = new Date(rangeStart)
  let weekNumber = 1

  while (currentStart <= rangeEnd) {
    const weekEnd = new Date(currentStart)
    const dayOfWeek = weekEnd.getDay() // 0 = Sun ... 6 = Sat
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
    weekEnd.setDate(weekEnd.getDate() + daysUntilSunday)

    const actualEnd = weekEnd > rangeEnd ? new Date(rangeEnd) : weekEnd

    const startMonth = currentStart.toLocaleDateString("en-US", { month: "short" })
    const endMonth = actualEnd.toLocaleDateString("en-US", { month: "short" })
    const startDay = currentStart.getDate()
    const endDay = actualEnd.getDate()

    const label =
      startMonth === endMonth
        ? `${startMonth} ${startDay}–${endDay}`
        : `${startMonth} ${startDay} – ${endMonth} ${endDay}`

    weeks.push({
      id: `week-${makeDateKey(currentStart)}`,
      weekNumber,
      startDate: new Date(currentStart),
      endDate: actualEnd,
      label,
    })

    currentStart = new Date(actualEnd)
    currentStart.setDate(currentStart.getDate() + 1)
    weekNumber++
  }

  return weeks
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function parseCurrencyInput(value: string): number {
  // Remove all non-digit characters except decimal point
  const cleaned = value.replace(/[^\d.]/g, "")
  const parsed = Number.parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}
