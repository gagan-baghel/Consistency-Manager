import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Earnings from '@/lib/models/Earnings'

const VALID_USERS = ['Lucky', 'gagan'] as const

function isValidUserId(userId: string | null): userId is (typeof VALID_USERS)[number] {
    return !!userId && VALID_USERS.includes(userId as (typeof VALID_USERS)[number])
}

export async function GET(request: NextRequest) {
    try {
        await connectDB()

        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!isValidUserId(userId)) {
            return NextResponse.json({ error: 'Valid userId is required' }, { status: 400 })
        }

        const earnings = await Earnings.find({ userId }).sort({ startDate: 1 })

        // Convert to object format expected by frontend
        const earningsMap: Record<string, number> = {}
        earnings.forEach((earning) => {
            earningsMap[earning.weekId] = earning.amount
        })

        return NextResponse.json({ earnings: earningsMap })
    } catch (error) {
        console.error('Error fetching earnings:', error)
        return NextResponse.json({ error: 'Failed to fetch earnings' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB()

        const { userId, weekId, amount, startDate, endDate } = await request.json()
        const numericAmount = Number(amount)

        if (!isValidUserId(userId) || !weekId || amount === undefined || !Number.isFinite(numericAmount)) {
            return NextResponse.json(
                { error: 'Valid userId, weekId, and numeric amount are required' },
                { status: 400 }
            )
        }

        // Upsert: update if exists, create if not
        const earning = await Earnings.findOneAndUpdate(
            { userId, weekId },
            {
                userId,
                weekId,
                amount: numericAmount,
                startDate: startDate ? new Date(startDate) : new Date(),
                endDate: endDate ? new Date(endDate) : new Date(),
            },
            { upsert: true, new: true }
        )

        return NextResponse.json({ earning })
    } catch (error) {
        console.error('Error saving earnings:', error)
        return NextResponse.json({ error: 'Failed to save earnings' }, { status: 500 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        await connectDB()

        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const weekId = searchParams.get('weekId')

        if (!isValidUserId(userId) || !weekId) {
            return NextResponse.json({ error: 'userId and weekId are required' }, { status: 400 })
        }

        await Earnings.findOneAndDelete({ userId, weekId })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting earnings:', error)
        return NextResponse.json({ error: 'Failed to delete earnings' }, { status: 500 })
    }
}
