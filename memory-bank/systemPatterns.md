# System Patterns: PharmaNet MyShop

## Architecture Overview
- **Frontend**: React SPA with Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Tailwind CSS with component library

## Key Design Patterns

### Frontend Patterns
1. **Component Architecture**
   - Reusable UI components in `src/components/`
   - Specialized Malaysian components in `src/components/ui/`
   - Layout components (Header, Footer, etc.)

2. **State Management**
   - React hooks for local state
   - Custom hooks (`useAuth`, `useCart`)
   - Context API for shared state

3. **Data Fetching**
   - Direct Supabase client calls
   - Type-safe queries via `src/integrations/supabase/types.ts`

### Backend Patterns
1. **Database Schema**
   - Role-based access control
   - Product images in storage bucket
   - Migrations in `supabase/migrations/`

2. **Authentication**
   - Email/password auth
   - Role management via `user_roles` table
   - JWT-based sessions

### Malaysian Localization
1. **Currency Handling**
   - `malaysian-currency.tsx` component
   - RM formatting utilities

2. **Address Forms**
   - Malaysian-specific form fields
   - State/postcode validation

3. **Language Support**
   - Language toggle component
   - Future i18n integration
