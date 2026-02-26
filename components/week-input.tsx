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
    // <CHANGE> Redesigned as a compact vertical grid cell with visual states
    <div
      className={`
        glass-inner glass-highlight flex flex-col h-28 p-3 rounded-xl transition-all
        ${isEmpty ? "opacity-80" : ""}
        ${isCurrent ? "ring-2 ring-primary/30 border-primary/60" : ""}
        ${isFocused ? "ring-2 ring-primary/40 border-primary" : ""}
        hover:border-primary/45 hover:translate-y-[-1px]
      `}
    >
      {/* Week header */}
      <div className="flex-1 mb-2">
        <div className={`text-xs font-medium ${isEmpty ? "text-muted-foreground/60" : "text-foreground"}`}>
          Week {week.weekNumber}
        </div>
        <div className={`text-[10px] leading-tight mt-0.5 ${isEmpty ? "text-muted-foreground/40" : "text-muted-foreground"}`}>
          {week.label}
        </div>
      </div>

      {/* Input area */}
      <div className="relative">
        {!isFocused && hasData && (
          <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none text-xs text-muted-foreground">
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
            h-8 text-sm text-right border-0 bg-transparent p-0 pr-2
            ${!isFocused && hasData ? "pl-5 font-medium" : "pl-2"}
            ${isEmpty ? "placeholder:text-muted-foreground/30" : ""}
          `}
        />
      </div>
    </div>
  )
}
