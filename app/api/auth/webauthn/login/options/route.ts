import { NextResponse, NextRequest } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getWebAuthnConfig } from "@/lib/webauthn-utils";
import { SignJWT } from "jose";

export async function POST(req: NextRequest) {
    try {
        const { rpID } = getWebAuthnConfig(req);
        const body = await req.json().catch(() => ({}));
        const email = body.email;

        await dbConnect();

        let allowCredentials = undefined;
        let userForChallenge: any = null;

        if (email) {
            userForChallenge = await User.findOne({ email });
            if (userForChallenge && userForChallenge.authenticators.length > 0) {
                allowCredentials = userForChallenge.authenticators.map((auth: any) => ({
                    id: auth.credentialID,
                    type: "public-key",
                    transports: auth.transports,
                }));
            }
        }

        const options = await generateAuthenticationOptions({
            rpID,
            allowCredentials,
            userVerification: "preferred",
        });

        // Guardamos el challenge. Si hay usuario, en DB para mayor seguridad.
        // También lo devolvemos en un cookie firmado por si es login anónimo.
        if (userForChallenge) {
            userForChallenge.currentChallenge = options.challenge;
            await userForChallenge.save();
        }

        const response = NextResponse.json(options);

        // Token temporal para el challenge
        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
        const challengeToken = await new SignJWT({ challenge: options.challenge })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('5m')
            .sign(secret);

        response.cookies.set('webauthn_challenge', challengeToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 300 // 5 min
        });

        return response;
    } catch (error: any) {
        console.error("WebAuthn Login Options Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
