export interface Week {
  id: string
  weekNumber: number
  startDate: Date
  endDate: Date
  label: string
}

export function generateWeeksFromRange(startDate: Date, endDate: Date): Week[] {
  const weeks: Week[] = []

  // Find the first Monday on or after startDate
  const firstMonday = new Date(startDate)
  const dayOfWeek = firstMonday.getDay()
  const daysUntilMonday = dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek
  firstMonday.setDate(firstMonday.getDate() + daysUntilMonday)

  const currentMonday = new Date(firstMonday)
  let weekNumber = 1

  while (currentMonday <= endDate) {
    const weekEnd = new Date(currentMonday)
    weekEnd.setDate(weekEnd.getDate() + 6)

    // If week extends beyond end date, cap it
    const actualEnd = weekEnd > endDate ? endDate : weekEnd

    const startMonth = currentMonday.toLocaleDateString("en-US", { month: "short" })
    const endMonth = actualEnd.toLocaleDateString("en-US", { month: "short" })
    const startDay = currentMonday.getDate()
    const endDay = actualEnd.getDate()

    const label =
      startMonth === endMonth
        ? `${startMonth} ${startDay}–${endDay}`
        : `${startMonth} ${startDay} – ${endMonth} ${endDay}`

    weeks.push({
      id: `week-${currentMonday.getTime()}`,
      weekNumber,
      startDate: new Date(currentMonday),
      endDate: actualEnd,
      label,
    })

    // Move to next Monday
    currentMonday.setDate(currentMonday.getDate() + 7)
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
