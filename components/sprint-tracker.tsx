"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import ActiveSprint from "./active-sprint"
import NewSprintForm from "./new-sprint-form"
import type { Sprint } from "@/lib/sprint-utils"

interface SprintTrackerProps {
  activeSprint: Sprint | null
  onCreateSprint: (goal: string, secondaryGoals: string[]) => void
  onToggleComplete: () => void
  onToggleSecondaryGoal: (goalId: string) => void
  onUpdateLog: (dayIndex: number, log: string) => void
  onToggleExecution: (dayIndex: number) => void
  onDailySync: () => void
  onStopSprint: (completed: boolean) => void
  onResetSprint: () => void
}

export default function SprintTracker({
  activeSprint,
  onCreateSprint,
  onToggleComplete,
  onToggleSecondaryGoal,
  onUpdateLog,
  onToggleExecution,
  onDailySync,
  onStopSprint,
  onResetSprint,
}: SprintTrackerProps) {
  const [showForm, setShowForm] = useState(false)

  const handleCreateSprint = (goal: string, secondaryGoals: string[]) => {
    onCreateSprint(goal, secondaryGoals)
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">15-Day Sprint</h2>
          <p className="text-sm text-muted-foreground">Focus on one goal at a time</p>
        </div>
        {activeSprint && activeSprint.completionStatus === "in-progress" && (
          <Button variant="outline" size="sm" onClick={onResetSprint}>
            New Sprint
          </Button>
        )}
      </div>

      {!activeSprint && !showForm && (
        <div className="text-center py-12">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Target Icon</title>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">No Active Sprint</h3>
            <p className="text-sm text-muted-foreground mb-6 text-balance">
              Start a focused 15-day sprint to achieve your next goal
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>Start New Sprint</Button>
        </div>
      )}

      {!activeSprint && showForm && <NewSprintForm onSubmit={handleCreateSprint} onCancel={() => setShowForm(false)} />}

      {activeSprint && (
        <ActiveSprint
          sprint={activeSprint}
          onToggleComplete={onToggleComplete}
          onToggleSecondaryGoal={onToggleSecondaryGoal}
          onUpdateLog={onUpdateLog}
          onToggleExecution={onToggleExecution}
          onDailySync={onDailySync}
          onStopSprint={onStopSprint}
        />
      )}
    </div>
  )
}
