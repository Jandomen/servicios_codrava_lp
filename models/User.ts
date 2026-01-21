import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, "El nombre es obligatorio"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "El correo electrónico es obligatorio"],
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, "La contraseña es obligatoria"],
        select: false,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    company: {
        type: String,
        trim: true,
    },
    biometricEnabled: {
        type: Boolean,
        default: false,
    },
    exclusiveBiometric: {
        type: Boolean,
        default: false,
    },
    // Credenciales WebAuthn reales
    authenticators: [{
        credentialID: Buffer,
        credentialPublicKey: Buffer,
        counter: Number,
        credentialDeviceType: String,
        credentialBackedUp: Boolean,
        transports: [String],
    }],
    // Para almacenar el challenge actual durante el flujo de registro/login
    currentChallenge: {
        type: String,
        select: false,
    }
}, {
    timestamps: true,
});

const User = models.User || model('User', UserSchema);

export default User;
