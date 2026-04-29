import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    street: String,
    number: String,
    postal: String,
    city: String,
    province: String
},
    { _id: false }
);

const companySchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    cif: {
        type: String,
        required: true,
        unique: true
    },
    address:{
        type: addressSchema,
        default: {}
    },
    logo: {
        type: String,
        default: ""
    },
    isFreelance: {
        type: Boolean,
        default: false
    },
    deleted: {
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
);

export default mongoose.model('Company', companySchema);
