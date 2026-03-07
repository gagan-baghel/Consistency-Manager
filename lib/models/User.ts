import mongoose, { Schema, Model } from 'mongoose'

export interface IUser {
    userId: string
    name: string
    createdAt: Date
}

const UserSchema = new Schema<IUser>({
    userId: {
        type: String,
        required: true,
        unique: true,
        enum: ['Lucky', 'gagan'],
    },
    name: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User
