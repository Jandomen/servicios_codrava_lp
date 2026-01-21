"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    User,
    Shield,
    Fingerprint,
    Bell,
    CreditCard,
    ChevronRight,
    Check,
    AlertCircle,
    Loader2,
    ArrowLeft,
    Trash2,
    Eye,
    ShieldAlert
} from "lucide-react";
import { startRegistration } from "@simplewebauthn/browser";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function SettingsPage() {
    const { data: session, update: updateSession } = useSession();
    const [biometricEnabled, setBiometricEnabled] = useState(session?.user?.biometricEnabled || false);
    const [registering, setRegistering] = useState(false);
    const [error, setError] = useState("");
    const [logs, setLogs] = useState<any[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await fetch("/api/security/logs");
            const data = await res.json();
            if (Array.isArray(data)) {
                setLogs(data);
            }
        } catch (err) {
            console.error("Error fetching logs:", err);
        } finally {
            setLoadingLogs(false);
        }
    };

    const handleMarkAsRead = async (logId: string) => {
        try {
            await fetch("/api/security/logs", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ logId }),
            });
            setLogs(logs.map(l => l._id === logId ? { ...l, read: true } : l));
        } catch (err) {
            console.error(err);
        }
    };

    const handleClearLogs = async () => {
        if (!confirm("¿Seguro que quieres borrar todo el historial de alertas?")) return;
        try {
            await fetch("/api/security/logs", { method: "DELETE" });
            setLogs([]);
        } catch (err) {
            console.error(err);
        }
    };

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
                className="mb-8 flex items-center gap-4"
            >
                <Link
                    href="/dashboard"
                    className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition-all group"
                >
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </Link>
                <div className="text-left">
                    <h1 className="text-3xl font-bold text-white mb-1">Seguridad y Biometría</h1>
                    <p className="text-zinc-500 text-sm">Gestiona el acceso ultra-seguro a tu cuenta Codrava.</p>
                </div>
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
                                    <p className="text-xs text-zinc-500">
                                        {session?.user?.exclusiveBiometric
                                            ? "Modo exclusivo activado (Contraseña desactivada)"
                                            : "Activa o desactiva el uso de biometría en este perfil."}
                                    </p>
                                </div>
                                <button
                                    disabled={session?.user?.exclusiveBiometric}
                                    onClick={() => setBiometricEnabled(!biometricEnabled)}
                                    className={`w-12 h-6 rounded-full transition-all duration-300 relative ${biometricEnabled ? "bg-[#D4AF37]" : "bg-zinc-700"
                                        } ${session?.user?.exclusiveBiometric ? "opacity-50 cursor-not-allowed" : ""}`}
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
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 p-5 bg-green-500/10 border border-green-500/20 rounded-2xl">
                                        <div className="p-2 bg-green-500/20 rounded-lg">
                                            <Check className="w-5 h-5 text-green-500" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-bold text-green-400 block">Huella Registrada</span>
                                            <span className="text-xs text-green-500/70">Tu dispositivo está vinculado correctamente.</span>
                                        </div>
                                    </div>

                                    {session?.user?.exclusiveBiometric && (
                                        <div className="flex items-center gap-3 p-4 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl">
                                            <Shield className="w-5 h-5 text-[#D4AF37] shrink-0" />
                                            <p className="text-[11px] text-[#D4AF37]/80 leading-tight">
                                                **MODO OWNER ACTIVO**: Tu acceso ahora es exclusivo por huella. Nadie con tu contraseña podrá ingresar.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Link a Gestión de Usuarios (Admin only) */}
                            {session?.user?.role === "admin" && (
                                <Link
                                    href="/dashboard/admin/users"
                                    className="flex items-center justify-between p-5 bg-zinc-900/30 hover:bg-zinc-800/50 rounded-2xl border border-zinc-800 transition-all group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-blue-500/10 rounded-xl">
                                            <User className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white">Gestionar Usuarios</p>
                                            <p className="text-xs text-zinc-500">Elimina o crea cuentas antes de la entrega.</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Intrusion Alerts Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-black/40 backdrop-blur-xl border border-zinc-800 rounded-2xl p-8 relative overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-500/10 rounded-2xl">
                                <ShieldAlert className="w-8 h-8 text-red-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Centinela de Seguridad</h2>
                                <p className="text-sm text-zinc-500">Intentos de intrusión detectados.</p>
                            </div>
                        </div>
                        {logs.length > 0 && (
                            <button
                                onClick={handleClearLogs}
                                className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                                title="Limpiar historial"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {loadingLogs ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-zinc-600" />
                            </div>
                        ) : logs.length === 0 ? (
                            <div className="text-center py-8 bg-zinc-900/30 rounded-2xl border border-zinc-800/50">
                                <Shield className="w-12 h-12 text-green-500/20 mx-auto mb-3" />
                                <p className="text-sm text-zinc-500">Sin incidentes detectados recientemente.</p>
                                <p className="text-[10px] text-zinc-600 mt-1 uppercase tracking-widest">Sistema Limpio</p>
                            </div>
                        ) : (
                            <AnimatePresence>
                                {logs.map((log) => (
                                    <motion.div
                                        key={log._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className={`p-4 rounded-xl border flex items-center justify-between transition-all ${log.read
                                            ? "bg-zinc-900/20 border-zinc-800/50"
                                            : "bg-red-500/5 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.05)]"
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${log.read ? "bg-zinc-700" : "bg-red-500 animate-pulse"}`} />
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="text-sm font-bold text-white">Intento de Acceso (Pass)</p>
                                                    <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20 uppercase font-black">Bloqueado</span>
                                                </div>
                                                <p className="text-xs text-zinc-400 mb-1">{log.details}</p>
                                                <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono">
                                                    <span>IP: {log.ip}</span>
                                                    <span>•</span>
                                                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {!log.read && (
                                            <button
                                                onClick={() => handleMarkAsRead(log._id)}
                                                className="p-2 bg-zinc-800/50 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                                title="Marcar como visto"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
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
