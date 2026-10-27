export type StickerItem = {
  id: string;
  emoji: string;
  label: string;
  // Only set for streak-reward stickers: the minimum streak (in days, ever
  // reached — see utils/milestones.ts) required before it can be placed.
  unlockAt?: number;
};

export type StickerPack = {
  id: string;
  title: string;
  stickers: StickerItem[];
};

export const MAX_STICKERS_PER_ENTRY = 4;

export const STICKER_PACKS: StickerPack[] = [
  {
    id: 'basic',
    title: '기본 스티커',
    stickers: [
      { id: 'heart', emoji: '❤️', label: '하트' },
      { id: 'sparkle', emoji: '✨', label: '반짝' },
      { id: 'star', emoji: '⭐', label: '별' },
      { id: 'cloud', emoji: '☁️', label: '구름' },
      { id: 'sun', emoji: '🌞', label: '햇살' },
      { id: 'moon', emoji: '🌙', label: '달' },
      { id: 'flower', emoji: '🌸', label: '꽃' },
      { id: 'ribbon', emoji: '🎀', label: '리본' },
      { id: 'coffee', emoji: '☕', label: '커피' },
      { id: 'book', emoji: '📖', label: '책' },
      { id: 'music', emoji: '🎵', label: '음표' },
      { id: 'paw', emoji: '🐾', label: '발자국' },
    ],
  },
  {
    id: 'milestones',
    title: '연속 기록 보상',
    stickers: [
      { id: 'milestone-7', emoji: '🥉', label: '7일 연속', unlockAt: 7 },
      { id: 'milestone-30', emoji: '🥈', label: '30일 연속', unlockAt: 30 },
      { id: 'milestone-100', emoji: '🥇', label: '100일 연속', unlockAt: 100 },
    ],
  },
];

export function findStickerById(id: string): StickerItem | undefined {
  for (const pack of STICKER_PACKS) {
    const found = pack.stickers.find((s) => s.id === id);
    if (found) return found;
  }
  return undefined;
}

export function isStickerUnlocked(sticker: StickerItem, unlockedMilestones: number[]): boolean {
  if (sticker.unlockAt !== undefined) return unlockedMilestones.includes(sticker.unlockAt);
  return true;
}
