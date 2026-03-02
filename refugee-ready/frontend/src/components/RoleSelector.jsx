import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, UserCircle, Home, Utensils, Stethoscope } from 'lucide-react';

export default function RoleSelector({ onSelectRole, onBack }) {
    const { t } = useTranslation();
    const [hoveredRole, setHoveredRole] = useState(null);

    const roles = [
        {
            id: 'refugee',
            icon: <UserCircle size={48} strokeWidth={1.5} />,
            title: t('roles.refugee', 'Refugee'),
            desc: t('roleSelector.roles.refugee', 'I just arrived. I need help.'),
            image: "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=1200&auto=format&fit=crop&q=80",
            accent: "#3b82f6" // Blue
        },
        {
            id: 'host',
            icon: <Home size={48} strokeWidth={1.5} />,
            title: t('roles.host', 'Host/Shelter'),
            desc: t('roleSelector.roles.host', 'I have beds available tonight.'),
            image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&auto=format&fit=crop&q=80",
            accent: "#10b981" // Emerald
        },
        {
            id: 'restaurant',
            icon: <Utensils size={48} strokeWidth={1.5} />,
            title: t('roles.restaurant', 'Restaurant'),
            desc: t('roleSelector.roles.restaurant', 'I have surplus food to share.'),
            image: "https://images.unsplash.com/photo-1481070555726-e2fe83477d4a?w=1200&auto=format&fit=crop&q=80",
            accent: "#f59e0b" // Amber
        },
        {
            id: 'doctor',
            icon: <Stethoscope size={48} strokeWidth={1.5} />,
            title: t('roles.doctor', 'Doctor'),
            desc: t('roleSelector.roles.doctor', 'I want to register my profile.'),
            image: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=1200&auto=format&fit=crop&q=80",
            accent: "#d946ef" // Fuchsia
        }
    ];

    return (
        <div className="min-h-screen bg-[#030407] overflow-hidden flex flex-col relative">

            {/* Background Image Preloader / Viewer */}
            <AnimatePresence>
                {hoveredRole && (
                    <motion.div
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 0.3, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="absolute inset-0 z-0 pointer-events-none"
                        style={{
                            backgroundImage: `url(${roles.find(r => r.id === hoveredRole)?.image})`,
                            backgroundPosition: 'center',
                            backgroundSize: 'cover'
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Global Overlay to darken the background image */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#030407] via-[#030407]/80 to-[#030407]/40 z-0"></div>

            {/* Header section */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 px-6 py-8 md:px-12 md:py-12 flex justify-between items-center"
            >
                <button
                    onClick={onBack}
                    className="cursor-none flex items-center space-x-2 text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-6 py-3 rounded-full backdrop-blur-md border border-white/10 group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-semibold tracking-wide uppercase">{t('back', 'Back')}</span>
                </button>

                <div className="text-right">
                    <h2 className="text-2xl md:text-4xl font-extrabold premium-gradient-text">
                        {t('roleSelector.title', 'Identify Your Role')}
                    </h2>
                </div>
            </motion.div>

            {/* Expanding Cards Layout */}
            <div className="relative z-10 flex-1 flex flex-col md:flex-row p-4 md:p-8 gap-4 mt-auto">
                {roles.map((role, idx) => {
                    const isHovered = hoveredRole === role.id;

                    return (
                        <motion.button
                            key={role.id}
                            onClick={() => onSelectRole(role.id)}
                            onMouseEnter={() => setHoveredRole(role.id)}
                            onMouseLeave={() => setHoveredRole(null)}
                            layout
                            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                            className={`cursor-none relative overflow-hidden rounded-3xl group flex-1 md:h-[65vh] h-[20vh] min-h-[100px] border border-white/10 backdrop-blur-md bg-white/5 flex flex-col justify-end text-left`}
                            style={{
                                flex: isHovered ? 2.5 : 1
                            }}
                        >
                            {/* Internal local image for the card */}
                            <div
                                className="absolute inset-0 z-0 transition-all duration-700 opacity-50 md:opacity-40 group-hover:opacity-100 md:grayscale group-hover:grayscale-0"
                                style={{
                                    backgroundImage: `url(${role.image})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                }}
                            />
                            {/* Card internal gradient */}
                            <div
                                className="absolute inset-0 z-10 transition-opacity duration-700"
                                style={{
                                    background: `linear-gradient(to top, #000 0%, ${role.accent}40 60%, transparent 100%)`,
                                    opacity: isHovered ? 0.9 : 0.6
                                }}
                            />

                            <motion.div
                                layout="position"
                                className="relative z-20 p-6 md:p-8 flex flex-col h-full justify-end"
                            >
                                <div
                                    className={`text-white mb-4 transition-transform duration-500 origin-bottom-left ${isHovered ? 'scale-125' : 'scale-100 text-gray-400'}`}
                                >
                                    {role.icon}
                                </div>

                                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 uppercase tracking-wide">
                                    {role.title}
                                </h3>

                                <AnimatePresence>
                                    {isHovered && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, y: 10 }}
                                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                                            exit={{ opacity: 0, height: 0, y: 10 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="text-gray-200 text-lg md:text-xl font-light mt-2 mb-4">
                                                {role.desc}
                                            </p>
                                            <div className="flex items-center space-x-2 text-white font-semibold uppercase tracking-wider text-sm mt-4">
                                                <span>Continue</span>
                                                <ArrowRight size={16} />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.button>
                    )
                })}
            </div>
        </div>
    );
}
