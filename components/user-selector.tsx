"use client"

import { useUser, UserId } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button'
import { User } from 'lucide-react'

export default function UserSelector() {
    const { currentUser, switchUser, isLoading } = useUser()

    if (isLoading) {
        return null
    }

    const otherUserId: UserId = currentUser.userId === 'Pal' ? 'gagan' : 'Pal'
    const otherUserName = otherUserId === 'Pal' ? 'Pal' : 'Gagan'

    return (
        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                <User className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{currentUser.name}</span>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={() => switchUser(otherUserId)}
                className="text-xs"
            >
                Switch to {otherUserName}
            </Button>
        </div>
    )
}
