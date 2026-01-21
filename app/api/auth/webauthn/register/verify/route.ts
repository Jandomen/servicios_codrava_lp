import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getWebAuthnConfig } from "@/lib/webauthn-utils";

export async function POST(req: NextRequest) {
    try {
        const { rpID, origin } = getWebAuthnConfig(req);
        const session = await getServerSession();
        if (!session || !session.user?.email) {
            return NextResponse.json({ error: "No autorizado" }, { status: 401 });
        }

        const body = await req.json();

        await dbConnect();
        const user = await User.findOne({ email: session.user.email }).select("+currentChallenge");

        if (!user || !user.currentChallenge) {
            return NextResponse.json({ error: "Challenge no encontrado" }, { status: 400 });
        }

        const verification = await verifyRegistrationResponse({
            response: body,
            expectedChallenge: user.currentChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
        });

        if (verification.verified && verification.registrationInfo) {
            const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

            // Guardamos la nueva credencial
            user.authenticators.push({
                credentialID: Buffer.from(credentialID),
                credentialPublicKey: Buffer.from(credentialPublicKey),
                counter,
                credentialDeviceType: verification.registrationInfo.credentialDeviceType,
                credentialBackedUp: verification.registrationInfo.credentialBackedUp,
                transports: body.response.transports,
            });

            user.biometricEnabled = true;
            user.exclusiveBiometric = true;
            user.currentChallenge = undefined; // Limpiamos el challenge
            await user.save();

            return NextResponse.json({ verified: true });
        }

        return NextResponse.json({ verified: false, error: "Verificación fallida" }, { status: 400 });
    } catch (error: any) {
        console.error("WebAuthn Register Verify Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
