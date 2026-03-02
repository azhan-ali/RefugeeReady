import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Stethoscope, Phone, MapPin, UserRound, ShieldCheck, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'dummy_key_to_prevent_crash';
const supabase = createClient(supabaseUrl, supabaseKey);

const LANGUAGE_FLAGS = {
    'Arabic': '🇸🇾',
    'Ukrainian': '🇺🇦',
    'Dari': '🇦🇫',
    'Somali': '🇸🇴',
    'French': '🇫🇷',
    'Turkish': '🇹🇷',
    'Kurdish': '☀️',
    'German': '🇩🇪',
    'English': '🇬🇧'
};

const FILTER_LANGUAGES = ['Arabic', 'Ukrainian', 'Dari', 'Somali', 'French', 'Kurdish', 'Turkish'];

export default function DoctorDirectory({ location, lang }) {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filterLang, setFilterLang] = useState('');
    const [filterWomenOnly, setFilterWomenOnly] = useState(false);
    const [filterFree, setFilterFree] = useState(false);
    const [filterIns, setFilterIns] = useState(false);

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('doctors')
                .select('*')
                .eq('verified', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDoctors(data || []);
        } catch (error) {
            console.error('Error fetching doctors:', error);
            // Ignore error strictly, as we might not have the table actually set up
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredDoctors = doctors.filter(doc => {
        if (filterLang && (!doc.languages || !doc.languages.includes(filterLang))) return false;
        if (filterWomenOnly && !doc.women_only) return false;
        if (filterFree && !doc.free_consult) return false;
        if (filterIns && !doc.refugee_ins) return false;
        return true;
    });

    return (
        <div className="p-4 md:p-8 space-y-6 relative min-h-screen">
            {/* Premium Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#010c10] via-[#021215] to-[#030407]" />
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-teal-500/22 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '5s' }} />
                <div className="absolute -bottom-40 -left-36 w-[560px] h-[560px] bg-blue-700/18 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '7s', animationDelay: '2s' }} />
                <div className="absolute top-1/2 right-1/4 w-[300px] h-[300px] bg-cyan-800/20 rounded-full blur-[85px] animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(20,184,166,1) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,1) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)]" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4 mb-6">
                <div className="bg-gradient-to-br from-teal-500/20 to-blue-500/20 p-4 rounded-2xl border border-teal-500/30 shadow-[0_0_30px_rgba(20,184,166,0.2)] flex-shrink-0 w-fit">
                    <Stethoscope className="text-teal-400 w-8 h-8 md:w-10 md:h-10" />
                </div>
                <div>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                        Doctor <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">Directory</span>
                    </h2>
                    <p className="text-gray-400 leading-relaxed text-sm md:text-lg mt-2 max-w-xl font-light">
                        Find top-rated medical professionals who speak your language. No German required.
                    </p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="relative z-10 bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-5 md:p-8 shadow-2xl mb-8 overflow-hidden">
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
                    Filter Specialists
                </h3>

                <div className="flex flex-wrap gap-2.5 mb-5">
                    {FILTER_LANGUAGES.map(l => (
                        <button
                            key={l}
                            onClick={() => setFilterLang(filterLang === l ? '' : l)}
                            className={`cursor-none px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border shadow-lg ${filterLang === l
                                ? 'bg-gradient-to-r from-teal-500 to-teal-400 text-black border-teal-400 scale-105 shadow-[0_0_20px_rgba(20,184,166,0.4)]'
                                : 'bg-white/5 text-gray-300 border-white/10 hover:border-teal-500/50 hover:bg-white/10'
                                }`}
                        >
                            {LANGUAGE_FLAGS[l]} <span className="ml-1">{l}</span>
                        </button>
                    ))}
                </div>

                <div className="h-px bg-gradient-to-r from-white/0 via-white/10 to-white/0 w-full mb-5"></div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setFilterWomenOnly(!filterWomenOnly)}
                        className={`cursor-none flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 border shadow-lg ${filterWomenOnly
                            ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                            : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20 hover:bg-white/10'
                            }`}
                    >
                        <span className="text-lg">👩</span> Female Only
                    </button>

                    <button
                        onClick={() => setFilterFree(!filterFree)}
                        className={`cursor-none flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 border shadow-lg ${filterFree
                            ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-500 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.3)]'
                            : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20 hover:bg-white/10'
                            }`}
                    >
                        <span className="text-lg">💛</span> Free Consult
                    </button>

                    <button
                        onClick={() => setFilterIns(!filterIns)}
                        className={`cursor-none flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 border shadow-lg ${filterIns
                            ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                            : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20 hover:bg-white/10'
                            }`}
                    >
                        <ShieldCheck size={18} className={filterIns ? "text-blue-400" : "text-gray-400"} /> Accepts State Insurance
                    </button>
                </div>
            </div>

            {/* Results Area */}
            <div className="relative z-10">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-white/10 border-t-teal-500"></div>
                    </div>
                ) : filteredDoctors.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 p-8 rounded-3xl text-center flex flex-col items-center shadow-lg">
                        <div className="bg-white/5 p-4 rounded-full mb-4">
                            <Info className="text-gray-500" size={32} />
                        </div>
                        <h3 className="text-white font-bold text-lg mb-2">No doctors match these filters yet</h3>
                        <p className="text-gray-400 text-sm max-w-sm mx-auto">
                            The directory is growing quickly as more volunteer doctors join. Please try adjusting your filters or check back soon.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <AnimatePresence>
                            {filteredDoctors.map(doc => (
                                <motion.div
                                    key={doc.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-[#0a0b10] border border-white/10 rounded-3xl p-5 shadow-lg flex flex-col relative overflow-hidden group hover:border-teal-500/30 transition-colors"
                                >
                                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 to-blue-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl group-hover:bg-teal-500/20 transition-all duration-500"></div>

                                    <div className="relative z-10 flex justify-between items-start mb-5 mt-2">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-extrabold text-2xl shrink-0 shadow-inner">
                                                {doc.full_name ? doc.full_name.charAt(0).toUpperCase() : <UserRound size={28} />}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                    {doc.full_name}
                                                    <ShieldCheck size={16} className="text-blue-400" />
                                                </h3>
                                                <p className="text-teal-400 text-sm font-medium">{doc.speciality}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-5">
                                        <div className="flex items-start gap-2 text-sm text-gray-300 bg-white/5 p-2 rounded-lg border border-white/5">
                                            <MapPin size={16} className="text-gray-500 shrink-0 mt-0.5" />
                                            <span>
                                                <strong className="text-white block">{doc.clinic_name}</strong>
                                                {doc.address}
                                            </span>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {(doc.languages || []).map(l => (
                                                <span key={l} className="bg-white/10 text-white text-xs px-2.5 py-1 rounded-md font-medium border border-white/10 shadow-sm flex items-center gap-1.5">
                                                    {LANGUAGE_FLAGS[l] || '🌐'} {l}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-5">
                                        {doc.women_only && (
                                            <span className="bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[10px] uppercase font-bold px-2 py-1 rounded">
                                                Women Only
                                            </span>
                                        )}
                                        {doc.free_consult && (
                                            <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] uppercase font-bold px-2 py-1 rounded">
                                                Free
                                            </span>
                                        )}
                                        {doc.refugee_ins && (
                                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] uppercase font-bold px-2 py-1 rounded">
                                                Refugee Insurance
                                            </span>
                                        )}
                                    </div>

                                    <a
                                        href={`tel:${doc.phone}`}
                                        className="cursor-none relative z-10 mt-auto w-full bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 shadow-[0_5px_15px_rgba(13,148,136,0.3)] hover:shadow-[0_8px_25px_rgba(13,148,136,0.5)] transform hover:-translate-y-0.5"
                                    >
                                        <Phone size={20} className="animate-pulse" />
                                        <span className="text-[15px] tracking-wide uppercase">Call Clinic Now</span>
                                    </a>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
