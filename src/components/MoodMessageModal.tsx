import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PaletteKey } from '../types';
import { MOOD_PALETTES, DEFAULT_PALETTE } from '../theme';

type Props = {
  visible: boolean;
  paletteKey: PaletteKey;
  message: string;
  customText: string;
  onChangeCustomText: (text: string) => void;
  onContinue: () => void;
};

export default function MoodMessageModal({
  visible,
  paletteKey,
  message,
  customText,
  onChangeCustomText,
  onContinue,
}: Props) {
  const palette = MOOD_PALETTES[paletteKey] ?? DEFAULT_PALETTE;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <LinearGradient
            colors={palette.colors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.content}>
            <Text style={styles.kicker}>오늘의 한마디</Text>
            <Text style={[styles.message, { color: palette.text }]}>{message}</Text>

            <TextInput
              style={[styles.input, { color: palette.text, borderColor: palette.subtext }]}
              value={customText}
              onChangeText={onChangeCustomText}
              placeholder="하고 싶은 말을 한 문장 적어보세요 (선택)"
              placeholderTextColor={palette.subtext}
            />

            <Pressable
              style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
              onPress={onContinue}
            >
              <Text style={styles.btnText}>일기 보러 가기</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  content: {
    padding: 28,
    alignItems: 'center',
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: 'rgba(0,0,0,0.45)',
    marginBottom: 14,
  },
  message: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 27,
    marginBottom: 24,
  },
  input: {
    width: '100%',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.35)',
    outlineWidth: 0,
  },
  btn: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  btnPressed: {
    opacity: 0.8,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2E2A26',
  },
});
