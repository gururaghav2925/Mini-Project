Fit-Fork: AI-Powered Smart Meal Planner

Fit-Fork is an intelligent, full-stack web application designed to revolutionize personal nutrition management. By integrating advanced AI (Google Gemini), real-time database syncing, and personalized health metrics, Fit-Fork acts as a personal clinical nutritionist and chef, offering tailored meal recommendations based on pantry inventory, medical conditions, and local environmental factors.

🏗️ System Architecture

The following diagram illustrates the high-level architecture of the Fit-Fork ecosystem, showcasing the flow of data between the frontend, backend services, and external AI/ML providers.

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
        Gemini[Google Gemini 2.5 Flash]
    end

    %% Data Flow Connections
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

🧠 Intelligent AI Chef

Context-Aware Assistance: Powered by Google Gemini 2.5 Flash, the AI understands your pantry inventory, health profile, and local weather to provide hyper-personalized advice.

Medical Guardrails: Automatically filters recipes based on medical conditions (e.g., Diabetes, Hypertension) and medication interactions.

Interactive Cooking Guides: Provides step-by-step cooking instructions and allows users to add missing ingredients to their pantry directly from the chat.

🏥 Health Connect

Digital Health Profile: Securely store and manage vital health metrics including blood sugar, blood pressure, cholesterol, allergies, and current medications.

ML-Powered Analysis: Includes a client-side Machine Learning model (KNN) that analyzes vitals to recommend specific dietary strategies (e.g., Low Sodium, Low Carb).

Geolocation & Weather Integration: Auto-detects user location and fetches real-time weather data to suggest context-appropriate meals (e.g., warm soups for rainy days).

🥕 Smart Pantry Management

Inventory Tracking: Manage pantry items with details like quantity and expiry dates.

Expiry Alerts: Visual indicators for items nearing expiration to reduce food waste.

Automated Restocking: One-click addition of ingredients from AI-generated recipes directly to the pantry.

🥗 Dynamic Recipe Hub

Regional Specialization: Access a vast database of over 30+ regional Indian recipes mapped to specific states and cuisines.

Smart Filtering: Recipes are automatically filtered based on the user's region and dietary preferences.

Detailed Recipe Views: Rich recipe cards with calorie counts, cooking time, and ingredient checklists.

🔐 Secure & Scalable Architecture

Authentication: Robust email and Google OAuth sign-in powered by Supabase Auth.

Row Level Security (RLS): Ensures users can only access and modify their own data.

Edge Functions: Serverless backend logic handles AI communication securely, protecting API keys.

🛠️ Tech Stack

Layer

Technology

Purpose

Frontend

React (Vite)

High-performance UI library

Language

TypeScript

Type safety and developer experience

Styling

Tailwind CSS

Utility-first CSS framework for rapid UI development

Icons

Lucide React

Consistent and clean iconography

Database

Supabase (PostgreSQL)

Relational database with real-time capabilities

Auth

Supabase Auth

Secure user management and OAuth integration

Backend Logic

Supabase Edge Functions

Serverless compute for secure API interactions

AI / LLM

Google Gemini API

Generative AI for meal planning and chat assistance

Client ML

Custom KNN Model

Lightweight health metric classification in-browser

Deployment

Netlify

Global CDN hosting for the frontend application

📦 Installation & Setup

Prerequisites

Node.js (v18 or higher)

npm or yarn

A Supabase account

A Google Cloud account (for Gemini API Key)

1. Clone the Repository

git clone [https://github.com/your-username/fit-fork.git](https://github.com/your-username/fit-fork.git)
cd fit-fork


2. Install Dependencies

npm install


3. Environment Configuration

Create a .env file in the root directory and add your Supabase credentials:

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key


4. Database Setup (Supabase)

Run the following SQL commands in your Supabase SQL Editor to set up the required tables and security policies:

-- Create Profiles Table
create table public.profiles (
  id uuid references auth.users(id) on delete cascade not null primary key,
  full_name text,
  email text,
  avatar_url text,
  updated_at timestamptz default now()
);

-- Create Pantry Table
create table public.pantry_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  quantity text,
  category text,
  expiry_date date,
  created_at timestamptz default now()
);

-- Create Medical Records Table
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

-- Enable RLS (Row Level Security) for all tables
alter table public.profiles enable row level security;
alter table public.pantry_items enable row level security;
alter table public.medical_records enable row level security;

-- Add policies to allow users to manage only their own data
-- (See repository docs for full policy SQL)


5. Deploy Edge Functions

Ensure you have the Supabase CLI installed and logged in.

supabase functions deploy assistant --no-verify-jwt
supabase secrets set GEMINI_API_KEY=your_google_gemini_key


6. Run Locally

npm run dev


Access the application at http://localhost:5173.

🚢 Deployment

The frontend is optimized for deployment on Netlify.

Connect your GitHub repository to Netlify.

Set the Build Command to npm run build.

Set the Publish Directory to dist.

Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to Netlify Environment Variables.


