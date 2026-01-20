"use client";

import { useState } from "react";
import { Search, CheckSquare, Sparkles, X, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Organized Categories Structure
export const CATEGORY_GROUPS = {
    "Salud & Bienestar": [
        "Médicos", "Clínicas", "Dentistas", "Psicólogos", "Nutriólogos", "Veterinarios", "Farmacias", "Laboratorios"
    ],
    "Gastronomía": [
        "Restaurantes", "Cafeterías", "Bares", "Panaderías", "Pastelerías", "Catering", "Comida Rápida"
    ],
    "Legal & Financiero": [
        "Abogados", "Contadores", "Notarías", "Seguros", "Consultorías", "Bancos"
    ],
    "Industria & Manufactura": [
        "Fábricas", "Maquiladoras", "Parques Industriales", "Bodegas", "Almacenes", "Textil", "Acereras", "Químicas"
    ],
    "Logística & Transporte": [
        "Transportistas", "Mudanzas", "Mensajería", "Paquetería", "Agencias Aduanales", "Renta de Camiones", "Fletes"
    ],
    "Hogar & Construcción": [
        "Ferreterías", "Arquitectos", "Mueblerías", "Plomeros", "Electricistas", "Decoración", "Jardinería", "Contratistas"
    ],
    "Entretenimiento & Ocio": [
        "Cines", "Teatros", "Casinos", "Museos", "Boliches", "Parques de Diversiones", "Salones de Eventos"
    ],
    "Educación": [
        "Escuelas", "Colegios", "Universidades", "Cursos de Idiomas", "Guarderías", "Academias de Música"
    ],
    "Automotriz": [
        "Talleres Mecánicos", "Refaccionarias", "Lavado de Autos", "Agencias de Autos", "Llanteras"
    ],
    "Moda & Retail": [
        "Boutiques", "Zapaterías", "Joyerías", "Centros Comerciales", "Tiendas Departamentales", "Ropa Deportiva"
    ],
    "Belleza": [
        "Salones de Belleza", "Barberías", "Spas", "Gimnasios", "Yoga", "Maquillaje"
    ],
    "Mascotas": [
        "Tiendas de Mascotas", "Estéticas Caninas", "Escuelas Caninas", "Hoteles para Perros"
    ],
    "Tecnología & Servicios": [
        "Marketing", "Desarrollo Web", "Electrónica", "Reparación Celulares", "Imprentas", "Soporte Técnico"
    ],
    "Servicios Públicos & Gobierno": [
        "Oficinas de Gobierno", "Correos", "Asociaciones Civiles", "Comisarías", "Bomberos"
    ],
    "Inmobiliaria & Turismo": [
        "Inmobiliarias", "Hoteles", "Agencias de Viajes", "Airbnb", "Hostales"
    ]
};

// Flattened list for backward compatibility if needed, or helper
export const ALL_CATEGORIES = Object.values(CATEGORY_GROUPS).flat().sort();
// Export CATEGORIES as ALL_CATEGORIES for external use (page.tsx)
export const CATEGORIES = ALL_CATEGORIES;

export function Sidebar({
    selectedCategories = [],
    onCategoryChange = () => { },
    onSearch = () => { },
    onClear = () => { },
    onTriggerGoogleSearch,
    isGoogleMode,
    isOpen = false,
    onClose = () => { },
    onSelectAll,
}: {
    selectedCategories?: string[];
    onCategoryChange?: (category: string) => void;
    onSearch?: (query: string) => void;
    onClear?: () => void;
    onTriggerGoogleSearch?: (query: string) => void;
    isGoogleMode?: boolean;
    isOpen?: boolean;
    onClose?: () => void;
    onSelectAll?: () => void;
}) {
    const [localSearch, localSetSearch] = useState("");
    // By default, maybe keep first group open or all closed? Let's keep all closed for cleaner UI or first open.
    // Let's keep all collapsed initially for that "clean" look.
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev =>
            prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
        );
    };

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        localSetSearch(val);
        onSearch(val);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && onTriggerGoogleSearch) {
            onTriggerGoogleSearch(localSearch);
            onClose?.();
        }
    };

    const handleCategoryClick = (cat: string) => {
        // 1. Toggle Selection
        onCategoryChange(cat);

        // 2. Auto-Search in Google Mode (if selecting, not deselecting)
        const isSelecting = !selectedCategories.includes(cat);
        if (isGoogleMode && onTriggerGoogleSearch && isSelecting) {
            onTriggerGoogleSearch(cat);
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={cn(
                    "fixed left-0 top-0 h-full z-50 w-80 border-r border-[#D4AF37]/20 bg-[#0B0B0E] transition-transform duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.5)]",
                    // Desktop positioning (fixed under stats bar)
                    "md:top-52 md:h-[calc(100vh-13rem)] md:z-40",
                    // Visibility logic
                    !isOpen && "-translate-x-full md:translate-x-0"
                )}
            >
                <div className="flex h-full flex-col px-4 py-8 relative">
                    {/* Mobile Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white md:hidden"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    <div className="mb-8 px-2 flex items-center gap-3">
                        <div className="relative h-10 w-10 overflow-hidden rounded-full border border-[#D4AF37]/30 shadow-gold p-1 bg-black shrink-0">
                            <img src="/logo.png" alt="Codrava Logo" className="h-full w-full object-contain" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-lg font-bold text-white tracking-widest drop-shadow-md leading-none">
                                CODRAVA <span className="text-[#D4AF37]">LP</span>
                            </h2>
                            <span className="text-[8px] text-zinc-500 uppercase tracking-[0.15em] leading-tight">
                                Ecosistema de Prospección
                            </span>
                        </div>
                    </div>


                    <div className="mb-8 space-y-2">

                        <div className="relative group">
                            <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 group-focus-within:text-[#D4AF37] transition-colors ${isGoogleMode ? 'text-blue-500' : 'text-zinc-500'}`} />
                            <input
                                type="text"
                                placeholder={isGoogleMode ? "Ej: Restaurantes, Monterrey..." : "Buscar ubicación..."}
                                value={localSearch}
                                onChange={handleSearch}
                                onKeyDown={handleKeyDown}
                                className={`w-full rounded-lg border border-zinc-800 bg-black/40 py-3 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:ring-1 transition-all ${isGoogleMode ? 'focus:border-blue-500 focus:ring-blue-500' : 'focus:border-[#D4AF37] focus:ring-[#D4AF37]'}`}
                            />
                            {isGoogleMode && <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-zinc-500 max-sm:hidden">⏎ Enter</div>}
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            if (onTriggerGoogleSearch) onTriggerGoogleSearch(localSearch);
                            onClose?.(); // Close sidebar on mobile after search
                        }}
                        className="mb-8 w-full rounded-lg bg-[#D4AF37] py-2.5 text-sm font-bold text-black hover:bg-[#E5C148] transition-colors shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2"
                    >
                        <Search className="h-4 w-4" />
                        INICIAR ESCANEO
                    </button>

                    {/* Categorias - Accordion Style */}
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <div className="mb-4 flex items-center justify-between">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                                Filtro de Categorías
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={onSelectAll}
                                    className="text-[10px] text-[#D4AF37] hover:text-white transition-colors uppercase tracking-wider font-bold"
                                >
                                    Todo
                                </button>
                                <span className="text-zinc-700">|</span>
                                <button
                                    onClick={onClear}
                                    className="text-[10px] text-zinc-500 hover:text-white transition-colors uppercase tracking-wider"
                                >
                                    Limpiar
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 space-y-2 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#D4AF37]/20 hover:scrollbar-thumb-[#D4AF37]/50">
                            {Object.entries(CATEGORY_GROUPS).map(([groupName, items]) => {
                                const isExpanded = expandedGroups.includes(groupName);
                                // Check if any item in this group is selected to highlight the group header
                                const hasSelection = items.some(item => selectedCategories.includes(item));

                                return (
                                    <div key={groupName} className="border border-zinc-800/50 rounded-lg overflow-hidden bg-zinc-900/20">
                                        <button
                                            onClick={() => toggleGroup(groupName)}
                                            className={cn(
                                                "w-full flex items-center justify-between p-3 text-left transition-colors hover:bg-zinc-800/50",
                                                hasSelection ? "text-[#D4AF37]" : "text-zinc-400"
                                            )}
                                        >
                                            <span className="text-xs font-bold uppercase tracking-wide">{groupName}</span>
                                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                        </button>

                                        {isExpanded && (
                                            <div className="p-2 space-y-1 bg-black/20 border-t border-zinc-800/50">
                                                {items.map((cat) => (
                                                    <label
                                                        key={cat}
                                                        className="group flex cursor-pointer items-center gap-3 rounded-lg border border-transparent p-2 hover:bg-[#D4AF37]/5 hover:border-[#D4AF37]/20 transition-all ml-1"
                                                    >
                                                        <div className="relative flex h-3.5 w-3.5 items-center justify-center rounded border border-zinc-700 bg-black group-hover:border-[#D4AF37]">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCategories.includes(cat)}
                                                                onChange={() => handleCategoryClick(cat)}
                                                                className="peer absolute h-3.5 w-3.5 cursor-pointer opacity-0"
                                                            />
                                                            <CheckSquare className="hidden h-2.5 w-2.5 text-[#D4AF37] peer-checked:block drop-shadow-[0_0_5px_rgba(212,175,55,1)]" />
                                                        </div>
                                                        <span className="text-xs text-zinc-300 group-hover:text-white transition-colors">{cat}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
