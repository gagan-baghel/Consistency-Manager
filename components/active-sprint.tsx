"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { calculateTimeRemaining, formatTimeUnit, getProgressPercentage, type Sprint } from "@/lib/sprint-utils"
import DailyExecutionLog from "./daily-execution-log"
import SprintCompletionDialog from "./sprint-completion-dialog"

interface ActiveSprintProps {
  sprint: Sprint
  onToggleComplete: () => void
  onToggleSecondaryGoal: (goalId: string) => void
  onUpdateLog: (dayIndex: number, log: string) => void
  onDailySync: () => void
  onStopSprint: (completed: boolean) => void
}

export default function ActiveSprint({
  sprint,
  onToggleComplete,
  onToggleSecondaryGoal,
  onUpdateLog,
  onDailySync,
  onStopSprint,
}: ActiveSprintProps) {
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(sprint.endDate))
  const [progress, setProgress] = useState(getProgressPercentage(sprint.startDate, sprint.endDate))
  const [showCompletionDialog, setShowCompletionDialog] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeRemaining = calculateTimeRemaining(sprint.endDate)
      setTimeRemaining(newTimeRemaining)
      setProgress(getProgressPercentage(sprint.startDate, sprint.endDate))

      if (newTimeRemaining.isExpired && !sprint.completed && sprint.completionStatus === "in-progress") {
        setShowCompletionDialog(true)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [sprint.endDate, sprint.startDate, sprint.completed, sprint.completionStatus])

  const getUrgencyColor = () => {
    if (sprint.completed) return "text-primary"
    if (timeRemaining.isExpired) return "text-destructive"
    if (timeRemaining.days < 3) return "text-orange-600"
    return "text-primary"
  }

  const getProgressColor = () => {
    if (sprint.completed) return "bg-primary"
    if (timeRemaining.isExpired) return "bg-destructive"
    if (timeRemaining.days < 3) return "bg-orange-500"
    return "bg-primary"
  }

  const handleConfirmCompletion = (completed: boolean) => {
    onStopSprint(completed)
    setShowCompletionDialog(false)
  }

  return (
    <div className="space-y-8">

      {/* Primary Goal and Completion */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <Checkbox
            id="sprint-complete"
            checked={sprint.completed}
            onCheckedChange={onToggleComplete}
            className="mt-1.5 h-5 w-5 rounded-sm"
            disabled={sprint.completionStatus !== "in-progress"}
          />
          <div className="flex-1 min-w-0">
            <Label
              htmlFor="sprint-complete"
              className={`text-lg font-semibold cursor-pointer block text-pretty leading-tight ${sprint.completed ? "line-through text-muted-foreground opacity-60" : "text-foreground"
                }`}
            >
              {sprint.goal}
            </Label>
            {sprint.completed && sprint.completedAt && (
              <p className="text-xs font-medium uppercase tracking-wider text-primary mt-2">
                Completed {new Date(sprint.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            )}
          </div>
        </div>

        {sprint.completionStatus === "in-progress" && (
          <Button variant="outline" size="sm" onClick={() => setShowCompletionDialog(true)} className="flex-shrink-0">
            Stop Sprint
          </Button>
        )}
      </div>

      {/* Countdown Timer */}
      {!sprint.completed && sprint.completionStatus === "in-progress" && (
        <div className="border border-border rounded-lg bg-muted/10 overflow-hidden">
          <div className="p-4 md:p-6 text-center">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">
              {timeRemaining.isExpired ? "Time Expired" : "Sprint Remaining"}
            </div>
            <div className={`flex items-center justify-center gap-4 md:gap-8 ${getUrgencyColor()} font-mono`}>
              <div className="flex flex-col items-center">
                <div className="text-3xl md:text-5xl font-bold tabular-nums tracking-tighter">
                  {formatTimeUnit(timeRemaining.days)}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">Days</div>
              </div>
              <div className="text-2xl md:text-4xl font-bold opacity-30 mt-[-10px]">:</div>
              <div className="flex flex-col items-center">
                <div className="text-3xl md:text-5xl font-bold tabular-nums tracking-tighter">
                  {formatTimeUnit(timeRemaining.hours)}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">Hrs</div>
              </div>
              <div className="text-2xl md:text-4xl font-bold opacity-30 mt-[-10px]">:</div>
              <div className="flex flex-col items-center">
                <div className="text-3xl md:text-5xl font-bold tabular-nums tracking-tighter">
                  {formatTimeUnit(timeRemaining.minutes)}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">Min</div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pb-6">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor()} transition-all duration-1000`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              <span>Start: {new Date(sprint.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              <span className="text-foreground">{Math.round(progress)}% Progress</span>
              <span>End: {new Date(sprint.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </div>
          </div>
        </div>
      )}

      {sprint.completionStatus !== "in-progress" && (
        <div
          className={`border rounded-lg p-6 text-center ${sprint.completionStatus === "completed"
            ? "bg-primary/5 border-primary/20"
            : "bg-destructive/5 border-destructive/20"
            }`}
        >
          <div
            className={`font-bold uppercase tracking-widest text-sm ${sprint.completionStatus === "completed" ? "text-primary" : "text-destructive"
              }`}
          >
            {sprint.completionStatus === "completed" ? "Sprint Accomplished" : "Sprint Not Completed"}
          </div>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            {sprint.completionStatus === "completed"
              ? "Goal verified and logged in history."
              : "Outcome recorded in history for review."}
          </p>
        </div>
      )}

      {sprint.secondaryGoals.length > 0 && (
        <div className="space-y-4 pt-2">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Secondary Objectives
          </h3>
          <div className="grid gap-3">
            {sprint.secondaryGoals.map((goal) => (
              <div
                key={goal.id}
                className={`flex items-start gap-3 p-3 rounded-md border border-border transition-colors ${goal.completed ? "bg-muted/20 opacity-60" : "bg-card"
                  }`}
              >
                <Checkbox
                  id={`secondary-${goal.id}`}
                  checked={goal.completed}
                  onCheckedChange={() => onToggleSecondaryGoal(goal.id)}
                  className="mt-0.5 h-4 w-4 rounded-sm"
                  disabled={sprint.completionStatus !== "in-progress"}
                />
                <Label
                  htmlFor={`secondary-${goal.id}`}
                  className={`text-sm font-medium cursor-pointer text-pretty leading-snug ${goal.completed ? "line-through text-muted-foreground" : "text-foreground"
                    }`}
                >
                  {goal.text}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4">
        <DailyExecutionLog sprint={sprint} onUpdateLog={onUpdateLog} />
      </div>

      <SprintCompletionDialog
        open={showCompletionDialog}
        onClose={() => setShowCompletionDialog(false)}
        onConfirm={handleConfirmCompletion}
        sprintGoal={sprint.goal}
        isNaturalEnd={timeRemaining.isExpired}
      />
    </div>
  )
}
