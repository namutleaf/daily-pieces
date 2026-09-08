import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { FONT_ASSETS } from './src/data/fonts';
import { theme } from './src/theme';

export default function App() {
  const [fontsLoaded] = useFonts(FONT_ASSETS);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: theme.bg }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootNavigator />
      <StatusBar style="dark" />
    </GestureHandlerRootView>
  );
}
