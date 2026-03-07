import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Sprint from '@/lib/models/Sprint'

const VALID_USERS = ['Lucky', 'gagan'] as const

function isValidUserId(userId: string | null): userId is (typeof VALID_USERS)[number] {
    return !!userId && VALID_USERS.includes(userId as (typeof VALID_USERS)[number])
}

function serializeSprint(sprint: any) {
    const sprintObj = sprint.toObject()
    return {
        ...sprintObj,
        id: sprintObj.sprintId,
        dailyLogs:
            sprintObj.dailyLogs instanceof Map
                ? Object.fromEntries(sprintObj.dailyLogs)
                : (sprintObj.dailyLogs || {}),
        executionChecklist:
            sprintObj.executionChecklist instanceof Map
                ? Object.fromEntries(sprintObj.executionChecklist)
                : (sprintObj.executionChecklist || {}),
        dailySyncUps:
            sprintObj.dailySyncUps instanceof Map
                ? Object.fromEntries(sprintObj.dailySyncUps)
                : (sprintObj.dailySyncUps || {}),
    }
}

export async function GET(request: NextRequest) {
    try {
        await connectDB()

        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const status = searchParams.get('status') // 'active' or 'all'

        if (!isValidUserId(userId)) {
            return NextResponse.json({ error: 'Valid userId is required' }, { status: 400 })
        }

        const query: { userId: string; status?: string } = { userId }

        if (status === 'active') {
            query.status = 'active'
        }

        const sprints = await Sprint.find(query).sort({ createdAt: -1 })

        // Convert Maps to objects for JSON serialization
        const serializedSprints = sprints.map(serializeSprint)

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

        if (!isValidUserId(userId) || !goal) {
            return NextResponse.json({ error: 'Valid userId and goal are required' }, { status: 400 })
        }

        const existingActive = await Sprint.findOne({ userId, status: 'active' })
        if (existingActive) {
            return NextResponse.json(
                { error: 'An active sprint already exists for this user' },
                { status: 409 }
            )
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

        const serializedSprint = serializeSprint(sprint)

        return NextResponse.json({ sprint: serializedSprint }, { status: 201 })
    } catch (error) {
        if ((error as { code?: number })?.code === 11000) {
            return NextResponse.json(
                { error: 'An active sprint already exists for this user' },
                { status: 409 }
            )
        }
        console.error('Error creating sprint:', error)
        return NextResponse.json({ error: 'Failed to create sprint' }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        await connectDB()

        const data = await request.json()
        const { sprintId, userId, updates } = data

        if (!sprintId || !isValidUserId(userId) || !updates || typeof updates !== 'object') {
            return NextResponse.json(
                { error: 'sprintId, valid userId, and updates are required' },
                { status: 400 }
            )
        }

        const existingSprint = await Sprint.findOne({ sprintId, userId })

        if (!existingSprint) {
            return NextResponse.json({ error: 'Sprint not found' }, { status: 404 })
        }

        const allowedUpdateKeys = [
            'goal',
            'dailyLogs',
            'secondaryGoals',
            'executionChecklist',
            'dailySyncUps',
            'completed',
            'completionStatus',
            'status',
            'outcome',
            'completedAt',
            'endedEarly',
            'lastSyncDate',
            'endDate',
        ]

        const safeUpdates: Record<string, unknown> = {}
        for (const key of allowedUpdateKeys) {
            if (key in updates) {
                safeUpdates[key] = updates[key]
            }
        }

        if ('completedAt' in safeUpdates && safeUpdates.completedAt) {
            safeUpdates.completedAt = new Date(safeUpdates.completedAt as string)
        }

        if ('lastSyncDate' in safeUpdates && safeUpdates.lastSyncDate) {
            safeUpdates.lastSyncDate = new Date(safeUpdates.lastSyncDate as string)
        }

        if ('endDate' in safeUpdates && safeUpdates.endDate) {
            safeUpdates.endDate = new Date(safeUpdates.endDate as string)
        }

        safeUpdates.userId = existingSprint.userId

        const sprint = await Sprint.findOneAndUpdate(
            { sprintId, userId },
            { $set: safeUpdates },
            { new: true }
        )

        if (!sprint) {
            return NextResponse.json({ error: 'Sprint not found' }, { status: 404 })
        }

        const serializedSprint = serializeSprint(sprint)

        return NextResponse.json({ sprint: serializedSprint })
    } catch (error) {
        if ((error as { code?: number })?.code === 11000) {
            return NextResponse.json(
                { error: 'Update conflicts with existing active sprint' },
                { status: 409 }
            )
        }
        console.error('Error updating sprint:', error)
        return NextResponse.json({ error: 'Failed to update sprint' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await connectDB()

        const { searchParams } = new URL(request.url)
        const sprintId = searchParams.get('sprintId')
        const userId = searchParams.get('userId')

        if (!sprintId || !isValidUserId(userId)) {
            return NextResponse.json({ error: 'sprintId and valid userId are required' }, { status: 400 })
        }

        await Sprint.findOneAndDelete({ sprintId, userId })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting sprint:', error)
        return NextResponse.json({ error: 'Failed to delete sprint' }, { status: 500 })
    }
}
