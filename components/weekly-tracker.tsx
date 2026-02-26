"use client"

import { useState, useMemo, useEffect } from "react"
import { Card } from "@/components/ui/card"
import DateRangeSelector from "./date-range-selector"
import WeekInput from "./week-input"
import EarningsSummary from "./earnings-summary"
import { generateWeeksFromRange } from "@/lib/date-utils"
import { useUser } from "@/contexts/UserContext"
import { toast } from "sonner"

interface WeekEarnings {
  [weekId: string]: number
}

const getDefaultDateRange = () => {
  const end = new Date()
  end.setHours(0, 0, 0, 0)
  const start = new Date(end)
  start.setDate(start.getDate() - 7)
  return { start, end }
}

export default function WeeklyTracker() {
  const { currentUser } = useUser()
  const initialRange = useMemo(() => getDefaultDateRange(), [])
  const today = new Date()

  const [startDate, setStartDate] = useState<Date>(initialRange.start)
  const [endDate, setEndDate] = useState<Date>(initialRange.end)
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

  // Fetch earnings from API when user changes
  useEffect(() => {
    const fetchEarnings = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/earnings?userId=${currentUser.userId}`)
        if (response.ok) {
          const data = await response.json()
          setEarnings(data.earnings || {})
        } else {
          toast.error("Could not load earnings")
        }
      } catch (error) {
        console.error('Failed to fetch earnings:', error)
        toast.error("Could not load earnings")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEarnings()
  }, [currentUser.userId])

  const handleEarningChange = async (weekId: string, value: number) => {
    const previousValue = earnings[weekId] || 0

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
      const response = await fetch('/api/earnings', {
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

      if (!response.ok) {
        throw new Error("Save failed")
      }
    } catch (error) {
      console.error('Failed to save earnings:', error)
      setEarnings((prev) => ({
        ...prev,
        [weekId]: previousValue,
      }))
      toast.error("Could not save earnings")
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b">
          <div>
            <h2 className="text-lg font-semibold">Weekly Earnings</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Scan your entire period at a glance</p>
          </div>
          <div className="w-full sm:w-auto">
            <DateRangeSelector
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
            />
          </div>
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
