"use client";

import { useState } from "react";
import { Sidebar, CATEGORIES } from "@/components/Sidebar";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal State
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null);

  // Filters State
  const [selectedPriority, setSelectedPriority] = useState("Todas las prioridades");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Google Search Handler
  const [lastFetchedQuery, setLastFetchedQuery] = useState("");

  // Google Search Handler
  const handleGoogleSearch = async (query: string) => {
    // baseText: Priorizamos la entrada directa o lo que hay en el cuadro
    const currentBoxText = searchQuery.trim();
    const effectiveLocation = query.trim() || currentBoxText;
    const categoriesToSearch = selectedCategories.length > 0 ? selectedCategories : [null];

    if (!effectiveLocation && selectedCategories.length === 0) {
      setErrorMsg("Por favor escribe una ciudad o selecciona una categoría.");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    setErrorMsg("");

    setLastFetchedQuery(effectiveLocation);

    try {
      const searchTasks = categoriesToSearch.map(async (cat) => {
        let finalQuery = "";


        if (cat) {
          if (effectiveLocation) {

            if (effectiveLocation.toLowerCase().includes(" en ") ||
              effectiveLocation.toLowerCase().includes(" near ") ||
              effectiveLocation.toLowerCase().includes(cat.toLowerCase().substring(0, 5))) {
              finalQuery = `${cat} ${effectiveLocation}`;
            } else {
              finalQuery = `${cat} en ${effectiveLocation}`;
            }
          } else {
            finalQuery = cat;
          }
        }

        else {
          finalQuery = effectiveLocation;


          const lowerQ = finalQuery.toLowerCase();
          const needsLocationContext = !lowerQ.includes(" en ") &&
            !lowerQ.includes(" near ") &&
            !["tacos", "pizza", "hotel", "gym", "taller", "escuela", "restaurante", "abogado", "dentista"].some(k => lowerQ.includes(k));

          if (needsLocationContext) {
            finalQuery = `Mejores negocios y servicios en ${finalQuery}`;
          }
        }

        console.log("🔍 SMART SCAN:", finalQuery);

        const res = await fetch("/api/places/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: finalQuery }),
        });

        return res.json();
      });

      const results = await Promise.all(searchTasks);

      let totalNewProspects = 0;
      let someSuccess = false;
      let lastApiError = "";

      setGoogleProspects(prev => {
        let updatedList = [...prev];
        const existingIds = new Set(prev.map(p => p.id || p.address));

        results.forEach(data => {
          if (data.success) {
            someSuccess = true;
            if (data.data) {
              data.data.forEach((p: Prospect) => {
                if (!existingIds.has(p.id || p.address)) {
                  updatedList.push(p);
                  existingIds.add(p.id || p.address);
                  totalNewProspects++;
                }
              });
            }
          } else {
            lastApiError = data.error || "Error de conexión con Google API";
          }
        });

        return updatedList;
      });

      if (!someSuccess && lastApiError) {
        setErrorMsg(`Google API: ${lastApiError}`);
      }

    } catch (error) {
      console.error("❌ ERROR CRÍTICO:", error);
      setErrorMsg("Error de conexión. Revisa tu internet.");
    } finally {
      setLoading(false);
    }
  };


  const filteredProspects = googleProspects.filter((prospect) => {

    const matchesPriority =
      selectedPriority === "Todas las prioridades" ||
      prospect.priority === selectedPriority;

    const q = searchQuery.toLowerCase().trim();
    const hasSearch = q.length > 0;
    const hasCategories = selectedCategories.length > 0;


    if (!hasSearch && !hasCategories) return matchesPriority;


    const isScanLocation = q === lastFetchedQuery.toLowerCase().trim();

    const matchesSearch = hasSearch && (
      isScanLocation ||
      prospect.name.toLowerCase().includes(q) ||
      prospect.category.toLowerCase().includes(q)
    );


    const matchesCategory = hasCategories && selectedCategories.includes(prospect.category);


    if (hasSearch || hasCategories) {
      return matchesPriority && (matchesSearch || matchesCategory);
    }

    return matchesPriority;
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };


  const stats = {
    total: googleProspects.length,
    urgent: googleProspects.filter(p => p.priority === "URGENTE").length,
    medium: googleProspects.filter(p => p.priority === "MEDIO").length,
    withoutWebsite: googleProspects.filter(p => !p.hasWebsite).length,
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

      <main className="flex-1 px-4 pl-0 transition-all duration-300 md:pl-80 md:px-0">
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
                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 max-w-[1600px] mx-auto">
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
