<div align="center">

<img src="https://img.shields.io/badge/sudo_make_world_2026-Hackathon-00e5a0?style=for-the-badge&labelColor=0d1117" />
<img src="https://img.shields.io/badge/Track-Civic-4da6ff?style=for-the-badge&labelColor=0d1117" />
<img src="https://img.shields.io/badge/Cost-$0_/_₹0-ff7a3d?style=for-the-badge&labelColor=0d1117" />
<img src="https://img.shields.io/badge/License-MIT-b57bff?style=for-the-badge&labelColor=0d1117" />

<br/><br/>

```
██████╗ ███████╗███████╗██╗   ██╗ ██████╗ ███████╗███████╗
██╔══██╗██╔════╝██╔════╝██║   ██║██╔════╝ ██╔════╝██╔════╝
██████╔╝█████╗  █████╗  ██║   ██║██║  ███╗█████╗  █████╗  
██╔══██╗██╔══╝  ██╔══╝  ██║   ██║██║   ██║██╔══╝  ██╔══╝  
██║  ██║███████╗██║      ╚████╔╝ ╚██████╔╝███████╗███████╗
╚═╝  ╚═╝╚══════╝╚═╝       ╚═══╝   ╚═════╝ ╚══════╝╚══════╝
                                                    READY
```

### A refugee survival platform for Germany
### 8 features · 10 languages · $0 cost · Works offline

<br/>

