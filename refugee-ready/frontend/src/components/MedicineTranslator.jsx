import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Pill, ShieldAlert, HeartPulse, Clock, Scale, Utensils, CalendarDays, Plus, Activity, RefreshCw, AlertTriangle, MapPin, Navigation } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { motion, AnimatePresence } from 'framer-motion';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export default function MedicineTranslator({ lang, location }) {
    const [status, setStatus] = useState('idle'); // idle, reading, explaining, success, error
    const [imagePreview, setImagePreview] = useState(null);
    const [extractedText, setExtractedText] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [medicines, setMedicines] = useState([]);
    const [pharmacies, setPharmacies] = useState([]);
    const [findingPharmacies, setFindingPharmacies] = useState(false);

    const cameraInputRef = useRef(null);
    const galleryInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            setImagePreview(event.target.result);
            processImage(event.target.result);
        };
        reader.readAsDataURL(file);
    };

    const processImage = async (imageSrc) => {
        setStatus('reading');
        setErrorMsg('');
        setExtractedText('');
        setMedicines([]);
        setPharmacies([]);

        let currentText = "";

        try {
            // STEP 2: OCR
            const tesseractResult = await Tesseract.recognize(
                imageSrc,
                'deu',
                { logger: m => { } }
            );

            currentText = tesseractResult.data.text;
            setExtractedText(currentText);

            if (!currentText || currentText.trim().length < 5) {
                setStatus('error');
                setErrorMsg('Could not read image. Please take a clearer photo.');
                return;
            }
        } catch (ocrError) {
            console.error("OCR Error:", ocrError);
            setStatus('error');
            setErrorMsg('Could not read image. Please take a clearer photo.');
            return;
        }

        try {
            // STEP 3: Call Groq AI directly from frontend (no backend needed)
            setStatus('explaining');

            const systemPrompt = `You are a medical assistant helping refugees understand German medicine labels. Analyze the medicine information and reply ONLY with a valid JSON array of medicine objects. Each object must have these exact fields: name (string), dose (string), frequency (string), warnings (string), treats (string). Reply in ${lang || 'English'}. Example: [{"name":"Ibuprofen","dose":"400mg","frequency":"3x daily after meals","warnings":"Do not take on empty stomach","treats":"Pain, fever, inflammation"}]`;

            const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: currentText }
                    ],
                    temperature: 0.4
                })
            });

            const groqData = await groqRes.json();
            const aiText = groqData.choices?.[0]?.message?.content || '';

            // Parse the AI JSON response
            let parsed;
            try {
                let clean = aiText.trim();
                if (clean.startsWith('```json')) clean = clean.replace(/^```json/, '');
                if (clean.startsWith('```')) clean = clean.replace(/^```/, '');
                if (clean.endsWith('```')) clean = clean.slice(0, -3).trim();
                parsed = JSON.parse(clean);
                if (!Array.isArray(parsed)) parsed = [parsed];
            } catch (e) {
                // Fallback: wrap raw response
                parsed = [{ name: 'Medicine Info', dose: '', frequency: '', warnings: '', treats: aiText }];
            }

            setMedicines(parsed);
            setStatus('success');
        } catch (apiError) {
            console.error("AI API Error:", apiError);
            setStatus('error');
            setErrorMsg('Translation unavailable. Please ask for help at a pharmacy.');
        }
    };

    const findPharmacies = async () => {
        if (!location?.lat || !location?.lng) {
            alert("Location access required to find pharmacies");
            return;
        }

        setFindingPharmacies(true);
        try {
            const query = `[out:json][timeout:15]; node["amenity"="pharmacy"](around:2500,${location.lat},${location.lng}); out body;`;
            const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
            const response = await fetch(url);

            if (!response.ok) throw new Error('Overpass error');
            const data = await response.json();

            if (data && data.elements) {
                const results = data.elements.map(el => ({
                    id: el.id,
                    name: el.tags?.name || 'Local Pharmacy',
                    lat: el.lat,
                    lng: el.lon,
                    distance: calculateDistance(location.lat, location.lng, el.lat, el.lon)
                }));

                // Sort by nearest, grab top 3
                results.sort((a, b) => a.distance - b.distance);
                setPharmacies(results.slice(0, 3));
            }
        } catch (err) {
            console.error("Pharmacy find error:", err);
            alert("Could not load pharmacies right now. Please try again.");
        } finally {
            setFindingPharmacies(false);
        }
    };

    const resetProcess = () => {
        setStatus('idle');
        setImagePreview(null);
        setExtractedText('');
        setMedicines([]);
        setPharmacies([]);
        setErrorMsg('');
    };

    return (
        <div className="p-3 md:p-6 space-y-4 relative min-h-screen">
            {/* Premium Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a0115] via-[#08021a] to-[#030407]" />
                <div className="absolute -top-44 -right-44 w-[620px] h-[620px] bg-violet-600/22 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '5s' }} />
                <div className="absolute -bottom-40 -left-36 w-[580px] h-[580px] bg-fuchsia-700/18 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '7s', animationDelay: '2s' }} />
                <div className="absolute top-1/3 left-1/3 w-[320px] h-[320px] bg-purple-900/25 rounded-full blur-[90px] animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)]" />
            </div>

            <div className="relative z-10 flex items-center flex-row space-x-3 mb-5">
                <div className="bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 p-2.5 rounded-xl border border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.2)] shrink-0">
                    <Pill className="text-violet-400 w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">
                        Medicine <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Translator</span>
                    </h2>
                    <p className="text-gray-400 text-xs mt-0.5">
                        Take a photo of any German prescription or medicine box. We will instantly translate the exact dosage and safety warnings.
                    </p>
                </div>
            </div>

            {/* Step Indicators */}
            <div className="relative z-10 flex justify-between items-center px-2 py-4 border-b border-white/5 md:max-w-md md:mx-auto mb-6">
                <div className={`flex flex-col items-center \${status === 'idle' ? 'text-violet-400 opacity-100' : 'text-gray-500 opacity-60'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1 \${status === 'idle' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/50' : 'bg-white/5 border border-white/10'}`}>1</div>
                    <span className="text-[10px] uppercase font-bold tracking-wider">Photo</span>
                </div>
                <div className="flex-1 h-px bg-white/10 mx-2"></div>
                <div className={`flex flex-col items-center \${status === 'reading' ? 'text-violet-400 opacity-100' : 'text-gray-500 opacity-60'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1 \${status === 'reading' ? 'bg-violet-500/20 text-violet-400 border border-violet-500/50' : 'bg-white/5 border border-white/10'}`}>2</div>
                    <span className="text-[10px] uppercase font-bold tracking-wider">Reading</span>
                </div>
                <div className="flex-1 h-px bg-white/10 mx-2"></div>
                <div className={`flex flex-col items-center \${(status === 'explaining' || status === 'success') ? 'text-violet-400 opacity-100' : 'text-gray-500 opacity-60'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1 \${(status === 'explaining' || status === 'success') ? 'bg-violet-500/20 text-violet-400 border border-violet-500/50' : 'bg-white/5 border border-white/10'}`}>3</div>
                    <span className="text-[10px] uppercase font-bold tracking-wider">Dosage</span>
                </div>
            </div>

            <div className="relative">
                <AnimatePresence mode="wait">

                    {/* IDLE STATE */}
                    {status === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white/[0.02] backdrop-blur-xl border-2 border-dashed border-violet-500/30 rounded-3xl p-8 flex flex-col items-center justify-center space-y-6 text-center hover:border-violet-400/60 hover:bg-white/[0.05] transition-all duration-300 shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 p-6 rounded-full border border-violet-500/30 shadow-[0_0_30px_rgba(139,92,246,0.2)] group-hover:scale-110 transition-transform duration-500 relative z-10">
                                <Plus className="text-violet-400 w-12 h-12" />
                            </div>

                            <div className="space-y-3 w-full max-w-sm">
                                <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    ref={cameraInputRef}
                                    onChange={handleFileChange}
                                />
                                <button
                                    onClick={() => cameraInputRef.current?.click()}
                                    className="relative z-10 w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-lg py-5 px-6 rounded-2xl flex items-center justify-center space-x-3 shadow-[0_5px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_8px_30px_rgba(139,92,246,0.5)] transition-all duration-300 transform hover:-translate-y-1 cursor-none"
                                >
                                    <Camera size={24} />
                                    <span>Photograph Prescription</span>
                                </button>

                                <div className="text-gray-500 text-sm font-medium my-2">OR</div>

                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={galleryInputRef}
                                    onChange={handleFileChange}
                                />
                                <button
                                    onClick={() => galleryInputRef.current?.click()}
                                    className="relative z-10 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center space-x-3 transition-all duration-300 cursor-none"
                                >
                                    <ImageIcon size={20} />
                                    <span>Upload from Gallery</span>
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* READING / EXPLAINING STATES */}
                    {(status === 'reading' || status === 'explaining') && (
                        <motion.div
                            key="processing"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-[#0a0b10] border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center space-y-6 text-center shadow-xl mb-4"
                        >
                            {imagePreview && (
                                <div className="w-32 h-40 rounded-xl overflow-hidden border-2 border-violet-500/30 opacity-70 mb-2 relative">
                                    <div className="absolute inset-0 bg-violet-500/20 z-10 animate-pulse"></div>
                                    <img src={imagePreview} alt="scanning" className="w-full h-full object-cover filter blur-[1px] grayscale" />

                                    <motion.div
                                        className="absolute left-0 right-0 h-1 bg-violet-400 z-20 shadow-[0_0_15px_rgba(139,92,246,1)]"
                                        animate={{ top: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    />
                                </div>
                            )}

                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/10 border-t-violet-500"></div>

                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {status === 'reading' ? '📖 Reading prescription...' : '💊 Translating medicines...'}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {status === 'reading' ? 'Checking handwriting and printed text' : 'Analyzing dosage and safety details'}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* OCR PREVIEW BLOCK (So user trusts the reading) */}
                    {(status === 'explaining') && extractedText && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-white/5 border border-white/10 rounded-xl p-4 mt-6"
                        >
                            <h4 className="text-xs text-gray-500 font-bold uppercase mb-2">Extracted Text</h4>
                            <p className="text-gray-400 text-xs font-mono line-clamp-3 leading-relaxed break-all">
                                {extractedText}
                            </p>
                        </motion.div>
                    )}

                    {/* ERROR STATE */}
                    {status === 'error' && (
                        <motion.div
                            key="error"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-500/10 border border-red-500/30 rounded-3xl p-6 flex flex-col items-center text-center space-y-4"
                        >
                            <AlertTriangle className="text-red-500 w-16 h-16" />
                            <div>
                                <h3 className="text-xl font-bold text-red-400 mb-2">Translation Failed</h3>
                                <p className="text-red-200/80 mb-6 text-lg">{errorMsg}</p>
                            </div>
                            <button
                                onClick={resetProcess}
                                className="bg-red-500 hover:bg-red-400 text-white font-bold py-3 px-8 rounded-xl transition-colors w-full cursor-none"
                            >
                                Try Again
                            </button>
                        </motion.div>
                    )}

                    {/* SUCCESS STATE */}
                    {status === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center bg-violet-500/10 border border-violet-500/30 rounded-2xl px-5 py-3 shadow-[0_4px_20px_rgba(139,92,246,0.1)]">
                                <span className="text-violet-400 font-bold flex items-center gap-2 text-lg">
                                    <ShieldAlert size={20} /> Safety First
                                </span>
                                <button
                                    onClick={resetProcess}
                                    className="text-gray-400 hover:text-white bg-white/5 p-2 rounded-full hover:bg-white/10 transition-colors cursor-none"
                                >
                                    <RefreshCw size={18} />
                                </button>
                            </div>

                            {/* Render Each Medicine */}
                            {medicines.map((med, idx) => {
                                const treats = med.treats || "Not specified";
                                const dose = med.dose || "Follow doctor's advice";
                                const freq = med.frequency || "Not specified";
                                const time = med.timing || "Any time";
                                const duration = med.duration || "Until finished";
                                const hasWarning = med.warnings && med.warnings.toLowerCase() !== 'none' && med.warnings.toLowerCase() !== 'none mentioned' && med.warnings !== '';

                                return (
                                    <div key={idx} className="bg-[#0a0b10] border border-white/10 rounded-3xl overflow-hidden relative shadow-lg">
                                        <div className="bg-violet-600/20 p-5 border-b border-violet-500/20 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                            <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                                                <Pill className="text-violet-400" />
                                                {med.name}
                                            </h3>
                                            <span className="text-violet-300 font-medium text-sm bg-violet-900/40 px-3 py-1 rounded-full w-fit">
                                                {treats}
                                            </span>
                                        </div>

                                        <div className="p-5 md:p-6 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                                    <Scale className="text-violet-400 shrink-0" size={24} />
                                                    <div>
                                                        <h5 className="text-xs font-bold text-gray-500 uppercase">Dose Amount</h5>
                                                        <p className="text-white text-lg font-medium">{dose}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                                    <Clock className="text-blue-400 shrink-0" size={24} />
                                                    <div>
                                                        <h5 className="text-xs font-bold text-gray-500 uppercase">How Often</h5>
                                                        <p className="text-white text-lg font-medium">{freq}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                                    <Utensils className="text-green-400 shrink-0" size={24} />
                                                    <div>
                                                        <h5 className="text-xs font-bold text-gray-500 uppercase">Timing (Food)</h5>
                                                        <p className="text-white text-lg font-medium">{time}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                                    <CalendarDays className="text-pink-400 shrink-0" size={24} />
                                                    <div>
                                                        <h5 className="text-xs font-bold text-gray-500 uppercase">Duration</h5>
                                                        <p className="text-white text-lg font-medium">{duration}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {hasWarning && (
                                                <div className="mt-4 bg-orange-500/10 border border-orange-500/30 p-5 rounded-2xl flex items-start gap-4 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                                                    <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={24} />
                                                    <div>
                                                        <h5 className="text-sm font-bold text-orange-500 uppercase tracking-wide mb-1">Important Warning</h5>
                                                        <p className="text-orange-100 text-base leading-relaxed font-medium">
                                                            {med.warnings}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            <p className="text-center text-xs text-gray-500 italic px-4">
                                Disclaimer: AI translations can make mistakes. If unsure about doses, please ask a real pharmacist before consuming.
                            </p>

                            {/* Pharmacy Finder Section */}
                            <div className="mt-8 pt-6 border-t border-white/10">
                                {pharmacies.length === 0 ? (
                                    <button
                                        onClick={findPharmacies}
                                        disabled={findingPharmacies}
                                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center space-x-3 transition-colors disabled:opacity-50 cursor-none"
                                    >
                                        {findingPharmacies ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/20 border-t-white"></div>
                                                <span>Searching Map...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Activity size={20} />
                                                <span>Find Nearest Pharmacy</span>
                                            </>
                                        )}
                                    </button>
                                ) : (
                                    <div className="space-y-4">
                                        <h4 className="flex items-center text-lg font-bold text-white gap-2 border-b border-white/5 pb-2">
                                            <MapPin className="text-blue-400" size={20} />
                                            Nearby Pharmacies
                                        </h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            {pharmacies.map(pharm => (
                                                <div key={pharm.id} className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center justify-between hover:border-blue-500/30 transition-colors">
                                                    <div>
                                                        <h5 className="font-bold text-white">{pharm.name.length > 25 ? pharm.name.substring(0, 25) + '...' : pharm.name}</h5>
                                                        <p className="text-sm text-gray-400">{pharm.distance.toFixed(1)} km away</p>
                                                    </div>
                                                    <a
                                                        href={`https://maps.google.com/?q=${pharm.lat},${pharm.lng}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors cursor-none shrink-0"
                                                    >
                                                        Navigate <Navigation size={14} />
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}


