import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components';
import { supabase } from '@/lib/supabase';

type Post = {
  id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  user_id: string;
  likes: { user_id: string }[];
  profiles?: {
    username: string;
    avatar_url: string | null;
  } | null;
};

const categories = ['Feed', 'Fashion', 'Art', 'Travel', 'Food'];
const moodboards = ['Fall Fits 2025', 'Retro Album Cover', 'Vintage'];

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [activeHeartPostId, setActiveHeartPostId] = useState<string | null>(null);

  const markImageLoaded = useCallback((postId: string) => {
    setLoadedImages((prev) => ({
      ...prev,
      [postId]: true,
    }));
  }, []);

  const loadPosts = async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    setUser(authUser ? { id: authUser.id } : null);

    const { data, error } = await supabase
      .from('posts')
      .select(`
        id,
        image_url,
        caption,
        created_at,
        user_id,
        likes ( user_id )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.log('feed load error:', error);
      return;
    }

    setPosts(data ?? []);
  };

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const handleFeedLike = async (item: any) => {
    if (!user?.id) return;

    const userLiked = item.likes?.some(
      (like: any) => like.user_id === user?.id
    );

    if (userLiked) {
      const { error } = await supabase
        .from('likes')
        .delete()
        .eq('post_id', item.id)
        .eq('user_id', user.id);

      if (!error) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === item.id
              ? {
                  ...post,
                  likes: post.likes.filter(
                    (like: any) => like.user_id !== user.id
                  ),
                }
              : post
          )
        );
      }
    } else {
      const { data, error } = await supabase
        .from('likes')
        .insert([{ post_id: item.id, user_id: user.id }])
        .select();

      if (!error && data) {
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === item.id
              ? {
                  ...post,
                  likes: [...(post.likes ?? []), { user_id: user.id }],
                }
              : post
          )
        );

        setActiveHeartPostId(item.id);
        setTimeout(() => {
          setActiveHeartPostId(null);
        }, 600);
      }
    }
  };

  console.log('feed posts:', posts);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.content}
        data={posts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        ListHeaderComponent={
          <View>
            <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, letterSpacing: 0.5 }}>
              Frame
            </Text>

            <View style={styles.searchBar}>
              <TextInput
                placeholder="Search"
                placeholderTextColor="#9A9A9A"
                style={styles.searchInput}
              />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabs}
            >
              {categories.map((category, index) => (
                <Text key={category} style={[styles.tab, index === 0 && styles.tabActive]}>
                  {category}
                </Text>
              ))}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => {
          const likeCount = item.likes?.length ?? 0;
          const userLiked = item.likes?.some(
            (like: any) => like.user_id === user?.id
          );

          return (
            <View style={styles.cardWrap}>
              <Card
                postId={item.id}
                image_url={item.image_url}
                likes={item.likes}
                caption={item.caption}
                username={item.profiles?.username}
                avatar_url={item.profiles?.avatar_url}
                timeAgo="2h ago"
                loadedImages={loadedImages}
                markImageLoaded={markImageLoaded}
                activeHeartPostId={activeHeartPostId}
                handleFeedLike={handleFeedLike}
                styles={styles}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Pressable onPress={() => handleFeedLike(item)}>
                  <Text style={{ fontSize: 20 }}>
                    {userLiked ? '❤️' : '🤍'}
                  </Text>
                </Pressable>

                <Text>{likeCount} likes</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No posts yet</Text>}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#444" />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F2',
  },
  list: {
    flex: 1,
    backgroundColor: '#F7F5F2',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 42,
  },
  searchBar: {
    backgroundColor: '#EFECE8',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 18,
  },
  searchInput: {
    fontSize: 18,
    color: '#111111',
  },
  tabs: {
    gap: 12,
    paddingBottom: 18,
  },
  tab: {
    fontSize: 16,
    color: '#8A8A8A',
    fontWeight: '500',
  },
  tabActive: {
    color: '#111111',
    fontWeight: '700',
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  cardWrap: {
    width: '48.5%',
    marginBottom: 14,
  },
  card: {
    marginBottom: 28,
    paddingHorizontal: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ccc',
    marginRight: 8,
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 32,
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Inter_600SemiBold',
  },
  time: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  image: {
    width: '100%',
    height: 320,
    borderRadius: 18,
  },
  imageWrap: {
    position: 'relative',
    width: '100%',
    marginTop: 8,
  },
  imagePlaceholder: {
    position: 'absolute',
    inset: 0,
    height: 320,
    borderRadius: 18,
    backgroundColor: '#ECE8E1',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  bigHeart: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    fontSize: 72,
  },
  caption: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'Inter_400Regular',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    gap: 14,
  },
  actionIcon: {
    marginRight: 16,
  },
  empty: {
    color: '#777777',
    fontSize: 16,
    marginTop: 20,
  },
  footerSection: {
    marginTop: 28,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 16,
  },
  pills: {
    gap: 12,
    paddingBottom: 8,
  },
  pill: {
    backgroundColor: '#EFECE8',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  pillText: {
    color: '#111111',
    fontSize: 16,
    fontWeight: '500',
  },
});
