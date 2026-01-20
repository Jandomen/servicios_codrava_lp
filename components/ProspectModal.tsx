"use client";

import { X, MapPin, Globe, Phone, Mail, Star, Sparkles, Smartphone, Copy, CheckCircle, AlertTriangle, XCircle, Layout, MessageSquare } from "lucide-react";
import { type Prospect } from "./ProspectCard";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface ProspectModalProps {
    prospect: Prospect | null;
    onClose: () => void;
}

export function ProspectModal({ prospect, onClose }: ProspectModalProps) {
    const [copiedPitch, setCopiedPitch] = useState<string | null>(null);

    if (!prospect) return null;

    const handleCopy = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopiedPitch(type);
        setTimeout(() => setCopiedPitch(null), 2000);
    };

    // Derived Data for "Recommended Services" based on gaps
    const recommendations = [];
    if (!prospect.hasWebsite) {
        recommendations.push({
            title: "Desarrollo Web/Landing Page",
            desc: "Diseño y desarrollo de sitios web profesionales con enfoque en conversión.",
            benefit: "Incremento del 40-60% en captación de leads"
        });
    }
    if (!prospect.hasApi) {
        recommendations.push({
            title: "Automatización WhatsApp API",
            desc: "Respuestas automáticas 24/7 y gestión de clientes.",
            benefit: "Reducción del 80% en tiempo de respuesta"
        });
    }
    if (prospect.rating < 4.0 || prospect.reviewCount < 10) {
        recommendations.push({
            title: "Gestión de Reputación (SEO Local)",
            desc: "Estrategia para aumentar reseñas positivas y ranking en Maps.",
            benefit: "Mejora del 300% en visibilidad local"
        });
    }

    // Default recommendation if list is empty
    if (recommendations.length === 0) {
        recommendations.push({
            title: "Consultoría de Expansión Digital",
            desc: "Análisis profundo para escalar la presencia actual.",
            benefit: "Estrategia personalizada de crecimiento"
        });
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-0 md:px-4 md:py-6">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-5xl overflow-hidden bg-[#0B0B0E] md:rounded-2xl border-0 md:border md:border-[#D4AF37]/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col"
                >
                    {/* Header */}
                    <div className="relative z-10 flex shrink-0 items-start justify-between border-b border-zinc-800 bg-[#0B0B0E]/95 p-6 backdrop-blur-xl">
                        <div className="flex items-start gap-4 pr-8">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-800 to-black border border-zinc-700 shadow-inner">
                                <span className="text-3xl font-bold text-[#D4AF37]">{prospect.name.charAt(0)}</span>
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">{prospect.name}</h2>
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                    <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-white border border-zinc-700">{prospect.category}</span>
                                    <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${prospect.priority === 'URGENTE' ? 'border-red-500/50 text-red-500 bg-red-500/10' : 'border-zinc-500/50 text-zinc-400 bg-zinc-500/10'}`}>
                                        {prospect.priority === 'URGENTE' ? 'Requiere acción inmediata' : prospect.priority}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="rounded-full bg-zinc-900 p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors border border-zinc-800"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8 custom-scrollbar">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

                            {/* LEFT COLUMN: Data & Analysis */}
                            <div className="space-y-8">
                                {/* Contact Info */}
                                <div className="space-y-4">
                                    <h3 className="section-title text-[#D4AF37]">Información Básica</h3>
                                    <div className="grid gap-3">
                                        <div className="info-row">
                                            <div className="icon-box"><MapPin className="h-4 w-4" /></div>
                                            <div>
                                                <span className="label">Ubicación</span>
                                                <p className="value">{prospect.address}</p>
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <div className="icon-box"><Phone className="h-4 w-4" /></div>
                                            <div>
                                                <span className="label">Teléfono</span>
                                                <p className="value">{prospect.phone || "No registrado"}</p>
                                            </div>
                                        </div>
                                        <div className="info-row">
                                            <div className="icon-box"><Mail className="h-4 w-4" /></div>
                                            <div>
                                                <span className="label">Correo Electrónico</span>
                                                <p className="value">{prospect.email || "No registrado"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Digital Presence Analysis */}
                                <div className="space-y-4">
                                    <h3 className="section-title text-cyan-400">Análisis de Presencia Digital</h3>
                                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 space-y-4">

                                        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${prospect.hasWebsite ? 'bg-cyan-900/20 text-cyan-400' : 'bg-red-900/20 text-red-500'}`}>
                                                    <Globe className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">Sitio Web</p>
                                                    <p className="text-xs text-zinc-400">{prospect.hasWebsite ? "Detectado" : "Sin sitio web detectado"}</p>
                                                </div>
                                            </div>
                                            {prospect.hasWebsite ? <CheckCircle className="h-4 w-4 text-cyan-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                                        </div>

                                        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg bg-zinc-800 text-zinc-400`}>
                                                    <MessageSquare className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">WhatsApp Business API</p>
                                                    <p className="text-xs text-zinc-400">{prospect.hasApi ? "Implementado" : "Sin automatización"}</p>
                                                </div>
                                            </div>
                                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                                        </div>

                                        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-3 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${prospect.rating >= 4.0 ? 'bg-green-900/20 text-green-400' : 'bg-amber-900/20 text-amber-500'}`}>
                                                    <Star className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">Google Business</p>
                                                    <p className="text-xs text-zinc-400">{prospect.rating} estrellas ({prospect.reviewCount} reseñas)</p>
                                                </div>
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${prospect.rating >= 4.0 ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                {prospect.rating >= 4.0 ? "BUENO" : "MEJORABLE"}
                                            </span>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Strategy & Actions */}
                            <div className="space-y-8">

                                {/* Recommended Services */}
                                <div className="space-y-4">
                                    <h3 className="section-title text-[#D4AF37]">Servicios CODRAVA Recomendados</h3>
                                    <div className="space-y-3">
                                        {recommendations.map((rec, i) => (
                                            <div key={i} className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition-all hover:border-[#D4AF37]/50 hover:bg-zinc-900/60">
                                                <div className="absolute left-0 top-0 h-full w-[2px] bg-[#D4AF37] opacity-50 group-hover:opacity-100" />
                                                <h4 className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors">{rec.title}</h4>
                                                <p className="mt-1 text-xs text-zinc-400">{rec.desc}</p>
                                                <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-green-500 flex items-center gap-1">
                                                    <Sparkles className="h-3 w-3" />
                                                    {rec.benefit}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Pitches */}
                                <div className="space-y-6">
                                    <div className="pitch-card">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Elevator Pitch - Guion Estratégico</h3>
                                            <button
                                                onClick={() => handleCopy(prospect.pitch, 'elevator')}
                                                className="text-[#D4AF37] hover:text-white transition-colors"
                                            >
                                                {copiedPitch === 'elevator' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <div className="bg-black/50 p-4 rounded-lg border border-zinc-800 text-sm italic text-zinc-300 leading-relaxed">
                                            "{prospect.pitch}"
                                        </div>
                                    </div>

                                    <div className="pitch-card">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Pitch de Valor Personalizado</h3>
                                            <button
                                                onClick={() => handleCopy(`Hola, veo que ${prospect.name} tiene un gran potencial pero le falta presencia online...`, 'value')}
                                                className="text-[#D4AF37] hover:text-white transition-colors"
                                            >
                                                {copiedPitch === 'value' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <div className="bg-black/50 p-4 rounded-lg border border-zinc-800 text-sm italic text-zinc-300 leading-relaxed">
                                            "{`Hola, veo que ${prospect.name} tiene un gran potencial pero le falta presencia online...`}"
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Footer / Actions Bar (Sticky on Mobile) */}
                    <div className="shrink-0 border-t border-zinc-800 bg-[#0B0B0E] p-4 md:p-6 pb-8 md:pb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto md:max-w-none md:mx-0">
                            {prospect.whatsapp && (
                                <a
                                    href={`https://wa.me/${prospect.whatsapp}?text=${encodeURIComponent(`Hola ${prospect.name}, los encontré en Google Maps...`)}`}
                                    target="_blank"
                                    className="flex items-center justify-center gap-2 rounded-lg bg-[#25D366] py-3 text-sm font-bold text-black hover:bg-[#128C7E] transition-all shadow-[0_0_20px_rgba(37,211,102,0.3)]"
                                >
                                    <Smartphone className="h-5 w-5" />
                                    WhatsApp
                                </a>
                            )}
                            <a
                                href={`tel:${prospect.phone}`}
                                className="flex items-center justify-center gap-2 rounded-lg bg-zinc-800 border-zinc-700 border py-3 text-sm font-bold text-white hover:bg-zinc-700 transition-all hover:border-[#D4AF37]/50"
                            >
                                <Phone className="h-5 w-5" />
                                Llamar Ahora
                            </a>
                            {prospect.email && (
                                <a
                                    href={`mailto:${prospect.email}`}
                                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-600/20 border border-blue-500/50 py-3 text-sm font-bold text-blue-400 hover:bg-blue-600/40 transition-all"
                                >
                                    <Mail className="h-5 w-5" />
                                    Enviar Email
                                </a>
                            )}
                        </div>
                    </div>

                </motion.div>
            </div>
            <style jsx>{`
                .section-title {
                    @apply text-xs font-bold uppercase tracking-widest mb-2 border-b border-zinc-800 pb-2 block;
                }
                .info-row {
                    @apply flex items-start gap-3 p-2 rounded-lg transition-colors hover:bg-white/5;
                }
                .icon-box {
                    @apply flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 shrink-0;
                }
                .label {
                    @apply block text-[10px] uppercase text-zinc-500 font-bold tracking-wider;
                }
                .value {
                    @apply text-sm text-zinc-200 font-medium break-all;
                }
            `}</style>
        </AnimatePresence>
    );
}
