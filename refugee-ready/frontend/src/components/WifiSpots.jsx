import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Wifi, Navigation, MapPin } from 'lucide-react';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

const userIcon = L.divIcon({
    html: `<div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.5);"></div>`,
    className: 'custom-user-icon',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

const wifiPinIcon = L.divIcon({
    html: `<div style="font-size: 24px; filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.5)); leading-none;">📶</div>`,
    className: 'custom-wifi-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12]
});

export default function WifiSpots({ location }) {
    const [spots, setSpots] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!location || !location.lat || !location.lng) return;

        const fetchSpots = async () => {
            setLoading(true);
            try {
                const query = `[out:json][timeout:15];
(
  node["internet_access"="wlan"]["internet_access:fee"="no"](around:2000,${location.lat},${location.lng});
  node["amenity"="library"](around:2000,${location.lat},${location.lng});
  node["amenity"="fast_food"]["name"~"McDonald",i](around:2000,${location.lat},${location.lng});
  node["amenity"="community_centre"](around:2000,${location.lat},${location.lng});
);
out body;`;

                const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error('Overpass API returned an error');
                }

                const data = await response.json();

                if (data && data.elements) {
                    const parsedSpots = data.elements.map(el => {
                        const distance = calculateDistance(location.lat, location.lng, el.lat, el.lon);
                        let name = el.tags?.name || 'Free WiFi';
                        if (!el.tags?.name) {
                            if (el.tags?.amenity === 'library') name = 'Local Library';
                            else if (el.tags?.amenity === 'community_centre') name = 'Community Centre';
                            else if (el.tags?.amenity === 'fast_food') name = "McDonald's";
                        }
                        return {
                            id: el.id,
                            lat: el.lat,
                            lng: el.lon,
                            name,
                            distance
                        };
                    });

                    // remove duplicates if multiple tags matched the same node
                    const uniqueSpots = [];
                    const seenIds = new Set();
                    for (let spot of parsedSpots) {
                        if (!seenIds.has(spot.id)) {
                            seenIds.add(spot.id);
                            uniqueSpots.push(spot);
                        }
                    }

                    uniqueSpots.sort((a, b) => a.distance - b.distance);
                    setSpots(uniqueSpots);
                }
            } catch (err) {
                console.error('Error fetching WiFi spots:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSpots();
    }, [location]);

    if (!location || !location.lat || !location.lng) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-900 rounded-lg shadow-sm border border-gray-800 text-center text-gray-300">
                <MapPin size={48} className="mb-4 text-gray-500 opacity-50" />
                <h3 className="text-xl font-medium text-white mb-2">Location Required</h3>
                <p>Please enable location to find WiFi spots nearby.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full h-[80vh] bg-gray-900 rounded-lg overflow-hidden shadow-lg border border-gray-800">

            {/* Map Section - Top Half */}
            <div className="h-1/2 w-full relative z-0">
                <MapContainer
                    center={[location.lat, location.lng]}
                    zoom={14}
                    scrollWheelZoom={true}
                    className="h-full w-full"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <Marker position={[location.lat, location.lng]} icon={userIcon}>
                        <Popup>You are here</Popup>
                    </Marker>

                    {spots.map((spot) => (
                        <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={wifiPinIcon}>
                            <Popup>{spot.name}</Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>

            {/* List Section - Bottom Half */}
            <div className="h-1/2 flex flex-col bg-gray-900 z-10">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900 shrink-0">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <Wifi className="text-blue-400" />
                        Free WiFi Near You
                    </h2>
                    {loading && (
                        <span className="text-sm text-blue-400 animate-pulse">Searching...</span>
                    )}
                    {!loading && spots.length > 0 && (
                        <span className="text-sm text-gray-400">{spots.length} spots found</span>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {!loading && spots.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            No free WiFi spots found within 2km.
                        </div>
                    )}

                    {spots.map((spot) => (
                        <div
                            key={spot.id}
                            className="bg-gray-800 rounded-lg p-4 flex items-center justify-between border border-gray-700 hover:border-gray-600 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="bg-blue-900/40 p-3 rounded-full shrink-0">
                                    <Wifi className="text-blue-400 fill-blue-400/20" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium" title={spot.name}>
                                        {spot.name.length > 30 ? spot.name.substring(0, 30) + '...' : spot.name}
                                    </h3>
                                    <p className="text-gray-400 text-sm mt-1">
                                        {(spot.distance).toFixed(2)} km away
                                    </p>
                                </div>
                            </div>

                            <a
                                href={`https://maps.google.com/?q=${spot.lat},${spot.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors shrink-0"
                            >
                                Navigate
                                <Navigation size={16} className="ml-1" />
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
