"use client";

import { X, MapPin, Globe, Phone, Mail, Star, Sparkles, Smartphone, Copy } from "lucide-react";
import { type Prospect } from "./ProspectCard";
import { motion, AnimatePresence } from "framer-motion";

interface ProspectModalProps {
    prospect: Prospect | null;
    onClose: () => void;
}

export function ProspectModal({ prospect, onClose }: ProspectModalProps) {
    if (!prospect) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-[#D4AF37]/30 bg-[#0B0B0E] shadow-[0_0_40px_rgba(212,175,55,0.15)]"
                >
                    {/* Header */}
                    <div className="relative border-b border-zinc-800 p-6">
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="flex items-start gap-4 pr-10">
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-black border border-zinc-700 shadow-inner">
                                <span className="text-2xl font-bold text-[#D4AF37]">{prospect.name.charAt(0)}</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{prospect.name}</h2>
                                <div className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
                                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-white border border-zinc-700">{prospect.category}</span>
                                    <span className="flex items-center gap-1 text-[#D4AF37]">
                                        <Star className="h-3 w-3 fill-current" />
                                        {prospect.rating} ({prospect.reviewCount} reseñas)
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left Column: Contact & Info */}
                        <div className="space-y-6">

                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Contacto</h3>
                                <div className="space-y-2">
                                    <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                                        <MapPin className="h-5 w-5 text-zinc-500 shrink-0" />
                                        <span className="text-sm text-zinc-300">{prospect.address}</span>
                                    </div>
                                    <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                                        <Phone className="h-5 w-5 text-zinc-500" />
                                        <span className="text-sm text-zinc-300">{prospect.phone || "No disponible"}</span>
                                    </div>
                                    {prospect.email && (
                                        <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                                            <Mail className="h-5 w-5 text-zinc-500" />
                                            <span className="text-sm text-zinc-300">{prospect.email}</span>
                                        </div>
                                    )}
                                    {prospect.website && (
                                        <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
                                            <Globe className="h-5 w-5 text-zinc-500" />
                                            <a href={prospect.website} target="_blank" className="text-sm text-blue-400 hover:underline truncate">
                                                {prospect.website}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-red-500">Brechas Digitales</h3>
                                <div className="flex flex-wrap gap-2">
                                    {prospect.gaps.map(gap => (
                                        <span key={gap} className="rounded-md border border-red-500/20 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
                                            {gap}
                                        </span>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Right Column: AI Analysis */}
                        <div className="space-y-6">
                            <div className="rounded-xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#D4AF37]/10 to-transparent p-5">
                                <div className="mb-3 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-[#D4AF37]" />
                                    <h3 className="text-sm font-bold text-[#D4AF37]">Codrava IA Insight</h3>
                                </div>
                                <p className="text-sm leading-relaxed text-zinc-300">
                                    {prospect.pitch}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                <a
                                    href={`tel:${prospect.phone}`}
                                    className="flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 py-3 text-sm font-bold text-white hover:bg-zinc-700 transition-colors"
                                >
                                    <Phone className="h-4 w-4" />
                                    Llamar
                                </a>
                                {prospect.whatsapp && (
                                    <a
                                        href={`https://wa.me/${prospect.whatsapp}?text=${encodeURIComponent(`Hola ${prospect.name}, los encontré en Google Maps...`)}`}
                                        target="_blank"
                                        className="flex items-center justify-center gap-2 rounded-lg border border-green-900 bg-green-900/20 py-3 text-sm font-bold text-green-500 hover:bg-green-900/40 transition-colors"
                                    >
                                        <Smartphone className="h-4 w-4" />
                                        WhatsApp API
                                    </a>
                                )}
                                {prospect.email && (
                                    <a
                                        href={`mailto:${prospect.email}`}
                                        className="col-span-2 flex items-center justify-center gap-2 rounded-lg border border-blue-900 bg-blue-900/20 py-3 text-sm font-bold text-blue-500 hover:bg-blue-900/40 transition-colors"
                                    >
                                        <Mail className="h-4 w-4" />
                                        Enviar Correo
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer - Raw Data Toggle (Optional) */}
                    <div className="bg-black/50 p-4 border-t border-zinc-900 flex justify-between items-center text-xs text-zinc-600">
                        <span>ID: {prospect.id || prospect._id || "N/A"}</span>
                        <span className="uppercase tracking-wider">Geolocalizado: {prospect.coordinates ? "SI" : "NO"}</span>
                    </div>

                </motion.div>
            </div>
        </AnimatePresence>
    );
}
