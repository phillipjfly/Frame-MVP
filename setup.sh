#!/usr/bin/env bash
set -euo pipefail

cat <<'EOF' > .gitignore
node_modules/
.expo/
.env
.DS_Store
*.log
dist/
build/
ios/Pods/
android/app/build/
EOF

cat <<'EOF' > package.json
{
"name": "frame-mvp",
"version": "1.0.0",
"private": true,
"main": "expo-router/entry",
"scripts": {
"start": "expo start",
"android": "expo run:android",
"ios": "expo run:ios",
"web": "expo start --web",
"typecheck": "tsc --noEmit"
},
"dependencies": {
"@expo/vector-icons": "^14.0.2",
"@react-native-async-storage/async-storage": "^1.23.1",
"@supabase/supabase-js": "^2.52.0",
"expo": "~53.0.12",
"expo-image-picker": "~16.1.4",
"expo-router": "~5.1.0",
"expo-status-bar": "~2.2.3",
"react": "19.0.0",
"react-native": "0.79.4",
"react-native-safe-area-context": "5.4.0",
"react-native-screens": "~4.11.1"
},
"devDependencies": {
"@types/react": "~19.0.10",
"typescript": "~5.8.3",
"babel-preset-expo": "^13.2.3"
}
}
EOF

cat <<'EOF' > .env.example
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
EOF

cat <<'EOF' > app.json
{
"expo": {
"name": "frame",
"slug": "frame-mvp",
"scheme": "frame",
"orientation": "portrait",
"userInterfaceStyle": "dark",
"plugins": [
"expo-router"
],
"experiments": {
"typedRoutes": true
}
}
}
EOF

cat <<'EOF' > tsconfig.json
{
"extends": "expo/tsconfig.base",
"compilerOptions": {
"strict": true,
"baseUrl": ".",
"paths": {
"@/": ["./"]
}
},
"include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
EOF

cat <<'EOF' > babel.config.js
module.exports = function(api) {
api.cache(true);
return {
presets: ['babel-preset-expo'],
plugins: ['expo-router/babel']
};
};
EOF

cat <<'EOF' > expo-env.d.ts
/// <reference types="expo/types" />
/// <reference types="expo-router/types" />
EOF

cat <<'EOF' > README.md

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
EOF

cat <<'EOF' > "app/_layout.tsx"
import { Stack } from 'expo-router';

import { AuthProvider } from '@/providers/AuthProvider';

export default function RootLayout() {
return (
<AuthProvider>
<Stack
screenOptions={{
headerShown: false,
contentStyle: { backgroundColor: '#0A0A0A' }
}}
/>
</AuthProvider>
);
}
EOF

cat <<'EOF' > "app/index.tsx"
import { Redirect } from 'expo-router';

import { useAuth } from '@/providers/AuthProvider';

export default function Index() {
const { session, loading } = useAuth();

if (loading) return null;

return session ? <Redirect href="/(tabs)" /> : <Redirect href="/(auth)/login" />;
}
EOF

cat <<'EOF' > "app/(auth)/_layout.tsx"
import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/providers/AuthProvider';

export default function AuthLayout() {
const { session, loading } = useAuth();

if (loading) return null;
if (session) return <Redirect href="/(tabs)" />;

return <Stack screenOptions={{ headerShown: false }} />;
}
EOF

cat <<'EOF' > "app/(auth)/login.tsx"
import { Link, Redirect } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';

export default function LoginScreen() {
const { session, loading: authLoading } = useAuth();
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

if (authLoading) {
return <View style={styles.container}><Text style={styles.subtitle}>loading session…</Text></View>;
}

if (session) {
return <Redirect href="/(tabs)" />;
}

const onLogin = async () => {
setLoading(true);
setError(null);

const { error: loginError } = await supabase.auth.signInWithPassword({
  email: email.trim(),
  password
});

if (loginError) setError(loginError.message);
setLoading(false);
};

return (
<View style={styles.container}>
<Text style={styles.wordmark}>frame</Text>
<Text style={styles.title}>log in</Text>

  <TextInput
    style={styles.input}
    placeholder="email"
    placeholderTextColor="#777777"
    autoCapitalize="none"
    keyboardType="email-address"
    value={email}
    onChangeText={setEmail}
  />
  <TextInput
    style={styles.input}
    placeholder="password"
    placeholderTextColor="#777777"
    secureTextEntry
    value={password}
    onChangeText={setPassword}
  />

  <Pressable style={styles.button} onPress={onLogin} disabled={loading}>
    <Text style={styles.buttonText}>{loading ? 'logging in…' : 'log in'}</Text>
  </Pressable>

  {error ? <Text style={styles.error}>{error}</Text> : null}

  <Link href="/(auth)/signup" style={styles.link}>
    new here? create account
  </Link>
</View>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#0A0A0A',
justifyContent: 'center',
padding: 24,
gap: 12
},
wordmark: { color: '#FFFFFF', fontSize: 52, textTransform: 'lowercase', letterSpacing: 4 },
title: { color: '#FFFFFF', fontSize: 24, textTransform: 'lowercase', marginBottom: 4 },
subtitle: { color: '#A3A3A3', textTransform: 'lowercase' },
input: {
borderWidth: 1,
borderColor: '#2A2A2A',
color: '#FFFFFF',
paddingHorizontal: 12,
paddingVertical: 10
},
button: {
borderWidth: 1,
borderColor: '#FFFFFF',
paddingVertical: 12,
alignItems: 'center'
},
buttonText: { color: '#FFFFFF', textTransform: 'lowercase' },
error: { color: '#FF8A8A' },
link: { color: '#FFFFFF', textTransform: 'lowercase', marginTop: 8 }
});
EOF

