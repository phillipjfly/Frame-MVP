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