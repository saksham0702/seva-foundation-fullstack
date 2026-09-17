import {Document,Types,Schema,model} from "mongoose"

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: string;
    createdBy: Types.ObjectId;
    updatedBy: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
}

const UserSchema = new Schema<IUser>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    createdBy: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    updatedBy: {
        type: Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
})

export const User = model<IUser>("User", UserSchema);