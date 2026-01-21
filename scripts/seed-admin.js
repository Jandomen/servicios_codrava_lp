const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI no está definido en .env.local");
    process.exit(1);
}

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    biometricEnabled: { type: Boolean, default: false },
    biometricCredentials: { type: [mongoose.Schema.Types.Mixed], default: [] },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Conectado a MongoDB");

        const email = "admin@codrava.com";
        const passwordPlain = "ju83GY67";
        const hashedPassword = await bcrypt.hash(passwordPlain, 10);

        const adminData = {
            name: "Admin Codrava",
            email: email,
            password: hashedPassword,
            role: "admin",
            biometricEnabled: false,
            biometricCredentials: []
        };

        // Upsert: Create or Update
        const user = await User.findOneAndUpdate(
            { email: email },
            adminData,
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        console.log(`✅ Usuario Admin configurado: ${user.email} (${user.role})`);

    } catch (error) {
        console.error("❌ Error al crear admin:", error);
    } finally {
        await mongoose.disconnect();
        console.log("👋 Desconectado");
    }
}

seedAdmin();
