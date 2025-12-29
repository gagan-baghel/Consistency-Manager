"use client"

import { useMemo } from "react"
import { formatCurrency, type Week } from "@/lib/date-utils"

interface EarningsSummaryProps {
  weeks: Week[]
  earnings: { [weekId: string]: number }
}

interface MonthlyBreakdown {
  month: string
  year: number
  total: number
  weekCount: number
}

export default function EarningsSummary({ weeks, earnings }: EarningsSummaryProps) {
  const totalEarnings = useMemo(() => Object.values(earnings).reduce((sum, val) => sum + (val || 0), 0), [earnings])

  const weeksWithEarnings = useMemo(() => Object.values(earnings).filter((val) => val > 0).length, [earnings])

  const averageWeekly = useMemo(() => {
    if (weeksWithEarnings === 0) return 0
    return totalEarnings / weeksWithEarnings
  }, [totalEarnings, weeksWithEarnings])

  const monthlyBreakdown = useMemo(() => {
    const monthMap = new Map<string, MonthlyBreakdown>()

    weeks.forEach((week) => {
      const monthKey = `${week.startDate.getFullYear()}-${week.startDate.getMonth()}`
      const monthName = week.startDate.toLocaleDateString("en-US", { month: "short" })
      const year = week.startDate.getFullYear()
      const earning = earnings[week.id] || 0

      if (monthMap.has(monthKey)) {
        const existing = monthMap.get(monthKey)!
        existing.total += earning
        existing.weekCount++
      } else {
        monthMap.set(monthKey, {
          month: monthName,
          year,
          total: earning,
          weekCount: 1,
        })
      }
    })

    return Array.from(monthMap.values())
  }, [weeks, earnings])

  return (
    <div className="space-y-6">
      <div className="bg-muted/20 rounded-lg p-6">
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Total</span>
          <span className="text-4xl font-bold tabular-nums tracking-tight">{formatCurrency(totalEarnings)}</span>
        </div>
        <div className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
          <span>{weeks.length}w in range</span>
          {weeksWithEarnings > 0 && (
            <>
              <span className="text-muted-foreground/40">•</span>
              <span>{weeksWithEarnings}w logged</span>
            </>
          )}
        </div>
      </div>

      {totalEarnings > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Avg / Week</div>
            <div className="text-2xl font-bold tabular-nums tracking-tight">{formatCurrency(averageWeekly)}</div>
          </div>
          <div className="space-y-1.5">
            <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Coverage</div>
            <div className="text-2xl font-bold tabular-nums tracking-tight">
              {weeksWithEarnings}/{weeks.length}
            </div>
          </div>
        </div>
      )}

      {monthlyBreakdown.length > 1 && totalEarnings > 0 && (
        <div className="space-y-3">
          <h3 className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">By Month</h3>
          <div className="space-y-2">
            {monthlyBreakdown.map((month) => (
              <div
                key={`${month.year}-${month.month}`}
                className="flex items-baseline justify-between py-2 border-b border-border/40 last:border-0"
              >
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">{month.month}</span>
                  {month.year !== new Date().getFullYear() && (
                    <span className="text-[10px] text-muted-foreground">{month.year}</span>
                  )}
                  <span className="text-[10px] text-muted-foreground">• {month.weekCount}w</span>
                </div>
                <span className="text-lg font-semibold tabular-nums tracking-tight">{formatCurrency(month.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
