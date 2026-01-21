import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import SecurityLog from "@/models/SecurityLog";
import bcrypt from "bcryptjs";
import { jwtVerify } from "jose";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                biometricToken: { label: "Biometric Token", type: "text" }
            },
            async authorize(credentials, _req: any) {
                await dbConnect();

                // Caso 1: Login Biométrico
                if (credentials?.biometricToken) {
                    try {
                        const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);
                        const { payload } = await jwtVerify(credentials.biometricToken, secret);

                        if (payload.type === 'biometric-verified' && payload.email) {
                            const user = await User.findOne({ email: payload.email });
                            if (user) {
                                return {
                                    id: user._id.toString(),
                                    name: user.name,
                                    email: user.email,
                                    role: user.role,
                                    biometricEnabled: user.biometricEnabled,
                                    exclusiveBiometric: user.exclusiveBiometric
                                };
                            }
                        }
                    } catch (err) {
                        console.error("Biometric JWT Verification failed:", err);
                        throw new Error("Verificación biométrica fallida o expirada");
                    }
                }

                // Caso 2: Login con Contraseña
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Credenciales incompletas");
                }

                const user = await User.findOne({ email: credentials.email }).select("+password");

                if (!user) {
                    throw new Error("Usuario no encontrado");
                }

                // BLOQUEO EXCLUSIVO: Si tiene la huella como única vía, bloqueamos contraseña
                if (user.exclusiveBiometric) {
                    // REGISTRAR INTENTO DE INTRUSIÓN
                    const ip = _req.headers?.['x-forwarded-for'] || _req.socket?.remoteAddress;
                    await SecurityLog.create({
                        userId: user._id,
                        action: 'INTRUSION_ATTEMPT',
                        details: `Intento de acceso con contraseña desde ${ip}`,
                        ip,
                        userAgent: _req.headers?.['user-agent']
                    });

                    throw new Error("Acceso exclusivo por HUELLA activado. La contraseña ha sido desactivada.");
                }

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error("Contraseña incorrecta");
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    biometricEnabled: user.biometricEnabled,
                    exclusiveBiometric: user.exclusiveBiometric
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }: any) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
                token.biometricEnabled = user.biometricEnabled;
                token.exclusiveBiometric = user.exclusiveBiometric;
            }
            if (trigger === "update" && session) {
                token = { ...token, ...session };
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.role = token.role;
                session.user.id = token.id;
                session.user.biometricEnabled = token.biometricEnabled;
                session.user.exclusiveBiometric = token.exclusiveBiometric;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: "jwt" as const,
    },
    secret: process.env.NEXTAUTH_SECRET,
};
