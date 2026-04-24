import type { PostgrestError, User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

const USERNAME_MAX_LENGTH = 20;
const DUPLICATE_USERNAME_CODE = '23505';
const NO_ROWS_FOUND_CODE = 'PGRST116';

function sanitizeUsername(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, USERNAME_MAX_LENGTH);
}

export function usernameFromEmail(email: string) {
  return sanitizeUsername(email.split('@')[0]);
}

function fallbackUsername(user: User, username: string) {
  const suffix = user.id.replace(/-/g, '').slice(0, 6);
  const base = username.slice(0, Math.max(1, USERNAME_MAX_LENGTH - suffix.length - 1));
  return `${base}_${suffix}`;
}

function getPreferredUsername(user: User) {
  const metadataUsername = user.user_metadata?.username;

  if (typeof metadataUsername === 'string') {
    const sanitized = sanitizeUsername(metadataUsername.trim());
    if (sanitized) {
      return sanitized;
    }
  }

  if (user.email) {
    const derived = usernameFromEmail(user.email.trim());
    if (derived) {
      return derived;
    }
  }

  return fallbackUsername(user, 'frame');
}

async function insertProfile(user: User, username: string) {
  return supabase.from('profiles').insert({
    id: user.id,
    username,
    display_name: null,
    bio: null,
    avatar_url: null,
  });
}

export async function ensureProfileForUser(user: User) {
  const { data: existingProfile, error: existingProfileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (existingProfile) {
    return { created: false, error: null as PostgrestError | null };
  }

  if (existingProfileError && existingProfileError.code !== NO_ROWS_FOUND_CODE) {
    return { created: false, error: existingProfileError };
  }

  const preferredUsername = getPreferredUsername(user);
  const { error } = await insertProfile(user, preferredUsername);

  if (!error) {
    return { created: true, error: null as PostgrestError | null };
  }

  if (error.code !== DUPLICATE_USERNAME_CODE) {
    return { created: false, error };
  }

  const retryUsername = fallbackUsername(user, preferredUsername);
  const retryResult = await insertProfile(user, retryUsername);

  return {
    created: !retryResult.error,
    error: retryResult.error,
  };
}