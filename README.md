# Nourishly - Smart Meal Planner

A full-stack web application for smart meal planning built with modern web technologies.

## Tech Stack

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend Services**: Supabase (Auth + Database + Storage)
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Deployment**: Netlify (with Serverless Functions)

## Project Structure

```
nourishly/
├── public/                    # Static assets
├── src/                       # Source code
│   ├── components/            # Reusable components
│   │   ├── auth/             # Authentication components
│   │   │   └── AuthCard.tsx  # Auth page wrapper component
│   │   └── ui/               # UI components
│   │       ├── Button.tsx    # Button component
│   │       └── InputField.tsx # Input field component
│   ├── lib/                   # Library configurations
│   │   └── supabase.ts       # Supabase client
│   ├── pages/                 # Page components
│   │   ├── auth/             # Authentication pages
│   │   │   ├── Signup.tsx
│   │   │   ├── Login.tsx
│   │   │   └── ForgotPassword.tsx
│   │   └── Home.tsx
│   ├── App.tsx               # Main App component with routing
│   ├── main.tsx              # Entry point
│   └── index.css             # Global styles with Tailwind
├── index.html                # HTML template
├── package.json              # Dependencies
├── tailwind.config.js        # Tailwind configuration
├── vite.config.ts            # Vite configuration
└── tsconfig.json             # TypeScript configuration
```

## Installed Dependencies

### Core Dependencies
- `react` & `react-dom` - React library
- `react-router-dom` - Client-side routing
- `@supabase/supabase-js` - Supabase client library
- `lucide-react` - Icon library

### Dev Dependencies
- `vite` - Build tool and dev server
- `typescript` - TypeScript compiler
- `tailwindcss` - Utility-first CSS framework
- `autoprefixer` & `postcss` - CSS processing
- `eslint` - Code linting

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   To get your Supabase credentials:
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Create a new project or select an existing one
   - Navigate to Settings → API
   - Copy the Project URL and anon/public key

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

5. Preview production build:
   ```bash
   npm run preview
   ```

## Features Implemented

### Authentication Pages
- ✅ **Signup** (`/signup`) - User registration with email verification
- ✅ **Login** (`/login`) - User authentication
- ✅ **Forgot Password** (`/forgot-password`) - Password reset via email

### Reusable Components
- ✅ **InputField** - Styled input component with error handling
- ✅ **Button** - Versatile button component with loading states
- ✅ **AuthCard** - Consistent auth page layout wrapper

### Supabase Integration
- ✅ Supabase client configured
- ✅ Email/password authentication
- ✅ Password reset functionality
- ✅ Email verification flow

## Next Steps

- Building navigation components (Navbar)
- Creating Profile page
- Creating Recipes page
- Creating Pantry page
- Creating Assistant page (chat UI)
- Setting up protected routes

