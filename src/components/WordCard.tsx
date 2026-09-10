import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { WordItem } from '../types';
import { theme } from '../theme';

type Props = {
  word: WordItem;
  selected?: boolean;
  disabled?: boolean;
  onPress: (word: WordItem) => void;
};

export default function WordCard({ word, selected, disabled, onPress }: Props) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  // Randomized once per card instance so every card bobs at its own pace,
  // like independent balloons rather than a synchronized grid.
  const { duration, driftY, tilt, delay } = useMemo(
    () => ({
      duration: 2200 + Math.random() * 1600,
      driftY: 3 + Math.random() * 2.5,
      tilt: 2 + Math.random() * 2.5,
      delay: Math.random() * 500,
    }),
    []
  );

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [floatAnim, duration, delay]);

  const translateY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [driftY, -driftY] });
  const rotate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [`-${tilt}deg`, `${tilt}deg`],
  });

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(pressAnim, { toValue: 0.88, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
  };
  const handlePressOut = () => {
    Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 10 }).start();
  };

  return (
    <Pressable
      disabled={disabled}
      onPress={() => onPress(word)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.touchArea}
    >
      <Animated.View
        style={[
          styles.card,
          selected && styles.cardSelected,
          { transform: [{ translateY }, { rotate }, { scale: pressAnim }] },
        ]}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.65)', 'rgba(255,255,255,0)']}
          start={{ x: 0.15, y: 0.05 }}
          end={{ x: 0.7, y: 0.7 }}
          style={styles.shine}
          pointerEvents="none"
        />
        <Text style={styles.emoji}>{word.emoji}</Text>
        <Text style={styles.label}>{word.label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  touchArea: {
    width: '22%',
    aspectRatio: 1.1,
    marginBottom: 22,
  },
  card: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#7A6A55',
    shadowOpacity: 0.22,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 7 },
    elevation: 6,
  },
  cardSelected: {
    borderColor: theme.accent,
    backgroundColor: theme.accentSoft,
  },
  shine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  emoji: {
    fontSize: 18,
    marginBottom: 4,
  },
  label: {
    fontSize: 10.5,
    fontWeight: '600',
    color: theme.ink,
    textAlign: 'center',
  },
});
