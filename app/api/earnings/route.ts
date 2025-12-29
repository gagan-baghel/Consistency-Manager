import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Earnings from '@/lib/models/Earnings'

export async function GET(request: NextRequest) {
    try {
        await connectDB()

        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 })
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

        if (!userId || !weekId || amount === undefined) {
            return NextResponse.json(
                { error: 'userId, weekId, and amount are required' },
                { status: 400 }
            )
        }

        // Upsert: update if exists, create if not
        const earning = await Earnings.findOneAndUpdate(
            { userId, weekId },
            {
                userId,
                weekId,
                amount,
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

        if (!userId || !weekId) {
            return NextResponse.json({ error: 'userId and weekId are required' }, { status: 400 })
        }

        await Earnings.findOneAndDelete({ userId, weekId })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting earnings:', error)
        return NextResponse.json({ error: 'Failed to delete earnings' }, { status: 500 })
    }
}
