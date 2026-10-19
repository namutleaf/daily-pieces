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
  free: boolean;
  stickers: StickerItem[];
};

export const MAX_STICKERS_PER_ENTRY = 4;

// Basic illustrations everyone can use today. Later packs below are already
// modeled as locked/"coming soon" so a real shop (with paid packs) can slot
// in later without changing this data shape — just flip `free` and add a
// price field when that day comes.
export const STICKER_PACKS: StickerPack[] = [
  {
    id: 'basic',
    title: '기본 스티커',
    free: true,
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
    free: true,
    stickers: [
      { id: 'milestone-7', emoji: '🥉', label: '7일 연속', unlockAt: 7 },
      { id: 'milestone-30', emoji: '🥈', label: '30일 연속', unlockAt: 30 },
      { id: 'milestone-100', emoji: '🥇', label: '100일 연속', unlockAt: 100 },
    ],
  },
  {
    id: 'coming-soon',
    title: '새로 올 스티커',
    free: false,
    stickers: [
      { id: 'soon-balloon', emoji: '🎈', label: '풍선' },
      { id: 'soon-clover', emoji: '🍀', label: '클로버' },
      { id: 'soon-bear', emoji: '🧸', label: '곰돌이' },
      { id: 'soon-dove', emoji: '🕊️', label: '비둘기' },
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

// A sticker is pickable when its pack isn't gated (the "coming soon" pack)
// and, for reward stickers, the streak that unlocks it has been reached.
export function isStickerUnlocked(
  pack: StickerPack,
  sticker: StickerItem,
  unlockedMilestones: number[]
): boolean {
  if (!pack.free) return false;
  if (sticker.unlockAt !== undefined) return unlockedMilestones.includes(sticker.unlockAt);
  return true;
}