[![Live Demo](https://img.shields.io/badge/🌐_LIVE_DEMO-refugee--ready.vercel.app-00e5a0?style=for-the-badge&labelColor=0d1117)](https://refugee-ready.vercel.app/)

</div>

---

## 🎯 The Problem

Every year, **300,000+ refugees arrive in Germany**. In their first 72 hours, they face:

```
❌  Official BAMF letters in German they cannot read
❌  No idea where to find a bed tonight
❌  Prescriptions with dosage they cannot understand
❌  Doctors who don't speak their language
❌  Freezing temperatures with nowhere warm to go
❌  No free WiFi to call their family
```

**No single app solves all of this. RefugeeReady does.**

---

## 🏆 Hackathon Track

```
/civic/  —  Improve transparency and engagement
            Difficulty: ████░░░░░░ (5/10)
            Examples:   budget trackers, voting info, petition platforms
```

RefugeeReady falls under the **Civic track** — improving access to critical public services and life-saving information for one of the most vulnerable populations in Germany.

---

## ✨ 8 Features

| | Feature | What it does | API Cost |
|---|---|---|---|
| ⚡ | **72-Hour Survival Mode** | Guided checklist: Day 1 survive, Day 2 register, Week 1 stabilize | Free — no API |
| 📶 | **Safe WiFi Spots** | Shows free WiFi within 2km to call family | Free — no key |
| 📄 | **Document Vault** | Photo of BAMF letter → AI explains in your language | Groq free |
| 🏠 | **Empty Tonight** | Real-time shelter bed availability from hosts | Supabase free |
| 🌡️ | **Winter Alert** | Below 0°C → push notification with emergency shelters | Free — no key |
| 🍞 | **Food Expiry Alert** | Bakeries post surplus food → refugees notified before closing | Supabase free |
| 💊 | **Medicine Translator** | Photo of prescription → AI explains dosage in your language | Groq free |
| 🩺 | **No German Doctor** | Filter doctors by language, gender, refugee insurance | Supabase free |

---

## 🌍 Supported Languages

```
🇸🇦 Arabic    🇺🇦 Ukrainian    🇦🇫 Dari       🇸🇴 Somali
🇫🇷 French    🇹🇷 Turkish      🏳️  Kurdish     🇪🇷 Tigrinya
🇬🇧 English   🇩🇪 German
```

---

## 👥 4 User Types

```
🧳 Refugee          →  Uses all 8 survival features
🏠 Shelter / Host   →  Posts available beds live on the map
🍞 Restaurant       →  Registers surplus food with time window
🩺 Doctor           →  Registers multilingual profile for directory
```

---

## 🛠️ Tech Stack

```
FRONTEND                           BACKEND
──────────────────────────────     ──────────────────────────────
React + Vite + Tailwind CSS        Node.js + Express
Leaflet.js + OpenStreetMap         Groq API (Llama 3 70B) — FREE
Tesseract.js (browser OCR)         Supabase — FREE
react-i18next (10 languages)       node-cron (Winter Alert)
Clash Display + Satoshi fonts      axios

APIS — ALL FREE, ZERO PAID KEYS
──────────────────────────────────────────────────────────────────
Overpass API      WiFi spots + pharmacies     No key needed
Open-Meteo        Weather for Winter Alert    No key needed
Web Push API      Browser notifications       Built-in browser
Supabase RT       Live bed map updates        Free tier
Groq API          Document + Medicine AI      Free tier
```

---

## 💰 Total Cost

```
┌─────────────────────────────────────────┐
│  Groq API      →  FREE (14,400 req/day) │
│  Supabase      →  FREE (500MB + RT)     │
│  Overpass API  →  FREE (no key)         │
│  Open-Meteo    →  FREE (no key)         │
│  Vercel        →  FREE                  │
│  Render        →  FREE                  │
│                ─────────────────        │
│  TOTAL         →  $0 / ₹0              │
└─────────────────────────────────────────┘
```

---

## 🚀 Setup & Run Locally

### Prerequisites
- Node.js 18+
- Free account → [console.groq.com](https://console.groq.com) *(no credit card)*
- Free account → [supabase.com](https://supabase.com) *(no credit card)*

### 1. Clone
```bash
git clone https://github.com/azhan-ali/RefugeeReady
cd RefugeeReady
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create `backend/.env`:
```env
GROQ_API_KEY=your_groq_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_service_key_here
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create `frontend/.env`:
```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_KEY=your_supabase_anon_key_here
VITE_BACKEND_URL=http://localhost:5000
```

### 4. Database Setup
Run `database/schema.sql` in your **Supabase SQL Editor**

### 5. Run
```bash
# Terminal 1
cd backend && node server.js

# Terminal 2
cd frontend && npm run dev
```

Open → `http://localhost:5173` 🎉

---

## 🧪 Testing the Features

**Document Vault** — Use this sample BAMF letter image:
```
Bundesamt für Migration und Flüchtlinge (BAMF)
Betreff: Anhörungstermin — 20.03.2026 um 10:00 Uhr
BAMF Berlin, Bundesallee 171, 10715 Berlin
Wenn Sie nicht erscheinen, wird Ihr Asylantrag abgelehnt.
```

**Medicine Translator** — Use this sample prescription image:
```
Ibuprofen 200mg Saft — 3x täglich 5ml nach dem Essen — 5 Tage
Paracetamol 250mg — Bei Fieber über 38.5°C
Amoxicillin 250mg — 2x täglich, 7 Tage, vor dem Essen
```

---

## 🗺️ Roadmap

- [ ] Add more German cities (currently Berlin, Hamburg, Munich)
- [ ] Admin panel for verifying doctors
- [ ] Voice explanations for low-literacy users
- [ ] Expand to Austria and Switzerland
- [ ] UNHCR partnership for official resource data

---

## 🤝 Contributing

[![GitHub](https://img.shields.io/badge/GitHub-azhan--ali%2FRefugeeReady-24292e?style=for-the-badge&logo=github&logoColor=white)](https://github.com/azhan-ali/RefugeeReady)
[![MIT License](https://img.shields.io/badge/License-MIT-b57bff?style=for-the-badge)](https://github.com/azhan-ali/RefugeeReady/blob/main/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-00e5a0?style=for-the-badge)](https://github.com/azhan-ali/RefugeeReady/pulls)

Open source and built for social good. Contributions are **very welcome** — whether you're a developer, translator, or NGO worker.

```bash
git clone https://github.com/azhan-ali/RefugeeReady
git checkout -b feature/your-feature
git commit -m 'Add your feature'
git push origin feature/your-feature
# Open a Pull Request ✅
```

---

## 📄 License

MIT — free to use, modify, and distribute.

---

<div align="center">

**Built in 72 hours at sudo make world 2026**

*For the 300,000+ refugees arriving in Germany every year* ❤️

[![Live Demo](https://img.shields.io/badge/Try_It_Live-refugee--ready.vercel.app-00e5a0?style=flat-square&labelColor=0d1117)](https://refugee-ready.vercel.app/)

</div>
