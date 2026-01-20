import { NextResponse } from "next/server";

const GOOGLE_PLACES_API_URL = "https://places.googleapis.com/v1/places:searchText";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { query } = body;

        console.log("Search query received:", query);

        if (!query) {
            return NextResponse.json(
                { success: false, error: "Query is required" },
                { status: 400 }
            );
        }

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.error("API Key is missing in environment variables");
            return NextResponse.json(
                { success: false, error: "Server Configuration Error: API Key missing" },
                { status: 500 }
            );
        }

        // Prepare request to Google Places API (New)
        console.log("Calling Google Places API...");
        // Retry Logic with Exponential Backoff
        const maxRetries = 3;
        let response;
        let lastError;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                if (attempt > 0) {
                    console.log(`Retrying Google API (Attempt ${attempt + 1}/${maxRetries})...`);
                    await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt - 1))); // 1s, 2s, 4s
                }

                response = await fetch(GOOGLE_PLACES_API_URL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Goog-Api-Key": apiKey,
                        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.primaryType",
                        "Referer": "http://localhost:3000/", // Consider making this dynamic based on req.headers.get("origin") or env var
                    },
                    body: JSON.stringify({
                        textQuery: query,
                        maxResultCount: 20,
                    }),
                });

                if (response.ok) break; // Success!

                // If 500/503/429, we retry. Otherwise (400, 403), we stop.
                if (![500, 503, 504, 429].includes(response.status)) {
                    break;
                }
            } catch (err) {
                lastError = err;
                console.warn(`Connection failed (Attempt ${attempt + 1}):`, err);
            }
        }

        if (!response) {
            throw lastError || new Error("Failed to connect to Google API after retries");
        }

        const data = await response.json();

        if (!response.ok) {
            console.error("Google API Response Error:", data);
            return NextResponse.json(
                { success: false, error: data.error?.message || "Google API returned an error" },
                { status: response.status }
            );
        }

        if (!data.places || data.places.length === 0) {
            console.log("No places found for query:", query);
            return NextResponse.json({ success: true, data: [] });
        }

        console.log(`Found ${data.places.length} places`);

        // Map Google Places to our Prospect Interface
        const prospects = data.places.map((place: any) => {
            // Estricta detección de WhatsApp (Solo Móviles Confirmados)
            const intl = place.internationalPhoneNumber || "";
            const cleanNumber = intl.replace(/\D/g, "");

            // Regla: 
            // 1. Debe ser México (+52)
            // 2. Debe tener el marcador móvil (1) -> "+52 1"
            // 3. Longitud exacta: 52 (2) + 1 (1) + 10 dígitos = 13 digitos
            // CUALQUIER otra cosa se asume fijo o inválido para WA seguro.

            const isMexicoMobile = intl.startsWith("+52 1") && cleanNumber.length === 13;

            // Si queremos soportar otros paises, aqui iría la lógica. 
            // Por ahora, priorizamos "NO mostrar" sobre "Mostrar error".

            const waNumber = isMexicoMobile ? cleanNumber : undefined;

            return {
                id: place.id,
                name: place.displayName?.text || "Desconocido",
                category: place.primaryType ? formatCategory(place.primaryType) : "Negocio",
                rating: place.rating || 0,
                reviewCount: place.userRatingCount || 0,
                address: place.formattedAddress || "Sin dirección",
                priority: calculatePriority(place.rating, place.userRatingCount),
                gaps: generateGaps(place),
                pitch: generatePitch(place),
                hasWebsite: !!place.websiteUri,
                hasApi: false,
                analysisStatus: "Parcial",
                phone: place.nationalPhoneNumber || place.formattedPhoneNumber || "",
                website: place.websiteUri,
                whatsapp: waNumber,
                email: undefined,
                coordinates: {
                    lat: place.location?.latitude,
                    lng: place.location?.longitude,
                },
            };
        });

        return NextResponse.json({ success: true, data: prospects });
    } catch (error) {
        console.error("Internal Server Error in /api/places/search:", error);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// Helpers
const CATEGORY_MAP: Record<string, string> = {
    "restaurant": "Restaurantes",
    "cafe": "Restaurantes",
    "meal_takeaway": "Restaurantes",
    "bar": "Restaurantes",
    "lawyer": "Abogados",
    "attorney": "Abogados",
    "hardware_store": "Ferreterías",
    "real_estate_agency": "Inmobiliarias",
    "dentist": "Dentistas",
    "dental_clinic": "Dentistas",
    "accounting": "Contadores",
    "gym": "Gimnasios",
    "fitness_center": "Gimnasios",
    "car_repair": "Talleres",
    "auto_repair": "Talleres",
    "lodging": "Hoteles",
    "hotel": "Hoteles",
    "beauty_salon": "Salones de Belleza",
    "hair_care": "Salones de Belleza",
    "spa": "Salones de Belleza",
};

function formatCategory(type: string): string {
    const t = type.toLowerCase();

    // Salud
    if (t.includes("dentist") || t.includes("orthodont")) return "Dentistas";
    if (t.includes("doctor") || t.includes("practitioner") || t.includes("physician")) return "Médicos";
    if (t.includes("clinic") || t.includes("hospital") || t.includes("medical")) return "Clínicas";
    if (t.includes("pharmacy") || t.includes("drugstore")) return "Farmacias";
    if (t.includes("veterinary") || t.includes("vet")) return "Veterinarios";
    if (t.includes("psychologist") || t.includes("mental")) return "Psicólogos";

    // Gastronomía
    if (t.includes("restaurant") || t.includes("food")) return "Restaurantes";
    if (t.includes("cafe") || t.includes("coffee")) return "Cafeterías";
    if (t.includes("bakery")) return "Panaderías";
    if (t.includes("bar") || t.includes("liquor") || t.includes("pub") || t.includes("night")) return "Bares";
    if (t.includes("meal_delivery") || t.includes("meal_takeaway")) return "Comida Rápida";

    // Legal & Financiero
    if (t.includes("lawyer") || t.includes("attorney") || t.includes("legal")) return "Abogados";
    if (t.includes("accounting") || t.includes("finance") || t.includes("tax")) return "Contadores";
    if (t.includes("insur")) return "Seguros";
    if (t.includes("notary")) return "Notarías";
    if (t.includes("bank") || t.includes("atm")) return "Bancos";

    // Hogar & Construcción
    if (t.includes("hardware")) return "Ferreterías";
    if (t.includes("plumber")) return "Plomeros";
    if (t.includes("electrician")) return "Electricistas";
    if (t.includes("carpenter") || t.includes("furniture")) return "Mueblerías";
    if (t.includes("architect")) return "Arquitectos";
    if (t.includes("painter") || t.includes("decor")) return "Decoración";

    // Educación
    if (t.includes("school") || t.includes("education")) return "Escuelas";
    if (t.includes("university") || t.includes("college")) return "Universidades";
    if (t.includes("language")) return "Cursos de Idiomas";

    // Automotriz
    if (t.includes("car_repair") || t.includes("mechanic")) return "Talleres Mecánicos";
    if (t.includes("car_dealer")) return "Agencias de Autos";
    if (t.includes("car_wash")) return "Lavado de Autos";

    // Belleza
    if (t.includes("hair") || t.includes("salon") || t.includes("barber")) return "Salones de Belleza";
    if (t.includes("spa") || t.includes("massage")) return "Spas";
    if (t.includes("gym") || t.includes("fitness") || t.includes("yoga")) return "Gimnasios";

    // Tecnología
    if (t.includes("electronics")) return "Electrónica";
    if (t.includes("web") || t.includes("software") || t.includes("computer")) return "Desarrollo Web";

    // Inmobiliaria & Turismo
    if (t.includes("real_estate") || t.includes("agency")) return "Inmobiliarias";
    if (t.includes("hotel") || t.includes("lodging")) return "Hoteles";
    if (t.includes("travel")) return "Agencias de Viajes";

    // Fallback: Clean string
    return t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function calculatePriority(rating: number, reviews: number) {
    if (!rating || rating < 3.5) return "URGENTE";
    if (rating < 4.5) return "MEDIO";
    return "BAJO";
}

function generateGaps(place: any) {
    const gaps = [];
    if (!place.websiteUri) gaps.push("Sin Sitio Web");
    if (!place.rating || place.rating < 4.0) gaps.push("Reputación Baja");
    if (!place.userRatingCount || place.userRatingCount < 20) gaps.push("Pocas Reseñas");
    if (gaps.length === 0) gaps.push("Optimización SEO");
    return gaps;
}

function generatePitch(place: any) {
    const name = place.displayName?.text || "este negocio";
    if (!place.websiteUri) {
        return `${name} está perdiendo clientes potenciales al no tener presencia web. Una Landing Page moderna capturaría ese tráfico perdido.`;
    }
    if (!place.rating || place.rating < 4.0) {
        return `La reputación actual de ${name} está limitando su crecimiento. Una estrategia de gestión de reseñas mejoraría su posicionamiento local.`;
    }
    return `${name} tiene buena base, pero podría escalar automatizando sus consultas con un Chatbot de IA.`;
}
