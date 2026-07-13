import type { SaveData, Subject } from '../types/game'

/**
 * エリアボス。
 * 「敵を倒す」ではなく「まなびの力で 元気にする」存在。
 * 理科・社会・英語は available:false の土台だけ用意してあり、
 * 問題がそろったら available を true にして pos を決めれば動く。
 */
export interface BossDef {
  id: Subject
  /** ボスの名まえ（こわくない よびかた） */
  name: string
  icon: string
  color: string
  /** 登場時のひとこと（1〜2文・ひらがな多め） */
  intro: string
  /** クリアしたときのひとこと */
  outro: string
  /** いま挑戦できる教科か（理科などは今後） */
  available: boolean
  /** ワールドのどこにいるか（available:true のみ使用） */
  pos: [number, number, number]
  /** 挑戦条件をみたしているか */
  isReady: (s: SaveData) => boolean
  /** 条件の説明 */
  conditionText: string
  /** あとどれくらいかのヒント（達成済みなら null） */
  remainingHint: (s: SaveData) => string | null
}

/** ボスチャレンジのルール（かんたんに調整できるようにここへ） */
export const BOSS_RULES = {
  /** ボスは5問（3問せいかいでクリア） */
  bossQuestions: 5,
  bossNeed: 3,
  /** しんでんは4問（こくご2＋さんすう2、3問せいかいでクリア） */
  templeQuestions: 4,
  templeNeed: 3,
  /** ヒントはチャレンジ中に1回だけ */
  hintLimit: 1,
}

export const BOSSES: BossDef[] = [
  {
    id: 'kokugo',
    name: 'ことばの もやもや',
    icon: '🌫️',
    color: '#8e7cc3',
    intro: 'もやもや〜…。ことばが わからなくて、もやもや しているの…。ことばの 力で わたしを 元気に して！',
    outro: 'もやが はれた〜！ ことばの 光を ありがとう！',
    available: true,
    pos: [-12, 0, -16.5],
    isReady: (s) => (s.stats.bySubject.kokugo?.cleared ?? 0) >= 5,
    conditionText: 'こくごの もんだいを 5もん クリアすると ちょうせんできるよ',
    remainingHint: (s) => {
      const left = 5 - (s.stats.bySubject.kokugo?.cleared ?? 0)
      return left > 0 ? `あと ${left}もん クリアで ちょうせんできるよ` : null
    },
  },
  {
    id: 'sansu',
    name: 'かずの からくり',
    icon: '⚙️',
    color: '#e8863b',
    intro: 'ガタ…ゴト…。かずが バラバラで うごけないんだ…。けいさんの 力で ぼくを なおして！',
    outro: 'カチッ！ うごけるように なったよ！ かずの 光を ありがとう！',
    available: true,
    pos: [12.5, 0, -15],
    isReady: (s) =>
      (s.stats.bySubject.sansu?.cleared ?? 0) >= 5 && s.totalMissionsCompleted >= 1,
    conditionText: 'さんすうを 5もん クリアして、ミッションを 1かい たっせいすると ちょうせんできるよ',
    remainingHint: (s) => {
      const left = 5 - (s.stats.bySubject.sansu?.cleared ?? 0)
      if (left > 0) return `あと ${left}もん クリアで ちょうせんできるよ`
      if (s.totalMissionsCompleted < 1) return 'ミッションを 1かい たっせいしよう'
      return null
    },
  },
  // ---- ここから下は 今後のための土台（まだ挑戦できない） ----
  {
    id: 'rika',
    name: 'しぜんの なぞ',
    icon: '🌀',
    color: '#26c6da',
    intro: '',
    outro: '',
    available: false,
    pos: [8, 0, -20],
    isReady: () => false,
    conditionText: 'じゅんびちゅう！ おたのしみに',
    remainingHint: () => 'じゅんびちゅう',
  },
  {
    id: 'shakai',
    name: 'まちの まよい道',
    icon: '🌪️',
    color: '#a1887f',
    intro: '',
    outro: '',
    available: false,
    pos: [20, 0, 5],
    isReady: () => false,
    conditionText: 'じゅんびちゅう！ おたのしみに',
    remainingHint: () => 'じゅんびちゅう',
  },
  {
    id: 'eigo',
    name: 'ことばの とびら',
    icon: '🚪',
    color: '#9575cd',
    intro: '',
    outro: '',
    available: false,
    pos: [-20, 0, 5],
    isReady: () => false,
    conditionText: 'じゅんびちゅう！ おたのしみに',
    remainingHint: () => 'じゅんびちゅう',
  },
]

export const BOSS_MAP: Record<string, BossDef> = Object.fromEntries(
  BOSSES.map((b) => [b.id, b]),
)

/** いま挑戦できるボス（ワールドに表示するもの） */
export const ACTIVE_BOSSES = BOSSES.filter((b) => b.available)

/** しんでんが ひらく条件：こくご＋さんすうの ボスをクリア */
export function isTempleReady(s: SaveData): boolean {
  return s.bossCleared.includes('kokugo') && s.bossCleared.includes('sansu')
}