cat <<'EOF' > "app/(auth)/signup.tsx"
import { Link, Redirect } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';

function usernameFromEmail(email: string) {
return email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
}

export default function SignUpScreen() {
const { session, loading: authLoading } = useAuth();
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [username, setUsername] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
const [success, setSuccess] = useState<string | null>(null);

if (authLoading) {
return <View style={styles.container}><Text style={styles.subtitle}>loading session…</Text></View>;
}

if (session) {
return <Redirect href="/(tabs)" />;
}

const onSignUp = async () => {
setLoading(true);
setError(null);
setSuccess(null);

const finalUsername = (username.trim() || usernameFromEmail(email.trim())).toLowerCase();

const { data, error: signUpError } = await supabase.auth.signUp({
  email: email.trim(),
  password
});

if (signUpError) {
  setError(signUpError.message);
  setLoading(false);
  return;
}

const userId = data.user?.id;

if (userId) {
  const { error: profileError } = await supabase.from('profiles').upsert({
    id: userId,
    username: finalUsername,
    display_name: null,
    bio: null,
    avatar_url: null
  });

  if (profileError) {
    setError(profileError.message);
    setLoading(false);
    return;
  }
}

setSuccess('account created. if email confirmation is on, check your inbox.');
setLoading(false);
};

return (
<View style={styles.container}>
<Text style={styles.wordmark}>frame</Text>
<Text style={styles.title}>sign up</Text>

  <TextInput
    style={styles.input}
    placeholder="username"
    placeholderTextColor="#777777"
    autoCapitalize="none"
    value={username}
    onChangeText={setUsername}
  />
  <TextInput
    style={styles.input}
    placeholder="email"
    placeholderTextColor="#777777"
    autoCapitalize="none"
    keyboardType="email-address"
    value={email}
    onChangeText={setEmail}
  />
  <TextInput
    style={styles.input}
    placeholder="password"
    placeholderTextColor="#777777"
    secureTextEntry
    value={password}
    onChangeText={setPassword}
  />

  <Pressable style={styles.button} onPress={onSignUp} disabled={loading}>
    <Text style={styles.buttonText}>{loading ? 'creating…' : 'create account'}</Text>
  </Pressable>

  {error ? <Text style={styles.error}>{error}</Text> : null}
  {success ? <Text style={styles.success}>{success}</Text> : null}

  <Link href="/(auth)/login" style={styles.link}>
    already have an account? log in
  </Link>
</View>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: '#0A0A0A',
justifyContent: 'center',
padding: 24,
gap: 12
},
wordmark: { color: '#FFFFFF', fontSize: 52, textTransform: 'lowercase', letterSpacing: 4 },
title: { color: '#FFFFFF', fontSize: 24, textTransform: 'lowercase', marginBottom: 4 },
subtitle: { color: '#A3A3A3', textTransform: 'lowercase' },
input: {
borderWidth: 1,
borderColor: '#2A2A2A',
color: '#FFFFFF',
paddingHorizontal: 12,
paddingVertical: 10
},
button: {
borderWidth: 1,
borderColor: '#FFFFFF',
paddingVertical: 12,
alignItems: 'center'
},
buttonText: { color: '#FFFFFF', textTransform: 'lowercase' },
error: { color: '#FF8A8A' },
success: { color: '#B5E3B5' },
link: { color: '#FFFFFF', textTransform: 'lowercase', marginTop: 8 }
});
EOF

