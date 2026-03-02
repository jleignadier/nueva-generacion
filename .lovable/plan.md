

## Fix "Miembro desde" (Member Since) Dates

### Problem
The `UserProfileModal` generates a **random** join date each time it renders, using `Math.floor(Math.random() * 12) + 1` months ago. This has nothing to do with the user's actual signup date stored in `profiles.created_at`.

### Solution

#### 1. Update `UserProfileModal` to accept a `joinDate` prop

Add `userJoinDate?: string` to the props interface. When provided, use it directly instead of generating a random date. Fall back to "Fecha no disponible" if not provided.

**File:** `src/components/UserProfileModal.tsx`
- Add `userJoinDate?: string` to `UserProfileModalProps`
- Replace the random date generation with:
  ```tsx
  const joinDate = userJoinDate 
    ? new Date(userJoinDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })
    : 'fecha no disponible';
  ```
- Remove the `Math.random()` logic entirely

#### 2. Fetch `created_at` in the leaderboard query and pass it through

**File:** `src/pages/tabs/LeaderboardTab.tsx`
- The leaderboard already fetches profile data via `get_user_leaderboard`. We need to check if `created_at` is available.
- Since the RPC function `get_user_leaderboard` doesn't return `created_at`, we'll fetch it on-demand when a user profile is clicked (a single query to `profiles` for that user's `created_at`).
- Pass the fetched `created_at` as `userJoinDate` to `UserProfileModal`.

#### 3. Implementation details

When a user clicks on a leaderboard entry to view their profile:
- Query `profiles.created_at` for the selected user's ID
- Store it in local state
- Pass it to `UserProfileModal` as `userJoinDate`

Note: Since `profiles` RLS only allows users to view their own profile (and admins to view all), we'll need to add `created_at` to the `get_user_leaderboard` RPC function so it's accessible to everyone.

#### 4. Database migration

Update the `get_user_leaderboard` function to also return `created_at` from the profiles table:

```sql
CREATE OR REPLACE FUNCTION public.get_user_leaderboard(p_limit integer DEFAULT 50)
RETURNS TABLE(
  user_id uuid, first_name text, last_name text, avatar_url text,
  organization_name text, points integer, total_hours numeric,
  events_attended integer, rank bigint, created_at timestamptz
)
...
  SELECT 
    up.user_id, p.first_name, p.last_name, p.avatar_url,
    o.name AS organization_name, up.points, up.total_hours,
    up.events_attended,
    RANK() OVER (ORDER BY up.points DESC, up.events_attended DESC),
    p.created_at
  FROM ...
```

### Files to modify
| File | Change |
|------|--------|
| Database migration | Add `created_at` to `get_user_leaderboard` return type |
| `src/components/UserProfileModal.tsx` | Add `userJoinDate` prop, remove random date generation |
| `src/pages/tabs/LeaderboardTab.tsx` | Pass `created_at` from leaderboard data to modal |

