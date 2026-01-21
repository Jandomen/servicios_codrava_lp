import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getWebAuthnConfig } from "@/lib/webauthn-utils";

const rpName = "Codrava LP";

export async function GET(req: NextRequest) {
    try {
        const { rpID } = getWebAuthnConfig(req);
        const session = await getServerSession();

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        await dbConnect();
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }

        const options = await generateRegistrationOptions({
            rpName,
            rpID,
            userID: user._id.toString(),
            userName: user.email,
            userDisplayName: user.name,
            attestationType: "none",
            authenticatorSelection: {
                residentKey: "preferred",
                userVerification: "preferred",
                authenticatorAttachment: "platform", // Obliga a usar biometría del dispositivo (TouchID, FaceID, etc)
            },
        });

        // Guardamos el challenge en el usuario para verificarlo después
        user.currentChallenge = options.challenge;
        await user.save();

        return NextResponse.json(options);
    } catch (error: any) {
        console.error("WebAuthn Register Options Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
