"use client";

import { RefreshCw, Menu, User, LogOut, Settings, Users } from "lucide-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function Header({
    onMenuToggle
}: {
    onMenuToggle?: () => void;
}) {
    const { data: session } = useSession();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex h-16 md:h-20 w-full items-center justify-between border-b border-[#D4AF37]/20 bg-[#0B0B0E]/95 px-4 md:px-6 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuToggle}
                    className="mr-2 text-zinc-400 hover:text-white md:hidden"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <Link href="/dashboard" className="flex items-center gap-2 md:gap-3 group">
                    <div className="relative h-8 w-8 md:h-12 md:w-12 overflow-hidden rounded-full border border-[#D4AF37]/30 shadow-gold p-0.5 md:p-1 bg-black shrink-0 transition-transform group-hover:scale-105">
                        <img src="/logo.png" alt="Codrava Logo" className="h-full w-full object-contain" />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-base md:text-xl font-bold text-white tracking-widest drop-shadow-md">
                            CODRAVA <span className="text-[#D4AF37]">LP</span>
                        </h1>
                        <span className="text-[8px] md:text-[10px] text-zinc-400 uppercase tracking-[0.2em] group-hover:text-zinc-300 transition-colors hidden xs:block">
                            Ecosistema de Prospección
                        </span>
                    </div>
                </Link>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <button className="group hidden sm:flex items-center gap-2 rounded-lg border border-zinc-800 bg-black/50 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-bold text-zinc-400 transition-all hover:border-[#D4AF37]/30 hover:text-[#D4AF37]">
                    <RefreshCw className="h-3.5 w-3.5 md:h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                    <span className="max-sm:hidden">Sincronizar</span>
                </button>

                <div className="h-6 w-px bg-zinc-800 mx-1 hidden md:block" />

                <div className="flex items-center gap-2">
                    {session?.user?.role === "admin" && (
                        <Link
                            href="/dashboard/admin/users"
                            className="p-2 md:p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all group hidden sm:flex"
                            title="Gestionar Usuarios"
                        >
                            <Users className="h-4 w-4 md:h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                        </Link>
                    )}

                    <Link
                        href="/dashboard/settings"
                        className="p-2 md:p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all group hidden sm:flex"
                        title="Configuración"
                    >
                        <Settings className="h-4 w-4 md:h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                    </Link>

                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="p-2 md:p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-red-500 hover:border-red-500/30 transition-all"
                        title="Cerrar Sesión"
                    >
                        <LogOut className="h-4 w-4 md:h-5 w-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}
