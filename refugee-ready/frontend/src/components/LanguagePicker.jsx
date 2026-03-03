import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Globe2, ChevronRight, Github, Star, GitFork, Heart } from 'lucide-react';

const languages = [
    { code: 'ar', name: 'عربي', label: 'Arabic', flag: '🇸🇾' },
    { code: 'uk', name: 'Українська', label: 'Ukrainian', flag: '🇺🇦' },
    { code: 'fa-AF', name: 'دری', label: 'Dari', flag: '🇦🇫' },
    { code: 'so', name: 'Soomaali', label: 'Somali', flag: '🇸🇴' },
    { code: 'fr', name: 'Français', label: 'French', flag: '🇫🇷' },
    { code: 'tr', name: 'Türkçe', label: 'Turkish', flag: '🇹🇷' },
    { code: 'ku', name: 'Kurdî', label: 'Kurdish', flag: '☀️' },
    { code: 'ti', name: 'ትግርኛ', label: 'Tigrinya', flag: '🇪🇷' },
    { code: 'en', name: 'English', label: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', label: 'German', flag: '🇩🇪' }
];

export default function LanguagePicker({ onSelectLanguage }) {
    const { t, i18n } = useTranslation();

    const handleSelect = (code) => {
        i18n.changeLanguage(code);
        onSelectLanguage(code);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: 20 },
        show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-black overflow-hidden relative selection:bg-accentOrg selection:text-white">

            {/* LEFT COLUMN */}
            <div className="w-full md:w-5/12 h-[45vh] md:h-screen relative flex flex-col justify-center px-8 md:px-16 border-b md:border-b-0 md:border-r border-white/10 z-10 bg-[#030407]">
                <div className="absolute inset-0 bg-grid-pattern opacity-50 z-0 mix-blend-screen pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accentOrg/20 rounded-full blur-[120px] pointer-events-none"></div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="relative z-10"
                >
                    <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-6 backdrop-blur-md">
                        <Globe2 className="w-4 h-4 text-accentCyan" />
                        <span className="text-sm font-medium tracking-widest text-gray-300 uppercase">Global Access</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold premium-gradient-text tracking-tighter mb-4 leading-tight">
                        Refugee<br /><span className="text-accentOrg text-glow">Ready.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 font-light mt-4 max-w-sm leading-relaxed">
                        {t('languagePicker.subtitle', 'Select your language to begin securing your essential resources.')}
                    </p>
                </motion.div>

                {/* Open Source GitHub Button */}
                <motion.a
                    href="https://github.com/azhan-ali/RefugeeReady"
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="absolute bottom-8 left-8 md:bottom-10 md:left-16 z-10 group flex flex-col gap-2"
                >
                    {/* Main GitHub Button */}
                    <div className="relative flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-accentOrg/50 rounded-xl px-4 py-3 transition-all duration-300 backdrop-blur-md overflow-hidden cursor-pointer">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-accentOrg/0 to-accentOrg/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute -inset-1 bg-accentOrg/20 blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 rounded-xl" />

                        <div className="relative z-10 flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/10 group-hover:bg-accentOrg/20 rounded-lg flex items-center justify-center transition-all duration-300 border border-white/10 group-hover:border-accentOrg/40">
                                <Github className="w-4 h-4 text-gray-300 group-hover:text-accentOrg transition-colors duration-300" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-gray-200 group-hover:text-white transition-colors uppercase tracking-widest leading-none">Open Source</span>
                                <span className="text-[10px] text-gray-500 group-hover:text-accentOrg/80 transition-colors leading-tight mt-0.5">azhan-ali/RefugeeReady</span>
                            </div>
                        </div>

                        {/* MIT Badge */}
                        <div className="relative z-10 ml-2 px-2 py-0.5 bg-accentOrg/20 border border-accentOrg/30 rounded-full">
                            <span className="text-[9px] font-bold text-accentOrg uppercase tracking-wider">MIT</span>
                        </div>
                    </div>

                    {/* Mini badges row */}
                    <div className="flex items-center gap-2 pl-1">
                        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                            <Star className="w-2.5 h-2.5 text-yellow-400" />
                            <span className="text-[9px] text-gray-400 font-medium">Star us</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                            <Heart className="w-2.5 h-2.5 text-red-400" />
                            <span className="text-[9px] text-gray-400 font-medium">Built for refugees</span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2 py-0.5">
                            <GitFork className="w-2.5 h-2.5 text-accentCyan" />
                            <span className="text-[9px] text-gray-400 font-medium">Fork it</span>
                        </div>
                    </div>
                </motion.a>
            </div>

            {/* RIGHT COLUMN */}
            <div className="w-full md:w-7/12 h-[55vh] md:h-screen relative bg-[#0a0b10] flex items-center justify-center p-4 md:p-12">
                <div className="w-full max-w-2xl h-full flex flex-col justify-center relative z-10">

                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="show"
                        className="w-full h-full md:h-[80vh] overflow-y-auto hide-scrollbar py-8 pr-2 md:pr-6 flex flex-col space-y-4"
                    >
                        {languages.map((lang) => (
                            <motion.button
                                key={lang.code}
                                variants={itemVariants}
                                whileHover={{ scale: 1.02, x: 10 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelect(lang.code)}
                                className="cursor-none group relative w-full flex items-center justify-between p-4 md:p-5 bg-white/5 hover:bg-white-[0.08] backdrop-blur-lg border border-white/5 hover:border-white/20 rounded-2xl transition-all text-left overflow-hidden min-h-[80px]"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-accentOrg/0 via-accentOrg/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out z-0"></div>

                                <div className="relative z-10 flex items-center space-x-4 md:space-x-6 w-full">
                                    {/* Fixed width container for flags (Windows shows letters instead of emojis) */}
                                    <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-full flex items-center justify-center text-xl md:text-2xl border border-white/10 group-hover:border-accentOrg/50 group-hover:scale-110 transition-all duration-300 drop-shadow-md">
                                        {lang.flag}
                                    </div>

                                    <div className="flex flex-col justify-center flex-1">
                                        <h3 className="text-xl md:text-2xl font-bold text-gray-200 group-hover:text-white transition-colors leading-tight mb-1">
                                            {lang.name}
                                        </h3>
                                        <p className="text-sm md:text-base text-gray-400 font-medium group-hover:text-accentOrg transition-colors leading-tight">
                                            {lang.label}
                                        </p>
                                    </div>
                                </div>

                                <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-accentOrg group-hover:text-white text-gray-500 transition-all duration-300">
                                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </motion.button>
                        ))}
                    </motion.div>

                    <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-[#0a0b10] to-transparent pointer-events-none z-20"></div>
                    <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#0a0b10] to-transparent pointer-events-none z-20"></div>
                </div>
            </div>

        </div>
    );
}
