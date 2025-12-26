

🥗 Fit-Fork — AI Powered Smart Meal Planner

Fit-Fork is an intelligent full-stack nutrition assistant that personalizes meal planning based on pantry inventory, medical conditions, vitals, location, and weather — designed to help users eat healthier while reducing food waste.

Powered by Google Gemini AI, Supabase, and client-side ML, Fit-Fork acts as your personal clinical nutritionist + smart kitchen assistant.

🏗️ System Architecture
graph TD
    subgraph Client ["Frontend (Netlify)"]
        UI[React + Tailwind UI]
        Auth[Auth Guard]
        LocalML[Client-side ML (KNN)]
        State[Local State / Cache]
    end

    subgraph Backend ["Supabase Backend"]
        AuthService[GoTrue Auth]
        DB[(PostgreSQL Database)]
        Storage[File Storage]
        Edge[Edge Functions (Deno)]
    end

    subgraph AI_Services ["External AI Services"]
        Gemini[Google Gemini 2.5 / 1.5 Flash]
    end

    UI -->|Auth Request| AuthService
    UI -->|Read/Write Data| DB
    UI -->|Upload Images| Storage
    UI -->|Chat Prompt + Context| Edge
    
    Edge -->|Inject Pantry & Health Context| DB
    Edge -->|Secure API Call| Gemini
    Gemini -->|AI Response| Edge
    Edge -->|Final Response| UI

    LocalML -->|Health Recommendations| UI
    LocalML -->|Sync Metrics| DB

🚀 Key Features
🧠 AI Chef Assistant

✔️ Context-aware using pantry, vitals & weather
✔️ Medical-safe recipes (Diabetes, BP, cholesterol filters)
✔️ Step-by-step cooking guidance
✔️ Add missing ingredients directly to pantry

🏥 Health Connect

✔️ Secure digital health profile
✔️ KNN-powered nutrition insights
✔️ Weather-aware food suggestions

🥕 Smart Pantry

✔️ Quantity + expiry tracking
✔️ Expiry alerts
✔️ AI restocking suggestions

🍲 Dynamic Recipe Hub

✔️ 30+ regional Indian recipes
✔️ Auto filtering by cuisine & diet
✔️ Calorie + cooking time insights

🔐 Security & Performance

✔️ Supabase Auth + OAuth
✔️ RLS (Row Level Security)
✔️ Serverless Edge Functions
✔️ Secure AI Key handling

🛠️ Tech Stack
Layer	Technology	Purpose
Frontend	React (Vite)	High-speed SPA UI
Language	TypeScript	Type safety
Styling	Tailwind CSS	Fast UI development
Icons	Lucide React	Clean icon system
Database	Supabase (PostgreSQL)	Managed relational DB
Auth	Supabase Auth	Secure authentication
Backend Logic	Supabase Edge Functions (Deno)	Secure AI + API processing
AI / LLM	Google Gemini API	Generative intelligence
Client ML	Custom KNN Model	Health classification
Deployment	Netlify	Global CDN hosting
📦 Installation & Setup
✅ Prerequisites

Node.js 18+

npm / yarn

Supabase account

Google Gemini API Key

🔹 1️⃣ Clone Repository
git clone https://github.com/your-username/fit-fork.git
cd fit-fork

🔹 2️⃣ Install Dependencies
npm install

🔹 3️⃣ Environment Variables

Create .env file:

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

🔹 4️⃣ Supabase Database Setup

Run in Supabase SQL Editor 👇

-- PROFILES
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  full_name text,
  email text,
  avatar_url text,
  updated_at timestamptz default now()
);

-- PANTRY
create table public.pantry_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  quantity text,
  category text,
  expiry_date date,
  created_at timestamptz default now()
);

-- MEDICAL RECORDS
create table public.medical_records (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  blood_sugar_level int,
  blood_pressure_systolic int,
  blood_pressure_diastolic int,
  conditions text[],
  medications text[],
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
alter table public.pantry_items enable row level security;
alter table public.medical_records enable row level security;


Add RLS per documentation

🔹 5️⃣ Deploy Edge Functions
supabase functions deploy assistant --no-verify-jwt
supabase secrets set GEMINI_API_KEY=your_google_gemini_key

🔹 6️⃣ Run Locally
npm run dev


App:
http://localhost:5173

🚢 Deployment
Netlify Setup

Connect GitHub Repo

Build: npm run build

Publish: dist

Add ENV variables in Netlify dashboard
