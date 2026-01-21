import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
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
            async authorize(credentials) {
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
                                    biometricEnabled: user.biometricEnabled
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

                const isValid = await bcrypt.compare(credentials.password, user.password);

                if (!isValid) {
                    throw new Error("Contraseña incorrecta");
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    biometricEnabled: user.biometricEnabled
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
