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
    email: { // Único (index: unique), validado con Zod
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: { //Cifrada con bcrypt

        type: String,
        required: true,
        minLength: 8,
        select: false // No se devuelve por defecto en las consultas
    },
    name: { // Nombre del usuario
        type: String,
        default: ""
    },
    lastName: { // Apellidos del usuario
        type: String,
        default: ""
    },
    nif: { // NIF del usuario
        type: String,
        default: ""
    },
    role: { // Por defecto "admin", puede ser "admin" o "guest"
        type: String,
        enum: ["admin", "guest"],
        default: "admin",
        index: true
    },
    status: { // Estado de verificación del usuario, por defecto "pending", puede ser "pending" o "verified"
        type: String,
        enum: ["pending", "verified"],
        default: "pending",
        index: true
    },
    verificationCode: { // Código aleatorio de 6 dígitos para verificar el email del usuario, se genera al crear el usuario y se borra al verificarlo
        type: String,
        default: ""
    },
    verificationAttempts: { // Número de intentos de verificación restantes
        type: Number,
        default: 3
    },
    company: { // ref: 'Company' — se asigna en el onboarding (index)
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        default: null,
        index: true
    },
    address: {
        type: addressSchema,
        default: {}
    },
    deleted: { // Soft delete
        type: Boolean,
        default: false
    },
    deletedAt: { // Fecha de eliminación (soft delete)
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