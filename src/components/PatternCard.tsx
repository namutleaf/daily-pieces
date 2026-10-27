import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { Pattern } from '../utils/insights';

const KIND_BADGE: Record<Pattern['kind'], { text: string; bg: string; fg: string }> = {
  bright: { text: '기분 좋은 날', bg: '#FFF1D6', fg: '#9A5B00' },
  weekday: { text: '기분 좋은 날', bg: '#FFF1D6', fg: '#9A5B00' },
  low: { text: '가라앉은 날', bg: '#E8ECF3', fg: '#4A5568' },
};

export default function PatternCard({ pattern }: { pattern: Pattern }) {
  const badge = KIND_BADGE[pattern.kind];
  return (
    <View style={styles.card}>
      <View style={styles.emojiWrap}>
        <Text style={styles.emoji}>{pattern.emoji}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.metaRow}>
          <Text style={styles.category}>{pattern.categoryTitle}</Text>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.fg }]}>{badge.text}</Text>
          </View>
        </View>
        <Text style={styles.label}>{pattern.label}</Text>
        <Text style={styles.detail}>{pattern.detail}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: theme.surface,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: theme.border,
    padding: 16,
  },
  emojiWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: theme.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  body: {
    flex: 1,
    gap: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  category: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.inkSoft,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.ink,
  },
  detail: {
    fontSize: 13,
    color: theme.inkSoft,
  },
});
