"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { ProspectCard, type Prospect } from "@/components/ProspectCard";
import { MapComponent } from "@/components/MapComponent";
import { ProspectModal } from "@/components/ProspectModal";
import { LayoutGrid, Map, AlertCircle, Search } from "lucide-react";
import { StatsBar } from "@/components/StatsBar";

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [googleProspects, setGoogleProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Modal State
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);

  // Filters State
  const [selectedPriority, setSelectedPriority] = useState("Todas las prioridades");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Google Search Handler
  const handleGoogleSearch = async (query: string) => {
    let effectiveQuery = query.trim();

    // 1. Manejo de escaneo vacío
    if (!effectiveQuery) {
      effectiveQuery = "Negocios Recomendados en esta zona";
    }

    else if (
      !effectiveQuery.toLowerCase().includes(" en ") &&
      !effectiveQuery.toLowerCase().includes(" near ") &&
      // Lista de exclusión simple: si la query es un producto o servicio obvio, no le agregamos prefijo
      !["papas", "tacos", "pizza", "hotel", "gym", "taller", "escuela"].some(k => effectiveQuery.toLowerCase().includes(k))
    ) {
      // Asunción segura: Si es una sola palabra o dos y no es un servicio común, probablemente es una ciudad.
      effectiveQuery = `Mejores negocios y servicios en ${effectiveQuery}`;
    }

    console.log("🔍 FRONTEND: Iniciando búsqueda en Google:", effectiveQuery);
    setLoading(true);
    setHasSearched(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/places/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Use effectiveQuery
        body: JSON.stringify({ query: effectiveQuery }),
      });

      console.log("📥 FRONTEND: Respuesta recibida [status]:", res.status);
      const data = await res.json();
      console.log("📦 FRONTEND: Datos parseados:", data);

      if (data.success) {
        setGoogleProspects(data.data);
        if (data.data.length === 0) {
          console.warn("⚠️ FRONTEND: 0 resultados encontrados.");
          setErrorMsg(`Google no encontró resultados para: "${effectiveQuery}".`);
        } else {
          console.log(`✅ FRONTEND: ${data.data.length} prospectos cargados.`);
        }
      } else {
        console.error("❌ FRONTEND: API Error:", data.error);
        setErrorMsg(`Error de Google API: ${data.error}`);
      }
    } catch (error) {
      console.error("❌ FRONTEND: Error Crítico:", error);
      setErrorMsg("Error de conexión al servidor. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic (Client-side)
  const filteredProspects = googleProspects.filter((prospect) => {
    // Local Filters for Google Results
    const matchesPriority =
      selectedPriority === "Todas las prioridades" ||
      prospect.priority.toLowerCase() === selectedPriority.toLowerCase().split(" ")[0] ||
      prospect.priority === selectedPriority;

    // NOTE: We disable client-side text filtering for Google Search.
    // The API already filtered by the query string. 
    // Applying it again would hide results that don't strictly contain the query text (e.g. "Restaurantes en Monterrey").
    const matchesSearch = true;

    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(prospect.category);

    return matchesPriority && matchesSearch && matchesCategory;
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className="flex min-h-screen bg-[#0B0B0E] pt-52">
      <Header />
      <StatsBar />

      <Sidebar
        selectedCategories={selectedCategories}
        onCategoryChange={handleCategoryChange}
        onSearch={(q) => {
          setSearchQuery(q);
        }}
        onClear={() => {
          setSelectedCategories([]);
          setSearchQuery("");
          setGoogleProspects([]);
          setErrorMsg("");
          setHasSearched(false);
        }}
        onTriggerGoogleSearch={handleGoogleSearch}
        isGoogleMode={true}
      />

      <main className="flex-1 pl-80 transition-all duration-300">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-end">
            <div className="flex gap-4">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-4 text-sm text-zinc-300 outline-none focus:border-[#D4AF37]"
              >
                <option>Todas las prioridades</option>
                <option value="URGENTE">Urgente</option>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>

              <div className="flex rounded-lg border border-zinc-800 bg-zinc-900 p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${viewMode === "grid"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4" />
                    Grid
                  </div>
                </button>
                <button
                  onClick={() => setViewMode("map")}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-all ${viewMode === "map"
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <Map className="h-4 w-4" />
                    Mapa
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex h-screen max-h-96 flex-col items-center justify-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#D4AF37] border-t-transparent" />
              <p className="animate-pulse text-sm text-[#D4AF37]">Escaneando zona con IA...</p>
            </div>
          ) : (
            <>
              {/* Error Message */}
              {errorMsg && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-500">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{errorMsg}</span>
                </div>
              )}

              {/* Content */}
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-w-5xl mx-auto">
                  {filteredProspects.length > 0 ? (
                    filteredProspects.map((prospect, index) => (
                      <ProspectCard
                        key={prospect.id || prospect._id}
                        prospect={prospect}
                        index={index}
                        onViewDetails={setSelectedProspect}
                      />
                    ))
                  ) : (
                    !errorMsg && (
                      <div className="col-span-full flex h-[50vh] flex-col items-center justify-center text-zinc-500">
                        {!hasSearched ? (
                          <>
                            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800">
                              <Search className="h-8 w-8 text-zinc-700" />
                            </div>
                            <h3 className="text-lg font-medium text-zinc-300">Explorador Listo</h3>
                            <p className="max-w-sm text-center text-sm mt-2">Usa el buscador de la izquierda para encontrar negocios en tiempo real (Ej. "Cafeterías en Polanco").</p>
                          </>
                        ) : (
                          <p>No se encontraron resultados para los filtros actuales.</p>
                        )}
                      </div>
                    )
                  )}
                </div>
              ) : (
                <MapComponent prospects={filteredProspects} />
              )}
            </>
          )}
        </div>
      </main>

      {/* Modal */}
      <ProspectModal
        prospect={selectedProspect}
        onClose={() => setSelectedProspect(null)}
      />
    </div>
  );
}
