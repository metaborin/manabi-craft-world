import type { SaveData } from '../types/game'

/**
 * エリア解放システム。
 * 最初から: はじまり広場・こくご・さんすう・けんちく・ショップ
 * 条件をみたすと自動で解放され、お祝いの演出が出る。
 * 新しいエリアは、この配列に追加するだけでよい。
 */
export interface AreaDef {
  id: string
  name: string
  icon: string
  /** 解放条件をみたしているか */
  isUnlocked: (s: SaveData) => boolean
  /** 条件の説明（かんたんな ことばで） */
  conditionText: string
  /** あとどれくらいかのヒント（達成済みなら null） */
  remainingHint: (s: SaveData) => string | null
  /** ロック中ゲートを置くワールド座標 */
  gatePos: [number, number, number]
  /** このエリアの先生NPCのID（いれば） */
  npcId?: string
}

export const UNLOCKABLE_AREAS: AreaDef[] = [
  {
    id: 'rika',
    name: 'りかのいけ',
    icon: '🔬',
    isUnlocked: (s) => s.totalMissionsCompleted >= 3,
    conditionText: 'ミッションを 3かい たっせいすると ひらくよ',
    remainingHint: (s) => {
      const left = 3 - s.totalMissionsCompleted
      return left > 0 ? `あと ${left}かい ミッションを たっせいしよう` : null
    },
    gatePos: [4.5, 0, -13],
    npcId: 'npc-rika',
  },
  {
    id: 'shakai',
    name: 'しゃかいのまち',
    icon: '🗾',
    isUnlocked: (s) => s.badges.length >= 3,
    conditionText: 'バッジを 3こ あつめると ひらくよ',
    remainingHint: (s) => {
      const left = 3 - s.badges.length
      return left > 0 ? `あと ${left}こ バッジを あつめよう` : null
    },
    gatePos: [14.5, 0, 2],
    npcId: 'npc-shakai',
  },
  {
    id: 'eigo',
    name: 'えいごのみなと',
    icon: '🌍',
    isUnlocked: (s) => s.level >= 3,
    conditionText: 'レベル3に なると ひらくよ',
    remainingHint: (s) => (s.level < 3 ? `レベル${s.level}→3 まで もんだいを とこう` : null),
    gatePos: [-14.5, 0, 2],
    npcId: 'npc-eigo',
  },
  {
    id: 'tokubetsu',
    name: 'とくべつひろば',
    icon: '🌈',
    isUnlocked: (s) => s.stats.blocksPlaced >= 10,
    conditionText: 'ブロックを 10こ おくと ひらくよ',
    remainingHint: (s) => {
      const left = 10 - s.stats.blocksPlaced
      return left > 0 ? `あと ${left}こ ブロックを おこう` : null
    },
    gatePos: [-11.5, 0, 14.5],
  },
  {
    id: 'temple',
    name: 'まなびの しんでん',
    icon: '🏛️',
    isUnlocked: (s) => s.bossCleared.includes('kokugo') && s.bossCleared.includes('sansu'),
    conditionText: 'こくごボスと さんすうボスを クリアすると とびらが ひらくよ',
    remainingHint: (s) => {
      const left: string[] = []
      if (!s.bossCleared.includes('kokugo')) left.push('こくごボス')
      if (!s.bossCleared.includes('sansu')) left.push('さんすうボス')
      return left.length > 0 ? `${left.join('と ')}を クリアしよう` : null
    },
    gatePos: [0, 0, -16.5],
  },
]

export const AREA_MAP: Record<string, AreaDef> = Object.fromEntries(
  UNLOCKABLE_AREAS.map((a) => [a.id, a]),
)

/** NPCのIDから、そのNPCのエリアを引く */
export const NPC_AREA: Record<string, AreaDef> = Object.fromEntries(
  UNLOCKABLE_AREAS.filter((a) => a.npcId).map((a) => [a.npcId!, a]),
)

/** 図鑑用：ぜんぶのエリア（最初から開いているものもふくむ） */
export const ALL_AREAS: { id: string; name: string; icon: string }[] = [
  { id: 'plaza', name: 'はじまりひろば', icon: '⛲' },
  { id: 'kokugo', name: 'こくごのもり', icon: '📖' },
  { id: 'sansu', name: 'さんすうのおか', icon: '🔢' },
  { id: 'build', name: 'けんちくエリア', icon: '🏠' },
  { id: 'shop', name: 'ごほうびショップ', icon: '🛒' },
  ...UNLOCKABLE_AREAS.map((a) => ({ id: a.id, name: a.name, icon: a.icon })),
]

/** 解放されているか（ずっと前のセーブは unlockedAreas を持っている） */
export function isAreaUnlocked(s: SaveData, areaId: string): boolean {
  const def = AREA_MAP[areaId]
  if (!def) return true // 定義がないエリアは最初から開いている
  return s.unlockedAreas.includes(areaId)
}

/**
 * 条件をみたした未解放エリアを unlockedAreas に追加して、
 * 新しく開いたエリアの定義を返す（mutateSaveの中から呼ばれる）
 */
export function checkAreaUnlocks(s: SaveData): AreaDef[] {
  const newly: AreaDef[] = []
  for (const a of UNLOCKABLE_AREAS) {
    if (!s.unlockedAreas.includes(a.id) && a.isUnlocked(s)) {
      s.unlockedAreas.push(a.id)
      newly.push(a)
    }
  }
  return newly
}
