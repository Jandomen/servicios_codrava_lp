"use client";

import { useState } from "react";
import { Search, CheckSquare, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
    "Abogados",
    "Restaurantes",
    "Ferreterías",
    "Inmobiliarias",
    "Dentistas",
    "Contadores",
    "Gimnasios",
    "Talleres",
    "Hoteles",
    "Salones de Belleza",
];

export function Sidebar({
    selectedCategories = [],
    onCategoryChange = () => { },
    onSearch = () => { },
    onClear = () => { },
    onTriggerGoogleSearch,
    isGoogleMode,
}: {
    selectedCategories?: string[];
    onCategoryChange?: (category: string) => void;
    onSearch?: (query: string) => void;
    onClear?: () => void;
    onTriggerGoogleSearch?: (query: string) => void;
    isGoogleMode?: boolean;
}) {
    const [isOpen, setIsOpen] = useState(true);
    const [localSearch, setLocalSearch] = useState("");

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setLocalSearch(val);
        onSearch(val);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && onTriggerGoogleSearch) {
            onTriggerGoogleSearch(localSearch);
        }
    };

    return (
        <aside
            className={cn(
                "fixed left-0 top-0 z-40 h-screen w-80 border-r border-[#D4AF37]/20 bg-[#0B0B0E] transition-transform shadow-[4px_0_24px_rgba(0,0,0,0.5)]",
                !isOpen && "-translate-x-full"
            )}
        >
            <div className="flex h-full flex-col px-4 py-8">
                <div className="mb-8 px-2 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#D4AF37]" />
                    <h2 className="text-xl font-bold text-white tracking-widest">
                        SCANNER <span className="text-[#D4AF37]">AI</span>
                    </h2>
                </div>

                {/* Zona de Escaneo */}
                <div className="mb-8 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                        {isGoogleMode ? "Buscador en Vivo (Google)" : "Zona de Escaneo"}
                    </label>
                    <div className="relative group">
                        <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 group-focus-within:text-[#D4AF37] transition-colors ${isGoogleMode ? 'text-blue-500' : 'text-zinc-500'}`} />
                        <input
                            type="text"
                            placeholder={isGoogleMode ? "Ej: Restaurantes, Monterrey, o 'Tacos'..." : "Buscar ubicación..."}
                            value={localSearch}
                            onChange={handleSearch}
                            onKeyDown={handleKeyDown}
                            className={`w-full rounded-lg border border-zinc-800 bg-black/40 py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all ${isGoogleMode ? 'focus:border-blue-500 focus:ring-blue-500' : 'focus:border-[#D4AF37] focus:ring-[#D4AF37]'}`}
                        />
                        {isGoogleMode && <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500">⏎ Enter</div>}
                    </div>
                </div>

                <button
                    onClick={() => onTriggerGoogleSearch && onTriggerGoogleSearch(localSearch)}
                    className="mb-8 w-full rounded-lg bg-[#D4AF37] py-2.5 text-sm font-bold text-black hover:bg-[#E5C148] transition-colors shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
                >
                    <Search className="h-4 w-4" />
                    INICIAR ESCANEO
                </button>

                {/* Categorias */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="mb-4 flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                            Filtro de Categorías
                        </label>
                        <div className="flex gap-3">
                            <button
                                onClick={onClear}
                                className="text-[10px] text-zinc-500 hover:text-white transition-colors uppercase tracking-wider"
                            >
                                Limpiar
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 space-y-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#D4AF37]/20 hover:scrollbar-thumb-[#D4AF37]/50">
                        {CATEGORIES.map((cat) => (
                            <label
                                key={cat}
                                className="group flex cursor-pointer items-center gap-3 rounded-lg border border-transparent p-2.5 hover:bg-[#D4AF37]/5 hover:border-[#D4AF37]/20 transition-all"
                            >
                                <div className="relative flex h-4 w-4 items-center justify-center rounded border border-zinc-700 bg-black group-hover:border-[#D4AF37]">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategories.includes(cat)}
                                        onChange={() => onCategoryChange(cat)}
                                        className="peer absolute h-4 w-4 cursor-pointer opacity-0"
                                    />
                                    <CheckSquare className="hidden h-3 w-3 text-[#D4AF37] peer-checked:block drop-shadow-[0_0_5px_rgba(212,175,55,1)]" />
                                </div>
                                <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">{cat}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
}
