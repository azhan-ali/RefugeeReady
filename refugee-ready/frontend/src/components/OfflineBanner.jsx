import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineBanner() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        const handleOffline = () => setIsOffline(true);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return (
        <AnimatePresence>
            {isOffline && (
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="bg-yellow-500/90 text-black px-4 py-3 shadow-lg flex items-center justify-center gap-3 w-full fixed top-0 left-0 z-50 backdrop-blur-sm"
                >
                    <WifiOff size={20} className="shrink-0" />
                    <p className="text-sm font-bold m-0 leading-tight">
                        📡 You are offline. Some features may not work. The survival guide is available.
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
