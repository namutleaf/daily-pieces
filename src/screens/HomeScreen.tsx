import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable
          style={({ pressed }) => pressed && styles.pressed}
          onPress={() => navigation.navigate('FontSettings')}
          hitSlop={12}
        >
          <Text style={styles.settingsText}>⚙️ 글꼴 설정</Text>
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Text style={styles.kicker}>DAILY PIECES</Text>
        <Text style={styles.title}>단어 조각으로{'\n'}오늘을 기록해요</Text>
        <Text style={styles.subtitle}>
          카드를 하나씩 고르면{'\n'}짧은 일기가 완성돼요
        </Text>
      </View>

      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.primaryBtn, pressed && styles.pressed]}
          onPress={() => navigation.navigate('ToneSelect')}
        >
          <Text style={styles.primaryBtnText}>오늘의 조각 모으기</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondaryBtn, pressed && styles.pressed]}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.secondaryBtnText}>지난 조각들 보기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  topBar: {
    alignItems: 'flex-end',
  },
  settingsText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.inkSoft,
  },
  hero: {
    marginTop: 24,
  },
  kicker: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 3,
    color: theme.accent,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.ink,
    lineHeight: 42,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: theme.inkSoft,
    lineHeight: 24,
  },
  actions: {
    gap: 12,
  },
  primaryBtn: {
    backgroundColor: theme.accent,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.border,
  },
  secondaryBtnText: {
    color: theme.ink,
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
