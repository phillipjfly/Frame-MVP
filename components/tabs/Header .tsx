import { ScrollView, Text, TextInput, View } from "react-native";

import type { NamedStyles } from "@/types/tabs";
import { categories } from "@/data/tabs";

export default function ListHeaderComponent({
  styles,
}: {
  styles: NamedStyles;
}) {
  return (
    <View>
      <Text
        style={{
          fontFamily: "PlayfairDisplay_700Bold",
          fontSize: 26,
          letterSpacing: 0.5,
        }}
      >
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
          <Text
            key={category}
            style={[styles.tab, index === 0 && styles.tabActive]}
          >
            {category}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}
