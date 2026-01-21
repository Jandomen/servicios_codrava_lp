import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import SecurityLog from "@/models/SecurityLog";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        await dbConnect();
        // Solo obtener logs del usuario actual
        const logs = await SecurityLog.find({ userId: session.user.id })
            .sort({ timestamp: -1 })
            .limit(50);

        return NextResponse.json(logs);
    } catch (error) {
        console.error("Error fetching security logs:", error);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { logId } = await req.json();
        await dbConnect();

        await SecurityLog.findOneAndUpdate(
            { _id: logId, userId: session.user.id },
            { read: true }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const logId = searchParams.get("id");

        await dbConnect();

        if (logId) {
            await SecurityLog.deleteOne({ _id: logId, userId: session.user.id });
        } else {
            // Limpiar todos si no hay ID (opcional, pero útil)
            await SecurityLog.deleteMany({ userId: session.user.id });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Error interno" }, { status: 500 });
    }
}
