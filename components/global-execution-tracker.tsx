"use client"

import React, { useState, useMemo } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react"

interface GlobalExecutionTrackerProps {
  executionData: Record<number, boolean> // day number (1-31) -> executed
  onToggleExecution: (dayNumber: number) => void
  onMonthChange?: (year: number, month: number) => void
  activeSprint?: {
    endDate: Date | string
  } | null
}

export default function GlobalExecutionTracker({
  executionData,
  onToggleExecution,
  onMonthChange,
  activeSprint
}: GlobalExecutionTrackerProps) {
  const today = new Date()
  const [selectedMonth, setSelectedMonth] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [isExpanded, setIsExpanded] = useState(false)

  // Calculate time remaining for active sprint
  const timeRemaining = useMemo(() => {
    if (!activeSprint) return null

    const now = new Date()
    const end = new Date(activeSprint.endDate)
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, isExpired: true }
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return { days, hours, minutes, isExpired: false }
  }, [activeSprint])

  // Notify parent when month changes
  React.useEffect(() => {
    if (onMonthChange) {
      onMonthChange(selectedMonth.year, selectedMonth.month)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth.year, selectedMonth.month])

  // Get month info based on selected month
  const monthInfo = useMemo(() => {
    const year = selectedMonth.year
    const month = selectedMonth.month
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const monthName = new Date(year, month, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

    // Check if this is the current month
    const isCurrentMonth = year === today.getFullYear() && month === today.getMonth()
    const currentDay = isCurrentMonth ? today.getDate() : null

    // Check if this is a future month
    const isFutureMonth = year > today.getFullYear() || (year === today.getFullYear() && month > today.getMonth())

    return { daysInMonth, monthName, currentDay, isCurrentMonth, isFutureMonth, year, month }
  }, [selectedMonth, today])

  const executedCount = Object.values(executionData).filter(Boolean).length
  const consistencyScore = Math.round((executedCount / monthInfo.daysInMonth) * 100)

  const handlePreviousMonth = () => {
    setSelectedMonth(prev => {
      const newMonth = prev.month - 1
      if (newMonth < 0) {
        return { year: prev.year - 1, month: 11 }
      }
      return { year: prev.year, month: newMonth }
    })
  }

  const handleNextMonth = () => {
    setSelectedMonth(prev => {
      const newMonth = prev.month + 1
      if (newMonth > 11) {
        return { year: prev.year + 1, month: 0 }
      }
      return { year: prev.year, month: newMonth }
    })
  }

  // Collapsed view
  if (!isExpanded) {
    return (
      <button
        type="button"
        onClick={() => setIsExpanded(true)}
        className="w-full bg-card border border-border rounded-lg p-4 hover:bg-muted/20 transition-colors text-left"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Execution Tracker</span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{executedCount}/{monthInfo.daysInMonth} days</span>
            <span>•</span>
            <span>{consistencyScore}%</span>
          </div>
        </div>
      </button>
    )
  }

  // Expanded view
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Header with collapse button */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePreviousMonth}
            className="p-1 hover:bg-muted rounded transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Execution Tracker</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">{monthInfo.monthName}</p>
          </div>
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 hover:bg-muted rounded transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(false)}
          className="p-1 hover:bg-muted rounded transition-colors"
          aria-label="Collapse"
        >
          <ChevronDown className="h-4 w-4 text-muted-foreground rotate-180" />
        </button>
      </div>

      {/* Sprint Timer - Prominent Display */}
      {timeRemaining && !timeRemaining.isExpired && (
        <div className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-b border-border">
          <div className="text-center">
            <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Sprint Remaining</p>
            <div className="flex items-center justify-center gap-4">
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold tabular-nums text-primary">
                  {timeRemaining.days}
                </div>
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1">Days</div>
              </div>
              <div className="text-3xl font-bold text-muted-foreground/30">:</div>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold tabular-nums text-primary">
                  {String(timeRemaining.hours).padStart(2, '0')}
                </div>
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1">Hrs</div>
              </div>
              <div className="text-3xl font-bold text-muted-foreground/30">:</div>
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold tabular-nums text-primary">
                  {String(timeRemaining.minutes).padStart(2, '0')}
                </div>
                <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-1">Min</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center justify-center gap-6 p-4 bg-muted/5 border-b border-border">
        <div className="text-center">
          <div className="text-xs font-semibold tabular-nums text-foreground">
            {executedCount}/{monthInfo.daysInMonth}
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Days Executed</div>
        </div>
        <div className="h-8 w-px bg-border" />
        <div className="text-center">
          <div className="text-xs font-bold tabular-nums text-primary">
            {consistencyScore}%
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Consistency</div>
        </div>
      </div>

      {/* Future month warning */}
      {monthInfo.isFutureMonth && (
        <div className="mx-4 mt-4 p-3 bg-muted/30 border border-border/50 rounded-md">
          <p className="text-xs text-muted-foreground text-center">
            Future months are view-only. You can track execution starting from this month.
          </p>
        </div>
      )}

      {/* Calendar Grid */}
      <div className="p-4">
        <div className="grid grid-cols-15 gap-2">
          {Array.from({ length: monthInfo.daysInMonth }, (_, index) => {
            const dayNumber = index + 1
            const isExecuted = executionData[dayNumber] || false
            const isToday = monthInfo.isCurrentMonth && dayNumber === monthInfo.currentDay
            const isFuture = monthInfo.isFutureMonth || (monthInfo.isCurrentMonth && dayNumber > monthInfo.currentDay!)

            return (
              <div
                key={dayNumber}
                className={`relative flex flex-col items-center p-2 rounded-md border transition-all ${isExecuted
                  ? "bg-primary/10 border-primary/40"
                  : isFuture
                    ? "bg-muted/5 border-border/50 opacity-50"
                    : "bg-muted/10 border-border hover:border-primary/20"
                  } ${isToday ? "ring-2 ring-primary/30" : ""}`}
              >
                <span className={`text-[10px] font-bold mb-1.5 ${isToday ? "text-primary" : "text-muted-foreground"}`}>
                  {dayNumber}
                </span>
                <Checkbox
                  id={`global-exec-${dayNumber}`}
                  checked={isExecuted}
                  onCheckedChange={() => onToggleExecution(dayNumber)}
                  className="h-4 w-4"
                  disabled={isFuture}
                />
              </div>
            )
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            Mark each day you took action toward your goal.
          </p>
        </div>
      </div>
    </div>
  )
}
