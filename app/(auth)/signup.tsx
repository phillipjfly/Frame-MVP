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