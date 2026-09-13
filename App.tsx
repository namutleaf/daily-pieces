import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { AppState, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { FONT_ASSETS } from './src/data/fonts';
import { theme } from './src/theme';
import { getLockEnabled, authenticate } from './src/utils/lock';

if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const tryUnlock = useCallback(async () => {
    const success = await authenticate('Daily Pieces 잠금 해제');
    if (success) onUnlock();
  }, [onUnlock]);

  useEffect(() => {
    tryUnlock();
  }, [tryUnlock]);

  return (
    <SafeAreaView style={styles.lockContainer}>
      <Text style={styles.lockTitle}>🔒 Daily Pieces</Text>
      <Text style={styles.lockHint}>지문 또는 얼굴 인식으로 잠금을 해제해주세요</Text>
      <Pressable style={styles.lockButton} onPress={tryUnlock}>
        <Text style={styles.lockButtonText}>다시 시도</Text>
      </Pressable>
    </SafeAreaView>
  );
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);
  const [lockChecked, setLockChecked] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    getLockEnabled().then((enabled) => {
      setLocked(enabled);
      setLockChecked(true);
    });
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        getLockEnabled().then(setLocked);
      }
    });
    return () => subscription.remove();
  }, []);

  // Proceed even if the optional decorative fonts fail to load (e.g. no
  // network on first launch) rather than blocking the whole app forever;
  // text simply falls back to the system font wherever one didn't load.
  if ((!fontsLoaded && !fontError) || !lockChecked) {
    return <View style={{ flex: 1, backgroundColor: theme.bg }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {locked ? (
        <LockScreen onUnlock={() => setLocked(false)} />
      ) : (
        <RootNavigator />
      )}
      <StatusBar style="dark" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  lockContainer: {
    flex: 1,
    backgroundColor: theme.bg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
  },
  lockTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.ink,
  },
  lockHint: {
    fontSize: 14,
    color: theme.inkSoft,
    textAlign: 'center',
  },
  lockButton: {
    marginTop: 20,
    backgroundColor: theme.accent,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  lockButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
