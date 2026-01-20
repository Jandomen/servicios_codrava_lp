export default function StatsCards() {
  const stats = [
    { label: "Prospectos", value: 128 },
    { label: "Empresas", value: 42 },
    { label: "Activos", value: "85%" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-[#1A1A1F] border border-[#D4AF37]/20 rounded-xl p-6"
        >
          <p className="text-sm text-gray-400">{stat.label}</p>
          <p className="text-3xl font-semibold text-[#D4AF37]">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
