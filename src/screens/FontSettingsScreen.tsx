import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { FONT_OPTIONS, FontKey } from '../data/fonts';
import { getFontPreference, setFontPreference } from '../utils/storage';
import { theme } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'FontSettings'>;

export default function FontSettingsScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<FontKey>('system');

  useEffect(() => {
    getFontPreference().then(setSelected);
  }, []);

  const handleSelect = async (key: FontKey) => {
    setSelected(key);
    await setFontPreference(key);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={styles.backText}>← 뒤로</Text>
        </Pressable>
        <Text style={styles.title}>글꼴 설정</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.hint}>일기 카드에 사용할 글꼴을 골라보세요</Text>

      <View style={styles.list}>
        {FONT_OPTIONS.map((font) => {
          const isActive = selected === font.key;
          return (
            <Pressable
              key={font.key}
              style={({ pressed }) => [
                styles.card,
                isActive && styles.cardActive,
                pressed && styles.pressed,
              ]}
              onPress={() => handleSelect(font.key)}
            >
              <View style={styles.cardText}>
                <Text style={styles.label}>
                  {isActive ? '✓ ' : ''}
                  {font.label}
                </Text>
                <Text style={[styles.sample, font.fontFamily && { fontFamily: font.fontFamily }]}>
                  {font.sample}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 8,
  },
  backText: {
    fontSize: 15,
    color: theme.inkSoft,
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.ink,
  },
  hint: {
    fontSize: 13,
    color: theme.inkSoft,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.border,
    padding: 18,
  },
  cardActive: {
    borderColor: theme.accent,
    backgroundColor: theme.accentSoft,
  },
  cardText: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.accent,
  },
  sample: {
    fontSize: 20,
    color: theme.ink,
  },
  pressed: {
    opacity: 0.8,
  },
});
