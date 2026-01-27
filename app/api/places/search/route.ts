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
                        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.location,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.primaryType,places.types,places.priceLevel,places.currentOpeningHours,places.photos",
                        "Referer": "http://localhost:3000/",
                    },
                    body: JSON.stringify({
                        textQuery: query,
                        maxResultCount: 20,
                    }),
                });

                if (response.ok) break;
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

        const prospects = data.places.map((place: any) => {
            const intl = place.internationalPhoneNumber || "";
            const cleanNumber = intl.replace(/\D/g, "");
            const isMexicoMobile = intl.startsWith("+52 1") && cleanNumber.length === 13;
            const waNumber = isMexicoMobile ? cleanNumber : undefined;

            // ANALISÍS MULTI-CAPA DE CATEGORÍAS
            // Priorizamos el primaryType, pero si es genérico, revisamos el array de types
            const allTypes = [place.primaryType, ...(place.types || [])].filter(Boolean);
            let finalCategory = "Negocio";

            for (const type of allTypes) {
                const formatted = formatCategory(type);
                if (formatted !== "Negocio") {
                    finalCategory = formatted;
                    break;
                }
            }

            return {
                id: place.id,
                name: place.displayName?.text || "Desconocido",
                category: finalCategory,
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
                isOpen: place.currentOpeningHours?.openNow,
                priceLevel: place.priceLevel,
                photo: place.photos?.[0]?.name,
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

    // Salud & Bienestar
    if (t.includes("dentist") || t.includes("orthodont")) return "Dentistas";
    if (t.includes("doctor") || t.includes("practitioner") || t.includes("physician") || t.includes("medical_office") || t.includes("specialist")) return "Médicos / Doctores";
    if (t.includes("clinic") || t.includes("hospital") || t.includes("medical") || t.includes("health")) return "Clínicas";
    if (t.includes("pharmacy") || t.includes("drugstore")) return "Farmacias";
    if (t.includes("veterinary") || t.includes("vet")) return "Veterinarios";
    if (t.includes("psychologist") || t.includes("mental") || t.includes("counsel") || t.includes("therapist")) return "Psicólogos";
    if (t.includes("nutrition") || t.includes("diet")) return "Nutriólogos";
    if (t.includes("laboratory") || t.includes("lab")) return "Laboratorios";

    // Gastronomía
    if (t.includes("bakery") || t.includes("pastry")) return "Pastelerías";
    if (t.includes("restaurant") || t.includes("food")) return "Restaurantes";
    if (t.includes("cafe") || t.includes("coffee")) return "Cafeterías";
    if (t.includes("bar") || t.includes("liquor") || t.includes("pub") || t.includes("night") || t.includes("club")) return "Bares";
    if (t.includes("meal_delivery") || t.includes("meal_takeaway") || t.includes("fast_food")) return "Comida Rápida";
    if (t.includes("catering")) return "Catering";

    // Legal & Financiero
    if (t.includes("lawyer") || t.includes("attorney") || t.includes("legal") || t.includes("court")) return "Abogados";
    if (t.includes("accounting") || t.includes("finance") || t.includes("tax") || t.includes("auditor")) return "Contadores";
    if (t.includes("insur")) return "Seguros";
    if (t.includes("notary")) return "Notarías";
    if (t.includes("bank") || t.includes("atm") || t.includes("credit_union") || t.includes("finance")) return "Bancos";

    // Hogar & Construcción
    if (t.includes("hardware") || t.includes("home_improvement")) return "Ferreterías";
    if (t.includes("plumber")) return "Plomeros";
    if (t.includes("electrician")) return "Electricistas";
    if (t.includes("carpenter") || t.includes("furniture") || t.includes("home_goods")) return "Mueblerías";
    if (t.includes("architect")) return "Arquitectos";
    if (t.includes("painter") || t.includes("decor") || t.includes("interior_design")) return "Decoración";
    if (t.includes("contractor") || t.includes("construction")) return "Contratistas";
    if (t.includes("garden") || t.includes("landscape")) return "Jardinería";

    // Industria & Manufactura
    if (t.includes("factory") || t.includes("manufacturing") || t.includes("industrial")) return "Industria";
    if (t.includes("warehouse") || t.includes("storage") || t.includes("wholesaler") || t.includes("distribution") || t.includes("almacen")) return "Almacenes";

    // Logística & Transporte
    if (t.includes("moving_company") || t.includes("mover")) return "Mudanzas";
    if (t.includes("logistics") || t.includes("freight") || t.includes("shipping") || t.includes("transport")) return "Logística";
    if (t.includes("post_office") || t.includes("courier") || t.includes("delivery") || t.includes("package")) return "Paquetería";

    // Entretenimiento & Ocio
    if (t.includes("movie_theater") || t.includes("cinema")) return "Cines";
    if (t.includes("casino")) return "Casinos";
    if (t.includes("museum") || t.includes("art_gallery") || t.includes("culture")) return "Museos";
    if (t.includes("bowling")) return "Boliches";
    if (t.includes("amusement_park") || t.includes("theme_park")) return "Parques de Diversiones";
    if (t.includes("event_venue") || t.includes("function_hall") || t.includes("banquet")) return "Salones de Eventos";

    // Mascotas
    if (t.includes("pet_store") || t.includes("pet_shop")) return "Tiendas de Mascotas";
    if (t.includes("pet_grooming") || t.includes("pet_esthetic")) return "Estéticas Caninas";
    if (t.includes("pet_hotel") || t.includes("dog_hotel")) return "Hoteles para Perros";

    // Moda & Retail
    if (t.includes("clothing_store") || t.includes("boutique") || t.includes("fashion")) return "Boutiques";
    if (t.includes("shoe_store")) return "Zapaterías";
    if (t.includes("jewelry_store")) return "Joyerías";
    if (t.includes("shopping_mall") || t.includes("department_store")) return "Centros Comerciales";

    // Educación
    if (t.includes("university") || t.includes("college")) return "Universidades";
    if (t.includes("school") || t.includes("education") || t.includes("learning")) return "Escuelas";
    if (t.includes("language")) return "Cursos de Idiomas";

    // Automotriz
    if (t.includes("motorcycle_dealer") || t.includes("motorcycle_shop")) return "Venta de Motos";
    if (t.includes("motorcycle_repair")) return "Talleres de Motos";
    if (t.includes("car_repair") || t.includes("mechanic")) return "Talleres Mecánicos";
    if (t.includes("car_dealer") || t.includes("auto_dealer")) return "Agencias de Autos";
    if (t.includes("car_wash")) return "Lavado de Autos";
    if (t.includes("tire") || t.includes("wheel")) return "Llanteras";
    if (t.includes("auto_parts")) return "Refaccionarias";

    // Belleza
    if (t.includes("hair") || t.includes("salon") || t.includes("barber") || t.includes("beauty")) return "Salones de Belleza";
    if (t.includes("spa") || t.includes("massage")) return "Spas";
    if (t.includes("gym") || t.includes("fitness") || t.includes("yoga") || t.includes("studio")) return "Gimnasios";

    // Tecnología & Servicios
    if (t.includes("electronics")) return "Electrónica";
    if (t.includes("computer") || t.includes("it_support") || t.includes("repair")) return "Soporte Técnico";
    if (t.includes("print") || t.includes("copy")) return "Imprentas";

    // Inmobiliaria & Turismo
    if (t.includes("real_estate") || t.includes("agency")) return "Inmobiliarias";
    if (t.includes("hotel") || t.includes("lodging") || t.includes("hostel") || t.includes("bed_and_breakfast")) return "Hoteles";
    if (t.includes("travel") || t.includes("tour")) return "Agencias de Viajes";

    // Fallback: Clean string
    return t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

function calculatePriority(rating: number, reviews: number) {
    if (!rating) return "URGENTE"; // Sin rating = Oportunidad vacía
    if (rating < 4.0 || reviews < 15) return "URGENTE"; // Baja calidad o sin presencia social
    if (rating < 4.5) return "MEDIO"; // Promedio
    return "BAJO"; // Bien posicionado
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
