"use client"

import { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import DateRangeSelector from "./date-range-selector"
import WeekInput from "./week-input"
import EarningsSummary from "./earnings-summary"
import { generateWeeksFromRange } from "@/lib/date-utils"
import { useUser } from "@/contexts/UserContext"

interface WeekEarnings {
  [weekId: string]: number
}

export default function WeeklyTracker() {
  const { currentUser } = useUser()
  const today = new Date()
  const defaultStart = new Date(today.getFullYear(), today.getMonth(), 1)
  const defaultEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

  const [startDate, setStartDate] = useState<Date>(defaultStart)
  const [endDate, setEndDate] = useState<Date>(defaultEnd)
  const [earnings, setEarnings] = useState<WeekEarnings>({})
  const [isLoading, setIsLoading] = useState(true)

  const weeks = useMemo(() => generateWeeksFromRange(startDate, endDate), [startDate, endDate])

  const currentWeekId = useMemo(() => {
    const todayTime = today.getTime()
    const currentWeek = weeks.find((week) => {
      return todayTime >= week.startDate.getTime() && todayTime <= week.endDate.getTime()
    })
    return currentWeek?.id
  }, [weeks, today])

  // Load date range from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(`dateRange_${currentUser.userId}`)
    if (saved) {
      try {
        const { startDate: savedStart, endDate: savedEnd } = JSON.parse(saved)
        setStartDate(new Date(savedStart))
        setEndDate(new Date(savedEnd))
      } catch (error) {
        console.error('Failed to load saved date range:', error)
      }
    }
  }, [currentUser.userId])

  // Save date range to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`dateRange_${currentUser.userId}`, JSON.stringify({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }))
  }, [startDate, endDate, currentUser.userId])

  // Fetch earnings from API when user changes
  useEffect(() => {
    const fetchEarnings = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/earnings?userId=${currentUser.userId}`)
        if (response.ok) {
          const data = await response.json()
          setEarnings(data.earnings || {})
        }
      } catch (error) {
        console.error('Failed to fetch earnings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEarnings()
  }, [currentUser.userId])

  const handleEarningChange = async (weekId: string, value: number) => {
    // Optimistically update UI
    setEarnings((prev) => ({
      ...prev,
      [weekId]: value,
    }))

    // Find the week data
    const week = weeks.find((w) => w.id === weekId)
    if (!week) return

    // Persist to database
    try {
      await fetch('/api/earnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          weekId,
          amount: value,
          startDate: week.startDate.toISOString(),
          endDate: week.endDate.toISOString(),
        }),
      })
    } catch (error) {
      console.error('Failed to save earnings:', error)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 pb-4 border-b">
            <div>
              <h2 className="text-lg font-semibold">Weekly Earnings</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Loading...</p>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4 pb-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Weekly Earnings</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Scan your entire period at a glance</p>
          </div>
          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onStartDateChange={setStartDate}
            onEndDateChange={setEndDate}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {weeks.map((week) => (
            <WeekInput
              key={week.id}
              week={week}
              value={earnings[week.id] || 0}
              onChange={(value) => handleEarningChange(week.id, value)}
              isCurrent={week.id === currentWeekId}
            />
          ))}
        </div>

        <div className="pt-4 border-t">
          <EarningsSummary weeks={weeks} earnings={earnings} />
        </div>
      </div>
    </Card>
  )
}
