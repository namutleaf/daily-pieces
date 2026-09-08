import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { FONT_ASSETS } from './src/data/fonts';
import { theme } from './src/theme';

export default function App() {
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);

  // Proceed even if the optional decorative fonts fail to load (e.g. no
  // network on first launch) rather than blocking the whole app forever;
  // text simply falls back to the system font wherever one didn't load.
  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: theme.bg }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootNavigator />
      <StatusBar style="dark" />
    </GestureHandlerRootView>
  );
}
