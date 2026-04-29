import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    street: String,
    number: String,
    postal: String,
    city: String,
    province: String
},
    { _id: false }
);

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {

        type: String,
        required: true,
        minLength: 8,
        select: false
    },
    name: {
        type: String,
        default: ""
    },
    lastName: {
        type: String,
        default: ""
    },
    nif: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: ["admin", "guest"],
        default: "admin",
        index: true
    },
    status: {
        type: String,
        enum: ["pending", "verified"],
        default: "pending",
        index: true
    },
    verificationCode: {
        type: String,
        default: ""
    },
    verificationAttempts: {
        type: Number,
        default: 3
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        default: null,
        index: true
    },
    address: {
        type: addressSchema,
        default: {}
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

userSchema.virtual("fullName").get(function () {
    return `${this.name} ${this.lastName}`.trim();
});

export default mongoose.model("User", userSchema);
