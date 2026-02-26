"use client"

import type React from "react"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface DateRangeSelectorProps {
  startDate: Date
  endDate: Date
  onStartDateChange: (date: Date) => void
  onEndDateChange: (date: Date) => void
}

export default function DateRangeSelector({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeSelectorProps) {
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }

  const parseDateInput = (value: string) => {
    const [year, month, day] = value.split("-").map(Number)
    return new Date(year, month - 1, day)
  }

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = parseDateInput(e.target.value)
    if (newStart <= endDate) {
      onStartDateChange(newStart)
    }
  }

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = parseDateInput(e.target.value)
    if (newEnd >= startDate) {
      onEndDateChange(newEnd)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs w-full sm:w-auto">
      <div className="flex items-center gap-1.5">
        <Label
          htmlFor="start-date"
          className="text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap"
        >
          From
        </Label>
        <Input
          id="start-date"
          type="date"
          value={formatDateForInput(startDate)}
          onChange={handleStartChange}
          className="h-8 text-xs w-full sm:w-[130px] glass-pill"
        />
      </div>
      <span className="text-muted-foreground/40 hidden sm:inline">→</span>
      <div className="flex items-center gap-1.5">
        <Label
          htmlFor="end-date"
          className="text-[10px] uppercase tracking-wider text-muted-foreground whitespace-nowrap"
        >
          To
        </Label>
        <Input
          id="end-date"
          type="date"
          value={formatDateForInput(endDate)}
          onChange={handleEndChange}
          className="h-8 text-xs w-full sm:w-[130px] glass-pill"
        />
      </div>
    </div>
  )
}
