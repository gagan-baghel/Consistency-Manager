"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { parseCurrencyInput } from "@/lib/date-utils"
import type { Week } from "@/lib/date-utils"

interface WeekInputProps {
  week: Week
  value: number
  onChange: (value: number) => void
  isCurrent?: boolean
}

export default function WeekInput({ week, value, onChange, isCurrent = false }: WeekInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [displayValue, setDisplayValue] = useState("")

  // <CHANGE> Check if this week has data
  const hasData = value > 0
  const isEmpty = !hasData && !isFocused

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(value > 0 ? value.toString() : "")
    }
  }, [value, isFocused])

  const handleFocus = () => {
    setIsFocused(true)
    setDisplayValue(value > 0 ? value.toString() : "")
  }

  const handleBlur = () => {
    setIsFocused(false)
    const parsed = parseCurrencyInput(displayValue)
    onChange(parsed)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDisplayValue(e.target.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur()
    }
  }

  return (
    <div
      className={`
        glass-lite flex flex-col h-28 p-3 rounded-xl transition-all
        ${isCurrent ? "ring-2 ring-primary/35 border-primary/65" : "border-border/70"}
        ${isFocused ? "ring-2 ring-primary/45 border-primary" : ""}
        hover:border-primary/45
      `}
    >
      <div className="flex-1 mb-2">
        <div className="text-xs font-semibold text-foreground">
          Week {week.weekNumber}
        </div>
        <div className="text-[10px] leading-tight mt-0.5 text-foreground/75">
          {week.label}
        </div>
      </div>

      <div className="relative">
        {!isFocused && hasData && (
          <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-xs text-foreground/70">
            $
          </div>
        )}
        <Input
          type="text"
          inputMode="decimal"
          value={isFocused ? displayValue : hasData ? value.toLocaleString() : ""}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="—"
          className={`
            h-9 text-sm text-right border border-border/70 bg-background/45 p-0 pr-2 font-medium text-foreground
            ${!isFocused && hasData ? "pl-5 font-medium" : "pl-2"}
            placeholder:text-foreground/55
          `}
        />
      </div>
    </div>
  )
}
