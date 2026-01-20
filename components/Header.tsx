
import { RefreshCw } from "lucide-react";

export function Header() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex h-20 w-full items-center justify-between border-b border-[#D4AF37]/20 bg-[#0B0B0E]/95 px-6 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
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
                <button className="group flex items-center gap-2 rounded-lg border border-[#D4AF37]/30 bg-black/50 px-4 py-2 text-sm font-bold text-[#D4AF37] transition-all hover:bg-[#D4AF37] hover:text-black hover:shadow-gold">
                    <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="max-sm:hidden">Actualizar Sistema</span>
                </button>


            </div>
        </header>
    );
}
