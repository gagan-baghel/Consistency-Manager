"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface SprintCompletionDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: (completed: boolean) => void
  sprintGoal: string
  isNaturalEnd: boolean
}

export default function SprintCompletionDialog({
  open,
  onClose,
  onConfirm,
  sprintGoal,
  isNaturalEnd,
}: SprintCompletionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{isNaturalEnd ? "Sprint Period Ended" : "End Sprint Early?"}</DialogTitle>
          <DialogDescription className="text-base pt-2">
            {isNaturalEnd ? (
              <span>Your 15-day sprint has reached its natural end.</span>
            ) : (
              <span>You're about to end this sprint before the 15-day period is complete.</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="glass-surface glass-highlight rounded-2xl p-4 mb-4">
            <p className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wider">Primary Goal</p>
            <p className="text-base font-semibold leading-relaxed text-pretty">{sprintGoal}</p>
          </div>

          <p className="text-base font-medium text-foreground mb-2">Did you complete this goal?</p>
          <p className="text-sm text-muted-foreground">
            This outcome will be recorded permanently in your sprint history.
          </p>
        </div>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          <Button onClick={() => onConfirm(true)} className="w-full bg-primary hover:bg-primary/90" size="lg">
            Yes, Goal Achieved
          </Button>
          <Button onClick={() => onConfirm(false)} variant="destructive" className="w-full" size="lg">
            No, Goal Not Completed
          </Button>
          <Button onClick={onClose} variant="ghost" className="w-full">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
