"use client";

import { X, MapPin, Globe, Phone, Mail, Star, Sparkles, Smartphone, Copy, CheckCircle, XCircle, MessageSquare, AlertTriangle } from "lucide-react";
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
                    className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl overflow-hidden bg-[#121214] md:rounded-2xl border-0 md:border md:border-zinc-800 shadow-2xl flex flex-col"
                >
                    {/* Header */}
                    <div className="relative z-10 shrink-0 border-b border-zinc-800/50 bg-[#121214] p-5">
                        <div className="flex justify-between items-start mb-2">
                            <div className={`inline-flex items-center gap-2 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wide border ${prospect.priority === 'URGENTE' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                prospect.priority === 'MEDIO' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                    'bg-green-500/10 text-green-500 border-green-500/20'
                                }`}>
                                {prospect.priority}
                            </div>
                            <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <h2 className="text-2xl font-bold text-white leading-tight">{prospect.name}</h2>
                        <p className="text-[#D4AF37] font-medium text-sm mt-0.5">{prospect.category}</p>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 custom-scrollbar space-y-6 bg-[#0B0B0E]">

                        {/* 1. Contact Info Boxes */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800 flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                                    <MapPin className="h-3 w-3" /> UBICACIÓN
                                </div>
                                <p className="text-sm text-zinc-200 font-medium truncate">{prospect.address}</p>
                            </div>
                            <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800 flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                                    <Phone className="h-3 w-3" /> TELÉFONO
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-zinc-200 font-medium">{prospect.phone || "No registrado"}</p>
                                    {prospect.phone && <Copy className="h-3 w-3 text-zinc-600 cursor-pointer hover:text-white" onClick={() => handleCopy(prospect.phone, 'phone')} />}
                                </div>
                            </div>
                            <div className="bg-zinc-900/50 rounded-lg p-3 border border-zinc-800 flex flex-col gap-1 md:col-span-2">
                                <div className="flex items-center gap-2 text-zinc-500 text-[10px] uppercase font-bold tracking-wider">
                                    <Mail className="h-3 w-3" /> CORREO ELECTRÓNICO
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-zinc-200 font-medium">{prospect.email || "Sin correo"}</p>
                                    {prospect.email && <Copy className="h-3 w-3 text-zinc-600 cursor-pointer hover:text-white" onClick={() => handleCopy(prospect.email!, 'email')} />}
                                </div>
                            </div>
                        </div>

                        {/* 2. Digital Presence */}
                        <div>
                            <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                                <span className="text-[#D4AF37]">📊</span> Análisis de Presencia Digital
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className={`flex items-center gap-3 p-3 rounded-lg border ${prospect.hasWebsite ? 'bg-green-900/10 border-green-900/30' : 'bg-red-900/10 border-red-900/30'}`}>
                                    {prospect.hasWebsite ? <CheckCircle className="h-5 w-5 text-green-500 shrink-0" /> : <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                                    <div>
                                        <p className={`text-sm font-bold ${prospect.hasWebsite ? 'text-green-400' : 'text-red-400'}`}>Sitio Web</p>
                                        <p className="text-xs text-zinc-500">{prospect.hasWebsite ? "Detectado correctamente" : "Sin sitio web detectado"}</p>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-3 p-3 rounded-lg border ${prospect.hasApi ? 'bg-green-900/10 border-green-900/30' : 'bg-red-900/10 border-red-900/30'}`}>
                                    {prospect.hasApi ? <CheckCircle className="h-5 w-5 text-green-500 shrink-0" /> : <XCircle className="h-5 w-5 text-red-500 shrink-0" />}
                                    <div>
                                        <p className={`text-sm font-bold ${prospect.hasApi ? 'text-green-400' : 'text-red-400'}`}>WhatsApp Business API</p>
                                        <p className="text-xs text-zinc-500">{prospect.hasApi ? "Automatización activa" : "Sin automatización"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Google Business Quality */}
                        <div>
                            <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                                <Star className="h-4 w-4 text-[#D4AF37]" /> Calidad de Google Business
                            </h3>
                            <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-4 flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <Star className="h-5 w-5 fill-[#D4AF37] text-[#D4AF37]" />
                                    <span className="text-xl font-bold text-white">{prospect.rating || "N/A"}</span>
                                </div>
                                <div className="h-8 w-[1px] bg-zinc-800"></div>
                                <div>
                                    <p className="text-sm text-zinc-300">{prospect.reviewCount} reseñas</p>
                                    <p className={`text-xs font-bold ${prospect.rating >= 4 ? 'text-green-500' : 'text-amber-500'}`}>
                                        {prospect.rating >= 4 ? "Excelente" : "Deficiente"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 4. Recommended Services */}
                        <div>
                            <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-3">
                                <Sparkles className="h-4 w-4 text-[#D4AF37]" /> Servicios CODRAVA Recomendados
                            </h3>
                            <div className="space-y-3">
                                {recommendations.slice(0, 1).map((rec, i) => (
                                    <div key={i} className="group relative overflow-hidden rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/5 p-4 flex items-start gap-3">
                                        <div className="p-2 bg-[#D4AF37]/10 rounded-lg text-[#D4AF37]">
                                            <Globe className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-white">{rec.title}</h4>
                                            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{rec.desc}</p>
                                            <p className="text-[10px] font-bold text-[#D4AF37] mt-2">{rec.benefit}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>


                        {/* 5. Pitches */}
                        <div className="space-y-6">
                            {/* Elevator Pitch */}
                            <div>
                                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <MessageSquare className="h-4 w-4 text-zinc-400" /> Elevator Pitch - Guion Estratégico
                                </h3>
                                <div className="rounded-lg border border-zinc-700 bg-zinc-900/50 p-4 relative group">
                                    <p className="text-sm text-zinc-200 italic leading-relaxed pr-2">"{prospect.pitch}"</p>
                                    <button
                                        onClick={() => handleCopy(prospect.pitch, 'elevator')}
                                        className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-bold hover:bg-[#D4AF37]/20 transition-all"
                                    >
                                        {copiedPitch === 'elevator' ? <CheckCircle className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                                        {copiedPitch === 'elevator' ? "Copiado" : "Copiar Guion"}
                                    </button>
                                </div>
                            </div>

                            {/* Value Pitch */}
                            <div>
                                <h3 className="text-sm font-bold text-white mb-3">Pitch de Valor Personalizado</h3>
                                <div className="rounded-lg bg-zinc-800/50 border-l-4 border-[#D4AF37] p-4">
                                    <p className="text-sm text-zinc-300 italic leading-relaxed">
                                        "{`Hola, veo que ${prospect.name} es un referente en su zona, pero noté que su presencia digital no refleja esa calidad. Un sitio web optimizado podría ayudarles a captar a todos esos clientes que hoy buscan en Google y no los encuentran.`}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer / Actions Bar (Sticky on Mobile) */}
                    <div className="shrink-0 border-t border-zinc-800 bg-[#121214] p-4">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {prospect.whatsapp && (
                                <a
                                    href={`https://wa.me/${prospect.whatsapp}?text=${encodeURIComponent(`Hola ${prospect.name}, los encontré en Google Maps...`)}`}
                                    target="_blank"
                                    className="flex items-center justify-center gap-2 rounded-md bg-[#25D366] text-black text-sm font-bold py-2.5 hover:brightness-110 transition-all lg:col-span-1 col-span-2"
                                >
                                    <Smartphone className="h-4 w-4" />
                                    WhatsApp
                                </a>
                            )}
                            <a
                                href={`tel:${prospect.phone}`}
                                className="flex items-center justify-center gap-2 rounded-md bg-blue-600 text-white text-sm font-bold py-2.5 hover:bg-blue-500 transition-all"
                            >
                                <Phone className="h-4 w-4" />
                                Llamar Ahora
                            </a>
                            {prospect.email && (
                                <a
                                    href={`mailto:${prospect.email}`}
                                    className="flex items-center justify-center gap-2 rounded-md bg-[#E58E18] text-black text-sm font-bold py-2.5 hover:bg-[#F6A32B] transition-all"
                                >
                                    <Mail className="h-4 w-4" />
                                    Enviar Email
                                </a>
                            )}
                            {prospect.website && (
                                <a
                                    href={prospect.website}
                                    target="_blank"
                                    className="flex items-center justify-center gap-2 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm font-bold py-2.5 hover:text-white transition-all"
                                >
                                    <Globe className="h-4 w-4" />
                                    Visitar Web
                                </a>
                            )}
                        </div>
                    </div>

                </motion.div>
            </div>
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #333;
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #555;
                }
            `}</style>
        </AnimatePresence>
    );
}
