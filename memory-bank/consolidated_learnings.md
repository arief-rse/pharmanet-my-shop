# Consolidated Learnings

## Malaysian Localization
1. **Pattern: Malaysian Component Isolation**
   - Malaysian-specific components are grouped in `src/components/ui/`
   - Shared data lives in `src/lib/malaysia-data.ts`
   - *Rationale:* Keeps localization concerns separate and reusable

2. **Pattern: Currency Handling**
   - Use `malaysian-currency.tsx` component for consistent formatting
   - Always display RM symbol before amount
   - *Rationale:* Ensures consistent currency presentation

## Supabase Integration
1. **Pattern: Migration Strategy**
   - Database changes go through `supabase/migrations/`
   - Each migration is timestamped and descriptive
   - *Rationale:* Maintains clear history of schema changes

2. **Pattern: Image Storage**
   - Product images stored in Supabase Storage
   - References stored in database
   - *Rationale:* Separates binary storage from metadata

## Development Practices
1. **Pattern: Component Organization**
   - Core components in `src/components/`
   - UI primitives in `src/components/ui/`
   - *Rationale:* Clear separation of concerns
