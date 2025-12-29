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
    return date.toISOString().split("T")[0]
  }

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = new Date(e.target.value)
    if (newStart <= endDate) {
      onStartDateChange(newStart)
    }
  }

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = new Date(e.target.value)
    if (newEnd >= startDate) {
      onEndDateChange(newEnd)
    }
  }

  return (
    <div className="flex items-center gap-2 text-xs">
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
          className="h-8 text-xs w-[130px]"
        />
      </div>
      <span className="text-muted-foreground/40">→</span>
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
          className="h-8 text-xs w-[130px]"
        />
      </div>
    </div>
  )
}
