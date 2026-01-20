import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Prospect from "@/models/Prospect";

const MOCK_PROSPECTS = [
    {
        name: "Bufete Jurídico Méndez & Asociados",
        category: "Abogados",
        rating: 4.8,
        reviewCount: 124,
        address: "Av. Reforma 222, Colonia Juárez, Ciudad de México, CDMX",
        priority: "URGENTE",
        gaps: ["Desarrollo Web/Landing Page", "Publicidad Digital & Contenido"],
        pitch:
            "Este despacho tiene una excelente reputación offline pero no aparece en las primeras 3 páginas de Google. Una campaña de SEO local podría duplicar sus consultas mensuales en 60 días.",
        hasWebsite: false,
        hasApi: false,
        analysisStatus: "Deficiente",
        phone: "+525512345678",
        email: "contacto@mendezasociados.com",
        whatsapp: "525512345678",
        coordinates: { lat: 19.4262, lng: -99.1601 }, // Paseo de la Reforma
    },
    {
        name: "Restaurante La Casona Antigua",
        category: "Restaurantes",
        rating: 4.5,
        reviewCount: 856,
        address: "Calle Hidalgo 45, Centro Histórico, Coyoacán",
        priority: "ALTA",
        gaps: ["Menu Digital", "Reservas Online", "Social Media"],
        pitch:
            "A pesar de tener alto tráfico peatonal, pierden el 30% de clientes potenciales por no tener sistema de reservas en línea ni menú digital actualizado.",
        hasWebsite: false,
        hasApi: false,
        analysisStatus: "Parcial",
        phone: "+525598765432",
        email: "reservas@lacasona.mx",
        whatsapp: "525598765432",
        coordinates: { lat: 19.3499, lng: -99.1627 }, // Coyoacan
    },
    {
        name: "Ferretería El Tornillo Maestro",
        category: "Ferreterías",
        rating: 4.2,
        reviewCount: 45,
        address: "Eje Central Lázaro Cárdenas 500, Narvarte",
        priority: "URGENTE",
        gaps: ["E-commerce Básico", "Catálogo Digital"],
        pitch:
            "Tienda con gran inventario pero sin visibilidad digital. Implementar un catálogo simple en línea les permitiría captar contratistas que buscan material específico.",
        hasWebsite: false,
        hasApi: false,
        analysisStatus: "Deficiente",
        phone: "+525555555555",
        email: "ventas@tornillomaestro.com",
        coordinates: { lat: 19.3907, lng: -99.1517 }, // Narvarte
    },
    {
        name: "Clínica Dental Sonrisas Brillantes",
        category: "Dentistas",
        rating: 4.9,
        reviewCount: 203,
        address: "Av. Universidad 1080, Xoco, Benito Juárez",
        priority: "ALTA",
        gaps: ["Citas Online", "Landing Page Promocional"],
        pitch:
            "Excelente servicio clínico pero proceso de citas arcaico. Un sistema de agendamiento automático reduciría el ausentismo y mejoraría la experiencia del paciente.",
        hasWebsite: true,
        hasApi: false,
        analysisStatus: "Parcial",
        phone: "+525544443333",
        email: "citas@sonrisasbrillantes.com",
        whatsapp: "525544443333",
        coordinates: { lat: 19.3621, lng: -99.1678 }, // Xoco
    },
    {
        name: "Gimnasio Iron Temple",
        category: "Gimnasios",
        rating: 4.7,
        reviewCount: 340,
        address: "Insurgentes Sur 1524, Mixcoac",
        priority: "MEDIA",
        gaps: ["Membresías Online", "App Móvil"],
        pitch:
            "Gran comunidad física pero sin retención digital. Una app para trackear progresos y renovación de membresía aumentaría el LTV del cliente.",
        hasWebsite: true,
        hasApi: true,
        analysisStatus: "Completo",
        phone: "+525511112222",
        coordinates: { lat: 19.3705, lng: -99.1793 }, // Mixcoac/Insurgentes
    },
    {
        name: "Taller Mecánico Velocidad Total",
        category: "Talleres",
        rating: 4.0,
        reviewCount: 22,
        address: "Dr. Vértiz 800, Narvarte Poniente",
        priority: "URGENTE",
        gaps: ["Sitio Web Informativo", "Google My Business"],
        pitch:
            "Negocio totalmente invisible en mapas digitales. Reclaman propiedad de GMB y crean sitio básico para captar emergencias viales en la zona.",
        hasWebsite: false,
        hasApi: false,
        analysisStatus: "Deficiente",
        phone: "+525566667777",
        whatsapp: "525566667777",
        coordinates: { lat: 19.3855, lng: -99.1522 }, // Vértiz
    },
];

export async function GET() {
    try {
        await dbConnect();
        // Clear existing to avoid duplicates on multiple calls
        await Prospect.deleteMany({});
        await Prospect.insertMany(MOCK_PROSPECTS);
        return NextResponse.json({
            success: true,
            message: "Database seeded successfully",
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: "Error seeding database" },
            { status: 500 }
        );
    }
}
