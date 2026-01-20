import StatsCards from "./components/StatsCards";
import ProspectList from "./components/ProspectList";
import Filters from "./components/Filters";

export default function DashboardPage() {
  return (
    <main className="min-h-screen p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-[#D4AF37]">
        Ecosistema de Prospección
      </h1>

      <Filters />

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProspectList />
        <div className="bg-[#1A1A1F] rounded-xl border border-[#D4AF37]/20 flex items-center justify-center text-gray-500">
          Mapa próximamente
        </div>
      </div>
    </main>
  );
}
