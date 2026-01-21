import mongoose, { Schema, model, models } from 'mongoose';

const SecurityLogSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    action: {
        type: String,
        default: 'INTRUSION_ATTEMPT', // Intento de acceso con contraseña en cuenta bloqueada por huella
    },
    details: {
        type: String,
    },
    ip: String,
    userAgent: String,
    timestamp: {
        type: Date,
        default: Date.now,
    },
    read: {
        type: Boolean,
        default: false,
    }
}, {
    timestamps: true,
});

const SecurityLog = models.SecurityLog || model('SecurityLog', SecurityLogSchema);

export default SecurityLog;
