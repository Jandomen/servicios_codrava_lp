"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    User,
    Shield,
    Fingerprint,
    Bell,
    CreditCard,
    ChevronRight,
    Check,
    AlertCircle,
    Loader2
} from "lucide-react";
import { startRegistration } from "@simplewebauthn/browser";
import { useSession } from "next-auth/react";

export default function SettingsPage() {
    const { data: session, update: updateSession } = useSession();
    const [biometricEnabled, setBiometricEnabled] = useState(session?.user?.biometricEnabled || false);
    const [registering, setRegistering] = useState(false);
    const [error, setError] = useState("");

    const handleRegisterBiometry = async () => {
        setRegistering(true);
        setError("");

        try {
            // 1. Obtener opciones del servidor
            const resOptions = await fetch("/api/auth/webauthn/register/options");
            const options = await resOptions.json();

            if (options.error) throw new Error(options.error);

            // 2. Interactuar con el autenticador del dispositivo
            const attestationResponse = await startRegistration(options);

            // 3. Verificar en el servidor
            const resVerify = await fetch("/api/auth/webauthn/register/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(attestationResponse),
            });

            const verification = await resVerify.json();

            if (verification.verified) {
                setBiometricEnabled(true);
                // Actualizar la sesión localmente
                await updateSession({ biometricEnabled: true });
                alert("¡Biometría registrada con éxito!");
            } else {
                throw new Error(verification.error || "La verificación falló");
            }
        } catch (err: any) {
            console.error("Biometric Registration Error:", err);
            setError(err.message || "Error al registrar biometría");
        } finally {
            setRegistering(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-13rem)] p-6 max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 text-center"
            >
                <h1 className="text-3xl font-bold text-white mb-2">Seguridad y Biometría</h1>
                <p className="text-zinc-500">Gestiona el acceso ultra-seguro a tu cuenta Codrava.</p>
            </motion.div>

            <div className="space-y-6">
                {/* Biometry Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="bg-black/40 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 relative overflow-hidden shadow-2xl shadow-[#D4AF37]/5"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <Fingerprint className="w-32 h-32 text-[#D4AF37]" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-[#D4AF37]/10 rounded-2xl">
                                <Fingerprint className="w-8 h-8 text-[#D4AF37]" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Acceso Facial / Huella</h2>
                                <p className="text-sm text-zinc-500">Configura tu dispositivo para un inicio de sesión instantáneo.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-5 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
                                <div>
                                    <p className="text-sm font-bold text-white">Estado del Sensor</p>
                                    <p className="text-xs text-green-500 font-medium">Listo para sincronizar</p>
                                </div>
                                <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            </div>

                            <div className="flex items-center justify-between p-5 bg-zinc-900/50 rounded-2xl border border-zinc-800/50">
                                <div>
                                    <p className="text-sm font-bold text-white">Autenticación Biométrica</p>
                                    <p className="text-xs text-zinc-500">Activa o desactiva el uso de biometría en este perfil.</p>
                                </div>
                                <button
                                    onClick={() => setBiometricEnabled(!biometricEnabled)}
                                    className={`w-12 h-6 rounded-full transition-all duration-300 relative ${biometricEnabled ? "bg-[#D4AF37]" : "bg-zinc-700"
                                        }`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-all duration-300 ${biometricEnabled ? "left-7" : "left-1"
                                        }`} />
                                </button>
                            </div>

                            {!biometricEnabled ? (
                                <button
                                    onClick={handleRegisterBiometry}
                                    disabled={registering}
                                    className="w-full bg-[#D4AF37] hover:bg-[#B5952F] text-black font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 group shadow-lg shadow-[#D4AF37]/10"
                                >
                                    {registering ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>Sincronizando con dispositivo...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Fingerprint className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            <span>Registrar Biometría Ahora</span>
                                        </>
                                    )}
                                </button>
                            ) : (
                                <div className="flex items-center gap-4 p-5 bg-green-500/10 border border-green-500/20 rounded-2xl">
                                    <div className="p-2 bg-green-500/20 rounded-lg">
                                        <Check className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-bold text-green-400 block">Huella Registrada</span>
                                        <span className="text-xs text-green-500/70">Tu dispositivo está vinculado correctamente.</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Information Alert */}
                <div className="flex gap-4 p-5 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                    <AlertCircle className="w-6 h-6 text-blue-400 shrink-0" />
                    <p className="text-sm text-blue-300/80 leading-relaxed font-medium">
                        Tu información biométrica está protegida por el protocolo **WebAuthn**. Codrava nunca almacena tus datos faciales o dactilares; solo tu dispositivo puede validar tu identidad.
                    </p>
                </div>
            </div>
        </div>
    );
}
