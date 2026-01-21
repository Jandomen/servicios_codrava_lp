import { RefreshCw } from "lucide-react";

export function StatsBar() {
    return (
        <div className="fixed top-16 md:top-24 left-0 right-0 z-30 border-b border-[#D4AF37]/20 bg-[#0B0B0E]/95 backdrop-blur-xl transition-all">
            <div className="flex w-full items-center justify-between px-2 py-2 md:px-6 md:py-4">
                <div className="grid w-full grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
                    <StatCard label="Total Prospectos" value="124" />
                    <StatCard label="Prioridad Urgente" value="12" color="text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    <StatCard label="Prioridad Alta" value="45" color="text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
                    <StatCard label="Sin Sitio Web" value="68" />
                </div>
            </div>
        </div>
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
        <div className="flex flex-col items-center border-l border-white/5 first:border-0 pl-2 md:pl-4 md:items-start text-center md:text-left">
            <span className="text-[8px] md:text-[9px] uppercase tracking-widest text-zinc-500 mb-0.5 md:mb-1">
                {label}
            </span>
            <span className={`text-xl md:text-2xl font-bold ${color}`}>{value}</span>
        </div>
    );
}
