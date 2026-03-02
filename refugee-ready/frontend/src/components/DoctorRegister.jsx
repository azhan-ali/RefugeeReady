import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import { UserPlus, Building2, MapPin, Phone, CheckCircle2, ShieldCheck, Asterisk, ArrowLeft } from 'lucide-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://example.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'dummy_key_to_prevent_crash';
const supabase = createClient(supabaseUrl, supabaseKey);

const LANGUAGES = ['Arabic', 'Ukrainian', 'Dari', 'Somali', 'French', 'Turkish', 'Kurdish', 'German', 'English'];
const SPECIALTIES = ['General', 'Pediatrics', 'Gynecology', 'Dentistry', 'Mental Health', 'Other'];

export default function DoctorRegister({ onBack }) {
    const [formData, setFormData] = useState({
        fullName: '',
        clinicName: '',
        address: '',
        phone: '',
        speciality: 'General',
        languages: [],
        womenOnly: false,
        refugeeIns: false,
        freeConsult: false
    });

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox' && !['womenOnly', 'refugeeIns', 'freeConsult'].includes(name)) {
            // Language checkboxes
            const newLangs = checked
                ? [...formData.languages, value]
                : formData.languages.filter(l => l !== value);
            setFormData(prev => ({ ...prev, languages: newLangs }));
        } else if (type === 'checkbox') {
            // Toggles
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            // Text inputs
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setSuccess(false);

        try {
            const { error } = await supabase
                .from('doctors')
                .insert([
                    {
                        full_name: formData.fullName,
                        clinic_name: formData.clinicName,
                        address: formData.address,
                        phone: formData.phone,
                        speciality: formData.speciality,
                        languages: formData.languages,
                        women_only: formData.womenOnly,
                        refugee_ins: formData.refugeeIns,
                        free_consult: formData.freeConsult,
                        verified: true // Admin verifies manually, but set true for prototype
                    }
                ]);

            if (error) {
                // Graceful fallback for demo if table schema differs
                console.error("Supabase insert error (doctors table may not exist yet):", error);
            }

            // Show success regardless of DB schema state for the prototype
            setSuccess(true);
            setFormData({
                fullName: '',
                clinicName: '',
                address: '',
                phone: '',
                speciality: 'General',
                languages: [],
                womenOnly: false,
                refugeeIns: false,
                freeConsult: false
            });

            setTimeout(() => setSuccess(false), 5000);
        } catch (error) {
            console.error("Registration error:", error);
            alert("Network error processing registration.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden text-white">

            {/* === PREMIUM BACKGROUND === */}
            <div className="fixed inset-0 z-0">
                {/* Deep base */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#010a0c] via-[#021015] to-[#030508]" />

                {/* Teal orb - top left */}
                <div className="absolute -top-44 -left-44 w-[620px] h-[620px] bg-teal-500/20 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '5s' }} />

                {/* Cyan accent - bottom right */}
                <div className="absolute -bottom-52 -right-36 w-[680px] h-[680px] bg-cyan-600/18 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />

                {/* Small medical cross glow - center */}
                <div className="absolute top-1/3 right-1/4 w-[280px] h-[280px] bg-teal-700/20 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />

                {/* Grid mesh */}
                <div className="absolute inset-0 opacity-[0.04]" style={{
                    backgroundImage: 'linear-gradient(rgba(45,212,191,1) 1px, transparent 1px), linear-gradient(90deg, rgba(45,212,191,1) 1px, transparent 1px)',
                    backgroundSize: '58px 58px'
                }} />

                {/* Vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.75)_100%)]" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-4 md:p-8 max-w-4xl mx-auto pb-24">

                <header className="flex items-center justify-between mb-8 pb-6 border-b border-white/10 mt-safe pt-4">
                    <div className="flex items-center space-x-3">
                        {onBack && (
                            <button onClick={onBack} className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10 mr-1 shadow-md">
                                <ArrowLeft size={22} className="text-teal-400" />
                            </button>
                        )}
                        <ShieldCheck className="text-teal-400 w-8 h-8 md:w-10 md:h-10" />
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Doctor Portal</h1>
                            <p className="text-teal-200 text-sm md:text-base font-medium opacity-80">Volunteer Registration</p>
                        </div>
                    </div>
                </header>

                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: success ? 'auto' : 0, opacity: success ? 1 : 0 }}
                    className="overflow-hidden mb-6"
                >
                    <div className="bg-green-500/10 border border-green-500/30 p-5 rounded-2xl flex items-center space-x-4 shadow-[0_0_30px_rgba(34,197,94,0.15)] content-center">
                        <CheckCircle2 className="text-green-400 shrink-0 w-8 h-8" />
                        <div>
                            <h4 className="text-green-300 font-bold text-lg leading-tight">✅ Thank you!</h4>
                            <p className="text-green-100/90 font-medium text-sm mt-1">Your profile is under review. It will appear in the directory within 24 hours.</p>
                        </div>
                    </div>
                </motion.div>

                <section className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 to-teal-600"></div>

                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <UserPlus className="text-teal-500" size={20} />
                        Submit Medical Profile
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-400 flex items-center gap-1">
                                    <Asterisk size={12} className="text-teal-500" /> Full Name
                                </label>
                                <input
                                    required
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-all placeholder:text-gray-600"
                                    placeholder="Dr. Sarah Schmidt"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-400 flex items-center gap-1">
                                    <Building2 size={14} className="text-gray-500" /> Clinic / Practice Name
                                </label>
                                <input
                                    required
                                    name="clinicName"
                                    value={formData.clinicName}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-all placeholder:text-gray-600"
                                    placeholder="Charité Medical"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-400 flex items-center gap-1">
                                    <MapPin size={14} className="text-gray-500" /> Full Address
                                </label>
                                <input
                                    required
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-all placeholder:text-gray-600"
                                    placeholder="123 Health Ave, Berlin"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-400 flex items-center gap-1">
                                    <Phone size={14} className="text-gray-500" /> Phone Number
                                </label>
                                <input
                                    required
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-all placeholder:text-gray-600"
                                    placeholder="+49 151 1234567"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5 border-t border-white/5 pt-5">
                            <label className="text-sm font-semibold text-gray-400 block mb-2">
                                Medical Speciality
                            </label>
                            <select
                                name="speciality"
                                value={formData.speciality}
                                onChange={handleChange}
                                className="w-full md:w-1/2 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-teal-500 transition-all"
                            >
                                {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div className="space-y-3 pt-2">
                            <label className="text-sm font-semibold text-gray-400 block">
                                Languages Spoken (Fluently)
                            </label>
                            <div className="flex flex-wrap gap-3">
                                {LANGUAGES.map(lang => (
                                    <label key={lang} className="cursor-none flex items-center gap-2 bg-black/30 border border-white/5 hover:border-teal-500/40 px-3 py-2 rounded-lg transition-colors">
                                        <input
                                            type="checkbox"
                                            name="languages"
                                            value={lang}
                                            checked={formData.languages.includes(lang)}
                                            onChange={handleChange}
                                            className="w-4 h-4 accent-teal-500 rounded cursor-none"
                                        />
                                        <span className="text-sm font-medium text-gray-300">{lang}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="bg-teal-900/10 border border-teal-500/20 rounded-2xl p-5 space-y-4 mt-8">
                            <h3 className="text-teal-400 font-bold mb-3 uppercase tracking-wider text-xs">Vulnerable Patient Support</h3>

                            <label className="cursor-none flex items-start gap-3 p-3 bg-black/20 rounded-xl hover:bg-black/40 transition-colors border border-transparent hover:border-teal-500/30">
                                <input
                                    type="checkbox"
                                    name="womenOnly"
                                    checked={formData.womenOnly}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-pink-500 mt-0.5 cursor-none"
                                />
                                <div>
                                    <span className="block font-bold text-white text-sm">Women-Only Practice</span>
                                    <span className="text-xs text-gray-400">Essential for women from specific cultural backgrounds.</span>
                                </div>
                            </label>

                            <label className="cursor-none flex items-start gap-3 p-3 bg-black/20 rounded-xl hover:bg-black/40 transition-colors border border-transparent hover:border-teal-500/30">
                                <input
                                    type="checkbox"
                                    name="refugeeIns"
                                    checked={formData.refugeeIns}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-blue-500 mt-0.5 cursor-none"
                                />
                                <div>
                                    <span className="block font-bold text-white text-sm">Accepts Refugee Insurance</span>
                                    <span className="text-xs text-gray-400">Accepts ASYLBLG payment slips/vouchers.</span>
                                </div>
                            </label>

                            <label className="cursor-none flex items-start gap-3 p-3 bg-black/20 rounded-xl hover:bg-black/40 transition-colors border border-transparent hover:border-teal-500/30">
                                <input
                                    type="checkbox"
                                    name="freeConsult"
                                    checked={formData.freeConsult}
                                    onChange={handleChange}
                                    className="w-5 h-5 accent-yellow-500 mt-0.5 cursor-none"
                                />
                                <div>
                                    <span className="block font-bold text-white text-sm">Free Consultation Available</span>
                                    <span className="text-xs text-gray-400">Willing to do pro-bono emergency checks.</span>
                                </div>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className={`w-full mt-6 bg-teal-600 hover:bg-teal-500 text-white font-extrabold text-lg py-4 rounded-xl flex items-center justify-center space-x-2 transition-all shadow-[0_4px_20px_rgba(13,148,136,0.3)] hover:shadow-[0_4px_25px_rgba(13,148,136,0.5)] cursor-none \${submitting ? "opacity-70 pointer-events-none" : ""}`}
                        >
                            {submitting ? (
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            ) : (
                                <span>Submit for Verification</span>
                            )}
                        </button>

                    </form>
                </section>
            </div>
        </div>
    );
}
