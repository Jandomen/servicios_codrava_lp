import { NextResponse, NextRequest } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { SignJWT, jwtVerify } from "jose";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getWebAuthnConfig } from "@/lib/webauthn-utils";

export async function POST(req: NextRequest) {
    try {
        const { rpID, origin } = getWebAuthnConfig(req);
        const body = await req.json();
        const { email, response } = body;

        if (!response) {
            return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
        }

        // 1. Obtener el challenge esperado del cookie
        const challengeCookie = req.cookies.get('webauthn_challenge')?.value;
        if (!challengeCookie) {
            return NextResponse.json({ error: "Sesión de biometría expirada" }, { status: 400 });
        }

        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
        const { payload } = await jwtVerify(challengeCookie, secret);
        const expectedChallenge = payload.challenge as string;

        await dbConnect();

        let user;
        if (email) {
            user = await User.findOne({ email });
        } else {
            // Login por descubrimiento: buscar usuario que tenga esta credencial
            // El response.id es el credentialID en base64url
            user = await User.findOne({
                "authenticators.credentialID": response.id
            });
        }

        await dbConnect();
        if (!user) {
            return NextResponse.json({ error: "Usuario o biometría no encontrados" }, { status: 404 });
        }

        const authenticator = user.authenticators.find(
            (auth: any) => auth.credentialID === response.id
        );

        if (!authenticator) {
            return NextResponse.json({ error: "Autenticador no reconocido" }, { status: 400 });
        }

        const verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge,
            expectedOrigin: origin,
            expectedRPID: rpID,
            authenticator: {
                credentialID: authenticator.credentialID,
                credentialPublicKey: authenticator.credentialPublicKey,
                counter: authenticator.counter,
            },
        });

        if (verification.verified) {
            // Actualizar el counter
            authenticator.counter = verification.authenticationInfo.newCounter;
            user.currentChallenge = undefined;
            await user.save();

            // Generamos un token temporal firmado para que NextAuth lo valide
            const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
            const biometricToken = await new SignJWT({
                email: user.email,
                id: user._id.toString(),
                type: 'biometric-verified'
            })
                .setProtectedHeader({ alg: 'HS256' })
                .setIssuedAt()
                .setExpirationTime('2m') // Token muy breve para máxima seguridad
                .sign(secret);

            return NextResponse.json({
                verified: true,
                biometricToken
            });
        }

        return NextResponse.json({ verified: false }, { status: 400 });
    } catch (error: any) {
        console.error("WebAuthn Login Verify Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
