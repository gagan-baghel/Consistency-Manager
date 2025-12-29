import mongoose, { Schema, Model } from 'mongoose'

export interface ISecondaryGoal {
    id: string
    text: string
    completed: boolean
}

export interface ISprint {
    userId: string
    sprintId: string
    goal: string
    startDate: Date
    endDate: Date
    status: 'active' | 'completed' | 'terminated'
    outcome?: 'achieved' | 'failed'
    completedAt?: Date
    dailyLogs: Record<number, string>
    secondaryGoals: ISecondaryGoal[]
    executionChecklist: Record<number, boolean>
    dailySyncUps: Record<string, boolean>
    completed: boolean
    completionStatus: 'in-progress' | 'completed' | 'failed'
    endedEarly: boolean
    lastSyncDate: Date | null
    createdAt: Date
    updatedAt: Date
}

const SecondaryGoalSchema = new Schema<ISecondaryGoal>(
    {
        id: { type: String, required: true },
        text: { type: String, required: true },
        completed: { type: Boolean, default: false },
    },
    { _id: false }
)

const SprintSchema = new Schema<ISprint>(
    {
        userId: {
            type: String,
            required: true,
            enum: ['Pal', 'gagan'],
            index: true,
        },
        sprintId: {
            type: String,
            required: true,
            unique: true,
        },
        goal: {
            type: String,
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'completed', 'terminated'],
            default: 'active',
        },
        outcome: {
            type: String,
            enum: ['achieved', 'failed'],
        },
        completedAt: {
            type: Date,
        },
        dailyLogs: {
            type: Map,
            of: String,
            default: {},
        },
        secondaryGoals: {
            type: [SecondaryGoalSchema],
            default: [],
        },
        executionChecklist: {
            type: Map,
            of: Boolean,
            default: {},
        },
        dailySyncUps: {
            type: Map,
            of: Boolean,
            default: {},
        },
        completed: {
            type: Boolean,
            default: false,
        },
        completionStatus: {
            type: String,
            enum: ['in-progress', 'completed', 'failed'],
            default: 'in-progress',
        },
        endedEarly: {
            type: Boolean,
            default: false,
        },
        lastSyncDate: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
)

// Index for finding active sprint per user
SprintSchema.index({ userId: 1, status: 1 })

const Sprint: Model<ISprint> = mongoose.models.Sprint || mongoose.model<ISprint>('Sprint', SprintSchema)

export default Sprint
