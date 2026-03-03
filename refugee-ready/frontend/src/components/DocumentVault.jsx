import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, UploadCloud, FileText, CheckCircle2, AlertTriangle, Calendar, MapPin, RefreshCw, Action, FileScan, Type } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { motion, AnimatePresence } from 'framer-motion';

export default function DocumentVault({ lang }) {
    const [status, setStatus] = useState('idle'); // idle, reading, explaining, success, error
    const [imagePreview, setImagePreview] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [result, setResult] = useState(null);

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
        setResult(null);

        let extractedText = "";

        try {
            // STEP 2: OCR locally in browser
            const tesseractResult = await Tesseract.recognize(
                imageSrc,
                'deu',
                { logger: m => { } }
            );

            extractedText = tesseractResult.data.text;

            if (!extractedText || extractedText.trim().length < 10) {
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

            const systemPrompt = `You are a helpful assistant for refugees in Germany. The user has photographed an official German document. Reply ONLY with a valid JSON object with these exact fields:
{
  "what_is_it": "Brief explanation of what this document is",
  "what_to_do": "Clear steps on what the user needs to do next",
  "deadline": "Any important deadline mentioned, or 'None mentioned'",
  "warning": "Consequences if missed, or 'None'",
  "address": "Important address or location, or 'None'"
}
Reply in ${lang || 'English'}. Do not include any other text, only the JSON.`;

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
                        { role: 'user', content: extractedText }
                    ],
                    temperature: 0.4
                })
            });

            const groqData = await groqRes.json();
            const aiText = groqData.choices?.[0]?.message?.content || '';

            let finalResult;
            try {
                let clean = aiText.trim();
                if (clean.startsWith('```json')) clean = clean.replace(/^```json/, '');
                if (clean.startsWith('```')) clean = clean.replace(/^```/, '');
                if (clean.endsWith('```')) clean = clean.slice(0, -3).trim();
                finalResult = JSON.parse(clean);
            } catch (e) {
                finalResult = {
                    what_is_it: 'Document Analysis',
                    what_to_do: aiText,
                    deadline: '',
                    warning: '',
                    address: ''
                };
            }

            setResult(finalResult);
            setStatus('success');
        } catch (apiError) {
            console.error("AI API Error:", apiError);
            setStatus('error');
            setErrorMsg('AI explanation unavailable. Please ask for help at a nearby refugee center.');
        }
    };

    const resetProcess = () => {
        setStatus('idle');
        setImagePreview(null);
        setResult(null);
        setErrorMsg('');
    };

    return (
        <div className="p-4 md:p-8 space-y-6 relative min-h-screen">
            {/* Premium Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-[#080210] via-[#070312] to-[#030407]" />
                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-purple-600/22 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '5s' }} />
                <div className="absolute -bottom-40 -right-40 w-[560px] h-[560px] bg-blue-700/18 rounded-full blur-[120px] animate-pulse" style={{ animationDuration: '7s', animationDelay: '2s' }} />
                <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-violet-800/20 rounded-full blur-[85px] animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }} />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(168,85,247,1) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,1) 1px, transparent 1px)', backgroundSize: '56px 56px' }} />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.65)_100%)]" />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4 mb-6">
                <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-4 rounded-2xl border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)] flex-shrink-0 w-fit">
                    <FileScan className="text-purple-400 w-8 h-8 md:w-10 md:h-10" />
                </div>
                <div>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
                        Document <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">Vault</span>
                    </h2>
                    <p className="text-gray-400 leading-relaxed text-sm md:text-lg mt-2 max-w-xl font-light">
                        Take a photo of any official German letter. Our AI will securely translate and explain it simply in your language.
                    </p>
                </div>
            </div>

            {/* Step Indicators */}
            <div className="relative z-10 flex justify-between items-center px-2 py-4 border-b border-white/5 md:max-w-md md:mx-auto">
                <div className={`flex flex-col items-center \${status === 'idle' ? 'text-purple-400 opacity-100' : 'text-gray-500 opacity-60'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1 \${status === 'idle' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' : 'bg-white/5 border border-white/10'}`}>1</div>
                    <span className="text-[10px] uppercase font-bold tracking-wider">Photo</span>
                </div>
                <div className="flex-1 h-px bg-white/10 mx-2"></div>
                <div className={`flex flex-col items-center \${status === 'reading' ? 'text-purple-400 opacity-100' : 'text-gray-500 opacity-60'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1 \${status === 'reading' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' : 'bg-white/5 border border-white/10'}`}>2</div>
                    <span className="text-[10px] uppercase font-bold tracking-wider">Reading</span>
                </div>
                <div className="flex-1 h-px bg-white/10 mx-2"></div>
                <div className={`flex flex-col items-center \${(status === 'explaining' || status === 'success') ? 'text-purple-400 opacity-100' : 'text-gray-500 opacity-60'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mb-1 \${(status === 'explaining' || status === 'success') ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50' : 'bg-white/5 border border-white/10'}`}>3</div>
                    <span className="text-[10px] uppercase font-bold tracking-wider">Result</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="relative mt-4">
                <AnimatePresence mode="wait">

                    {/* IDLE STATE: Upload Area */}
                    {status === 'idle' && (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white/[0.02] backdrop-blur-xl border-2 border-dashed border-purple-500/30 rounded-3xl p-8 flex flex-col items-center justify-center space-y-6 text-center hover:border-purple-400/60 hover:bg-white/[0.05] transition-all duration-300 shadow-2xl relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-6 rounded-full border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.2)] group-hover:scale-110 transition-transform duration-500 relative z-10">
                                <FileText className="text-purple-400 w-12 h-12" />
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
                                    className="relative z-10 w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold text-lg py-5 px-6 rounded-2xl flex items-center justify-center space-x-3 shadow-[0_5px_20px_rgba(168,85,247,0.3)] hover:shadow-[0_8px_30px_rgba(168,85,247,0.5)] transition-all duration-300 transform hover:-translate-y-1 cursor-none"
                                >
                                    <Camera size={24} />
                                    <span>Take Photo</span>
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
                            className="bg-[#0a0b10] border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center space-y-6 text-center shadow-xl"
                        >
                            {imagePreview && (
                                <div className="w-32 h-40 rounded-xl overflow-hidden border-2 border-purple-500/30 opacity-60 mb-2 relative">
                                    <div className="absolute inset-0 bg-purple-500/20 z-10 animate-pulse"></div>
                                    <img src={imagePreview} alt="scanning" className="w-full h-full object-cover filter blur-[2px] grayscale" />

                                    {/* Scanning line animation */}
                                    <motion.div
                                        className="absolute left-0 right-0 h-1 bg-purple-400 z-20 shadow-[0_0_10px_rgba(168,85,247,1)]"
                                        animate={{ top: ['0%', '100%', '0%'] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                    />
                                </div>
                            )}

                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/10 border-t-purple-500"></div>

                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">
                                    {status === 'reading' ? '🔄 Reading your document...' : '🤖 Explaining in your language...'}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {status === 'reading' ? 'Extracting German text' : 'Translating and summarizing details'}
                                </p>
                            </div>
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
                                <h3 className="text-xl font-bold text-red-400 mb-2">Something went wrong</h3>
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
                    {status === 'success' && result && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-b from-[#1a1b26] to-[#0f172a] border border-purple-500/40 rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(147,51,234,0.1)]"
                        >
                            <div className="bg-purple-500/20 px-6 py-4 flex justify-between items-center border-b border-purple-500/30">
                                <h3 className="font-bold text-purple-300 flex items-center gap-2">
                                    <CheckCircle2 size={20} className="text-purple-400" />
                                    Analysis Complete
                                </h3>
                                <button
                                    onClick={resetProcess}
                                    className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors cursor-none focus:outline-none"
                                >
                                    <RefreshCw size={18} />
                                </button>
                            </div>

                            <div className="p-5 md:p-6 space-y-6">
                                {/* Section: What is it */}
                                <div className="space-y-2">
                                    <h4 className="flex items-center text-lg font-bold text-white gap-2 border-b border-white/5 pb-2">
                                        <FileText className="text-purple-400" size={20} />
                                        What is this document?
                                    </h4>
                                    <p className="text-gray-200 text-lg leading-relaxed pl-7">
                                        {result.what_is_it || result.what || result.title || "No title found."}
                                    </p>
                                </div>

                                {/* Section: What to do */}
                                <div className="space-y-2 bg-purple-500/5 p-4 rounded-2xl border border-purple-500/10">
                                    <h4 className="flex items-center text-lg font-bold text-white gap-2 mb-2">
                                        <CheckCircle2 className="text-green-400" size={20} />
                                        What do you need to do?
                                    </h4>
                                    <p className="text-gray-200 text-lg leading-relaxed pl-7">
                                        {result.what_to_do || result.action || result.steps || "No action required."}
                                    </p>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Deadline */}
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                        <div className="flex items-start gap-3">
                                            <Calendar className="text-orange-400 mt-0.5" size={20} />
                                            <div>
                                                <h5 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Important Deadline</h5>
                                                <p className="text-white font-medium text-base">
                                                    {result.deadline || "None mentioned"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Address */}
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                        <div className="flex items-start gap-3">
                                            <MapPin className="text-blue-400 mt-0.5" size={20} />
                                            <div>
                                                <h5 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Address / Location</h5>
                                                <p className="text-white font-medium text-base">
                                                    {result.address || result.location || "None mentioned"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Warning */}
                                {(result.warning && (result.warning.toLowerCase() !== 'none' && result.warning.toLowerCase() !== 'none mentioned')) && (
                                    <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20">
                                        <div className="flex items-start gap-3">
                                            <AlertTriangle className="text-red-400 mt-0.5 shrink-0" size={20} />
                                            <div>
                                                <h5 className="text-sm font-bold text-red-400/80 uppercase tracking-wider mb-1">Warning if missed</h5>
                                                <p className="text-red-100 font-medium text-base">
                                                    {result.warning}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <p className="text-center text-xs text-gray-500 italic pt-2">
                                    Disclaimer: This is an AI translation. Show the original document to a social worker or lawyer for verified advice.
                                </p>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
