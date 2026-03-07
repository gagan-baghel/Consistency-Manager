import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/lib/models/User'

export async function GET() {
    try {
        await connectDB()

        let users = await User.find({})

        if (users.length === 0) {
            const Lucky = new User({ userId: 'Lucky', name: 'Lucky' })
            const gagan = new User({ userId: 'gagan', name: 'Gagan' })

            await Promise.all([Lucky.save(), gagan.save()])
            users = [Lucky, gagan]
        }

        return NextResponse.json({ users })
    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        await connectDB()

        const { userId, name } = await request.json()

        if (!userId || !name) {
            return NextResponse.json({ error: 'userId and name are required' }, { status: 400 })
        }

        const existingUser = await User.findOne({ userId })

        if (existingUser) {
            return NextResponse.json({ user: existingUser })
        }

        const user = new User({ userId, name })
        await user.save()

        return NextResponse.json({ user }, { status: 201 })
    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }
}
