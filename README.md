## RefugeeReady 🧳
A refugee assistance platform for Germany. 8 features, 10 languages, ₹0 cost.

### Live Demo
https://refugeeready-demo.vercel.app/

### Features
1. **72-Hour Survival Guide**: Step-by-step checklist matching the urgent legal & physical needs of newly arrived refugees in Germany.
2. **Document Vault**: Uses OCR (Tesseract) & AI to read and simply explain dense German legal texts (BAMF letters).
3. **Medicine Translator**: Snap a photo of a prescription and get dosage, timing, and safety warnings in your native language.
4. **Winter Alert**: Scans live weather APIs, automatically firing emergency push notifications with nearby shelter maps when temps drop below 0°C.
5. **Empty Tonight (Shelter Finder)**: A live, real-time map displaying warm beds directly uploaded by local shelters & verified hosts.
6. **Food Rescue (Food Panel)**: Direct interface for bakeries/restaurants to ping excess daily food, immediately visible to nearby refugees.
7. **Doctor Directory**: A multi-filtered index of doctors speaking matching local languages or offering free/refugee-insurance consultations.
8. **Offline Progressive Web App**: Fully caches critical survival data and language translation files locally so core guides work with no reception.

### Tech Stack
React, Tailwind, Leaflet, Tesseract.js, Groq API, Supabase, Open-Meteo, Overpass API, Node.js, Express

### Setup
1. Clone the repository
2. Configure frontend `.env` (VITE_BACKEND_URL, Supabase credentials)
3. Configure backend `.env` (Supabase, Groq API, FRONTEND_URL)
4. Run `npm install` and `npm run dev` in respectively both `/frontend` and `/backend` directories.

### License
MIT
