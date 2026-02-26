"use client"

import React, { useState, useEffect } from "react"
import WeeklyTracker from "./weekly-tracker"
import SprintTracker from "./sprint-tracker"
import SprintHistoryView from "./sprint-history-view"
import GlobalExecutionTracker from "./global-execution-tracker"
import type { Sprint } from "@/lib/sprint-utils"
import { useUser } from "@/contexts/UserContext"
import { toast } from "sonner"

type Tab = "earnings" | "sprint" | "history"

export default function EarningsTracker() {
  const { currentUser } = useUser()
  const [activeTab, setActiveTab] = useState<Tab>("earnings")
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null)
  const [sprintHistory, setSprintHistory] = useState<Sprint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [globalExecutionData, setGlobalExecutionData] = useState<Record<number, boolean>>({})
  const [selectedMonth, setSelectedMonth] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() })

  // Load global execution data from localStorage for selected month
  useEffect(() => {
    const monthKey = `${selectedMonth.year}-${selectedMonth.month + 1}`
    const saved = localStorage.getItem(`execution_${currentUser.userId}_${monthKey}`)
    if (saved) {
      try {
        setGlobalExecutionData(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load execution data:', error)
      }
    } else {
      setGlobalExecutionData({})
    }
  }, [currentUser.userId, selectedMonth])

  // Save global execution data to localStorage whenever it changes
  useEffect(() => {
    const monthKey = `${selectedMonth.year}-${selectedMonth.month + 1}`
    localStorage.setItem(`execution_${currentUser.userId}_${monthKey}`, JSON.stringify(globalExecutionData))
  }, [globalExecutionData, currentUser.userId, selectedMonth])

  const handleMonthChange = React.useCallback((year: number, month: number) => {
    setSelectedMonth({ year, month })
  }, [])

  // Fetch sprints when user changes
  useEffect(() => {
    const fetchSprints = async () => {
      setIsLoading(true)
      try {
        // Fetch active sprint
        const activeResponse = await fetch(`/api/sprints?userId=${currentUser.userId}&status=active`)
        if (activeResponse.ok) {
          const activeData = await activeResponse.json()
          const activeSprints = activeData.sprints || []
          setActiveSprint(activeSprints.length > 0 ? activeSprints[0] : null)
        }

        // Fetch all sprints for history
        const allResponse = await fetch(`/api/sprints?userId=${currentUser.userId}`)
        if (allResponse.ok) {
          const allData = await allResponse.json()
          const allSprints = allData.sprints || []
          // Filter out active sprints from history
          const history = allSprints.filter((s: Sprint) => s.status !== 'active')
          setSprintHistory(history)
        }
      } catch (error) {
        console.error('Failed to fetch sprints:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSprints()
  }, [currentUser.userId])

  const persistSprint = async (sprint: Sprint) => {
    try {
      const response = await fetch('/api/sprints', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sprintId: sprint.id,
          userId: currentUser.userId,
          updates: sprint,
        }),
      })

      if (!response.ok) {
        return false
      }
      return true
    } catch (error) {
      console.error('Failed to persist sprint:', error)
      return false
    }
  }

  const handleGlobalExecutionToggle = (dayNumber: number) => {
    setGlobalExecutionData((prev) => ({
      ...prev,
      [dayNumber]: !prev[dayNumber],
    }))
  }

  const handleCreateSprint = async (goal: string, secondaryGoals: string[]) => {
    try {
      const response = await fetch('/api/sprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          goal,
          secondaryGoals,
          executionChecklist: globalExecutionData,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setActiveSprint(data.sprint)
      } else {
        const data = await response.json().catch(() => ({}))
        toast.error(data.error || "Failed to create sprint")
      }
    } catch (error) {
      console.error('Failed to create sprint:', error)
      toast.error("Failed to create sprint")
    }
  }

  const handleToggleComplete = () => {
    if (!activeSprint) return

    const updated: Sprint = {
      ...activeSprint,
      completed: !activeSprint.completed,
      completedAt: !activeSprint.completed ? new Date() : undefined,
    }

    setActiveSprint(updated)
    void persistSprint(updated).then((ok) => {
      if (!ok) {
        setActiveSprint(activeSprint)
        toast.error("Could not save completion status")
      }
    })
  }

  const handleToggleSecondaryGoal = (goalId: string) => {
    if (!activeSprint) return

    const updated: Sprint = {
      ...activeSprint,
      secondaryGoals: activeSprint.secondaryGoals.map((sg) =>
        sg.id === goalId ? { ...sg, completed: !sg.completed } : sg,
      ),
    }

    setActiveSprint(updated)
    void persistSprint(updated).then((ok) => {
      if (!ok) {
        setActiveSprint(activeSprint)
        toast.error("Could not save secondary goal update")
      }
    })
  }

  const handleUpdateLog = (dayIndex: number, log: string) => {
    if (!activeSprint) return

    const updated: Sprint = {
      ...activeSprint,
      dailyLogs: {
        ...activeSprint.dailyLogs,
        [dayIndex]: log,
      },
    }

    setActiveSprint(updated)
    void persistSprint(updated).then((ok) => {
      if (!ok) {
        setActiveSprint(activeSprint)
        toast.error("Could not save daily log")
      }
    })
  }

  const handleToggleExecution = (dayIndex: number) => {
    if (!activeSprint) return

    const updated: Sprint = {
      ...activeSprint,
      executionChecklist: {
        ...activeSprint.executionChecklist,
        [dayIndex]: !activeSprint.executionChecklist[dayIndex],
      },
    }

    setActiveSprint(updated)
    void persistSprint(updated).then((ok) => {
      if (!ok) {
        setActiveSprint(activeSprint)
        toast.error("Could not save execution status")
      }
    })
  }

  const handleDailySync = () => {
    if (!activeSprint) return

    const now = new Date()
    const dateKey = now.toISOString().split("T")[0]

    const updated: Sprint = {
      ...activeSprint,
      lastSyncDate: now,
      dailySyncUps: {
        ...activeSprint.dailySyncUps,
        [dateKey]: true,
      },
    }

    setActiveSprint(updated)
    void persistSprint(updated).then((ok) => {
      if (!ok) {
        setActiveSprint(activeSprint)
        toast.error("Could not save daily check-in")
      }
    })
  }

  const handleStopSprint = async (completed: boolean) => {
    if (!activeSprint) return

    const now = new Date()
    const isEarlyTermination = now < new Date(activeSprint.endDate)

    const finalSprint: Sprint = {
      ...activeSprint,
      completed,
      completionStatus: completed ? "completed" : "failed",
      status: "terminated",
      outcome: completed ? "achieved" : "failed",
      completedAt: now,
      endedEarly: isEarlyTermination,
    }

    // Persist the terminated sprint
    const saved = await persistSprint(finalSprint)
    if (!saved) {
      toast.error("Could not close sprint")
      return
    }

    setSprintHistory((prev) => [finalSprint, ...prev])

    // Clear active sprint
    setActiveSprint(null)
  }

  const handleResetSprint = async () => {
    if (activeSprint) {
      const finalSprint: Sprint = {
        ...activeSprint,
        completionStatus: activeSprint.completed ? "completed" : "failed",
        status: "terminated",
        outcome: activeSprint.completed ? "achieved" : "failed",
      }

      // Persist the terminated sprint
      const saved = await persistSprint(finalSprint)
      if (!saved) {
        toast.error("Could not archive current sprint")
        return
      }

      setSprintHistory((prev) => [finalSprint, ...prev])
    }

    // Clear active sprint
    setActiveSprint(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="glass-surface rounded-2xl overflow-hidden p-6">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <GlobalExecutionTracker
          executionData={globalExecutionData}
          onToggleExecution={handleGlobalExecutionToggle}
          onMonthChange={handleMonthChange}
          activeSprint={activeSprint}
        />
      </div>

      <div className="glass-surface glass-highlight rounded-2xl overflow-hidden">
        <div className="border-b border-border/80 bg-muted/25 backdrop-blur-sm">
          <div className="flex p-2 gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab("earnings")}
              className={`shrink-0 sm:flex-1 min-w-[132px] px-4 sm:px-6 py-3 text-sm font-medium transition-colors relative rounded-xl ${activeTab === "earnings"
                ? "text-foreground glass-surface"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/35"
                }`}
            >
              Weekly Earnings
              {activeTab === "earnings" && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sprint")}
              className={`shrink-0 sm:flex-1 min-w-[132px] px-4 sm:px-6 py-3 text-sm font-medium transition-colors relative rounded-xl ${activeTab === "sprint"
                ? "text-foreground glass-surface"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/35"
                }`}
            >
              Active Sprint
              {activeTab === "sprint" && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`shrink-0 sm:flex-1 min-w-[148px] px-4 sm:px-6 py-3 text-sm font-medium transition-colors relative rounded-xl ${activeTab === "history"
                ? "text-foreground glass-surface"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/35"
                }`}
            >
              Sprint History
              {sprintHistory.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                  {sprintHistory.length}
                </span>
              )}
              {activeTab === "history" && <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />}
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "earnings" && <WeeklyTracker />}
          {activeTab === "sprint" && (
            <SprintTracker
              activeSprint={activeSprint}
              onCreateSprint={handleCreateSprint}
              onToggleComplete={handleToggleComplete}
              onToggleSecondaryGoal={handleToggleSecondaryGoal}
              onUpdateLog={handleUpdateLog}
              onToggleExecution={handleToggleExecution}
              onDailySync={handleDailySync}
              onStopSprint={handleStopSprint}
              onResetSprint={handleResetSprint}
            />
          )}
          {activeTab === "history" && <SprintHistoryView sprints={sprintHistory} />}
        </div>
      </div>
    </div>
  )
}
