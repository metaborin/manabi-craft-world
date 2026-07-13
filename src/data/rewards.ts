import type { BadgeDef, BlockDef, PetDef, SaveData } from '../types/game'

/** 建築に使えるブロックの種類 */
export const BLOCKS: BlockDef[] = [
  { id: 'grass', name: 'くさブロック', color: '#6abe30', emoji: '🟩', price: 5, category: 'block', inShop: true },
  { id: 'dirt', name: 'つちブロック', color: '#a0713c', emoji: '🟫', price: 5, category: 'block', inShop: true },
  { id: 'wood', name: 'きのブロック', color: '#c98f4e', emoji: '🪵', price: 8, category: 'block', inShop: true },
  { id: 'stone', name: 'いしブロック', color: '#9aa0a6', emoji: '🪨', price: 8, category: 'block', inShop: true },
  { id: 'brick', name: 'れんがブロック', color: '#d95f3b', emoji: '🧱', price: 10, category: 'block', inShop: true },
  { id: 'sand', name: 'すなブロック', color: '#f0d98c', emoji: '🏖️', price: 8, category: 'block', inShop: true },
  { id: 'water', name: 'みずブロック', color: '#5ec8f2', emoji: '💧', price: 10, category: 'block', inShop: true },
  { id: 'road', name: 'みちブロック', color: '#cbb37e', emoji: '🛤️', price: 5, category: 'block', inShop: true },
  { id: 'sky', name: 'みずいろブロック', color: '#9fdcf2', emoji: '🩵', price: 8, category: 'block', inShop: true },
  { id: 'glass', name: 'ガラスブロック', color: '#cfeef7', emoji: '🧊', price: 12, category: 'deco', inShop: true },
  { id: 'flower', name: 'はなブロック', color: '#ff7eb3', emoji: '🌸', price: 12, category: 'deco', inShop: true },
  { id: 'star', name: 'ほしブロック', color: '#ffd54f', emoji: '⭐', price: 20, category: 'deco', inShop: true },
  { id: 'gem', name: 'ほうせきブロック', color: '#b388ff', emoji: '💎', price: 25, category: 'deco', inShop: true },
  // ↓ ショップでは買えない。たからばこ・クエストで手に入るレアブロック
  { id: 'gold', name: 'きんのブロック', color: '#f5c518', emoji: '🥇', price: 40, category: 'deco', inShop: false },
  { id: 'bookshelf', name: 'ほんだなブロック', color: '#8d6248', emoji: '📚', price: 30, category: 'deco', inShop: false },
]

export const BLOCK_MAP: Record<string, BlockDef> = Object.fromEntries(
  BLOCKS.map((b) => [b.id, b]),
)

/** ペットの種類（ショップでたまごを買うとなかまになる） */
export const PETS: PetDef[] = [
  {
    id: 'robo',
    name: 'ちびロボ',
    color: '#8fb8d8',
    emoji: '🤖',
    price: 60,
    desc: 'メカだけど あまえんぼう。せいかいすると ピカピカ よろこぶ',
  },
  {
    id: 'usagi',
    name: 'ほしうさぎ',
    color: '#fff1c9',
    emoji: '🐰',
    price: 60,
    desc: 'よぞらから きた うさぎ。ぴょんぴょん はねるのが だいすき',
  },
  {
    id: 'ryu',
    name: 'こりゅう',
    color: '#8ed98c',
    emoji: '🐲',
    price: 60,
    desc: 'ちいさな ドラゴン。いつか おおきく なるかも…？',
  },
]

export const PET_MAP: Record<string, PetDef> = Object.fromEntries(
  PETS.map((p) => [p.id, p]),
)

/** ペットの成長段階を返す */
export function petStage(growth: number): string {
  if (growth >= 30) return 'おとな'
  if (growth >= 10) return 'こども'
  return 'あかちゃん'
}

/** ペットのレベル（成長ポイントから計算。5ポイントで1レベル） */
export const PET_EXP_PER_LEVEL = 5

export function petLevel(growth: number): number {
  return Math.floor(growth / PET_EXP_PER_LEVEL) + 1
}

/** いまのレベル内での進み具合（0〜1） */
export function petLevelProgress(growth: number): number {
  return (growth % PET_EXP_PER_LEVEL) / PET_EXP_PER_LEVEL
}

