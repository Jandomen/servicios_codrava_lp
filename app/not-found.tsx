"use client";

import Link from "next/link";
import { AlertOctagon, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0B0E] p-4 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#D4AF37]/10 shadow-[0_0_50px_rgba(212,175,55,0.2)]">
                <AlertOctagon className="h-12 w-12 text-[#D4AF37]" />
            </div>

            <h1 className="mb-2 text-6xl font-black text-white tracking-widest">
                404
            </h1>

            <h2 className="mb-6 text-xl font-medium text-zinc-400">
                Ruta No Detectada
            </h2>

            <p className="mb-10 max-w-md text-sm leading-relaxed text-zinc-500">
                La página que buscas no existe en el ecosistema Codrava. Verifica la URL o regresa al tablero principal.
            </p>

            <Link
                href="/"
                className="flex items-center gap-2 rounded-lg bg-[#D4AF37] px-6 py-3 text-sm font-bold text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:bg-[#E5C148] transition-all"
            >
                <ArrowLeft className="h-4 w-4" />
                Volver al Dashboard
            </Link>

            <div className="absolute bottom-8 text-[10px] text-zinc-700 uppercase tracking-[0.2em]">
                Codrava Ecosystem v1.0
            </div>
        </div>
    );
}
