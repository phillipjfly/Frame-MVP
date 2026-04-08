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