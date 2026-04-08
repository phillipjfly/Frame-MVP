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