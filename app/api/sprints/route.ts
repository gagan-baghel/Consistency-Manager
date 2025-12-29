import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Sprint from '@/lib/models/Sprint'

export async function GET(request: NextRequest) {
    try {
        await connectDB()

        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const status = searchParams.get('status') // 'active' or 'all'

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
        }

        let query: any = { userId }

        if (status === 'active') {
            query.status = 'active'
        }

        const sprints = await Sprint.find(query).sort({ createdAt: -1 })

        // Convert Maps to objects for JSON serialization
        const serializedSprints = sprints.map((sprint) => {
            const sprintObj = sprint.toObject()
            return {
                ...sprintObj,
                id: sprintObj.sprintId,
                dailyLogs: sprintObj.dailyLogs instanceof Map ? Object.fromEntries(sprintObj.dailyLogs) : (sprintObj.dailyLogs || {}),
                executionChecklist: sprintObj.executionChecklist instanceof Map ? Object.fromEntries(sprintObj.executionChecklist) : (sprintObj.executionChecklist || {}),
                dailySyncUps: sprintObj.dailySyncUps instanceof Map ? Object.fromEntries(sprintObj.dailySyncUps) : (sprintObj.dailySyncUps || {}),
            }
        })

        return NextResponse.json({ sprints: serializedSprints })
    } catch (error) {
        console.error('Error fetching sprints:', error)
        return NextResponse.json({ error: 'Failed to fetch sprints' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB()

        const data = await request.json()
        const { userId, goal, secondaryGoals, executionChecklist } = data

        if (!userId || !goal) {
            return NextResponse.json({ error: 'userId and goal are required' }, { status: 400 })
        }

        const startDate = new Date()
        const endDate = new Date(startDate.getTime() + 15 * 24 * 60 * 60 * 1000)
        const sprintId = `sprint-${Date.now()}`

        const sprint = new Sprint({
            userId,
            sprintId,
            goal,
            startDate,
            endDate,
            status: 'active',
            completed: false,
            completionStatus: 'in-progress',
            endedEarly: false,
            dailyLogs: {},
            executionChecklist: executionChecklist || {},
            dailySyncUps: {},
            lastSyncDate: null,
            secondaryGoals: (secondaryGoals || []).map((text: string, index: number) => ({
                id: `sg-${Date.now()}-${index}`,
                text,
                completed: false,
            })),
        })

        await sprint.save()

        const sprintObj = sprint.toObject()
        const serializedSprint = {
            ...sprintObj,
            id: sprintObj.sprintId,
            dailyLogs: sprintObj.dailyLogs instanceof Map ? Object.fromEntries(sprintObj.dailyLogs) : (sprintObj.dailyLogs || {}),
            executionChecklist: sprintObj.executionChecklist instanceof Map ? Object.fromEntries(sprintObj.executionChecklist) : (sprintObj.executionChecklist || {}),
            dailySyncUps: sprintObj.dailySyncUps instanceof Map ? Object.fromEntries(sprintObj.dailySyncUps) : (sprintObj.dailySyncUps || {}),
        }

        return NextResponse.json({ sprint: serializedSprint }, { status: 201 })
    } catch (error) {
        console.error('Error creating sprint:', error)
        return NextResponse.json({ error: 'Failed to create sprint' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        await connectDB()

        const data = await request.json()
        const { sprintId, updates } = data

        if (!sprintId) {
            return NextResponse.json({ error: 'sprintId is required' }, { status: 400 })
        }

        // First, fetch the existing sprint to verify ownership
        const existingSprint = await Sprint.findOne({ sprintId })

        if (!existingSprint) {
            return NextResponse.json({ error: 'Sprint not found' }, { status: 404 })
        }

        // Verify that the userId in updates matches the existing sprint's userId
        // This prevents users from modifying other users' sprints
        if (updates.userId && updates.userId !== existingSprint.userId) {
            return NextResponse.json({ error: 'Unauthorized: Cannot modify another user\'s sprint' }, { status: 403 })
        }

        // Ensure userId cannot be changed
        const safeUpdates = { ...updates, userId: existingSprint.userId }

        const sprint = await Sprint.findOneAndUpdate(
            { sprintId },
            { $set: safeUpdates },
            { new: true }
        )

        if (!sprint) {
            return NextResponse.json({ error: 'Sprint not found' }, { status: 404 })
        }

        const sprintObj = sprint.toObject()
        const serializedSprint = {
            ...sprintObj,
            id: sprintObj.sprintId,
            dailyLogs: sprintObj.dailyLogs instanceof Map ? Object.fromEntries(sprintObj.dailyLogs) : (sprintObj.dailyLogs || {}),
            executionChecklist: sprintObj.executionChecklist instanceof Map ? Object.fromEntries(sprintObj.executionChecklist) : (sprintObj.executionChecklist || {}),
            dailySyncUps: sprintObj.dailySyncUps instanceof Map ? Object.fromEntries(sprintObj.dailySyncUps) : (sprintObj.dailySyncUps || {}),
        }

        return NextResponse.json({ sprint: serializedSprint })
    } catch (error) {
        console.error('Error updating sprint:', error)
        return NextResponse.json({ error: 'Failed to update sprint' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await connectDB()

        const { searchParams } = new URL(request.url)
        const sprintId = searchParams.get('sprintId')

        if (!sprintId) {
            return NextResponse.json({ error: 'sprintId is required' }, { status: 400 })
        }

        await Sprint.findOneAndDelete({ sprintId })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting sprint:', error)
        return NextResponse.json({ error: 'Failed to delete sprint' }, { status: 500 })
    }
}
