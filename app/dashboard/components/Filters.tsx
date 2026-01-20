export default function Filters() {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <input
        type="text"
        placeholder="Buscar empresa..."
        className="bg-[#1A1A1F] border border-[#D4AF37]/20 rounded-lg px-4 py-2 outline-none focus:border-[#D4AF37]"
      />

      <select
        className="bg-[#1A1A1F] border border-[#D4AF37]/20 rounded-lg px-4 py-2"
      >
        <option>Todos los sectores</option>
        <option>Logística</option>
        <option>Industrial</option>
        <option>Retail</option>
      </select>
    </div>
  );
}
