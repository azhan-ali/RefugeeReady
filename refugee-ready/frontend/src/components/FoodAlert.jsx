import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Check, Utensils, AlertTriangle, Leaf, Award, Repeat, BellRing } from 'lucide-react';

const getDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity;
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export default function FoodAlert({ location, lang }) {
    const { t } = useTranslation();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all'); // all, halal, vegan

    useEffect(() => {
        const fetchFood = async () => {
            try {
                setLoading(true);
                const baseUrl = import.meta.env.VITE_BACKEND_URL;
                const response = await fetch(`${baseUrl}/api/food`);
                const data = await response.json();

                if (data.success) {
                    // Calculate distance for each item
                    const itemsWithDistance = data.food.map(item => {
                        let dist = Infinity;
                        if (location?.lat && location?.lng && item.lat && item.lng) {
                            dist = getDistance(location.lat, location.lng, item.lat, item.lng);
                        } else if (item.distance !== undefined) {
                            dist = item.distance; // fallback if backend provides it
                        }
                        return { ...item, calculatedDistance: dist };
                    });

                    // Sort by closest first
                    itemsWithDistance.sort((a, b) => a.calculatedDistance - b.calculatedDistance);
                    setListings(itemsWithDistance);
                } else {
                    setError('Failed to load food listings.');
                }
            } catch (err) {
                console.error("Food fetch error:", err);
                setError('Network error while loading food listings.');
            } finally {
                setLoading(false);
            }
        };

        fetchFood();
    }, [location]);

    const handleClaim = async (id) => {
        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await fetch(`${baseUrl}/api/food/${id}/claim`, {
                method: 'PATCH',
            });
            const data = await response.json();

            if (data.success) {
                setListings(prev => prev.map(item => {
                    if (item.id === id) {
                        const newCount = (item.claimed_count || 0) + 1;
                        return {
                            ...item,
                            claimed_count: newCount,
                            claimed: true
                        };
                    }
                    return item;
                }));
            }
        } catch (err) {
            console.error("Claim error:", err);
        }
    };

    const isHalal = (item) => item.halal || item.is_halal || /halal/i.test(item.description || '') || /halal/i.test(item.title || '') || /halal/i.test(item.food_items || '');
    const isVegan = (item) => item.vegan || item.is_vegan || /vegan/i.test(item.description || '') || /vegan/i.test(item.title || '') || /vegan/i.test(item.food_items || '');
    const isDaily = (item) => item.recurring || item.is_recurring || /daily|everyday|recurring/i.test(item.description || '') || /daily/i.test(item.title || '') || /daily/i.test(item.available_time_window || '');

    const filteredListings = listings.filter(item => {
        if (filter === 'halal') return isHalal(item);
        if (filter === 'vegan') return isVegan(item);
        return true;
    });

    const checkIsSoon = (timeStr) => {
        if (!timeStr) return false;
        const lower = timeStr.toLowerCase();
        if (lower.includes('now') || lower.includes('soon') || lower.includes('immediately')) return true;

        const currentHour = new Date().getHours();
        const match = lower.match(/(\d{1,2})(?::\d{2})?\s*(am|pm)?/);
        if (match) {
            let hour = parseInt(match[1]);
            if (match[2] === 'pm' && hour < 12) hour += 12;
            if (match[2] === 'am' && hour === 12) hour = 0;

            let diff = hour - currentHour;
            // If it's within the next 2 hours, or it already started in the last hour
            if (diff >= -1 && diff <= 2) return true;
        }
        return false;
    };

    const hasFoodSoon = filteredListings.some(item => {
        const claimedCount = item.claimed_count || (item.claimed ? 1 : 0);
        const totalCount = item.total_count || 1;
        const isFullyClaimed = item.claimed || claimedCount >= totalCount;
        const timeWindow = item.available_time_window || item.pickup_time || "";
        return (!isFullyClaimed && checkIsSoon(timeWindow));
    });

    return (
        <div className="p-4 md:p-8 space-y-6 relative min-h-screen">
            {/* Premium Background Elements */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-900/20 via-[#030407] to-[#030407] pointer-events-none z-0"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4 mb-6">
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-4 rounded-2xl border border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.2)] flex-shrink-0 w-fit">
                    <Utensils className="text-green-400 w-8 h-8 md:w-10 md:h-10" />
                </div>
                <div>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                        Food <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">Rescue</span>
                    </h2>
                    <p className="text-gray-400 leading-relaxed text-sm md:text-lg mt-2 max-w-xl font-light">
                        Discover and claim surplus food from local restaurants and bakeries for free.
                    </p>
                </div>
            </div>

            {hasFoodSoon && !loading && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-start space-x-3 shadow-[0_4px_15px_rgba(34,197,94,0.1)]"
                >
                    <BellRing className="text-green-400 mt-0.5 shrink-0" size={20} />
                    <div>
                        <h4 className="text-green-400 font-bold text-sm">Food available soon!</h4>
                        <p className="text-green-500/80 text-xs mt-0.5">There are active donations in your area within the next 2 hours. Claim before they're gone.</p>
                    </div>
                </motion.div>
            )}

            {/* Filter Buttons */}
            <div className="relative z-10 flex space-x-3 overflow-x-auto pb-4 scrollbar-none pt-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors cursor-none ${filter === 'all'
                        ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                >
                    All Food
                </button>
                <button
                    onClick={() => setFilter('halal')}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center space-x-1 transition-colors cursor-none ${filter === 'halal'
                        ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                >
                    <Award size={14} />
                    <span>Halal only</span>
                </button>
                <button
                    onClick={() => setFilter('vegan')}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center space-x-1 transition-colors cursor-none ${filter === 'vegan'
                        ? 'bg-green-500 text-black shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                        : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                >
                    <Leaf size={14} />
                    <span>Vegan only</span>
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-500"></div>
                    <p className="text-gray-400 text-sm animate-pulse">Scanning local businesses for surplus food...</p>
                </div>
            ) : error ? (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl flex items-center">
                    <AlertTriangle className="mr-3" />
                    {error}
                </div>
            ) : filteredListings.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-16 px-4 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center"
                >
                    <div className="bg-white/5 p-4 rounded-full mb-4">
                        <Utensils className="opacity-40 text-white" size={40} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">No food available right now</h3>
                    <p className="text-gray-400 text-sm max-w-[250px]">
                        {filter === 'all'
                            ? "Local businesses haven't posted any surplus food today. Check back later."
                            : `We couldn't find any ${filter} listings at this moment.`}
                    </p>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {filteredListings.map(item => {
                            const calcdDist = item.calculatedDistance;
                            const distanceStr = calcdDist !== Infinity
                                ? (calcdDist < 1 ? '< 1 km' : `${calcdDist.toFixed(1)} km`)
                                : (item.location ? String(item.location) : 'Distance unknown');

                            const claimedCount = item.claimed_count || (item.claimed ? 1 : 0);
                            const totalCount = item.total_count || 1; // Default to 1 if not provided
                            const isFullyClaimed = item.claimed || claimedCount >= totalCount;
                            const progressPercentage = Math.min((claimedCount / totalCount) * 100, 100);

                            // Format business name and items
                            const bizName = item.business_name || item.title || "Local Business";
                            const itemsDesc = item.food_items || item.description || "Surplus food items";
                            const timeWindow = item.available_time_window || item.pickup_time || "Contact for time";

                            const halal = isHalal(item);
                            const vegan = isVegan(item);
                            const daily = isDaily(item);

                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="bg-[#0a0b10] border border-white/10 rounded-2xl p-5 relative overflow-hidden group hover:border-green-500/30 transition-colors"
                                >
                                    {/* Badges */}
                                    <div className="absolute top-5 right-5 flex flex-col items-end gap-2">
                                        {daily && (
                                            <div className="bg-purple-500/10 text-purple-400 text-xs px-2 py-1 rounded-md flex items-center border border-purple-500/20 font-medium">
                                                <Repeat size={12} className="mr-1" /> Daily
                                            </div>
                                        )}
                                        {halal && (
                                            <div className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded-md flex items-center border border-emerald-500/20 font-medium">
                                                <Award size={12} className="mr-1" /> Halal
                                            </div>
                                        )}
                                        {vegan && (
                                            <div className="bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded-md flex items-center border border-green-500/20 font-medium">
                                                <Leaf size={12} className="mr-1" /> Vegan
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold text-white pr-20">{bizName}</h3>
                                    <p className="text-gray-400 mt-1 mb-4 text-sm font-medium">{itemsDesc}</p>

                                    <div className="flex flex-col space-y-2 mb-5 text-sm text-gray-400 bg-white/5 p-3 rounded-xl border border-white/5">
                                        <div className="flex items-center">
                                            <Clock size={16} className="mr-3 text-green-500" />
                                            <span>{timeWindow}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <MapPin size={16} className="mr-3 text-green-500" />
                                            <span>{distanceStr}</span>
                                        </div>
                                    </div>

                                    {/* Progress bar */}
                                    <div className="mb-5">
                                        <div className="flex justify-between text-xs mb-1.5">
                                            <span className="text-gray-400 font-medium">Claimed Space</span>
                                            <span className="text-white font-bold">{claimedCount} / {totalCount}</span>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
                                            <div
                                                className="bg-green-500 h-full rounded-full transition-all duration-700 ease-out"
                                                style={{ width: `${progressPercentage}%` }}
                                            ></div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <button
                                        onClick={() => handleClaim(item.id)}
                                        disabled={isFullyClaimed}
                                        className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all cursor-none ${isFullyClaimed
                                            ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
                                            : 'bg-green-500 hover:bg-green-400 text-black shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_25px_rgba(34,197,94,0.4)]'
                                            }`}
                                    >
                                        {isFullyClaimed ? (
                                            <>
                                                <Check size={18} />
                                                <span>Fully Claimed</span>
                                            </>
                                        ) : (
                                            <>
                                                <Utensils size={18} />
                                                <span>I'm going</span>
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
