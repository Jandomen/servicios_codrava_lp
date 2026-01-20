/* eslint-disable @next/next/no-img-element */
import { RefreshCw } from "lucide-react";

export function Header() {
    return (
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-[#D4AF37]/20 bg-[#0B0B0E]/80 px-6 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[#D4AF37]/30 shadow-gold p-1 bg-black">
                    <img src="/logo.png" alt="Codrava Logo" className="h-full w-full object-contain" />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-xl font-bold text-white tracking-widest drop-shadow-md">
                        CODRAVA <span className="text-[#D4AF37]">LP</span>
                    </h1>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-[0.2em]">
                        Ecosistema de Prospección
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="flex gap-6 max-md:hidden">
                    <StatCard label="Total Prospectos" value="124" />
                    <StatCard label="Prioridad Urgente" value="12" color="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    <StatCard label="Prioridad Alta" value="45" color="text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
                    <StatCard label="Sin Sitio Web" value="68" />
                </div>

                <button className="group flex items-center gap-2 rounded-lg border border-[#D4AF37]/30 bg-black/50 px-4 py-2 text-sm font-bold text-[#D4AF37] transition-all hover:bg-[#D4AF37] hover:text-black hover:shadow-gold">
                    <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="max-sm:hidden">Actualizar Sistema</span>
                </button>
            </div>
        </header>
    );
}

function StatCard({
    label,
    value,
    color = "text-white",
}: {
    label: string;
    value: string;
    color?: string;
}) {
    return (
        <div className="flex flex-col items-center px-4 md:items-start border-l border-white/5 pl-6 first:border-0">
            <span className="text-[9px] uppercase tracking-widest text-zinc-500 mb-1">
                {label}
            </span>
            <span className={`text-2xl font-bold ${color}`}>{value}</span>
        </div>
    );
}
