import mongoose from "mongoose";

const clientSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    cif: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        default: ""
    },
    address: {
        type: {
            street: String,
            number: String,
            postal: String,
            city: String,
            province: String
        },
        _id: false,
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
},
    { timestamps: true }
);

export default mongoose.model("Client", clientSchema);
