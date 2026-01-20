"use client";

import {
    MoreVertical,
    Star,
    MapPin,
    Globe,
    Smartphone,
    Phone,
    AlertCircle,
    ShieldAlert,
    Mail,
} from "lucide-react";
import { motion } from "framer-motion";

export interface Prospect {
    _id?: string;
    id?: string;
    name: string;
    category: string;
    rating: number;
    reviewCount: number;
    address: string;
    priority: "URGENTE" | "MEDIO" | "BAJO";
    gaps: string[];
    pitch: string;
    hasWebsite: boolean;
    hasApi: boolean;
    analysisStatus: "Deficiente" | "Completo" | "Parcial";
    phone: string;
    email?: string;
    website?: string;
    whatsapp?: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}

export function ProspectCard({
    prospect,
    index = 0,
    onViewDetails
}: {
    prospect: Prospect;
    index?: number;
    onViewDetails?: (prospect: Prospect) => void;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group relative flex flex-col rounded-xl border border-zinc-800 bg-[#0B0B0E]/80 backdrop-blur-sm p-5 shadow-lg transition-all hover:border-[#D4AF37] hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] cursor-pointer overflow-hidden"
            onClick={() => onViewDetails?.(prospect)}
        >
            {/* Cyberpunk/Futuristic Decor */}
            <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-[#D4AF37]/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute bottom-0 left-0 h-16 w-16 bg-gradient-to-tr from-[#D4AF37]/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="absolute top-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />


            <div className="mb-4 flex items-start justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <PriorityBadge priority={prospect.priority} />
                        <span className="text-xs font-medium text-zinc-400">
                            {prospect.category}
                        </span>
                    </div>
                    <h3 className="line-clamp-1 text-lg font-bold text-white group-hover:text-[#D4AF37] transition-colors tracking-tight">
                        {prospect.name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-[#D4AF37]">
                        <Star className="h-3 w-3 fill-current" />
                        <span className="font-medium">{prospect.rating}</span>
                        <span className="text-zinc-600">({prospect.reviewCount})</span>
                    </div>
                </div>
                <button className="text-zinc-600 hover:text-[#D4AF37] transition-colors">
                    <MoreVertical className="h-5 w-5" />
                </button>
            </div>


            <div className="mb-4 space-y-3">
                <div className="flex items-start gap-2 text-xs text-zinc-400">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D4AF37]" />
                    <span className="line-clamp-2">{prospect.address}</span>
                </div>

                <div className="space-y-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">
                        Brechas Detectadas
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                        {prospect.gaps.map((gap) => (
                            <span
                                key={gap}
                                className="inline-flex rounded-md bg-red-500/5 px-2 py-0.5 text-[10px] font-medium text-red-500 border border-red-500/20 shadow-[0_0_5px_rgba(239,68,68,0.1)]"
                            >
                                {gap}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="rounded-lg bg-zinc-900/50 p-3 border border-zinc-800/50 group-hover:border-[#D4AF37]/20 transition-colors">
                    <div className="mb-1 flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#D4AF37] drop-shadow-[0_0_5px_rgba(212,175,55,0.5)]">AI Pitch</span>
                    </div>
                    <p className="line-clamp-3 text-xs leading-relaxed text-zinc-400">
                        {prospect.pitch}
                    </p>
                </div>
            </div>


            <div className="mb-5 flex flex-wrap gap-2">
                {!prospect.hasWebsite && (
                    <StatusChip icon={Globe} label="Sin Web" color="text-zinc-400" />
                )}
                {!prospect.hasApi && (
                    <StatusChip icon={AlertCircle} label="Sin API" color="text-zinc-400" />
                )}
                <StatusChip
                    icon={ShieldAlert}
                    label={prospect.analysisStatus}
                    color="text-red-400"
                />
            </div>

            {/* Actions */}
            <div className="mt-auto grid grid-cols-[1fr_repeat(4,auto)] gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={() => onViewDetails?.(prospect)}
                    className="rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B5952F] px-3 py-2 text-xs font-bold text-black shadow-[0_0_15px_rgba(212,175,55,0.4)] hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-1"
                >
                    <span className="truncate">VER DETALLES</span>
                </button>

                {/* Website Button */}
                {prospect.website && (
                    <a
                        href={prospect.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/btn flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-950/30 text-cyan-400 transition-all hover:border-cyan-400 hover:bg-cyan-500/20 hover:shadow-[0_0_15px_rgba(34,211,238,0.4)]"
                        title="Visitar Sitio Web"
                    >
                        <Globe className="h-4 w-4 transition-transform group-hover/btn:rotate-12" />
                    </a>
                )}

                {/* WhatsApp Button */}
                {prospect.whatsapp && (
                    <a
                        href={`https://wa.me/${prospect.whatsapp}?text=${encodeURIComponent(`Hola ${prospect.name}, los encontré en Google Maps y noté que podríamos mejorar su presencia digital.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/btn flex h-9 w-9 items-center justify-center rounded-lg border border-green-500/30 bg-green-950/30 text-green-400 transition-all hover:border-green-400 hover:bg-green-500/20 hover:shadow-[0_0_15px_rgba(74,222,128,0.4)]"
                        title="WhatsApp"
                    >
                        <Smartphone className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                    </a>
                )}

                {/* Call Button */}
                <a
                    href={`tel:${prospect.phone}`}
                    className="group/btn flex h-9 w-9 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-950/30 text-amber-400 transition-all hover:border-amber-400 hover:bg-amber-500/20 hover:shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                    title="Llamar"
                >
                    <Phone className="h-4 w-4 transition-transform group-hover/btn:rotate-12" />
                </a>

                {/* Gmail Button */}
                {prospect.email && (
                    <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${prospect.email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/btn flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/30 bg-red-950/30 text-red-500 transition-all hover:border-red-500 hover:bg-red-500/20 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                        title="Redactar en Gmail"
                    >
                        <Mail className="h-4 w-4 transition-transform group-hover/btn:scale-110" />
                    </a>
                )}
            </div>
        </motion.div>
    );
}

function PriorityBadge({ priority }: { priority: string }) {
    const styles = {
        URGENTE: "bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)]",
        MEDIO: "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_8px_rgba(59,130,246,0.2)]",
        BAJO: "bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_8px_rgba(34,197,94,0.2)]",
    };

    return (
        <span
            className={`rounded border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles[priority as keyof typeof styles] || styles.BAJO
                }`}
        >
            {priority}
        </span>
    );
}

function StatusChip({
    icon: Icon,
    label,
    color,
}: {
    icon: any;
    label: string;
    color: string;
}) {
    return (
        <div className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1">
            <Icon className={`h-3 w-3 ${color}`} />
            <span className={`text-[10px] font-medium ${color}`}>{label}</span>
        </div>
    );
}
