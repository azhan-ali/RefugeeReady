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
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex items-center space-x-3 mb-2">
                <Stethoscope className="text-teal-500" size={28} />
                <h2 className="text-2xl font-bold text-white">Find a Doctor</h2>
            </div>
            <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                Find medical professionals who speak your language and understand your needs. No German required.
            </p>

            {/* Filters Section */}
            <div className="bg-[#0a0b10] border border-white/10 rounded-2xl p-4 md:p-6 shadow-lg mb-6">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Filter By Need</h3>

                <div className="flex flex-wrap gap-2 mb-4">
                    {FILTER_LANGUAGES.map(l => (
                        <button
                            key={l}
                            onClick={() => setFilterLang(filterLang === l ? '' : l)}
                            className={`cursor-none px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${filterLang === l
                                    ? 'bg-teal-500 text-black border-teal-500'
                                    : 'bg-white/5 text-gray-300 border-white/10 hover:border-teal-500/50'
                                }`}
                        >
                            {LANGUAGE_FLAGS[l]} {l}
                        </button>
                    ))}
                </div>

                <div className="h-px bg-white/10 w-full mb-4"></div>

                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setFilterWomenOnly(!filterWomenOnly)}
                        className={`cursor-none flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${filterWomenOnly
                                ? 'bg-pink-500/20 text-pink-400 border-pink-500/50'
                                : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20'
                            }`}
                    >
                        👩 Female Doctor Only
                    </button>

                    <button
                        onClick={() => setFilterFree(!filterFree)}
                        className={`cursor-none flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${filterFree
                                ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'
                                : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20'
                            }`}
                    >
                        💛 Free Consultation
                    </button>

                    <button
                        onClick={() => setFilterIns(!filterIns)}
                        className={`cursor-none flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${filterIns
                                ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                                : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20'
                            }`}
                    >
                        ✅ Accepts Refugee Insurance
                    </button>
                </div>
            </div>

            {/* Results Area */}
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
                                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 to-teal-600"></div>

                                <div className="flex justify-between items-start mb-4 mt-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold text-xl shrink-0">
                                            {doc.full_name ? doc.full_name.charAt(0).toUpperCase() : <UserRound />}
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
                                    className="cursor-none mt-auto w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center space-x-2 transition-colors"
                                >
                                    <Phone size={18} />
                                    <span>Call Now</span>
                                </a>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
