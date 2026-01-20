"use client";

import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { type Prospect } from "./ProspectCard";
import { useState, useCallback, useEffect } from "react";

const containerStyle = {
    width: "100%",
    height: "100%",
    borderRadius: "0.75rem",
};

const defaultCenter = {
    lat: 19.432608,
    lng: -99.133209, // Mexico City
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

export function MapComponent({ prospects }: { prospects: Prospect[] }) {
    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    });

    const [map, setMap] = useState<google.maps.Map | null>(null);

    const onLoad = useCallback(
        (map: google.maps.Map) => {
            setMap(map);
        },
        []
    );

    // Auto-center map when prospects change
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
                // Adjust zoom if too close (single result)
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
        <div className="h-[calc(100vh-12rem)] w-full rounded-xl border border-[#D4AF37]/20 shadow-gold overflow-hidden">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={defaultCenter}
                zoom={12}
                options={mapOptions}
                onLoad={onLoad}
                onUnmount={onUnmount}
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
                        // We could use a custom gold icon here if we had the URL
                        // icon={{
                        //   url: "/gold-marker.png", 
                        //   scaledSize: new window.google.maps.Size(30, 30)
                        // }}
                        />
                    )
                ))}
            </GoogleMap>
        </div>
    );
}
