import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user?.role !== "admin") {
            return NextResponse.json({ error: "No autorizado. Se requieren permisos de administrador." }, { status: 403 });
        }

        const { name, email, password, role, company } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Nombre, email y contraseña son obligatorios." }, { status: 400 });
        }

        await dbConnect();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "El usuario ya existe." }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role || "user",
            company,
            biometricEnabled: false
        });

        return NextResponse.json({
            success: true,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        }, { status: 201 });

    } catch (error: any) {
        console.error("Admin User Creation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user?.role !== "admin") {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        await dbConnect();
        const users = await User.find({}).select("-password").sort({ createdAt: -1 });

        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user?.role !== "admin") {
            return NextResponse.json({ error: "No autorizado" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("id");

        if (!userId) {
            return NextResponse.json({ error: "ID de usuario requerido" }, { status: 400 });
        }

        await dbConnect();

        // Evitar que un admin se borre a sí mismo
        const userToDelete = await User.findById(userId);
        if (userToDelete && userToDelete.email === session.user.email) {
            return NextResponse.json({ error: "No puedes eliminar tu propia cuenta." }, { status: 400 });
        }

        await User.findByIdAndDelete(userId);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
