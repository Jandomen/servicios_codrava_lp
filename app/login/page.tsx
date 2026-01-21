"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Fingerprint, Loader2, ArrowRight } from "lucide-react";
import { startAuthentication } from "@simplewebauthn/browser";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [biometricLoading, setBiometricLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Credenciales inválidas. Intenta de nuevo.");
                setLoading(false);
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError("Ocurrió un error inesperado.");
            setLoading(false);
        }
    };

    const handleBiometricLogin = async () => {
        setBiometricLoading(true);
        setError("");

        try {
            // 1. Obtener opciones del servidor (el email ahora es opcional)
            const resOptions = await fetch("/api/auth/webauthn/login/options", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: email ? JSON.stringify({ email }) : JSON.stringify({}),
            });
            const options = await resOptions.json();

            if (options.error) throw new Error(options.error);

            // 2. Autenticar con el dispositivo (esto abrirá el prompt de FaceID/Huella)
            const authResponse = await startAuthentication(options);

            // 3. Verificar en el servidor
            const resVerify = await fetch("/api/auth/webauthn/login/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: email || null, // Si es login por descubrimiento, el servidor buscará el email por el ID de credencial
                    response: authResponse
                }),
            });

            const verification = await resVerify.json();

            if (verification.verified && verification.biometricToken) {
                // 4. Iniciar sesión en NextAuth usando el token biométrico
                const result = await signIn("credentials", {
                    biometricToken: verification.biometricToken,
                    redirect: false,
                });

                if (result?.error) {
                    throw new Error("Error al iniciar sesión con biometría");
                }

                router.push("/dashboard");
                router.refresh();
            } else {
                throw new Error("Verificación biométrica fallida");
            }
        } catch (err: any) {
            console.error("Biometric Login Error:", err);
            // Si el usuario canceló el prompt del navegador, no mostramos error feo
            if (err.name !== 'NotAllowedError') {
                setError(err.message || "Error en la autenticación biométrica");
            }
        } finally {
            setBiometricLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0B0B0E] flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-green-500/5 rounded-full blur-[120px]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl font-bold tracking-tighter text-white mb-2"
                    >
                        CODRAVA
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-zinc-400 text-sm tracking-widest uppercase"
                    >
                        Acceso al Sistema
                    </motion.p>
                </div>

                <div className="bg-black/40 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
                    {/* Border Gradient Effect */}
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent opacity-50" />
                    <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#D4AF37]/20 to-transparent opacity-50" />

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider ml-1">Correo Electrónico</label>
                            <div className="relative group/input">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within/input:text-[#D4AF37] transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-10 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all"
                                    placeholder="usuario@codrava.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-zinc-500 font-medium uppercase tracking-wider ml-1">Contraseña</label>
                            <div className="relative group/input">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within/input:text-[#D4AF37] transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-black/50 border border-zinc-800 rounded-xl px-10 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#D4AF37] hover:bg-[#B5952F] text-black font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Ingresar
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="my-8 flex items-center gap-4 text-zinc-700">
                        <div className="h-px flex-1 bg-zinc-900" />
                        <span className="text-xs font-medium uppercase">O ingresa con</span>
                        <div className="h-px flex-1 bg-zinc-900" />
                    </div>

                    <button
                        type="button"
                        onClick={handleBiometricLogin}
                        disabled={biometricLoading}
                        className="w-full bg-zinc-900/50 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white py-3 rounded-xl transition-all flex items-center justify-center gap-3 group/bio"
                    >
                        {biometricLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin text-[#D4AF37]" />
                        ) : (
                            <>
                                <Fingerprint className="w-5 h-5 group-hover/bio:text-[#D4AF37] transition-colors" />
                                <span>Biometría</span>
                            </>
                        )}
                    </button>
                </div>

                <p className="text-center text-zinc-600 text-xs mt-8">
                    &copy; 2024 Codrava Ecosistema. Acceso restringido.
                </p>
            </motion.div>
        </div>
    );
}
