Frame MVP build order
1) Recommended folder structure
Frame-MVP/
├─ app/
│  ├─ _layout.tsx
│  ├─ index.tsx
│  ├─ (auth)/
│  │  └─ login.tsx
│  ├─ (tabs)/
│  │  ├─ _layout.tsx
│  │  ├─ index.tsx
│  │  ├─ upload.tsx
│  │  └─ profile.tsx
│  └─ u/
│     └─ [id].tsx
├─ components/
│  ├─ feed/PostCard.tsx
│  ├─ forms/AuthForm.tsx
│  ├─ layout/Screen.tsx
│  └─ profile/ProfileHeader.tsx
├─ providers/AuthProvider.tsx
├─ services/
│  ├─ interactions.ts
│  ├─ posts.ts
│  └─ profiles.ts
├─ lib/supabase.ts
├─ constants/theme.ts
├─ types/db.ts
├─ supabase/migrations/20260407_frame_mvp.sql
└─ .env.example
2) Initial project setup steps
Copy .env.example to .env and set EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_ANON_KEY.

Install dependencies with npm install.

Create Supabase storage bucket named post-images and set it public for MVP simplicity.

Run the SQL migration in Supabase SQL editor.

Start app with npm run start.

3) Supabase schema for MVP tables
Use supabase/migrations/20260407_frame_mvp.sql.

Tables included:

profiles

posts

likes

comments

Includes row-level security policies for auth-safe CRUD.

4) Auth flow
AuthProvider listens for session changes.

app/index.tsx routes to login if unauthenticated, else tabs.

AuthForm supports email sign up + password login.

ensureProfile upserts profiles row after auth.

5) Placeholder screens for Feed, Upload, Profile
Feed tab scaffolds editorial list structure and empty state.

Upload tab scaffolds photo picker + caption + tags form.

Profile tab scaffolds personal profile and posts list.

6) Feature-by-feature implementation status
Implemented MVP features:

Email sign up / log in ✅

User profile ✅

Upload a photo post ✅

Add caption ✅

Add simple outfit tags ✅

Home feed ✅

Like posts ✅

Comment on posts ✅

View your own and other users' profiles ✅

Excluded by design for MVP:

Video

Messaging

Stories

Notifications

AI features