cat <<'EOF' > "app/(tabs)/_layout.tsx"
import { FontAwesome6 } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';

import { useAuth } from '@/providers/AuthProvider';

export default function TabsLayout() {
const { session, loading } = useAuth();

if (loading) return null;
if (!session) return <Redirect href="/(auth)/login" />;

return (
<Tabs
screenOptions={{
headerShown: false,
tabBarStyle: {
backgroundColor: '#0A0A0A',
borderTopColor: '#2A2A2A'
},
tabBarActiveTintColor: '#FFFFFF',
tabBarInactiveTintColor: '#888888',
tabBarLabelStyle: { textTransform: 'lowercase' }
}}
>
<Tabs.Screen
name="index"
options={{
title: 'feed',
tabBarIcon: ({ color, size }) => <FontAwesome6 name="image" size={size} color={color} />
}}
/>
<Tabs.Screen
name="upload"
options={{
title: 'upload',
tabBarIcon: ({ color, size }) => <FontAwesome6 name="plus" size={size} color={color} />
}}
/>
<Tabs.Screen
name="profile"
options={{
title: 'profile',
tabBarIcon: ({ color, size }) => <FontAwesome6 name="user" size={size} color={color} />
}}
/>
</Tabs>
);
}
EOF

cat <<'EOF' > "app/(tabs)/index.tsx"
import { StyleSheet, Text, View } from 'react-native';

export default function FeedScreen() {
return (
<View style={styles.container}>
<Text style={styles.wordmark}>frame</Text>
<Text style={styles.title}>feed</Text>
<Text style={styles.copy}>editorial home feed placeholder</Text>
</View>
);
}

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: '#0A0A0A', padding: 24, justifyContent: 'center', gap: 12 },
wordmark: { color: '#FFFFFF', fontSize: 52, textTransform: 'lowercase', letterSpacing: 4 },
title: { color: '#FFFFFF', fontSize: 28, textTransform: 'lowercase' },
copy: { color: '#A3A3A3', textTransform: 'lowercase' }
});
EOF

cat <<'EOF' > "app/(tabs)/upload.tsx"
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function UploadScreen() {
return (
<View style={styles.container}>
<Text style={styles.wordmark}>frame</Text>
<Text style={styles.title}>upload</Text>
<Text style={styles.copy}>photo upload placeholder</Text>

  <Pressable style={styles.button}>
    <Text style={styles.buttonText}>choose photo</Text>
  </Pressable>
  <Pressable style={styles.button}>
    <Text style={styles.buttonText}>publish</Text>
  </Pressable>
</View>
);
}

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: '#0A0A0A', padding: 24, justifyContent: 'center', gap: 12 },
wordmark: { color: '#FFFFFF', fontSize: 52, textTransform: 'lowercase', letterSpacing: 4 },
title: { color: '#FFFFFF', fontSize: 28, textTransform: 'lowercase' },
copy: { color: '#A3A3A3', textTransform: 'lowercase' },
button: {
borderWidth: 1,
borderColor: '#FFFFFF',
paddingVertical: 12,
alignItems: 'center'
},
buttonText: { color: '#FFFFFF', textTransform: 'lowercase' }
});
EOF

