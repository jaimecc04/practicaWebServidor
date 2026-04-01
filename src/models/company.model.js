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
    owner: { // ref: 'user' -- admin que creó la compañía
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: { // nombre de la empresa
        type: String,
        required: true,
    },
    cif: { // CIF de la empresa
        type: String,
        required: true,
        unique: true
    },
    address:{
        type: addressSchema,
        default: {}
    },
    logo: { // URL del logo de la empresa
        type: String,
        default: ""
    },
    isFreelance: { // true si es autónomo, (1 sola persona), false si es empresa (varios empleados)
        type: Boolean,
        default: false
    },
    deleted: { // Soft delete
        type: Boolean,
        default: false
    }
},
    { timestamps: true }
);

export default mongoose.model('Company', companySchema);