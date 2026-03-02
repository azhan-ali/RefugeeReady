import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, PlusCircle, Trash2, Home, User, Clock, CheckCircle2, AlertTriangle, MessageSquare, Phone, MapPin, ArrowLeft } from 'lucide-react';

export default function HostPanel({ onBack }) {
    const [formData, setFormData] = useState({
        shelterName: '',
        address: '',
        capacity: 1,
        notes: '',
        availableUntil: '',
        contactPhone: ''
    });

    const [submitting, setSubmitting] = useState(false);
    const [activeListings, setActiveListings] = useState([]);
    const [showSuccess, setShowSuccess] = useState(false);

    // In a real app, this would fetch from GET /api/beds where host_id = current_user
    // For demo purposes, we append locally after successful POST

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setShowSuccess(false);

        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await fetch(`${baseUrl}/api/beds`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    location: `${formData.shelterName}, ${formData.address}`,
                    capacity: Number(formData.capacity),
                    notes: formData.notes,
                    contact_info: formData.contactPhone,
                    available: true,
                    // valid_until: formData.availableUntil (Add this to backend ultimately)
                })
            });

            const data = await response.json();

            if (data.success) {
                setShowSuccess(true);
                // Prepend to active listings locally for demo feedback 
                setActiveListings(prev => [{
                    id: data.bed.id,
                    ...formData
                }, ...prev]);

                // Reset form
                setFormData({
                    shelterName: '',
                    address: '',
                    capacity: 1,
                    notes: '',
                    availableUntil: '',
                    contactPhone: ''
                });

                setTimeout(() => setShowSuccess(false), 5000);
            } else {
                alert("Failed to post beds.");
            }
        } catch (error) {
            console.error("Post error:", error);
            alert("Network error.");
        } finally {
            setSubmitting(false);
        }
    };

    const removeListing = async (id) => {
        try {
            const baseUrl = import.meta.env.VITE_BACKEND_URL;
            const response = await fetch(`${baseUrl}/api/beds/${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.success) {
                setActiveListings(prev => prev.filter(listing => listing.id !== id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-[#030407] text-white p-4 md:p-8 max-w-4xl mx-auto">

            {/* Header */}
            <header className="flex items-center justify-between mb-8 pb-6 border-b border-white/10 mt-safe pt-4">
                <div className="flex items-center space-x-3">
                    {onBack && (
                        <button onClick={onBack} className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10 mr-1 shadow-md">
                            <ArrowLeft size={22} className="text-orange-400" />
                        </button>
                    )}
                    <ShieldCheck className="text-orange-500 w-8 h-8 md:w-10 md:h-10" />
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Host Dashboard</h1>
                        <p className="text-orange-200 text-sm md:text-base font-medium opacity-80">Emergency Shelter Network</p>
                    </div>
                </div>
                <div className="bg-orange-500/10 text-orange-400 px-3 py-1.5 rounded-full text-xs font-bold border border-orange-500/20 flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    Live System
                </div>
            </header>

            {/* Success Banner */}
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: showSuccess ? 'auto' : 0, opacity: showSuccess ? 1 : 0 }}
                className="overflow-hidden mb-6"
            >
                <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-2xl flex items-center space-x-3 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
                    <CheckCircle2 className="text-green-400 shrink-0" size={24} />
                    <span className="text-green-100 font-medium">✅ Your beds are now showing on the map for refugees in your area!</span>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Form Section */}
                <section>
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden">

                        {/* Orange top accent */}
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-400 to-orange-600"></div>

                        <h2 className="text-xl font-bold mb-6 flex items-center">
                            <PlusCircle className="mr-2 text-orange-500" size={20} />
                            Post Available Beds
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-1 flex items-center gap-1">
                                    <Home size={14} /> Shelter/Host Name
                                </label>
                                <input
                                    required
                                    name="shelterName"
                                    value={formData.shelterName}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-gray-600"
                                    placeholder="e.g. St. Jude Emergency Ward"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-1 flex items-center gap-1">
                                    <MapPin size={14} /> Exact Address
                                </label>
                                <input
                                    required
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all placeholder:text-gray-600"
                                    placeholder="e.g. 123 Main St, Berlin"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-1 flex items-center gap-1">
                                        <User size={14} /> Beds Available
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        name="capacity"
                                        value={formData.capacity}
                                        onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all text-xl font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-400 mb-1 flex items-center gap-1">
                                        <Clock size={14} /> Available Until
                                    </label>
                                    <input
                                        required
                                        type="time"
                                        name="availableUntil"
                                        value={formData.availableUntil}
                                        onChange={handleChange}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-1 flex items-center gap-1">
                                    <MessageSquare size={14} /> Special Notes
                                </label>
                                <input
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all placeholder:text-gray-600"
                                    placeholder="e.g. Women-only space, Halal food available"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-400 mb-1 flex items-center gap-1">
                                    <Phone size={14} /> Contact Phone
                                </label>
                                <input
                                    required
                                    type="tel"
                                    name="contactPhone"
                                    value={formData.contactPhone}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 transition-all placeholder:text-gray-600"
                                    placeholder="+49 151 1234567"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full mt-4 bg-orange-500 hover:bg-orange-400 text-black font-extrabold text-lg py-4 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-[0_4px_20px_rgba(249,115,22,0.3)] hover:shadow-[0_4px_25px_rgba(249,115,22,0.5)] cursor-none \${submitting ? "opacity-70 pointer-events-none" : ""}`}
                            >
                                {submitting ? (
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
                                ) : (
                                    <span>Post Available Beds — Goes Live Instantly</span>
                                )}
                            </button>

                            <p className="text-center text-xs text-gray-500 mt-3 italic flex items-center justify-center gap-1">
                                <AlertTriangle size={12} /> Posts exist in real-time across the refugee network.
                            </p>
                        </form>
                    </div>
                </section>

                {/* Active Listings Section */}
                <section>
                    <div className="bg-transparent lg:bg-white/5 border-none lg:border lg:border-white/10 rounded-3xl lg:p-6 lg:min-h-full">
                        <h2 className="text-xl font-bold mb-4 flex items-center px-2 lg:px-0">
                            Active Listings <span className="ml-2 bg-white/10 text-xs px-2 py-0.5 rounded-full">{activeListings.length}</span>
                        </h2>

                        {activeListings.length === 0 ? (
                            <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center opacity-70">
                                <Home className="text-gray-600 w-16 h-16 mb-4" />
                                <p className="text-gray-400 max-w-[200px]">You have no active emergency beds listed currently.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {activeListings.map((listing) => (
                                    <motion.div
                                        key={listing.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-[#0a0b10] border border-orange-500/20 rounded-2xl p-4 flex flex-col shadow-lg relative overflow-hidden"
                                    >
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-orange-500/20 to-transparent pointer-events-none"></div>

                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-lg text-white leading-tight">{listing.shelterName}</h3>
                                                <p className="text-xs text-gray-400 flex items-center mt-1">
                                                    <MapPin size={10} className="mr-1 text-orange-400" /> {listing.address}
                                                </p>
                                            </div>
                                            <div className="bg-orange-500/10 border border-orange-500/20 rounded-md px-2 py-1 flex items-center">
                                                <span className="text-orange-400 font-bold text-lg mr-1">{listing.capacity}</span>
                                                <span className="text-[9px] uppercase font-bold text-orange-200">Beds</span>
                                            </div>
                                        </div>

                                        <div className="text-xs text-gray-300 bg-white/5 p-2 rounded-lg mb-3 border border-white/5 line-clamp-2">
                                            <span className="font-semibold text-orange-400">Notes:</span> {listing.notes || "None"}
                                        </div>

                                        <div className="flex justify-between items-center mt-auto border-t border-white/5 pt-3">
                                            <span className="text-xs bg-black/40 px-2 py-1 rounded text-gray-400 flex items-center">
                                                <Clock size={10} className="mr-1 shrink-0" /> Until {listing.availableUntil}
                                            </span>
                                            <button
                                                onClick={() => removeListing(listing.id)}
                                                className="text-red-400 hover:text-red-300 text-xs font-bold uppercase tracking-wider flex items-center transition-colors cursor-none py-1 px-2 rounded hover:bg-red-500/10"
                                            >
                                                <Trash2 size={12} className="mr-1" />
                                                Remove
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
}