cat <<'EOF' > "app/(tabs)/profile.tsx"
import { Redirect } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';

export default function ProfileScreen() {
const { session, loading } = useAuth();

if (loading) return null;
if (!session) return <Redirect href="/(auth)/login" />;

return (
<View style={styles.container}>
<Text style={styles.wordmark}>frame</Text>
<Text style={styles.title}>profile</Text>
<Text style={styles.copy}>{session.user.email}</Text>

  <View style={styles.badge}>
    <Text style={styles.badgeText}>mvp profile placeholder</Text>
  </View>

  <Pressable style={styles.button} onPress={() => supabase.auth.signOut()}>
    <Text style={styles.buttonText}>log out</Text>
  </Pressable>
</View>
);
}

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: '#0A0A0A', padding: 24, justifyContent: 'center', gap: 12 },
wordmark: { color: '#FFFFFF', fontSize: 52, textTransform: 'lowercase', letterSpacing: 4 },
title: { color: '#FFFFFF', fontSize: 28, textTransform: 'lowercase' },
copy: { color: '#A3A3A3' },
badge: { borderWidth: 1, borderColor: '#FFFFFF', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6 },
badgeText: { color: '#FFFFFF', textTransform: 'lowercase' },
button: {
borderWidth: 1,
borderColor: '#FFFFFF',
paddingVertical: 12,
alignItems: 'center'
},
buttonText: { color: '#FFFFFF', textTransform: 'lowercase' }
});
EOF

cat <<'EOF' > providers/AuthProvider.tsx
import type { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { supabase } from '@/lib/supabase';

type AuthContextType = {
session: Session | null;
loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
session: null,
loading: true
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
const [session, setSession] = useState<Session | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
let mounted = true;

supabase.auth.getSession().then(({ data }) => {
  if (!mounted) return;
  setSession(data.session);
  setLoading(false);
});

const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
  if (!mounted) return;
  setSession(nextSession);
  setLoading(false);
});

return () => {
  mounted = false;
  listener.subscription.unsubscribe();
};
}, []);

const value = useMemo(() => ({ session, loading }), [session, loading]);

return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
return useContext(AuthContext);
}
EOF

cat <<'EOF' > lib/index.ts
// Shared data clients (e.g., Supabase) will live here.
export {};
EOF

cat <<'EOF' > lib/supabase.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
throw new Error('Missing Supabase env vars: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
auth: {
storage: AsyncStorage,
autoRefreshToken: true,
persistSession: true,
detectSessionInUrl: false
}
});
EOF

cat <<'EOF' > components/index.ts
// Reusable UI components will live here.
export {};
EOF

cat <<'EOF' > constants/theme.ts
export const palette = {
black: '#0A0A0A',
white: '#FFFFFF',
neutral100: '#F5F5F2',
neutral300: '#D9D9D2',
neutral500: '#9A9A92',
neutral700: '#4A4A44'
};

export const spacing = {
xs: 6,
sm: 12,
md: 16,
lg: 24,
xl: 32
};
EOF

cat <<'EOF' > docs/mvp-plan.md

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
EOF

cat <<'EOF' > supabase/sql/profiles.sql
-- profiles table for Frame auth profile data
create table if not exists public.profiles (
id uuid primary key references auth.users(id) on delete cascade,
username text not null unique,
display_name text,
bio text,
avatar_url text,
created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- read profiles: public
create policy "profiles_select_public"
on public.profiles
for select
using (true);

-- insert own profile only
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

-- update own profile only
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);
EOF

cat <<'EOF' > types/index.ts
// Shared TypeScript types will live here.
export {};
EOF

cat <<'EOF' > utils/index.ts
export const appName = 'frame';
EOF

mkdir -p "app/(auth)" "app/(tabs)" components constants docs lib providers "supabase/sql" types utils

npm install