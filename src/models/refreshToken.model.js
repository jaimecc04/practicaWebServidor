import mongoose from "mongoose";

const refreshTokenSchema = new mongoose.Schema({
    token: { // Token JWT de refresco
        type: String,
        required: true,
        unique: true
    },
    user: { // Referencia al usuario propietario del token
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expiresAt: { // Fecha de expiración del token
        type: Date,
        required: true,
        index: { expires: 0 } // El token se eliminará automáticamente al expirar
    },
    createdByIp: String, // IP desde la que se creó el token
    revokedAt: Date, // Fecha de revocación del token
    revokedByIp: String // IP desde la que se revocó el token
}, {
    timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// Método para verificar si el token está activo (no revocado y no expirado)
refreshTokenSchema.methods.isActive = function() {
    return !this.revokedAt && this.expiresAt > new Date();
};

export default mongoose.model('RefreshToken', refreshTokenSchema);
