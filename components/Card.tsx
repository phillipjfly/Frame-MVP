import React, { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View, Text, Image } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

type CardProps = {
  postId: string;
  image_url: string;
  likes: { user_id: string }[];
  caption?: string | null;
  username?: string;
  avatar_url?: string | null;
  timeAgo?: string;
  loadedImages: Record<string, boolean>;
  markImageLoaded: (postId: string) => void;
  activeHeartPostId: string | null;
  handleFeedLike: (item: any) => Promise<void>;
  styles: any;
};

export function Card({
  postId,
  image_url,
  likes,
  caption,
  username = 'frame user',
  avatar_url,
  timeAgo = '2h ago',
  loadedImages,
  markImageLoaded,
  activeHeartPostId,
  handleFeedLike,
  styles,
}: CardProps) {
  const lastTap = useRef<number>(0);
  const item = { id: postId, image_url, likes };

  const handleImageTap = (item: any) => {
    const now = Date.now();

    if (now - lastTap.current < 300) {
      handleFeedLike(item);
    } else {
      setTimeout(() => {
        if (Date.now() - lastTap.current >= 300) {
          router.push({
            pathname: '/post/[id]',
            params: { id: item.id },
          });
        }
      }, 300);
    }

    lastTap.current = now;
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={() =>
        router.push({
          pathname: '/post/[id]',
          params: { id: postId },
        })
      }
    >
      <View style={styles.userRow}>
        <View style={styles.avatar}>
          {avatar_url ? (
            <Image source={{ uri: avatar_url }} style={styles.avatar} />
          ) : (
            <Text style={styles.avatarText}>{username.charAt(0).toUpperCase()}</Text>
          )}
        </View>
        <View>
          <Text style={styles.username}>{username}</Text>
          <Text style={styles.time}>{timeAgo}</Text>
        </View>
      </View>
      <Pressable onPress={() => handleImageTap(item)}>
        <View style={styles.imageWrap}>
          {!loadedImages[postId] && (
            <View style={styles.imagePlaceholder}>
              <ActivityIndicator size="small" color="#999999" />
            </View>
          )}

          <Image
            source={{ uri: item.image_url }}
            style={styles.image}
            onLoad={() => markImageLoaded(postId)}
          />

          {activeHeartPostId === item.id && (
            <Text style={styles.bigHeart}>❤️</Text>
          )}
        </View>
      </Pressable>
      {caption ? (
        <Text style={styles.caption} numberOfLines={1}>
          {caption}
        </Text>
      ) : null}
      <View style={styles.actions}>
        <Feather name="heart" size={18} color="#111" style={styles.actionIcon} />
        <Feather name="message-circle" size={18} color="#111" style={styles.actionIcon} />
        <Feather name="share-2" size={18} color="#111" style={styles.actionIcon} />
      </View>
    </Pressable>
  );
}
