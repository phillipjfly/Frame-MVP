import type { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { ensureProfileForUser } from '@/lib/profiles';
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

const syncProfile = async (nextSession: Session | null) => {
  if (!nextSession?.user) return;

  const { error } = await ensureProfileForUser(nextSession.user);
  if (error) {
    console.error('Error ensuring profile:', error);
  }
};

supabase.auth.getSession().then(({ data, error }) => {
  if (error) console.error('Error getting session:', error);
  if (!mounted) return;
  setSession(data.session);
  setLoading(false);

  syncProfile(data.session).catch((profileError) => {
    console.error('Error syncing profile:', profileError);
  });
});

const { data: listener } = supabase.auth.onAuthStateChange((_, nextSession: Session | null) => {
  if (!mounted) return;
  setSession(nextSession);
  setLoading(false);

  syncProfile(nextSession).catch((profileError) => {
    console.error('Error syncing profile:', profileError);
  });
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