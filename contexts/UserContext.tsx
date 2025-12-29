"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserId = 'Pal' | 'gagan'

interface User {
    userId: UserId
    name: string
}

interface UserContextType {
    currentUser: User
    switchUser: (userId: UserId) => void
    isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const USERS: Record<UserId, User> = {
    Pal: { userId: 'Pal', name: 'Pal' },
    gagan: { userId: 'gagan', name: 'Gagan' },
}

const STORAGE_KEY = 'earnings-tracker-user'

export function UserProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User>(USERS.Pal)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Load user from localStorage on mount
        const savedUserId = localStorage.getItem(STORAGE_KEY) as UserId | null
        if (savedUserId && USERS[savedUserId]) {
            setCurrentUser(USERS[savedUserId])
        }
        setIsLoading(false)
    }, [])

    const switchUser = (userId: UserId) => {
        const user = USERS[userId]
        if (user) {
            setCurrentUser(user)
            localStorage.setItem(STORAGE_KEY, userId)
        }
    }

    return (
        <UserContext.Provider value={{ currentUser, switchUser, isLoading }}>
            {children}
        </UserContext.Provider>
    )
}

export function useUser() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider')
    }
    return context
}
