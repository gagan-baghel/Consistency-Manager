"use client"

import { Button } from "@/components/ui/button"
import { hasSyncedToday } from "@/lib/sprint-utils"

interface DailySyncIndicatorProps {
  lastSyncDate: Date | string | null
  onSync: () => void
}

export default function DailySyncIndicator({ lastSyncDate, onSync }: DailySyncIndicatorProps) {
  const synced = hasSyncedToday(lastSyncDate)

  return (
    <div
      className={`glass-surface glass-highlight rounded-2xl p-4 transition-colors ${synced ? "border-primary/35" : "border-border"
        }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold mb-1">{synced ? "Today's Check-in Complete" : "Daily Check-in"}</h3>
          <p className="text-xs text-muted-foreground">
            {synced
              ? "You've confirmed alignment today. See you tomorrow."
              : "Mark your presence and confirm you're aligned with your sprint."}
          </p>
        </div>
        <div>
          {synced ? (
            <div className="flex items-center justify-center w-10 h-10 glass-orb bg-primary/80 text-primary-foreground">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <title>Check</title>
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          ) : (
            <Button onClick={onSync} size="sm" className="whitespace-nowrap">
              Check In
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
