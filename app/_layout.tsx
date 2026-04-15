import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Inter_400Regular, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { PlayfairDisplay_700Bold } from "@expo-google-fonts/playfair-display";

import { AuthProvider } from "@/providers/AuthProvider";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    PlayfairDisplay_700Bold,
  });
  // console.log(fontsLoaded)

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0A0A0A" },
        }}
      />
    </AuthProvider>
  );
}