/** つぎのレベルまであと何ポイントか */
export function petExpToNext(growth: number): number {
  return PET_EXP_PER_LEVEL - (growth % PET_EXP_PER_LEVEL)
}

/** ペットの表示サイズ（レベルで少しずつ大きくなる） */
export function petScale(growth: number): number {
  return Math.min(1 + (petLevel(growth) - 1) * 0.07, 1.6)
}

/** つぎの成長段階までの情報（おとなになったらnull） */
export function petNextStage(
  growth: number,
): { next: string; remaining: number; progress: number } | null {
  if (growth < 10) return { next: 'こども', remaining: 10 - growth, progress: growth / 10 }
  if (growth < 30) return { next: 'おとな', remaining: 30 - growth, progress: (growth - 10) / 20 }
  return null
}

/** 学習バッジ。checkがtrueを返すと獲得 */
export const BADGES: (BadgeDef & { check: (s: SaveData) => boolean })[] = [
  {
    id: 'first-clear',
    name: 'はじめのいっぽ',
    desc: 'はじめて もんだいに チャレンジした',
    icon: '🌟',
    check: (s) => s.stats.answered >= 1,
  },
  {
    id: 'try-10',
    name: 'チャレンジャー',
    desc: '10もん チャレンジした',
    icon: '🔥',
    check: (s) => s.stats.answered >= 10,
  },
  {
    id: 'try-30',
    name: 'がんばりマスター',
    desc: '30もん チャレンジした',
    icon: '🏅',
    check: (s) => s.stats.answered >= 30,
  },
  {
    id: 'sansu-5',
    name: 'かずのたんけんか',
    desc: 'さんすうを 5もん クリアした',
    icon: '🔢',
    check: (s) => (s.stats.bySubject.sansu?.cleared ?? 0) >= 5,
  },
  {
    id: 'kokugo-5',
    name: 'ことばのたんけんか',
    desc: 'こくごを 5もん クリアした',
    icon: '📖',
    check: (s) => (s.stats.bySubject.kokugo?.cleared ?? 0) >= 5,
  },
  {
    id: 'sansu-15',
    name: 'けいさんマスター',
    desc: 'さんすうを 15もん クリアした',
    icon: '🧮',
    check: (s) => (s.stats.bySubject.sansu?.cleared ?? 0) >= 15,
  },
  {
    id: 'kokugo-15',
    name: 'ことばマスター',
    desc: 'こくごを 15もん クリアした',
    icon: '✍️',
    check: (s) => (s.stats.bySubject.kokugo?.cleared ?? 0) >= 15,
  },
  {
    id: 'level-5',
    name: 'レベル5とうたつ',
    desc: 'レベル5に なった',
    icon: '⬆️',
    check: (s) => s.level >= 5,
  },
  {
    id: 'level-10',
    name: 'レベル10とうたつ',
    desc: 'レベル10に なった',
    icon: '🚀',
    check: (s) => s.level >= 10,
  },
  {
    id: 'coins-100',
    name: 'コインあつめめいじん',
    desc: 'コインを 100まい ためた',
    icon: '🪙',
    check: (s) => s.coins >= 100,
  },
  {
    id: 'builder-1',
    name: 'はじめてのけんちく',
    desc: 'ブロックを おいてみた',
    icon: '🏠',
    check: (s) => s.stats.blocksPlaced >= 1,
  },
  {
    id: 'builder-20',
    name: 'けんちくか',
    desc: 'ブロックを 20こ おいた',
    icon: '🏰',
    check: (s) => s.stats.blocksPlaced >= 20,
  },
  {
    id: 'pet-get',
    name: 'ペットとなかよし',
    desc: 'ペットが なかまになった',
    icon: '🐾',
    check: (s) => s.pet !== null,
  },
  {
    id: 'chest-1',
    name: 'たからばこ はっけん',
    desc: 'かくされた たからばこを あけた',
    icon: '🎁',
    check: (s) => (s.openedChests?.length ?? 0) >= 1,
  },
  {
    id: 'chest-all',
    name: 'たからばこハンター',
    desc: 'たからばこを 5こ ぜんぶ あけた',
    icon: '🗝️',
    check: (s) => (s.openedChests?.length ?? 0) >= 5,
  },
  {
    id: 'mission-5',
    name: 'ミッションビギナー',
    desc: 'ミッションを 5かい たっせいした',
    icon: '🎯',
    check: (s) => (s.totalMissionsCompleted ?? 0) >= 5,
  },
  {
    id: 'mission-20',
    name: 'ミッションマスター',
    desc: 'ミッションを 20かい たっせいした',
    icon: '🏆',
    check: (s) => (s.totalMissionsCompleted ?? 0) >= 20,
  },
  {
    id: 'stack-2',
    name: 'はじめての 2かいだて',
    desc: 'ブロックを 2だんに つんだ',
    icon: '🏗️',
    check: (s) => s.buildLayers?.[1]?.some((c) => c !== null) ?? false,
  },
  {
    id: 'template-1',
    name: 'おてほん けんちくし',
    desc: 'おてほんで たてものを たてた',
    icon: '📐',
    check: (s) => (s.stats.templatesUsed ?? 0) >= 1,
  },
  {
    id: 'days-3',
    name: '3日 あそんだよ',
    desc: '3日 あそびに きてくれた',
    icon: '📅',
    check: (s) => (s.playDays ?? 0) >= 3,
  },
  {
    id: 'allmission-1',
    name: 'きょうの ぜんぶクリア',
    desc: 'きょうの ミッションを ぜんぶ たっせいした',
    icon: '🌟',
    check: (s) => (s.allMissionDays ?? 0) >= 1,
  },
  {
    id: 'pet-lv5',
    name: 'ペットマスター',
    desc: 'ペットが レベル5に なった',
    icon: '👑',
    check: (s) => (s.pet ? petLevel(s.pet.growth) >= 5 : false),
  },
]

