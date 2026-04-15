import type { NamedStyles, ImagePost } from "@/types/tabs";
import type { ImageStyle } from "react-native";
import { Image, Text, View } from "react-native";

export default function Post({
  styles,
  item,
}: {
  styles: NamedStyles;
  item: ImagePost;
}) {
  return (
    <View style={styles.cardWrap}>
      <View style={styles.card}>
        <Image
          source={{ uri: item.image_url }}
          // Explicitly cast to ImageStyle to support image-specific
          style={styles.cardImage as ImageStyle}
        />

        {item.caption ? (
          <Text style={styles.caption} numberOfLines={1}>
            {item.caption}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
