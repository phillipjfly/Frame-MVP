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