import { Redirect } from 'expo-router';

import { useAuth } from '@/providers/AuthProvider';

export default function Index() {
const { session, loading } = useAuth();

if (loading) return null;

return session ? <Redirect href="/(tabs)" /> : <Redirect href="/(auth)/login" />;
}