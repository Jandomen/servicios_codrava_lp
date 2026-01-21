"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    UserPlus,
    Users,
    Shield,
    Building2,
    Mail,
    Lock,
    Plus,
    X,
    Check,
    Loader2,
    Search,
    MoreVertical,
    Trash2,
    ShieldAlert,
    ArrowLeft
} from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AdminUsersPage() {
    const { data: session } = useSession();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        role: "user",
        company: ""
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            const data = await res.json();
            if (res.ok) setUsers(data);
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");
        setSuccess(false);

        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Error al crear usuario");

            setSuccess(true);
            setFormData({ name: "", email: "", password: "", role: "user", company: "" });
            fetchUsers();
            setTimeout(() => {
                setIsModalOpen(false);
                setSuccess(false);
            }, 1500);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("¿Estás seguro de que deseas eliminar este usuario?")) return;

        try {
            const res = await fetch(`/api/admin/users?id=${userId}`, {
                method: "DELETE"
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Error al eliminar");
            }

            fetchUsers();
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (session?.user?.role !== "admin") {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
                <ShieldAlert className="w-16 h-16 text-red-500/50 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h2>
                <p className="text-zinc-500 max-w-md">No tienes los privilegios necesarios para acceder a esta sección de administración.</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white hover:border-zinc-700 transition-all group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Gestión de Usuarios</h1>
                        <p className="text-zinc-500 text-sm">Administra cuentas y permisos del ecosistema.</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B5952F] text-black font-bold px-6 py-4 rounded-xl transition-all shadow-lg shadow-[#D4AF37]/10"
                >
                    <UserPlus className="w-5 h-5" />
                    <span>Crear Usuario</span>
                </button>
            </div>

            {/* Stats / Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: "Total Usuarios", value: users.length, icon: Users, color: "blue" },
                    { label: "Administradores", value: users.filter(u => u.role === 'admin').length, icon: Shield, color: "gold" },
                    { label: "Empresas Activas", value: new Set(users.map(u => u.company).filter(Boolean)).size, icon: Building2, color: "green" },
                ].map((stat, i) => (
                    <div key={i} className="bg-black/40 backdrop-blur-xl border border-zinc-800 p-6 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <stat.icon className="w-16 h-16" />
                        </div>
                        <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-2">{stat.label}</p>
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Users Table */}
            <div className="bg-black/40 backdrop-blur-xl border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-zinc-800 bg-zinc-900/30">
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Usuario</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Rol</th>
                                <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#D4AF37]" />
                                        <span>Cargando directorio...</span>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                                        No hay usuarios registrados aparte de ti.
                                    </td>
                                </tr>
                            ) : users.map((user) => (
                                <tr key={user._id} className="hover:bg-zinc-800/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#D4AF37] font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-white">{user.name}</p>
                                                <p className="text-xs text-zinc-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin'
                                            ? "bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30"
                                            : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-zinc-400">
                                        {user.company || "N/A"}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {user.email !== session?.user?.email && (
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Eliminar usuario"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal: Create User */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-lg bg-[#0B0B0E] border border-zinc-800 rounded-3xl p-8 relative z-10 shadow-3xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-[#D4AF37]/10 rounded-xl">
                                        <UserPlus className="w-6 h-6 text-[#D4AF37]" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Nuevo Usuario</h2>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateUser} className="space-y-6">
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-4 rounded-xl">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="bg-green-500/10 border border-green-500/20 text-green-500 text-sm p-4 rounded-xl flex items-center gap-2">
                                        <Check className="w-5 h-5" />
                                        <span>Usuario creado correctamente.</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2 col-span-2">
                                        <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest ml-1">Nombre Completo</label>
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50"
                                            placeholder="Juan Pérez"
                                        />
                                    </div>

                                    <div className="space-y-2 col-span-2">
                                        <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest ml-1">Correo Electrónico</label>
                                        <input
                                            required
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50"
                                            placeholder="juan@empresa.com"
                                        />
                                    </div>

                                    <div className="space-y-2 col-span-2">
                                        <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest ml-1">Contraseña Inicial</label>
                                        <input
                                            required
                                            type="password"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50"
                                            placeholder="••••••••"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest ml-1">Rol</label>
                                        <select
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50 appearance-none"
                                        >
                                            <option value="user">Usuario Estándar</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs text-zinc-500 font-bold uppercase tracking-widest ml-1">Empresa</label>
                                        <input
                                            value={formData.company}
                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                            className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37]/50"
                                            placeholder="Codrava S.A."
                                        />
                                    </div>
                                </div>

                                <button
                                    disabled={isSubmitting}
                                    className="w-full bg-[#D4AF37] hover:bg-[#B5952F] text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmar Creación"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
