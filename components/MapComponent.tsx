"use client";

import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { type Prospect } from "./ProspectCard";
import { useState, useCallback, useEffect } from "react";

const containerStyle = {
    width: "100%",
    height: "100%",
    borderRadius: "0.75rem",
};

const defaultCenter = {
    lat: 19.432608,
    lng: -99.133209,
};

const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    styles: [
        {
            elementType: "geometry",
            stylers: [{ color: "#212121" }],
        },
        {
            elementType: "labels.icon",
            stylers: [{ visibility: "off" }],
        },
        {
            elementType: "labels.text.fill",
            stylers: [{ color: "#757575" }],
        },
        {
            elementType: "labels.text.stroke",
            stylers: [{ color: "#212121" }],
        },
        {
            featureType: "administrative",
            elementType: "geometry",
            stylers: [{ color: "#757575" }],
        },
        {
            featureType: "administrative.country",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9e9e9e" }],
        },
        {
            featureType: "administrative.land_parcel",
            stylers: [{ visibility: "off" }],
        },
        {
            featureType: "administrative.locality",
            elementType: "labels.text.fill",
            stylers: [{ color: "#bdbdbd" }],
        },
        {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#757575" }],
        },
        {
            featureType: "poi.park",
            elementType: "geometry",
            stylers: [{ color: "#181818" }],
        },
        {
            featureType: "poi.park",
            elementType: "labels.text.fill",
            stylers: [{ color: "#616161" }],
        },
        {
            featureType: "poi.park",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#1b1b1b" }],
        },
        {
            featureType: "road",
            elementType: "geometry.fill",
            stylers: [{ color: "#2c2c2c" }],
        },
        {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#8a8a8a" }],
        },
        {
            featureType: "road.arterial",
            elementType: "geometry",
            stylers: [{ color: "#373737" }],
        },
        {
            featureType: "road.highway",
            elementType: "geometry",
            stylers: [{ color: "#3c3c3c" }],
        },
        {
            featureType: "road.highway.controlled_access",
            elementType: "geometry",
            stylers: [{ color: "#4e4e4e" }],
        },
        {
            featureType: "road.local",
            elementType: "labels.text.fill",
            stylers: [{ color: "#616161" }],
        },
        {
            featureType: "transit",
            elementType: "labels.text.fill",
            stylers: [{ color: "#757575" }],
        },
        {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#000000" }],
        },
        {
            featureType: "water",
            elementType: "labels.text.fill",
            stylers: [{ color: "#3d3d3d" }],
        },
    ],
};

export function MapComponent({ prospects, onSelect }: { prospects: Prospect[], onSelect?: (prospect: Prospect) => void }) {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [selectedMarker, setSelectedMarker] = useState<Prospect | null>(null);

    const onLoad = useCallback(
        (map: google.maps.Map) => {
            setMap(map);
        },
        []
    );

    useEffect(() => {
        if (map && prospects.length > 0) {
            const bounds = new window.google.maps.LatLngBounds();
            let hasValidCoords = false;

            prospects.forEach((prospect) => {
                if (prospect.coordinates && prospect.coordinates.lat && prospect.coordinates.lng) {
                    bounds.extend({
                        lat: prospect.coordinates.lat,
                        lng: prospect.coordinates.lng,
                    });
                    hasValidCoords = true;
                }
            });

            if (hasValidCoords) {
                map.fitBounds(bounds);
                const listener = window.google.maps.event.addListenerOnce(map, "bounds_changed", () => {
                    if (map.getZoom()! > 16) map.setZoom(16);
                });
            }
        }
    }, [map, prospects]);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    if (!isLoaded) {
        return (
            <div className="flex h-full w-full items-center justify-center rounded-xl bg-[#121216] border border-zinc-800">
                <div className="text-zinc-500">Cargando Mapa...</div>
            </div>
        );
    }

    return (
        <div className="w-full aspect-square h-auto md:h-[75vh] md:w-auto mx-auto rounded-xl border border-[#D4AF37]/20 shadow-gold overflow-hidden">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={defaultCenter}
                zoom={12}
                options={mapOptions}
                onLoad={onLoad}
                onUnmount={onUnmount}
                onClick={() => setSelectedMarker(null)} // Click on map closes info window
            >
                {prospects.map((prospect) => (
                    prospect.coordinates && (
                        <Marker
                            key={prospect._id || prospect.id}
                            position={{
                                lat: prospect.coordinates.lat,
                                lng: prospect.coordinates.lng,
                            }}
                            title={prospect.name}
                            icon={{
                                path: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
                                fillColor: prospect.priority === "URGENTE" ? "#EF4444" : // Red (Urgente)
                                    prospect.priority === "MEDIO" ? "#3B82F6" :   // Blue (Medio)
                                        "#22C55E",                                    // Green (Bajo)
                                fillOpacity: 1,
                                strokeWeight: 2,
                                strokeColor: "#000000",
                                scale: 2,
                                anchor: new google.maps.Point(12, 22),
                            }}
                            onClick={() => setSelectedMarker(prospect)}
                        />
                    )
                ))}

                {selectedMarker && selectedMarker.coordinates && (
                    <InfoWindow
                        position={{
                            lat: selectedMarker.coordinates.lat,
                            lng: selectedMarker.coordinates.lng,
                        }}
                        onCloseClick={() => setSelectedMarker(null)}
                        options={{
                            pixelOffset: new window.google.maps.Size(0, -30),
                        }}
                    >
                        <div className="bg-black text-white p-2 min-w-[200px] max-w-[250px]">
                            <h3 className="font-bold text-sm mb-1 text-[#D4AF37]">{selectedMarker.name}</h3>
                            <p className="text-xs text-zinc-400 mb-2 truncate">{selectedMarker.address}</p>
                            <div className="flex gap-2">
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold
                                    ${selectedMarker.priority === 'URGENTE' ? 'bg-red-500/20 text-red-500' :
                                        selectedMarker.priority === 'MEDIO' ? 'bg-blue-500/20 text-blue-500' :
                                            'bg-green-500/20 text-green-500'}`}>
                                    {selectedMarker.priority}
                                </span>
                            </div>

                            {onSelect && (
                                <button
                                    onClick={() => {
                                        onSelect(selectedMarker);
                                        setSelectedMarker(null);
                                    }}
                                    className="mt-3 w-full bg-[#D4AF37] hover:bg-[#E5C148] text-black text-xs font-bold py-1.5 px-3 rounded-md transition-colors"
                                >
                                    VER DETALLES
                                </button>
                            )}
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
}
