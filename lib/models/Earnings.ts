import mongoose, { Schema, Model } from 'mongoose'

export interface IEarnings {
    userId: string
    weekId: string
    amount: number
    startDate: Date
    endDate: Date
    createdAt: Date
    updatedAt: Date
}

const EarningsSchema = new Schema<IEarnings>(
    {
        userId: {
            type: String,
            required: true,
            enum: ['Pal', 'gagan'],
            index: true,
        },
        weekId: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            default: 0,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
    },
    {
        timestamps: true,
    }
)

// Compound index for user-specific week lookups
EarningsSchema.index({ userId: 1, weekId: 1 }, { unique: true })

const Earnings: Model<IEarnings> =
    mongoose.models.Earnings || mongoose.model<IEarnings>('Earnings', EarningsSchema)

export default Earnings
