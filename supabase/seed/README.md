# Supabase Seeding Scripts

This directory contains seeding scripts for populating the database with initial data.

## Sports Placeholders

The `sports_placeholders.ts` script ensures that all sports in the catalog have at least one placeholder activity entry, even if no real vendors offer them yet.

### What it does:

1. **Ensures all sports exist** - Creates entries in the `sports` table for all water sports
2. **Creates placeholder school** - Sets up a "Demo Vendor" school (marked as inactive)
3. **Creates placeholder activities** - For sports without real vendors, creates placeholder `school_sports` entries
4. **Creates placeholder time slots** - Adds closed time slots so the UI doesn't break

### Running the script:

```bash
# Using npm script
npm run seed:sports

# Or directly with tsx
npx tsx supabase/seed/sports_placeholders.ts
```

### Environment Variables Required:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin operations

### Notes:

- Placeholder entries are marked as inactive/closed so they don't appear in real search results
- The script is idempotent - safe to run multiple times
- Only creates placeholders for sports that don't already have activities
