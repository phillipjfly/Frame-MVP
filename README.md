frame auth + supabase wiring (expo router)
This scaffold now wires Supabase auth into the Expo Router app with minimal editorial UI.

File placement and purpose
lib/supabase.ts

Reusable Supabase client.

Uses EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.

Persists auth session with AsyncStorage.

providers/AuthProvider.tsx

Global auth/session provider.

Restores session at app startup.

Subscribes to auth state changes.

app/_layout.tsx

Root app layout.

Wraps navigation in AuthProvider.

app/index.tsx

Initial redirect route.

Sends logged-out users to /(auth)/login and logged-in users to /(tabs).

app/(auth)/_layout.tsx

Auth-group guard.

Redirects logged-in users away from auth pages.

app/(auth)/login.tsx

Email/password login screen.

Includes loading + error states.

app/(auth)/signup.tsx

Email/password signup screen.

Creates a row in profiles after signup.

Includes loading + error/success states.

app/(tabs)/_layout.tsx

Bottom tab navigation for Feed, Upload, Profile.

Guards tabs so logged-out users are redirected to login.

app/(tabs)/index.tsx

Feed placeholder screen (minimal/editorial UI).

app/(tabs)/upload.tsx

Upload placeholder screen (minimal/editorial UI).

app/(tabs)/profile.tsx

Profile placeholder screen.

Shows current user email and log-out action.

supabase/sql/profiles.sql

SQL file kept separate from app code.

Creates public.profiles + RLS policies:

anyone can read profiles

users can insert their own profile

users can update only their own profile

.env.example

Template for required public Expo env vars.

Environment variables
Create .env at repo root:

EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
Next step
Run SQL in Supabase SQL editor: supabase/sql/profiles.sql

Add .env values.

Run app with Expo.

iOS setup
- `app.json` includes `expo.ios.bundleIdentifier`.
- Run locally on macOS with Xcode installed using `expo run:ios`.
- For EAS or native builds, ensure your iOS credentials and App Store settings are configured.