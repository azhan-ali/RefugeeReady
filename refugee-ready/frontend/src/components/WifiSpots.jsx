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

    <div className="p-3 md:p-6 space-y-4 relative min-h-screen">
        {/* Premium Background Elements */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-[#030407] to-[#030407] pointer-events-none z-0"></div>

        <div className="relative z-10 flex flex-col items-center justify-center p-12 bg-white/[0.03] backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 text-center text-gray-300">
            <div className="bg-blue-500/10 p-5 rounded-full mb-6">
                <MapPin size={48} className="text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3 tracking-wide">Location Required</h3>
            <p className="max-w-md text-gray-400">Please enable location access to find the closest free WiFi spots. We do not store your location.</p>
        </div>
    </div>

    return (
        <div className="p-3 md:p-6 space-y-4 relative min-h-screen flex flex-col">
            {/* Premium Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#010517] via-[#030812] to-[#030407]" />
                <div className="absolute -top-40 -left-32 w-[580px] h-[580px] bg-blue-600/25 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '5s' }} />
                <div className="absolute -bottom-40 -right-32 w-[500px] h-[500px] bg-indigo-700/20 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '7s', animationDelay: '2s' }} />
                <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-cyan-600/15 rounded-full blur-[90px] animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,1) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)]" />
            </div>

            <div className="relative z-10 flex items-center flex-row space-x-3 mb-4">
                <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-2.5 rounded-xl border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.2)] shrink-0">
                    <Wifi className="text-blue-400 w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                        Free <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">WiFi Spots</span>
                    </h2>
                    <p className="text-gray-400 text-xs mt-0.5">
                        Find free public internet connections nearby to contact your family.
                    </p>
                </div>
            </div>

            <div className="relative z-10 flex flex-col w-full h-[65vh] md:h-[70vh] bg-white/[0.02] backdrop-blur-3xl rounded-3xl overflow-hidden shadow-2xl border border-white/10 mt-6 shrink-0">
                {/* Map Section - Top Half */}
                <div className="h-1/2 md:h-3/5 w-full relative z-0 border-b border-white/10">
                    <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay z-10 pointer-events-none"></div>
                    <MapContainer
                        center={[location.lat, location.lng]}
                        zoom={14}
                        scrollWheelZoom={true}
                        className="h-full w-full"
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />

                        <Marker position={[location.lat, location.lng]} icon={userIcon}>
                            <Popup><span className="text-black font-bold">You are here</span></Popup>
                        </Marker>

                        {spots.map((spot) => (
                            <Marker key={spot.id} position={[spot.lat, spot.lng]} icon={wifiPinIcon}>
                                <Popup><span className="text-black font-bold">{spot.name}</span></Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>

                {/* List Section - Bottom Half */}
                <div className="h-1/2 md:h-2/5 flex flex-col bg-transparent z-10">
                    <div className="p-4 md:p-5 border-b border-white/10 flex justify-between items-center bg-white/[0.03] backdrop-blur-md shrink-0">
                        <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2 tracking-wide">
                            <Wifi className="text-blue-400" size={20} />
                            Nearest Connections
                        </h2>
                        {loading && (
                            <span className="text-xs md:text-sm text-blue-400 animate-pulse font-semibold tracking-widest uppercase bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">Scanning</span>
                        )}
                        {!loading && spots.length > 0 && (
                            <span className="text-sm text-gray-400">{spots.length} spots found</span>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto scrollbar-none">
                        {loading && spots.length === 0 ? (
                            <div className="flex justify-center items-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-4 border-white/10 border-t-blue-500"></div>
                            </div>
                        ) : spots.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                                <Wifi size={32} className="opacity-20 mb-3" />
                                <p>No free WiFi spots found within 2km.</p>
                                <p className="text-sm mt-1">Try moving to a more central location.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-white/5">
                                {spots.map((spot) => (
                                    <li key={spot.id} className="p-4 md:p-5 hover:bg-white/5 transition-colors group cursor-none">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/20 group-hover:bg-blue-500/20 transition-all shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                                                    <Wifi size={18} className="text-blue-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-bold tracking-wide text-[15px]">{spot.name}</h3>
                                                    <p className="text-gray-400 text-sm flex items-center gap-1.5 mt-0.5">
                                                        <Navigation size={12} className="text-blue-400/70" />
                                                        {spot.distance.toFixed(1)} km away
                                                    </p>
                                                </div>
                                            </div>
                                            <a
                                                href={`https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="cursor-none bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/30 text-blue-300 font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2"
                                            >
                                                <Navigation size={14} /> Go
                                            </a>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


