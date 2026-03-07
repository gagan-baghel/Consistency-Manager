"use client"

import { useState } from "react"
import { getAllSprintDays, getCurrentDayNumber, type Sprint } from "@/lib/sprint-utils"
import { Input } from "@/components/ui/input"

interface DailyExecutionLogProps {
  sprint: Sprint
  onUpdateLog: (dayIndex: number, log: string) => void
}

export default function DailyExecutionLog({ sprint, onUpdateLog }: DailyExecutionLogProps) {
  const days = getAllSprintDays(sprint.startDate)
  const currentDay = getCurrentDayNumber(sprint.startDate)
  const [editingDay, setEditingDay] = useState<number | null>(null)
  const [tempLog, setTempLog] = useState("")

  const handleEditDay = (dayNumber: number) => {
    const dayIndex = dayNumber - 1
    setEditingDay(dayNumber)
    setTempLog(sprint.dailyLogs[dayIndex] || "")
  }

  const handleSaveLog = (dayNumber: number) => {
    const dayIndex = dayNumber - 1
    onUpdateLog(dayIndex, tempLog.trim())
    setEditingDay(null)
    setTempLog("")
  }

  const handleCancelEdit = () => {
    setEditingDay(null)
    setTempLog("")
  }

  const loggedCount = Object.keys(sprint.dailyLogs).filter((key) => sprint.dailyLogs[Number.parseInt(key)]).length
  const availableDays = Math.min(currentDay, 15)

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
          Daily Execution Log
        </h3>
        <p className="text-xs text-muted-foreground">
          {loggedCount}/{availableDays} days logged • {Math.round((loggedCount / Math.max(availableDays, 1)) * 100)}%
          consistency
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {days.map((day) => {
          const dayIndex = day.dayNumber - 1
          const hasLog = Boolean(sprint.dailyLogs[dayIndex])
          const isEditing = editingDay === day.dayNumber
          const isEditable = day.dayNumber <= currentDay
          const isFuture = day.dayNumber > currentDay

          return (
            <div
              key={day.dayNumber}
              className={`p-3 rounded-xl border text-left text-sm transition-colors glass-highlight ${
                hasLog
                  ? "glass-lite border-border hover:bg-muted/20"
                  : isFuture
                    ? "bg-muted/40 border-muted-foreground/20 opacity-50 cursor-not-allowed"
                    : "bg-muted/40 border-muted-foreground/20 hover:border-border hover:glass-lite"
              } ${isEditable && !isEditing ? "cursor-pointer" : ""}`}
              onClick={() => isEditable && !isEditing && handleEditDay(day.dayNumber)}
            >
              {!isEditing ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">Day {day.dayNumber}</span>
                    <span className="text-xs text-muted-foreground">
                      {day.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  {hasLog ? (
                    <p className="text-xs leading-relaxed line-clamp-2">{sprint.dailyLogs[dayIndex]}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">{isFuture ? "Future" : "Tap to log"}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                  <div className="text-xs font-medium text-muted-foreground">Day {day.dayNumber}</div>
                  <Input
                    type="text"
                    placeholder="What did you do?"
                    value={tempLog}
                    onChange={(e) => setTempLog(e.target.value.slice(0, 100))}
                    autoFocus
                    className="h-8 text-xs"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleSaveLog(day.dayNumber)
                      } else if (e.key === "Escape") {
                        handleCancelEdit()
                      }
                    }}
                  />
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      className="h-7 flex-1 text-xs bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
                      onClick={(e) => {
                        e.preventDefault()
                        handleSaveLog(day.dayNumber)
                      }}
                      disabled={!tempLog.trim()}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="h-7 flex-1 text-xs glass-lite rounded-lg font-medium hover:bg-muted/80"
                      onClick={(e) => {
                        e.preventDefault()
                        handleCancelEdit()
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                  <div className="text-[11px] text-muted-foreground text-right">{tempLog.length}/100</div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Keep entries brief and action-focused. Click any past day to edit.
      </p>
    </div>
  )
}
