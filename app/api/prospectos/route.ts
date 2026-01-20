import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Prospect from "@/models/Prospect";

export async function GET() {
    try {
        await dbConnect();
        const prospects = await Prospect.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: prospects });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Error fetching prospects" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const prospect = await Prospect.create(body);
        return NextResponse.json({ success: true, data: prospect }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Error creating prospect" },
            { status: 400 }
        );
    }
}
