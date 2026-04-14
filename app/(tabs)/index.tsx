import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';

type Post = {
  id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
};

const categories = ['Feed', 'Fashion', 'Art', 'Travel', 'Food'];
const moodboards = ['Fall Fits 2025', 'Retro Album Cover', 'Vintage'];

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadPosts = async () => {
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
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  const gridPosts = useMemo(() => posts, [posts]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.content}
        data={gridPosts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        ListHeaderComponent={
          <View>
            <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, letterSpacing: 0.5 }}>Frame</Text>

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
                <Text
                  key={category}
                  style={[styles.tab, index === 0 && styles.tabActive]}
                >
                  {category}
                </Text>
              ))}
            </ScrollView>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <View style={styles.card}>
              <Image
                source={{ uri: item.image_url }}
                style={styles.cardImage}
              />

              {item.caption ? (
                <Text style={styles.caption} numberOfLines={1}>
                  {item.caption}
                </Text>
              ) : null}
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No posts yet</Text>}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#444"
          />
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
  brand: {
    fontSize: 32,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 16,
    marginTop: 4,
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
    marginBottom: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
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
  username: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 16,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 18,
    resizeMode: 'cover',
    backgroundColor: '#E9E5E0',
    marginTop: 8,
    marginBottom: 10,
  },
  caption: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Inter_600SemiBold',
    color: '#000',
    marginBottom: 6,
  },
  timeText: {
    fontSize: 13,
    color: '#999',
    marginTop: 2,
  },
  iconRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  captionPill: {
    position: 'absolute',
    bottom: 14,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  captionText: {
    color: '#111111',
    fontSize: 15,
    fontWeight: '500',
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
  empty: {
    color: '#777777',
    fontSize: 16,
    marginTop: 20,
  },
});
