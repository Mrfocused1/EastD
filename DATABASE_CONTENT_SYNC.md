# Database Content Synchronization Guide

## Issue Background

**Problem**: Database content was reverting to old values (e.g., "Sarah Chen", "Marcus Williams") instead of keeping recent updates (e.g., "The Uncut Podcast", "BMoni & Mr Ugandan Shnack").

**Root Cause**: React components had hardcoded default values that would get saved back to the database when the admin page was used.

## What Was Fixed (2026-02-01)

### Files Updated

1. **`components/MembersSection.tsx`** (lines 23-90)
   - Updated hardcoded `defaultMembers` array to match current database values
   - Added warning comments about keeping these in sync

2. **`app/admin/homepage/page.tsx`** (lines 75-137)
   - Updated hardcoded `members` initial state to match current database values
   - Added `dataLoadedFromDB` flag to track when data has been fetched
   - Added safeguard in `handleSave` to prevent saving before data loads
   - Added warning comments

### Current Correct Values (as of 2026-01-02)

```json
[
  {
    "name": "The Uncut Podcast",
    "role": "Podcasters / Content Creators"
  },
  {
    "name": "BMoni & Mr Ugandan Shnack",
    "role": "Online Personality & Fashion Model"
  },
  {
    "name": "Get the Gist Podcast",
    "role": "Podcasters / Content Creators"
  },
  {
    "name": "Septimus",
    "role": "Content Creator"
  },
  {
    "name": "Ratings & Reviews",
    "role": "Youtube Show"
  }
]
```

## Safeguards Now in Place

1. **Loading State Protection**
   - Admin page shows loading spinner until data is fetched from Supabase
   - Form is completely hidden during loading

2. **Save Button Disabled**
   - Save button is disabled until changes are made
   - Save button is disabled while saving

3. **Database Load Check**
   - `handleSave()` will throw an error if called before data loads from database
   - Error message: "Data not loaded from database. Please wait for the page to fully load before saving."

4. **Warning Comments**
   - Both files now have prominent comments warning developers about syncing defaults
   - Comments include the last update date

## How to Prevent This in the Future

### When Updating Member Content via Admin Panel

1. ✅ Use the admin panel at `/admin/homepage` - it will load current values
2. ✅ Wait for the page to fully load before making changes
3. ✅ Make your changes and save
4. ⚠️ After saving via admin panel, update the hardcoded defaults in both files

### When Updating Member Content Directly in Code

If you need to update members directly in code:

1. Update the database first (via Supabase UI or SQL)
2. Then update both:
   - `components/MembersSection.tsx` (lines 27-90) - the `defaultMembers` constant
   - `app/admin/homepage/page.tsx` (lines 80-137) - the `useState` initial value
3. Update the date in the warning comments

### Best Practice for Future Development

Consider refactoring to eliminate hardcoded defaults entirely:

```typescript
// Instead of hardcoded defaults, use empty array
const [members, setMembers] = useState<Member[]>([]);

// Show loading state while data loads
if (isLoading) {
  return <LoadingSpinner />;
}

// Only render content after data loads
if (members.length === 0) {
  return <EmptyState />;
}
```

This pattern eliminates the risk of stale defaults being saved.

## Database Information

- **System**: Supabase (PostgreSQL)
- **Table**: `site_content`
- **Query**:
  ```sql
  SELECT * FROM site_content
  WHERE page = 'homepage'
  AND section = 'clients'
  AND key = 'members'
  ```

## Files Involved

- `/components/MembersSection.tsx` - Frontend display component
- `/app/admin/homepage/page.tsx` - Admin editing interface
- `/lib/supabase.ts` - Supabase client configuration

## Testing After Changes

After updating member content:

1. Visit the homepage and verify new members display correctly
2. Hard refresh the page (Cmd+Shift+R) to clear any caching
3. Visit `/admin/homepage` and verify the correct members load
4. Make a small change and save to verify no reversion occurs
5. Check Supabase database to confirm the save was successful

## Emergency Recovery

If content reverts again:

1. Check Supabase `site_content` table for current values
2. Verify the `updated_at` timestamp on the `members` row
3. If data is incorrect in database, restore from this document's correct values
4. Update the hardcoded defaults in both component files
