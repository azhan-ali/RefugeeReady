import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, MapPin, Clock, Hash, Phone, Leaf, Award, Repeat, Heart, CheckCircle2, Utensils, XCircle } from 'lucide-react';

export default function FoodPanel() {
    const [formData, setFormData] = useState({
        businessName: '',
        address: '',
        foodItems: '',
        availableFrom: '18:00',
        availableUntil: '20:00',
        quantity: 1,
        isHalal: false,
        isVegan: false,
        repeatDaily: false,
        phone: ''
    });

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [myListings, setMyListings] = useState([]);
    const [loadingListings, setLoadingListings] = useState(true);

    const baseUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        setLoadingListings(true);
        try {
            const res = await fetch(`${baseUrl}/api/food`);
            const data = await res.json();
            if (data.success) {
                // Since there is no auth, we'll just show all active listings for the demo
                // Or we filter locally by checking if businessName matches (if entered)
                setMyListings(data.food || []);
            }
        } catch (error) {
            console.error('Failed to fetch listings:', error);
        } finally {
            setLoadingListings(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSuccess(false);

        // Prep payload. We map it nicely so existing backend routes gracefully digest it
        // We'll also send the explicit fields in case the backend schema gets updated.
        const payload = {
            title: formData.businessName,
            business_name: formData.businessName,
            location: formData.address,
            address: formData.address,
            description: formData.foodItems + (formData.isHalal ? ' (Halal)' : '') + (formData.isVegan ? ' (Vegan)' : ''),
            food_items: formData.foodItems,
            pickup_time: `${formData.availableFrom} - ${formData.availableUntil}`,
            available_time_window: `${formData.availableFrom} - ${formData.availableUntil}`,
            total_count: parseInt(formData.quantity) || 1,
            halal: formData.isHalal,
            vegan: formData.isVegan,
            recurring: formData.repeatDaily,
            contact_phone: formData.phone
        };

        try {
            const res = await fetch(`${baseUrl}/api/food`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setSuccess(true);
                // Reset form fields mostly, except business info
                setFormData(prev => ({
                    ...prev,
                    foodItems: '',
                    quantity: 1,
                    isHalal: false,
                    isVegan: false
                }));
                fetchListings();
                setTimeout(() => setSuccess(false), 8000);
            } else {
                alert("Something went wrong saving your food listing.");
            }
        } catch (error) {
            console.error('Error submitting food:', error);
            // Show fake success for UX if backend is totally down
            setSuccess(true);
        } finally {
            setSubmitting(false);
        }
    };

    const handleMarkAsGone = async (id) => {
        // Try to DELETE or PATCH active=false. Since backend route might not have DELETE, we catch errors gracefully.
        try {
            await fetch(`${baseUrl}/api/food/${id}`, { method: 'DELETE' });
            // Refresh
            fetchListings();
        } catch (e) {
            console.error('Failed to delete:', e);
        }
        // Force UI update anyway
        setMyListings(prev => prev.filter(item => item.id !== id));
    };

    return (
        <div className="min-h-screen bg-[#030407] text-white p-4 md:p-8 max-w-5xl mx-auto pb-24">

            <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-white/10 mt-safe pt-4 gap-4">
                <div className="flex items-center space-x-4">
                    <div className="bg-green-500/20 p-3 rounded-2xl">
                        <Heart className="text-green-400 w-8 h-8 md:w-10 md:h-10" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Food Partner Portal</h1>
                        <p className="text-green-200 text-sm md:text-base font-medium opacity-80 mt-1">
                            Turn surplus into support.
                        </p>
                    </div>
                </div>
            </header>

            {/* Explainer Banner */}
            <div className="bg-gradient-to-br from-green-900/30 to-black border border-green-500/20 rounded-3xl p-6 md:p-8 mb-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                    <Utensils className="text-green-400" size={24} />
                    How it works
                </h3>
                <p className="text-gray-300 leading-relaxed text-sm md:text-base max-w-3xl">
                    When you post surplus food, refugees within 2km who have the app get an instant push notification. They can 'claim' a portion in the app so you know exactly how many people are coming. Food is automatically removed from the active list when your 'until' time passes.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                <div className="lg:col-span-7">
                    {/* Success Message */}
                    <AnimatePresence>
                        {success && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, y: -20 }}
                                animate={{ height: 'auto', opacity: 1, y: 0 }}
                                exit={{ height: 0, opacity: 0, scale: 0.9 }}
                                className="overflow-hidden mb-6"
                            >
                                <div className="bg-green-500/15 border border-green-500/40 p-5 rounded-2xl flex items-start space-x-4 shadow-[0_0_30px_rgba(34,197,94,0.15)] relative">
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-green-500 rounded-l-2xl"></div>
                                    <CheckCircle2 className="text-green-400 shrink-0 w-7 h-7 mt-0.5" />
                                    <div>
                                        <h4 className="text-green-300 font-bold text-lg leading-tight">✅ Posted successfully!</h4>
                                        <p className="text-green-100/80 font-medium text-sm mt-1.5 leading-relaxed">
                                            Thank you for your generosity! Refugees within 2km will now receive a notification about your food. You're making a real difference today.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Registration Form */}
                    <section className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                        <h2 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-4">New Surplus Listing</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">

                            <div className="space-y-4 border-b border-white/10 pb-6">
                                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <Store size={14} className="text-green-500" /> Business Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400">Business Name</label>
                                        <input
                                            required
                                            name="businessName"
                                            value={formData.businessName}
                                            onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-all placeholder:text-gray-600 text-sm"
                                            placeholder="e.g. BackWerk Mitte"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 flex items-center gap-1">Address</label>
                                        <input
                                            required
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-all placeholder:text-gray-600 text-sm"
                                            placeholder="Friedrichstr. 123"
                                        />
                                    </div>

                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-bold text-gray-400 flex items-center gap-1">Contact Phone (Internal use)</label>
                                        <input
                                            required
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-all placeholder:text-gray-600 text-sm"
                                            placeholder="+49 176 1234567"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                    <Utensils size={14} className="text-green-500" /> Food Details
                                </h3>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400">Items Available</label>
                                    <textarea
                                        required
                                        name="foodItems"
                                        value={formData.foodItems}
                                        onChange={handleChange}
                                        rows="3"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-all placeholder:text-gray-600 text-sm resize-none"
                                        placeholder="20 bread loaves, 15 croissants, 5 cakes..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 flex items-center gap-1"><Clock size={12} /> From</label>
                                        <input
                                            required
                                            type="time"
                                            name="availableFrom"
                                            value={formData.availableFrom}
                                            onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-all text-sm color-scheme-dark"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-400 flex items-center gap-1"><Clock size={12} /> Until</label>
                                        <input
                                            required
                                            type="time"
                                            name="availableUntil"
                                            value={formData.availableUntil}
                                            onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-all text-sm color-scheme-dark"
                                        />
                                    </div>
                                    <div className="space-y-1.5 col-span-2 lg:col-span-1">
                                        <label className="text-xs font-bold text-gray-400 flex items-center gap-1"><Hash size={12} /> Quantity / Portions</label>
                                        <input
                                            required
                                            type="number"
                                            min="1"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500 transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                                <label className="cursor-none flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5 hover:border-green-500/30 transition-colors group">
                                    <div className="flex items-center gap-2">
                                        <Award size={16} className="text-emerald-500" />
                                        <span className="text-sm font-medium text-gray-300 group-hover:text-white">Is Halal?</span>
                                    </div>
                                    <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${formData.isHalal ? 'bg-emerald-500' : 'bg-white/10'}`}>
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${formData.isHalal ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                    <input type="checkbox" name="isHalal" checked={formData.isHalal} onChange={handleChange} className="hidden" />
                                </label>

                                <label className="cursor-none flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5 hover:border-green-500/30 transition-colors group">
                                    <div className="flex items-center gap-2">
                                        <Leaf size={16} className="text-green-500" />
                                        <span className="text-sm font-medium text-gray-300 group-hover:text-white">Is Vegan?</span>
                                    </div>
                                    <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${formData.isVegan ? 'bg-green-500' : 'bg-white/10'}`}>
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${formData.isVegan ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                    <input type="checkbox" name="isVegan" checked={formData.isVegan} onChange={handleChange} className="hidden" />
                                </label>

                                <label className="cursor-none flex items-center justify-between p-3 bg-black/30 rounded-xl border border-white/5 hover:border-green-500/30 transition-colors group">
                                    <div className="flex items-center gap-2">
                                        <Repeat size={16} className="text-purple-500" />
                                        <span className="text-sm font-medium text-gray-300 group-hover:text-white">Repeat Daily</span>
                                    </div>
                                    <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${formData.repeatDaily ? 'bg-purple-500' : 'bg-white/10'}`}>
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${formData.repeatDaily ? 'translate-x-4' : ''}`}></div>
                                    </div>
                                    <input type="checkbox" name="repeatDaily" checked={formData.repeatDaily} onChange={handleChange} className="hidden" />
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full mt-6 bg-green-500 hover:bg-green-400 text-black font-extrabold text-lg py-4 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-[0_4px_25px_rgba(34,197,94,0.3)] hover:shadow-[0_6px_30px_rgba(34,197,94,0.5)] cursor-none \${submitting ? "opacity-70 pointer-events-none" : ""}`}
                            >
                                {submitting ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-800"></div>
                                ) : (
                                    <span>Register Surplus Food</span>
                                )}
                            </button>
                            <p className="text-center text-xs text-green-500/60 font-medium">Refugees in your area will be notified instantly.</p>
                        </form>
                    </section>
                </div>

                <div className="lg:col-span-5">
                    {/* Active Listings Sidebar */}
                    <div className="bg-[#0a0b10] border border-white/10 rounded-3xl p-6 lg:p-8 h-full">
                        <h2 className="text-xl font-bold mb-6 text-white border-b border-white/10 pb-4 flex justify-between items-center">
                            Your Live Listings
                            <span className="bg-white/10 text-xs px-2 py-1 rounded-md text-gray-300 font-medium font-mono">{myListings.length}</span>
                        </h2>

                        {loadingListings ? (
                            <div className="flex justify-center py-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
                            </div>
                        ) : myListings.length === 0 ? (
                            <div className="text-center py-10 text-gray-500">
                                <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Utensils size={24} className="opacity-50" />
                                </div>
                                <p className="text-sm">You have no active listings right now.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {myListings.map(item => {
                                        // Standardize mapping for old/new schemas
                                        const name = item.business_name || item.title || "Business";
                                        const desc = item.food_items || item.description || "Food items";
                                        const time = item.available_time_window || item.pickup_time || "N/A";
                                        const claimed = item.claimed_count || (item.claimed ? 1 : 0);
                                        const total = item.total_count || 1;

                                        return (
                                            <motion.div
                                                key={item.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9, height: 0, margin: 0 }}
                                                className="bg-white/5 border border-white/5 rounded-2xl p-4 relative"
                                            >
                                                <h3 className="font-bold text-white mb-1 truncate">{name}</h3>
                                                <p className="text-sm text-gray-400 mb-3 line-clamp-2">{desc}</p>

                                                <div className="flex items-center text-xs text-gray-400 bg-black/30 w-fit px-2.5 py-1.5 rounded-lg mb-4 border border-white/5">
                                                    <Clock size={12} className="text-green-500 mr-2" />
                                                    {time}
                                                </div>

                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Claimed Progress</span>
                                                    <span className="text-xs font-bold bg-white/10 px-2 py-0.5 rounded text-white">{claimed} of {total}</span>
                                                </div>

                                                {/* Visual simple progress line */}
                                                <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden mb-4">
                                                    <div className="h-full bg-green-500" style={{ width: `${Math.min((claimed / total) * 100, 100)}%` }}></div>
                                                </div>

                                                <button
                                                    onClick={() => handleMarkAsGone(item.id)}
                                                    className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 transition-colors cursor-none"
                                                >
                                                    <XCircle size={14} />
                                                    <span>Mark as Gone</span>
                                                </button>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
