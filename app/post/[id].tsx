import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { supabase } from '@/lib/supabase';

type Post = {
  id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  user_id: string;
};

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from('posts')
        .select('id, image_url, caption, created_at, user_id')
        .eq('id', id)
        .single();

      if (!error && data) {
        setPost(data);
      }

      setLoading(false);
    };

    loadPost();
  }, [id]);

  useEffect(() => {
    const loadLikeState = async () => {
      if (!id) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUserId(user?.id ?? null);

      const { count } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', id);

      setLikeCount(count ?? 0);

      if (user?.id) {
        const { data: existingLike } = await supabase
          .from('likes')
          .select('id')
          .eq('post_id', id)
          .eq('user_id', user.id)
          .maybeSingle();

        setLiked(!!existingLike);
      }
    };

    loadLikeState();
  }, [id]);

  const handleLike = async () => {
    if (!userId || !id || likeLoading) return;

    setLikeLoading(true);

    if (liked) {
      // UNLIKE
      await supabase
        .from('likes')
        .delete()
        .eq('post_id', id)
        .eq('user_id', userId);

      setLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      // LIKE
      await supabase
        .from('likes')
        .insert([{ post_id: id, user_id: userId }]);

      setLiked(true);
      setLikeCount((prev) => prev + 1);
    }

    setLikeLoading(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="small" color="#999999" />
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.empty}>post not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Feather name="arrow-left" size={22} color="#111111" />
          </Pressable>
          <Text style={styles.headerTitle}>post</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Image source={{ uri: post.image_url }} style={styles.image} />

        <View style={styles.metaBlock}>
          <Text style={styles.username}>frame user</Text>
          {post.caption ? <Text style={styles.caption}>{post.caption}</Text> : null}
          <Text style={styles.timeText}>recent post</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity onPress={handleLike}>
            <Text style={{ fontSize: 22 }}>
              {liked ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
          <Text>{likeCount} likes</Text>
          <Feather name="message-circle" size={22} color="#111111" />
          <Feather name="bookmark" size={22} color="#111111" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F2',
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    color: '#666666',
    fontSize: 16,
    textTransform: 'lowercase',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECE8E1',
  },
  headerTitle: {
    fontSize: 22,
    color: '#111111',
    fontWeight: '600',
    textTransform: 'lowercase',
  },
  headerSpacer: {
    width: 36,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 22,
    resizeMode: 'cover',
    backgroundColor: '#E9E5E0',
  },
  metaBlock: {
    marginTop: 16,
    gap: 6,
  },
  username: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111111',
  },
  caption: {
    fontSize: 16,
    color: '#111111',
    lineHeight: 22,
  },
  timeText: {
    fontSize: 13,
    color: '#888888',
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
});