/**
 * 称号。じょうけんをみたすと もらえて、ステータスで なのれる。
 */
export const TITLES: (BadgeDef & { check: (s: SaveData) => boolean })[] = [
  {
    id: 'egg',
    name: 'まなびの たまご',
    desc: 'ぼうけんの はじまり',
    icon: '🥚',
    check: () => true,
  },
  {
    id: 'explorer',
    name: 'ひろばの たんけんか',
    desc: 'たからばこを 3こ あけた',
    icon: '🗺️',
    check: (s) => (s.openedChests?.length ?? 0) >= 3,
  },
  {
    id: 'builder',
    name: 'ブロックビルダー',
    desc: 'ブロックを 20こ おいた',
    icon: '🏗️',
    check: (s) => s.stats.blocksPlaced >= 20,
  },
  {
    id: 'petfriend',
    name: 'ペットフレンド',
    desc: 'ペットが レベル3に なった',
    icon: '🐾',
    check: (s) => (s.pet ? petLevel(s.pet.growth) >= 3 : false),
  },
  {
    id: 'kotoba',
    name: 'ことばの みならい',
    desc: 'こくごを 5もん クリアした',
    icon: '📖',
    check: (s) => (s.stats.bySubject.kokugo?.cleared ?? 0) >= 5,
  },
  {
    id: 'kazu',
    name: 'かずの みならい',
    desc: 'さんすうを 5もん クリアした',
    icon: '🔢',
    check: (s) => (s.stats.bySubject.sansu?.cleared ?? 0) >= 5,
  },
]

export const TITLE_MAP: Record<string, BadgeDef> = Object.fromEntries(
  TITLES.map((t) => [t.id, t]),
)

/** ペットのレベルでふえる とくぎ */
export const PET_ABILITIES: { level: number; icon: string; desc: string }[] = [
  { level: 1, icon: '🚶', desc: 'いっしょに ぼうけんに ついてくる' },
  { level: 2, icon: '👃', desc: 'ちかくの たからばこの けはいを かんじる' },
  { level: 3, icon: '💡', desc: '「つぎにすること」を おしえてくれる' },
  { level: 4, icon: '🪙', desc: 'クエストのあと コインを 2まい ひろってくる' },
  { level: 5, icon: '👑', desc: 'とくべつな バッジを くれる' },
]

/** レベルアップに必要な経験値 */
export function xpForLevel(level: number): number {
  return 40 + (level - 1) * 30
}

/** 3もん・10もんクリアのボーナス */
export const DAILY_BONUS = {
  small: { at: 3, coins: 10, message: 'きょう 3もんクリア！ ボーナス +10コイン🪙' },
  big: { at: 10, coins: 30, message: 'きょう 10もんクリア！ すごい！ +30コイン🎉' },
}
