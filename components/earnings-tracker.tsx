"use client"

import React, { useState, useEffect } from "react"
import WeeklyTracker from "./weekly-tracker"
import SprintTracker from "./sprint-tracker"
import SprintHistoryView from "./sprint-history-view"
import GlobalExecutionTracker from "./global-execution-tracker"
import type { Sprint } from "@/lib/sprint-utils"
import { useUser } from "@/contexts/UserContext"

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
      await fetch('/api/sprints', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sprintId: sprint.id,
          updates: sprint,
        }),
      })
    } catch (error) {
      console.error('Failed to persist sprint:', error)
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
      }
    } catch (error) {
      console.error('Failed to create sprint:', error)
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
    persistSprint(updated)
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
    persistSprint(updated)
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
    persistSprint(updated)
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
    persistSprint(updated)
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
    persistSprint(updated)
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
    await persistSprint(finalSprint)

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
      await persistSprint(finalSprint)

      setSprintHistory((prev) => [finalSprint, ...prev])
    }

    // Clear active sprint
    setActiveSprint(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="border border-border rounded-lg overflow-hidden bg-card p-6">
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

      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="border-b border-border bg-muted/20">
          <div className="flex">
            <button
              type="button"
              onClick={() => setActiveTab("earnings")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === "earnings"
                ? "text-foreground bg-card"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
            >
              Weekly Earnings
              {activeTab === "earnings" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("sprint")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === "sprint"
                ? "text-foreground bg-card"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
            >
              Active Sprint
              {activeTab === "sprint" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === "history"
                ? "text-foreground bg-card"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
            >
              Sprint History
              {sprintHistory.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-primary/10 text-primary">
                  {sprintHistory.length}
                </span>
              )}
              {activeTab === "history" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
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
