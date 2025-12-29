"use client"

import { Checkbox } from "@/components/ui/checkbox"
import type { Sprint } from "@/lib/sprint-utils"
import { getAllSprintDays } from "@/lib/sprint-utils"

interface ExecutionChecklistProps {
  sprint: Sprint
  onToggleExecution: (dayIndex: number) => void
}

export default function ExecutionChecklist({ sprint, onToggleExecution }: ExecutionChecklistProps) {
  const sprintDays = getAllSprintDays(sprint.startDate)
  const executedCount = Object.values(sprint.executionChecklist).filter(Boolean).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Execution Tracker</h3>
        <span className="text-xs font-medium text-muted-foreground">{executedCount}/15 days executed</span>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 lg:grid-cols-15 gap-2">
        {sprintDays.map((day, index) => {
          const isExecuted = sprint.executionChecklist[index] || false
          const isEditable = day.isPast

          return (
            <div
              key={index}
              className={`relative flex flex-col items-center p-2 rounded-md border transition-colors ${!isEditable
                ? "bg-muted/20 border-muted-foreground/20 opacity-50"
                : isExecuted
                  ? "bg-primary/10 border-primary/40"
                  : "bg-card border-border hover:border-primary/30"
                }`}
            >
              <span className="text-[10px] font-bold text-muted-foreground mb-1.5">D{day.dayNumber}</span>
              <Checkbox
                id={`exec-${index}`}
                checked={isExecuted}
                onCheckedChange={() => isEditable && onToggleExecution(index)}
                disabled={!isEditable}
                className="h-4 w-4"
              />
            </div>
          )
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Mark each day you took action toward your goal. Consistency score: {Math.round((executedCount / 15) * 100)}%
      </p>
    </div>
  )
}
