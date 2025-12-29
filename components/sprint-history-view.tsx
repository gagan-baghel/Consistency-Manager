"use client"

import { useState, useMemo } from "react"
import type { Sprint } from "@/lib/sprint-utils"
import { getSprintDays, getExecutionCount } from "@/lib/sprint-utils"

interface SprintHistoryViewProps {
  sprints: Sprint[]
}

export default function SprintHistoryView({ sprints }: SprintHistoryViewProps) {
  const [expandedSprintId, setExpandedSprintId] = useState<string | null>(null)

  // Ensure all dates are properly converted to Date objects
  const normalizedSprints = useMemo(() => {
    return sprints.map(sprint => ({
      ...sprint,
      startDate: sprint.startDate instanceof Date ? sprint.startDate : new Date(sprint.startDate),
      endDate: sprint.endDate instanceof Date ? sprint.endDate : new Date(sprint.endDate),
      completedAt: sprint.completedAt
        ? (sprint.completedAt instanceof Date ? sprint.completedAt : new Date(sprint.completedAt))
        : undefined,
      lastSyncDate: sprint.lastSyncDate
        ? (sprint.lastSyncDate instanceof Date ? sprint.lastSyncDate : new Date(sprint.lastSyncDate))
        : null,
    }))
  }, [sprints])

  if (normalizedSprints.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-3">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>History Icon</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium mb-2">No Sprint History</h3>
          <p className="text-sm text-muted-foreground text-balance">
            Completed sprints will appear here with full details
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">Sprint History</h2>
        <p className="text-sm text-muted-foreground">
          {normalizedSprints.length} {normalizedSprints.length === 1 ? "sprint" : "sprints"} completed
        </p>
      </div>

      <div className="space-y-3">
        {normalizedSprints.map((sprint) => {
          const isExpanded = expandedSprintId === sprint.id
          const loggedDays = Object.keys(sprint.dailyLogs).filter((key) => sprint.dailyLogs[Number(key)]?.trim()).length
          const completedSecondaryGoals = sprint.secondaryGoals.filter((sg) => sg.completed).length
          const sprintDays = getSprintDays(sprint.startDate, sprint.endDate)
          const executionCount = getExecutionCount(sprint.executionChecklist)

          const isSuccess = sprint.completionStatus === "completed"
          const isFailed = sprint.completionStatus === "failed"

          return (
            <div
              key={sprint.id}
              className={`border rounded-lg overflow-hidden ${isFailed ? "border-destructive/40 bg-destructive/5" : "border-border bg-card"
                }`}
            >
              <button
                type="button"
                onClick={() => setExpandedSprintId(isExpanded ? null : sprint.id)}
                className="w-full p-4 text-left hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-sm flex items-center justify-center flex-shrink-0 ${isSuccess
                      ? "bg-primary text-primary-foreground"
                      : isFailed
                        ? "bg-destructive text-destructive-foreground"
                        : "bg-muted border border-border"
                      }`}
                  >
                    {isSuccess && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <title>Checkmark</title>
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {isFailed && (
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <title>X Mark</title>
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-pretty mb-1 ${isFailed ? "text-destructive" : ""}`}>
                      {sprint.goal}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-2">
                      <span
                        className={`font-semibold uppercase tracking-wider ${isSuccess ? "text-primary" : isFailed ? "text-destructive" : ""
                          }`}
                      >
                        {isSuccess ? "Achieved" : isFailed ? "Not Completed" : "Unknown"}
                      </span>
                      {sprint.endedEarly && (
                        <>
                          <span>•</span>
                          <span className="text-orange-600 font-medium">Ended Early</span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        {sprint.startDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        –{" "}
                        {sprint.endDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span>•</span>
                      <span>{executionCount}/15 executed</span>
                      <span>•</span>
                      <span>{loggedDays}/15 logged</span>
                      {sprint.secondaryGoals.length > 0 && (
                        <>
                          <span>•</span>
                          <span>
                            {completedSecondaryGoals}/{sprint.secondaryGoals.length} secondary
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <title>Expand Icon</title>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border p-4 bg-muted/10 space-y-6">
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Execution Overview
                    </h4>
                    <div className="flex gap-1 mb-2">
                      {Array.from({ length: 15 }).map((_, i) => {
                        const executed = sprint.executionChecklist[i] || false
                        return (
                          <div
                            key={i}
                            className={`h-8 flex-1 rounded-sm ${executed ? "bg-primary" : "bg-muted border border-border"
                              }`}
                            title={`Day ${i + 1}: ${executed ? "Executed" : "Skipped"}`}
                          />
                        )
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {executionCount} days executed ({Math.round((executionCount / 15) * 100)}% consistency)
                    </p>
                  </div>

                  {/* Secondary Goals */}
                  {sprint.secondaryGoals.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        Secondary Goals
                      </h4>
                      <div className="space-y-2">
                        {sprint.secondaryGoals.map((sg) => (
                          <div key={sg.id} className="flex items-start gap-2">
                            <div
                              className={`mt-0.5 w-4 h-4 rounded-sm flex items-center justify-center flex-shrink-0 ${sg.completed ? "bg-primary text-primary-foreground" : "bg-muted border border-border"
                                }`}
                            >
                              {sg.completed && (
                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                  <title>Checkmark</title>
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                            <span className={`text-sm ${sg.completed ? "" : "text-muted-foreground"}`}>{sg.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Daily Execution Log */}
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                      Daily Execution Log
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {sprintDays.map((day) => {
                        const log = sprint.dailyLogs[day.dayIndex]
                        const hasLog = log && log.trim().length > 0

                        return (
                          <div
                            key={day.dayIndex}
                            className={`p-3 rounded-md border text-sm ${hasLog ? "bg-card border-border" : "bg-muted/40 border-muted-foreground/20"
                              }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-muted-foreground">Day {day.dayIndex}</span>
                              <span className="text-xs text-muted-foreground">
                                {day.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            </div>
                            {hasLog ? (
                              <p className="text-xs leading-relaxed">{log}</p>
                            ) : (
                              <p className="text-xs text-muted-foreground italic">No entry</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      Log entries: {loggedDays}/15 days ({Math.round((loggedDays / 15) * 100)}%)
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
