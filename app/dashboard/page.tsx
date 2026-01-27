"use client";

import { useState } from "react";
import { Sidebar, CATEGORIES } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { ProspectCard, type Prospect } from "@/components/ProspectCard";
import { MapComponent } from "@/components/MapComponent";
import { ProspectModal } from "@/components/ProspectModal";
import { LayoutGrid, Map, AlertCircle, Search } from "lucide-react";
import { StatsBar } from "@/components/StatsBar";

const PRODUCT_KEYWORDS = ["tacos", "huaraches", "comida", "hidrogeno", "chocolates", "libros", "pizza", "motos", "motocicletas", "pomadas", "medicamentos"];

const normalize = (text: string) =>
  text ? text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : "";

export default function Dashboard() {
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [googleProspects, setGoogleProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);

  const [selectedPriority, setSelectedPriority] = useState("Todas las prioridades");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [lastFetchedQuery, setLastFetchedQuery] = useState("");

  const handleGoogleSearch = async (trigger: string) => {
    // 1. Candado: Evita colisiones por múltiples clics
    if (loading) return;

    const isCategoryTrigger = CATEGORIES.includes(trigger);
    const locationPart = isCategoryTrigger ? searchQuery.trim() : trigger.trim();

    const isLocationOnly = !isCategoryTrigger && !PRODUCT_KEYWORDS.some(k => normalize(locationPart).includes(normalize(k)));

    const categoriesToScan = isCategoryTrigger
      ? [trigger]
      : (isLocationOnly
        ? [null, "Médicos", "Restaurantes", "Talleres Mecánicos", "Escuelas", "Boutiques"]
        : (selectedCategories.length > 0 ? selectedCategories : [null]));

    if (!locationPart && !isCategoryTrigger && categoriesToScan.every(c => !c)) {
      setErrorMsg("Por favor escribe una ciudad o selecciona una categoría.");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setErrorMsg("");

    // 2. Reseteo inteligente si cambió de ciudad
    const normalizedNewLocation = normalize(locationPart || "");
    const normalizedOldLocation = normalize(lastFetchedQuery || "");
    if (normalizedNewLocation !== normalizedOldLocation && !isCategoryTrigger) {
      setGoogleProspects([]);
      setLastFetchedQuery(locationPart || "Búsqueda Local");
    }

    try {
      const searchTasks = categoriesToScan.map(async (cat) => {
        try {
          const finalQuery = cat ? (locationPart ? `${cat} en ${locationPart}` : cat) : locationPart;

          const res = await fetch("/api/places/search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: finalQuery }),
          });

          if (!res.ok) throw new Error("API Offline");
          const data = await res.json();
          return { ...data, searchedCategory: cat, success: !!data.success };
        } catch (err) {
          console.warn(`Error en tarea ${cat}:`, err);
          return { success: false, searchedCategory: cat };
        }
      });

      const results = await Promise.all(searchTasks);
      let someSuccess = false;

      setGoogleProspects(prev => {
        const newList: Prospect[] = [];
        const existingIds = new Set(prev.map(p => p.id));

        results.forEach(data => {
          if (data.success && data.data) {
            someSuccess = true;
            data.data.forEach((p: Prospect) => {
              if (data.searchedCategory && (!p.category || p.category === "Negocio")) {
                p.category = data.searchedCategory;
              }
              if (!existingIds.has(p.id)) {
                newList.push(p);
                existingIds.add(p.id);
              }
            });
          }
        });

        return [...newList, ...prev];
      });

      if (!someSuccess) {

      }

    } catch (error) {
      console.error("❌ ERROR CRÍTICO:", error);
      setErrorMsg("Error de conexión. Intenta de nuevo por favor.");
    } finally {
      // 3. DESBLOQUEO TOTAL: El botón siempre vuelve a estar activo aquí
      setLoading(false);
    }
  };




  const filteredProspects = googleProspects.filter((prospect) => {
    const q = normalize(searchQuery.trim());
    const hasSearch = q.length > 0;
    const hasCategories = selectedCategories.length > 0;

    // 1. Filtro de Prioridad
    const matchesPriority =
      selectedPriority === "Todas las prioridades" ||
      prospect.priority === selectedPriority;

    if (!matchesPriority) return false;

    // 2. Si no hay nada pedido ni seleccionado, ocultamos todo
    if (!hasSearch && !hasCategories) return false;

    // 3. Tokenización de la búsqueda (Ignoramos conectores y acentos)
    const keywords = q.split(/\s+/).filter(word =>
      (word.length > 2 || /\d/.test(word)) && // Permitimos palabras de 1-2 letras si son números (calle, no.)
      !["las", "los", "con", "del", "que", "donde", "cerca"].includes(word)
    );

    const isLocationSearch = q.length > 3 && !PRODUCT_KEYWORDS.some(k => q.includes(normalize(k)));

    // 4. Lógica de Selección
    // Si el usuario marcó categorías, solo mostramos esas.
    if (hasCategories) {
      return selectedCategories.includes(prospect.category) && matchesPriority;
    }

    // Si no hay categorías marcadas:
    // - Si es búsqueda de ubicación (Ej. Toluca), mostramos todos los resultados encontrados de forma general.
    if (isLocationSearch) return matchesPriority;

    // - Si es búsqueda de producto o nombre (Ej. Tacos), validamos el match de texto.
    return keywords.length > 0 && keywords.every(word =>
      normalize(prospect.name).includes(word) ||
      normalize(prospect.category).includes(word)
    );
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };


  const stats = {
    total: filteredProspects.length,
    urgent: filteredProspects.filter(p => p.priority === "URGENTE").length,
    medium: filteredProspects.filter(p => p.priority === "MEDIO").length,
    withoutWebsite: filteredProspects.filter(p => !p.hasWebsite).length,
  };

  return (
    <div className="flex min-h-screen bg-[#0B0B0E] pt-44 md:pt-52">
      <Header onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
      <StatsBar stats={stats} />

      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        selectedCategories={selectedCategories}
        onCategoryChange={handleCategoryChange}
        onSelectAll={() => setSelectedCategories([...CATEGORIES])}
        searchQuery={searchQuery}
        detectedCategories={googleProspects.map(p => p.category)}
        isLocationSearch={searchQuery.length > 3 && !PRODUCT_KEYWORDS.some(k => normalize(searchQuery).includes(normalize(k)))}
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

      <main className="flex-1 px-4 pl-0 transition-all duration-300 lg:pl-80 lg:px-0">
        <div className="p-4 md:p-6">
          <div className="mb-6 flex items-center justify-end">
            <div className="flex gap-4">
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="h-10 rounded-lg border border-zinc-800 bg-zinc-900 px-4 text-sm text-zinc-300 outline-none focus:border-[#D4AF37]"
              >
                <option>Todas las prioridades</option>
                <option value="URGENTE">Urgente</option>
                <option value="MEDIO">Medio</option>
                <option value="BAJO">Bajo</option>
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


          {loading ? (
            <div className="flex h-screen max-h-96 flex-col items-center justify-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#D4AF37] border-t-transparent" />
              <p className="animate-pulse text-sm text-[#D4AF37]">Escaneando zona con IA...</p>
            </div>
          ) : (
            <>

              {errorMsg && (
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-500">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span className="font-medium">{errorMsg}</span>
                </div>
              )}


              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 max-w-[1600px] mx-auto">
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
                <MapComponent prospects={filteredProspects} onSelect={setSelectedProspect} />
              )}
            </>
          )}
        </div>
      </main>


      <ProspectModal
        prospect={selectedProspect}
        onClose={() => setSelectedProspect(null)}
      />
    </div>
  );
}
