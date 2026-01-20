const prospectos = [
  { id: 1, nombre: "Empresa Alpha", ciudad: "CDMX", sector: "Logística" },
  { id: 2, nombre: "Beta Corp", ciudad: "Monterrey", sector: "Industrial" },
  { id: 3, nombre: "Gamma SA", ciudad: "Guadalajara", sector: "Retail" }
];

export default function ProspectList() {
  return (
    <div className="bg-[#1A1A1F] rounded-xl border border-[#D4AF37]/20 p-4">
      <h2 className="text-lg font-medium text-[#D4AF37] mb-4">
        Prospectos
      </h2>

      <ul className="space-y-3">
        {prospectos.map((p) => (
          <li
            key={p.id}
            className="p-3 rounded-lg bg-black/30 hover:bg-black/50 transition"
          >
            <p className="font-medium">{p.nombre}</p>
            <p className="text-sm text-gray-400">
              {p.ciudad} · {p.sector}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
