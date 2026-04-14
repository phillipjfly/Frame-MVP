import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { supabase } from '@/lib/supabase';

export default function UploadScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  const choosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const publishPost = async () => {
    if (!imageUri) {
      Alert.alert('No photo selected', 'Choose a photo first.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert('Not logged in', 'Please log in again.');
      return;
    }

    try {
      setUploading(true);

      const manipulated = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 1080 } }],
        {
          compress: 0.75,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      const response = await fetch(manipulated.uri);
      const arrayBuffer = await response.arrayBuffer();

      const filePath = `${user.id}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('posts')
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      const { error: insertError } = await supabase.from('posts').insert([
        {
          user_id: user.id,
          image_url: imageUrl,
          caption: caption.trim() || null,
        },
      ]);

      if (insertError) throw insertError;

      Alert.alert('Success', 'Post uploaded.');
      setImageUri(null);
      setCaption('');
    } catch (error: any) {
      Alert.alert('Upload failed', error?.message || 'Something went wrong.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.wordmark}>frame</Text>
      <Text style={styles.title}>upload</Text>

      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      ) : (
        <Text style={styles.copy}>choose a photo to post</Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="write a caption"
        placeholderTextColor="#777777"
        value={caption}
        onChangeText={setCaption}
      />

      <Pressable style={styles.button} onPress={choosePhoto}>
        <Text style={styles.buttonText}>choose photo</Text>
      </Pressable>

      <Pressable
        style={[styles.button, uploading && styles.buttonDisabled]}
        onPress={publishPost}
        disabled={uploading}
      >
        <Text style={styles.buttonText}>
          {uploading ? 'publishing…' : 'publish'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    padding: 24,
    justifyContent: 'center',
    gap: 12,
  },
  wordmark: {
    color: '#FFFFFF',
    fontSize: 52,
    textTransform: 'lowercase',
    letterSpacing: 4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    textTransform: 'lowercase',
  },
  copy: {
    color: '#A3A3A3',
    textTransform: 'lowercase',
  },
  preview: {
    width: '100%',
    height: 280,
    borderRadius: 8,
    backgroundColor: '#111111',
  },
  input: {
    borderWidth: 1,
    borderColor: '#2A2A2A',
    color: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  button: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    textTransform: 'lowercase',
  },
});