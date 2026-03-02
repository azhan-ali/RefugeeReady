import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
    Zap,
    Wifi,
    Utensils,
    Home,
    FileText,
    Pill,
    Stethoscope,
    MapPin,
    Search,
    AlertCircle
} from 'lucide-react';

// Import child components
import WinterAlert from './WinterAlert';
import SurvivalMode from './SurvivalMode';
import WifiSpots from './WifiSpots';
import FoodAlert from './FoodAlert';
import EmptyTonight from './EmptyTonight';
import DocumentVault from './DocumentVault';
import MedicineTranslator from './MedicineTranslator';
import DoctorDirectory from './DoctorDirectory';

const tabs = [
    { id: 'survival', label: 'Survival', icon: <Zap size={20} /> },
    { id: 'wifi', label: 'WiFi', icon: <Wifi size={20} /> },
    { id: 'food', label: 'Food', icon: <Utensils size={20} /> },
    { id: 'beds', label: 'Beds', icon: <Home size={20} /> },
    { id: 'docs', label: 'Docs', icon: <FileText size={20} /> },
    { id: 'meds', label: 'Meds', icon: <Pill size={20} /> },
    { id: 'doctor', label: 'Doctor', icon: <Stethoscope size={20} /> }
];

export default function RefugeeDashboard({ onBack }) {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('survival');
    const [location, setLocation] = useState(null);
    const [locationDenied, setLocationDenied] = useState(false);
    const [manualCity, setManualCity] = useState('');
    const [survivalModeActive, setSurvivalModeActive] = useState(false);

    // Re-map language code to actual language name just for display
    const getLanguageName = () => {
        const code = i18n.language;
        const map = {
            'ar': 'Arabic (عربي)',
            'uk': 'Ukrainian (Українська)',
            'fa-AF': 'Dari (دری)',
            'so': 'Somali (Soomaali)',
            'fr': 'French (Français)',
            'tr': 'Turkish (Türkçe)',
            'ku': 'Kurdish (Kurdî)',
            'ti': 'Tigrinya (ትግርኛ)',
            'en': 'English',
            'de': 'German (Deutsch)'
        };
        return map[code] || 'English';
    };

    useEffect(() => {
        // 1. Ask for GPS on load
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setLocationDenied(false);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setLocationDenied(true);
                },
                { timeout: 10000 }
            );
        } else {
            setLocationDenied(true);
        }
    }, []);

    const handleManualCitySubmit = (e) => {
        e.preventDefault();
        if (manualCity.trim()) {
            setLocation({ city: manualCity.trim() });
            setLocationDenied(false); // Hide the prompt once they enter a city
        }
    };

    const renderActiveTab = () => {
        const props = { location, lang: i18n.language, setActiveTab };
        switch (activeTab) {
            case 'survival': return <SurvivalMode {...props} />;
            case 'wifi': return <WifiSpots {...props} />;
            case 'food': return <FoodAlert {...props} />;
            case 'beds': return <EmptyTonight {...props} />;
            case 'docs': return <DocumentVault {...props} />;
            case 'meds': return <MedicineTranslator {...props} />;
            case 'doctor': return <DoctorDirectory {...props} />;
            default: return <SurvivalMode {...props} />;
        }
    };

    return (
        <div className="flex flex-col min-h-screen overflow-hidden pb-20 relative text-white">

            {/* === PREMIUM BACKGROUND === */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                {/* Deep space base */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#02040f] via-[#050812] to-[#030407]" />
                {/* Large cosmic blue orb - top left */}
                <div className="absolute -top-56 -left-56 w-[700px] h-[700px] bg-indigo-600/20 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '6s' }} />
                {/* Orange accent (brand) - bottom right */}
                <div className="absolute -bottom-48 -right-48 w-[650px] h-[650px] bg-orange-600/15 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
                {/* Teal hint - center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-900/25 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
                {/* Small accent orb - top right */}
                <div className="absolute top-20 right-10 w-[200px] h-[200px] bg-violet-600/15 rounded-full blur-[70px] animate-pulse" style={{ animationDuration: '4s', animationDelay: '3s' }} />
                {/* Subtle grid */}
                <div className="absolute inset-0 opacity-[0.025]" style={{
                    backgroundImage: 'linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)',
                    backgroundSize: '64px 64px'
                }} />
                {/* Edge vignette */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(0,0,0,0.6)_100%)]" />
            </div>

            {/* Fixed Header */}
            <header className="sticky top-0 z-40 bg-[#0a0b10]/90 backdrop-blur-xl border-b border-white/5">
                {/* Winter Alert goes at the very top */}
                <WinterAlert location={location} lang={i18n.language} />

                <div className="flex justify-between items-center px-4 py-3">
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => {
                                if (activeTab !== 'survival') {
                                    setActiveTab('survival');
                                } else {
                                    onBack();
                                }
                            }}
                            className="cursor-none text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-3 flex items-center justify-center rounded-full backdrop-blur-md border border-white/10"
                            aria-label="Back"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                        </button>
                        <span className="text-xl font-bold tracking-tight text-white">Refugee<span className="text-accentOrg">Ready</span></span>
                    </div>
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider bg-white/5 px-3 py-1.5 rounded-full">
                        {getLanguageName()}
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto relative z-10 w-full max-w-5xl mx-auto">

                {/* Location prompt if GPS denied */}
                {locationDenied && !location?.city && (
                    <div className="m-4 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col items-center gap-4">
                        <div className="flex items-center text-red-400 w-full">
                            <MapPin className="mr-3" />
                            <p className="text-sm">We need your city to show local resources.</p>
                        </div>
                        <form onSubmit={handleManualCitySubmit} className="flex w-full">
                            <input
                                type="text"
                                placeholder="Enter city (e.g. Berlin)"
                                className="bg-black/50 border border-white/10 rounded-l-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-accentOrg w-full"
                                value={manualCity}
                                onChange={(e) => setManualCity(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="cursor-none bg-accentOrg text-white px-6 py-3 rounded-r-lg text-sm font-semibold hover:bg-orange-600 transition-colors"
                            >
                                Save
                            </button>
                        </form>
                    </div>
                )}

                {/* I Just Arrived Button */}
                <div className="px-4 py-4">
                    <button
                        onClick={() => {
                            setSurvivalModeActive(!survivalModeActive);
                            setActiveTab('survival');
                        }}
                        className={`cursor-none w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 transition-all duration-300 ${survivalModeActive
                            ? 'bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.3)] border border-red-400'
                            : 'bg-white/5 text-gray-200 border border-white/10 hover:bg-white/10'
                            }`}
                    >
                        <AlertCircle size={24} className={survivalModeActive ? 'animate-pulse' : ''} />
                        <span>{t('app.justArrivedToday', 'I just arrived today')}</span>
                    </button>
                </div>

                {/* Dynamic Tab Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full pb-24"
                >
                    {renderActiveTab()}
                </motion.div>

            </main>

            {/* Fixed Bottom Navigation Bar */}
            <nav className="fixed bottom-0 w-full bg-[#0a0b10] border-t border-white/10 z-50 px-2 pb-safe pt-2">
                <ul className="flex justify-between max-w-5xl mx-auto">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                            <li key={tab.id} className="flex-1">
                                <button
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`cursor-none w-full flex flex-col items-center justify-center py-2 space-y-1 transition-all group relative`}
                                >
                                    <div className={`
                    absolute top-[-10px] w-8 h-1 rounded-b-full transition-all duration-300
                    ${isActive ? 'bg-accentOrg scale-100' : 'bg-transparent scale-0'}
                  `} />

                                    <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'text-accentOrg' : 'text-gray-500 group-hover:text-gray-300 bg-transparent'}`}>
                                        {tab.icon}
                                    </div>

                                    <span className={`text-[10px] font-semibold tracking-wider uppercase transition-colors duration-300 ${isActive ? 'text-accentOrg' : 'text-gray-500 group-hover:text-gray-300'}`}>
                                        {tab.label}
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

        </div>
    );
}
