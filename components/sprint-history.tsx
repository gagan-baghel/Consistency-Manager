"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { Sprint } from "@/lib/sprint-utils"

interface SprintHistoryProps {
  sprints: Sprint[]
}

export default function SprintHistory({ sprints }: SprintHistoryProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="border-t pt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Sprint History</h3>
        <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
          {isExpanded ? "Hide" : "Show"} ({sprints.length})
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {sprints.map((sprint) => (
            <div key={sprint.id} className="bg-muted/40 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 w-5 h-5 rounded-sm flex items-center justify-center flex-shrink-0 ${
                    sprint.completed ? "bg-primary text-primary-foreground" : "bg-muted border border-border"
                  }`}
                >
                  {sprint.completed && (
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <title>Checkmark</title>
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium text-pretty ${sprint.completed ? "" : "text-muted-foreground"}`}>
                    {sprint.goal}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>
                      {sprint.startDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <span>
                      {sprint.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    {sprint.completedAt && (
                      <>
                        <span>•</span>
                        <span className="text-primary font-medium">Completed</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
