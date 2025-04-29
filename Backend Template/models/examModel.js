import mongoose, { Schema } from "mongoose";

const accountSchema = new Schema(
    {
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
            index: true
        },
        password: {
            type: String,
            required: true,
            index: true
        },
        role: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: ["active", "inactive", "banning"],
            default: "active"
        },
        refreshToken: {
            type: String,
            index: true
        },
        socketId: {
            type: String,
            index: true,
        },
        lastLogin: {
            type: Date,
            default: Date.now
        },
    },
    {
        timestamps: true,
    }
)

const Account = mongoose.model("Account", accountSchema);

export default Account;
