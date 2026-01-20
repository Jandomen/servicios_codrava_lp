export default function LoadingDashboard() {
  return (
    <div className="min-h-screen p-6 space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-[#1A1A1F] rounded" />

      <div className="h-12 bg-[#1A1A1F] rounded" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className="h-24 bg-[#1A1A1F] rounded-xl"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-[#1A1A1F] rounded-xl" />
        <div className="h-80 bg-[#1A1A1F] rounded-xl" />
      </div>
    </div>
  );
}
