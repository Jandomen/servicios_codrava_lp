"use client";

import { useState } from "react";
import {
    Search,
    X,
    ChevronDown,
    ChevronRight,
    Check
} from "lucide-react";
import { cn } from "@/lib/utils";

/* =========================
   CATEGORÍAS
========================= */

export const CATEGORY_GROUPS = {
    "Salud & Bienestar": [
        "Médicos", "Clínicas", "Dentistas", "Psicólogos", "Nutriólogos",
        "Veterinarios", "Farmacias", "Laboratorios"
    ],
    "Gastronomía": [
        "Restaurantes", "Cafeterías", "Bares", "Panaderías",
        "Pastelerías", "Catering", "Comida Rápida"
    ],
    "Legal & Financiero": [
        "Abogados", "Contadores", "Notarías", "Seguros",
        "Consultorías", "Bancos"
    ],
    "Industria & Manufactura": [
        "Fábricas", "Maquiladoras", "Parques Industriales",
        "Bodegas", "Almacenes", "Textil", "Acereras", "Químicas"
    ],
    "Logística & Transporte": [
        "Transportistas", "Mudanzas", "Mensajería", "Paquetería",
        "Agencias Aduanales", "Renta de Camiones", "Fletes"
    ],
    "Hogar & Construcción": [
        "Ferreterías", "Arquitectos", "Mueblerías", "Plomeros",
        "Electricistas", "Decoración", "Jardinería", "Contratistas"
    ],
    "Entretenimiento & Ocio": [
        "Cines", "Teatros", "Casinos", "Museos",
        "Boliches", "Parques de Diversiones", "Salones de Eventos"
    ],
    "Educación": [
        "Escuelas", "Colegios", "Universidades",
        "Cursos de Idiomas", "Guarderías", "Academias de Música"
    ],
    "Automotriz": [
        "Talleres Mecánicos", "Refaccionarias",
        "Lavado de Autos", "Agencias de Autos", "Llanteras"
    ],
    "Moda & Retail": [
        "Boutiques", "Zapaterías", "Joyerías",
        "Centros Comerciales", "Tiendas Departamentales",
        "Ropa Deportiva"
    ],
    "Belleza": [
        "Salones de Belleza", "Barberías", "Spas",
        "Gimnasios", "Yoga", "Maquillaje"
    ],
    "Mascotas": [
        "Tiendas de Mascotas", "Estéticas Caninas",
        "Escuelas Caninas", "Hoteles para Perros"
    ],
    "Tecnología & Servicios": [
        "Electrónica",
        "Reparación Celulares", "Imprentas", "Soporte Técnico"
    ],
    "Servicios Públicos & Gobierno": [
        "Oficinas de Gobierno", "Correos",
        "Asociaciones Civiles", "Comisarías", "Bomberos"
    ],
    "Inmobiliaria & Turismo": [
        "Inmobiliarias", "Hoteles",
        "Agencias de Viajes", "Airbnb", "Hostales"
    ]
};

export const ALL_CATEGORIES = Object.values(CATEGORY_GROUPS).flat();
export const CATEGORIES = ALL_CATEGORIES;



export function Sidebar({
    selectedCategories = [],
    onCategoryChange = () => { },
    onSearch = () => { },
    onClear = () => { },
    onTriggerGoogleSearch,
    isGoogleMode = false,
    isOpen = false,
    onClose = () => { },
    onSelectAll
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
    const [localSearch, setLocalSearch] = useState("");
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

    const toggleGroup = (group: string) => {
        setExpandedGroups(prev =>
            prev.includes(group)
                ? prev.filter(g => g !== group)
                : [...prev, group]
        );
    };

    const handleCategoryClick = (e: React.MouseEvent, cat: string) => {
        e.preventDefault();
        onCategoryChange(cat);

        const isSelecting = !selectedCategories.includes(cat);
        if (isGoogleMode && onTriggerGoogleSearch && isSelecting) {
            onTriggerGoogleSearch(cat);
        }
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 md:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={cn(
                    "fixed left-0 top-0 z-50 h-full w-80 bg-[#0B0B0E] border-r border-[#D4AF37]/20 transition-transform",
                    "md:top-52 md:h-[calc(100vh-13rem)] md:z-40",
                    !isOpen && "-translate-x-full md:translate-x-0"
                )}
            >
                <div className="flex h-full flex-col px-4 py-6">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 md:hidden text-zinc-500"
                    >
                        <X />
                    </button>

                    {/* SEARCH */}
                    <div className="mb-6 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                        <input
                            value={localSearch}
                            onChange={(e) => {
                                setLocalSearch(e.target.value);
                                onSearch(e.target.value);
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && onTriggerGoogleSearch) {
                                    onTriggerGoogleSearch(localSearch);
                                }
                            }}
                            placeholder="Buscar…"
                            className="w-full rounded-lg bg-black border border-zinc-800 pl-10 pr-3 py-2 text-sm text-white"
                        />
                    </div>

                    {/* CATEGORIES */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                        {Object.entries(CATEGORY_GROUPS).map(([group, items]) => {
                            const isExpanded = expandedGroups.includes(group);
                            const hasSelection = items.some(i =>
                                selectedCategories.includes(i)
                            );

                            return (
                                <div key={group} className="border border-zinc-800 rounded-lg">
                                    <button
                                        onClick={() => toggleGroup(group)}
                                        className={cn(
                                            "w-full flex justify-between items-center p-3 text-xs font-bold uppercase",
                                            hasSelection ? "text-[#D4AF37]" : "text-zinc-400"
                                        )}
                                    >
                                        {group}
                                        {isExpanded ? <ChevronDown /> : <ChevronRight />}
                                    </button>

                                    {isExpanded && (
                                        <div className="p-2 space-y-1">
                                            {items.map(cat => {
                                                const checked = selectedCategories.includes(cat);
                                                return (
                                                    <label
                                                        key={cat}
                                                        className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-[#D4AF37]/10 group/item"
                                                        onClick={(e) => handleCategoryClick(e, cat)}
                                                    >
                                                        <div
                                                            className={cn(
                                                                "h-4 w-4 flex items-center justify-center rounded border transition-all",
                                                                checked
                                                                    ? "border-green-500 bg-green-500/10 shadow-[0_0_8px_rgba(34,197,94,.4)]"
                                                                    : "border-zinc-600 group-hover/item:border-zinc-500"
                                                            )}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={checked}
                                                                readOnly
                                                                className="sr-only"
                                                            />
                                                            {checked && (
                                                                <Check className="h-3 w-3 text-green-500 stroke-[4] animate-in zoom-in-50 duration-200" />
                                                            )}
                                                        </div>
                                                        <span
                                                            className={cn(
                                                                "text-xs transition-colors",
                                                                checked ? "text-green-500 font-bold" : "text-zinc-400 group-hover/item:text-zinc-200"
                                                            )}
                                                        >
                                                            {cat}
                                                        </span>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* FOOTER */}
                    <div className="mt-4 flex justify-between text-xs">
                        <button onClick={onSelectAll} className="text-[#D4AF37]">Todo</button>
                        <button onClick={onClear} className="text-zinc-500">Limpiar</button>
                    </div>
                </div>
            </aside>
        </>
    );
}
