import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';

export default function SurvivalMode({ location, lang, setActiveTab }) {
    const { t } = useTranslation();

    // Initialize state from localStorage or default to empty object
    const [completedItems, setCompletedItems] = useState(() => {
        const saved = localStorage.getItem('refugee_survival_progress');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                return {};
            }
        }
        return {};
    });

    // Save to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('refugee_survival_progress', JSON.stringify(completedItems));
    }, [completedItems]);

    const toggleItem = (itemId) => {
        setCompletedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const sections = [
        {
            id: 'day1',
            title: t('survival.day1', 'Day 1 — Survive'),
            items: [
                { id: 'wifi', text: t('survival.items.wifi.text'), actionText: t('survival.items.wifi.action'), onAction: () => setActiveTab('wifi') },
                { id: 'shelter', text: t('survival.items.shelter.text'), actionText: t('survival.items.shelter.action'), onAction: () => setActiveTab('beds') },
                { id: 'food', text: t('survival.items.food.text'), actionText: t('survival.items.food.action'), onAction: () => setActiveTab('food') },
                { id: 'medical', text: t('survival.items.medical.text'), actionText: t('survival.items.medical.action'), onAction: () => setActiveTab('doctor') }
            ]
        },
        {
            id: 'day2',
            title: t('survival.day2', 'Day 2 — Register'),
            items: [
                {
                    id: 'bamf',
                    text: t('survival.items.bamf.text'),
                    actionText: t('survival.items.bamf.action'),
                    onAction: () => window.open(`https://www.google.com/maps/search/BAMF+registration+${location?.city || 'Germany'}`, '_blank')
                },
                { id: 'legal', text: t('survival.items.legal.text'), actionText: t('survival.items.legal.action', { defaultValue: '' }), onAction: null },
                { id: 'address', text: t('survival.items.address.text'), actionText: t('survival.items.address.action', { defaultValue: '' }), onAction: null }
            ]
        },
        {
            id: 'week1',
            title: t('survival.week1', 'Week 1 — Stabilize'),
            items: [
                { id: 'language', text: t('survival.items.language.text'), actionText: t('survival.items.language.action', { defaultValue: '' }), onAction: null },
                { id: 'bank', text: t('survival.items.bank.text'), actionText: t('survival.items.bank.action', { defaultValue: '' }), onAction: null },
                { id: 'sim', text: t('survival.items.sim.text'), actionText: t('survival.items.sim.action', { defaultValue: '' }), onAction: null }
            ]
        }
    ];

    const totalItems = sections.reduce((acc, section) => acc + section.items.length, 0);
    const completedCount = Object.values(completedItems).filter(Boolean).length;
    const progressPercent = totalItems === 0 ? 0 : (completedCount / totalItems) * 100;

    return (
        <div className="px-4 py-6 md:px-8 max-w-4xl mx-auto pb-10 relative">

            {/* Premium Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0f0200] via-[#100303] to-[#030407]" />
                <div className="absolute -top-44 -left-40 w-[600px] h-[600px] bg-red-700/20 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '5s' }} />
                <div className="absolute -bottom-44 -right-40 w-[580px] h-[580px] bg-orange-700/20 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '7s', animationDelay: '2s' }} />
                <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-red-900/25 rounded-full blur-[90px] animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(239,68,68,1) 1px, transparent 1px), linear-gradient(90deg, rgba(239,68,68,1) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)]" />
            </div>

            {/* Header & Progress */}
            <div className="mb-10 p-6 md:p-8 bg-gradient-to-br from-red-600/10 to-accentOrg/10 border border-red-500/20 rounded-3xl relative overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute top-[-50%] right-[-10%] w-[200px] h-[200px] bg-red-500/20 rounded-full blur-[60px] pointer-events-none"></div>

                <div className="relative z-10">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-3 drop-shadow-md tracking-tight">
                        {t('survival.title', '72-Hour Survival Guide')}
                    </h2>
                    <p className="text-gray-300 font-medium mb-6 text-lg">
                        {t('survival.completed', '{{count}} of {{total}} steps completed', { count: completedCount, total: totalItems })}
                    </p>

                    <div className="w-full bg-black/60 rounded-full h-3 md:h-4 border border-white/5 overflow-hidden">
                        <motion.div
                            className="bg-gradient-to-r from-red-500 to-accentOrg h-full rounded-full shadow-[0_0_15px_#ff6b35]"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        ></motion.div>
                    </div>
                </div>
            </div>

            {/* Checklist Sections */}
            <div className="space-y-10">
                {sections.map((section, sectionIndex) => (
                    <motion.div
                        key={section.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: sectionIndex * 0.15 }}
                    >
                        <h3 className="text-xl md:text-2xl font-bold text-gray-100 mb-5 border-b border-white/10 pb-3 flex items-center">
                            <span className="w-2 h-6 bg-accentOrg rounded-sm mr-3"></span>
                            {section.title}
                        </h3>

                        <div className="space-y-3">
                            {section.items.map((item) => {
                                const isChecked = !!completedItems[item.id];
                                return (
                                    <div
                                        key={item.id}
                                        onClick={() => toggleItem(item.id)}
                                        className={`cursor-none group relative p-5 md:p-6 rounded-2xl border transition-all duration-300 ${isChecked
                                            ? 'bg-green-500/5 border-green-500/20 shadow-[0_4px_20px_rgba(34,197,94,0.05)]'
                                            : 'bg-cardDark/40 backdrop-blur-md border-white/5 hover:bg-cardHover/50 hover:border-white/10 hover:shadow-lg'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            {/* Checkbox trigger */}
                                            <button
                                                className={`cursor-none flex-shrink-0 mt-0.5 rounded-full transition-colors ${isChecked ? 'text-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'text-gray-500 group-hover:text-accentOrg'}`}
                                            >
                                                {isChecked ? <CheckCircle2 size={28} /> : <Circle size={28} strokeWidth={1.5} />}
                                            </button>

                                            {/* Text & Action */}
                                            <div className="flex-1">
                                                <p
                                                    className={`text-lg transition-all duration-300 leading-snug ${isChecked ? 'text-gray-500 line-through' : 'text-gray-200'
                                                        }`}
                                                >
                                                    {item.text}
                                                </p>

                                                {item.onAction && item.actionText && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            item.onAction();
                                                        }}
                                                        className={`cursor-none mt-4 inline-flex items-center gap-1 text-sm md:text-base font-semibold tracking-wide transition-colors ${isChecked ? 'text-blue-400/40 hover:text-blue-400' : 'text-blue-400 hover:text-blue-300 group-hover:underline'}`}
                                                    >
                                                        {item.actionText}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                ))}
            </div>

        </div>
    );
}
