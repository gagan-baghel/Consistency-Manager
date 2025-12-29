"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"

interface NewSprintFormProps {
  onSubmit: (goal: string, secondaryGoals: string[]) => void
  onCancel: () => void
}

export default function NewSprintForm({ onSubmit, onCancel }: NewSprintFormProps) {
  const [goal, setGoal] = useState("")
  const [secondaryGoal, setSecondaryGoal] = useState("")
  const [secondaryGoals, setSecondaryGoals] = useState<string[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (goal.trim()) {
      onSubmit(goal.trim(), secondaryGoals)
    }
  }

  const handleAddSecondaryGoal = () => {
    if (secondaryGoal.trim() && secondaryGoals.length < 3) {
      setSecondaryGoals((prev) => [...prev, secondaryGoal.trim()])
      setSecondaryGoal("")
    }
  }

  const handleRemoveSecondaryGoal = (index: number) => {
    setSecondaryGoals((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSecondaryGoalKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddSecondaryGoal()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="goal" className="text-sm font-medium mb-2 block">
          Primary Goal
        </Label>
        <Input
          id="goal"
          type="text"
          placeholder="What do you want to accomplish in 15 days?"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          autoFocus
          className="text-base"
        />
        <p className="text-xs text-muted-foreground mt-1.5">Your main focus for this sprint</p>
      </div>

      <div>
        <Label htmlFor="secondary-goal" className="text-sm font-medium mb-2 block">
          Secondary Goals <span className="text-muted-foreground font-normal">(Optional, max 3)</span>
        </Label>
        <div className="flex gap-2">
          <Input
            id="secondary-goal"
            type="text"
            placeholder="Add a supporting goal..."
            value={secondaryGoal}
            onChange={(e) => setSecondaryGoal(e.target.value)}
            onKeyDown={handleSecondaryGoalKeyDown}
            disabled={secondaryGoals.length >= 3}
            className="text-base"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleAddSecondaryGoal}
            disabled={!secondaryGoal.trim() || secondaryGoals.length >= 3}
          >
            +
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1.5">
          Additional objectives to track alongside your primary goal
        </p>

        {secondaryGoals.length > 0 && (
          <div className="mt-3 space-y-2">
            {secondaryGoals.map((sg, index) => (
              <div key={index} className="flex items-center gap-2 bg-muted/40 rounded-lg px-3 py-2">
                <span className="flex-1 text-sm text-pretty">{sg}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleRemoveSecondaryGoal(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={!goal.trim()} className="flex-1">
          Start Sprint
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
