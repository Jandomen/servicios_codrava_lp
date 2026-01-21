import { NextRequest } from "next/server";

/**
 * Obtiene el RP ID y el Origin de forma dinámica basándose en la petición actual.
 * El RP ID suele ser el dominio sin protocolo (ej: 'localhost' o 'tudominio.vercel.app').
 * El Origin es el dominio completo con protocolo (ej: 'http://localhost:3000').
 */
export function getWebAuthnConfig(req?: Request | NextRequest) {
    // Si estamos en desarrollo, usamos localhost
    const isDev = process.env.NODE_ENV === "development";

    // Prioridad 1: Variables de entorno explícitas
    if (process.env.WEBAUTHN_RP_ID && process.env.WEBAUTHN_ORIGIN) {
        return {
            rpID: process.env.WEBAUTHN_RP_ID,
            origin: process.env.WEBAUTHN_ORIGIN,
        };
    }

    // Prioridad 2: Deducir de NEXTAUTH_URL
    if (process.env.NEXTAUTH_URL) {
        const url = new URL(process.env.NEXTAUTH_URL);
        return {
            rpID: url.hostname,
            origin: url.origin,
        };
    }

    // Prioridad 3: Deducir de las cabeceras de la petición (fallback dinámico)
    if (req) {
        const host = req.headers.get("host") || "localhost";
        const protocol = host.includes("localhost") ? "http" : "https";
        return {
            rpID: host.split(":")[0], // Eliminar el puerto s lo hay
            origin: `${protocol}://${host}`,
        };
    }

    // Fallback por defecto (desarrollo local)
    return {
        rpID: "localhost",
        origin: "http://localhost:3000",
    };
}
