# Tech Context: PharmaNet MyShop

## Core Technologies
- **Frontend**: 
  - React 18
  - TypeScript 5
  - Vite 5
  - Tailwind CSS 3

- **Backend**:
  - Supabase (PostgreSQL 15)
  - Supabase Auth
  - Supabase Storage

## Development Setup
- **Package Manager**: Bun
- **Linting**: ESLint
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with CSS modules
- **Testing**: (To be implemented)

## Key Dependencies
- `@supabase/supabase-js`: Client library
- `react-hook-form`: Form handling
- `sonner`: Toast notifications
- `date-fns`: Date utilities
- `react-router-dom`: Routing

## Configuration Files
- `vite.config.ts`: Vite setup with React plugin
- `tailwind.config.ts`: Tailwind configuration
- `tsconfig.json`: TypeScript strict mode
- `eslint.config.js`: ESLint configuration

## Environment Variables
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Supabase public key
- `AUTH_API_KEY`: Admin API key (development only)
