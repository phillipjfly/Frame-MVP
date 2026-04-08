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