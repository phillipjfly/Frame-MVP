import { useCallback, useState } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/providers/AuthProvider';

type Post = {
  id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
};

export default function ProfileScreen() {
  const { session, loading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadPosts = async () => {
    if (!session?.user?.id) return;

    const { data, error } = await supabase
      .from('posts')
      .select('id, image_url, caption, created_at')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [session?.user?.id])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  if (loading || !session) {
    return null;
  }

  const username = session.user.email?.split('@')[0] ?? 'frame user';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.wordmark}>frame</Text>
      <Text style={styles.title}>profile</Text>

      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {username.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.headerInfo}>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.email}>{session.user.email}</Text>
          <Text style={styles.meta}>{posts.length} post{posts.length === 1 ? '' : 's'}</Text>
        </View>
      </View>

      <Pressable style={styles.logoutButton} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.logoutText}>log out</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>your posts</Text>

      {posts.length === 0 ? (
        <Text style={styles.empty}>you haven\'t posted anything yet</Text>
      ) : (
        <View style={styles.grid}>
          {posts.map((post) => (
            <View key={post.id} style={styles.postCard}>
              <Image source={{ uri: post.image_url }} style={styles.postImage} />
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  wordmark: {
    color: '#FFFFFF',
    fontSize: 52,
    textTransform: 'lowercase',
    letterSpacing: 4,
    marginBottom: 8,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    textTransform: 'lowercase',
    marginBottom: 20,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F0F0F',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
    gap: 4,
  },
  username: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
  },
  email: {
    color: '#A3A3A3',
    fontSize: 14,
  },
  meta: {
    color: '#FFFFFF',
    fontSize: 14,
    textTransform: 'lowercase',
  },
  logoutButton: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  logoutText: {
    color: '#FFFFFF',
    textTransform: 'lowercase',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    textTransform: 'lowercase',
    marginBottom: 16,
  },
  empty: {
    color: '#A3A3A3',
    textTransform: 'lowercase',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  postCard: {
    width: '32%',
  },
  postImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
  },
  caption: {
    color: '#FFFFFF',
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
});