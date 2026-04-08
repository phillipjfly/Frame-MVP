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