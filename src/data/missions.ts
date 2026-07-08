import type { MissionCounter, QuestReward, SaveData } from '../types/game'

/**
 * きょうのミッション。
 * いまは毎日おなじ固定セットだが、`missionsForDate()` を通して取得するので、
 * あとから日替わり（日付でローテーション）にしやすい。
 */
export interface MissionDef {
  id: string
  icon: string
  title: string
  /** 目標回数 */
  goal: number
  /** どのできごとを数えるか */
  counter: MissionCounter
  /** 達成報酬 */
  reward: QuestReward & { petExp?: number }
}

export const DAILY_MISSIONS: MissionDef[] = [
  {
    id: 'm-quest3',
    icon: '📚',
    title: 'もんだいを 3もん クリアしよう',
    goal: 3,
    counter: 'questsCleared',
    reward: { coins: 10, xp: 10, petExp: 2 },
  },
  {
    id: 'm-talk1',
    icon: '💬',
    title: 'せんせいや なかまと はなそう',
    goal: 1,
    counter: 'npcTalked',
    reward: { coins: 5, xp: 5 },
  },
  {
    id: 'm-chest1',
    icon: '🎁',
    title: 'たからばこを あけよう',
    goal: 1,
    counter: 'chestsOpened',
    reward: { coins: 5, xp: 5, petExp: 1 },
  },
  {
    id: 'm-build3',
    icon: '🧱',
    title: 'ブロックを 3こ おいてみよう',
    goal: 3,
    counter: 'blocksPlaced',
    reward: { coins: 5, xp: 5, blocks: { star: 1 } },
  },
  {
    id: 'm-shop1',
    icon: '🛒',
    title: 'ショップを のぞいてみよう',
    goal: 1,
    counter: 'shopVisited',
    reward: { coins: 5, xp: 5 },
  },
  {
    id: 'm-erase1',
    icon: '🧽',
    title: 'ブロックを 1こ けしてみよう',
    goal: 1,
    counter: 'blocksErased',
    reward: { coins: 5, xp: 5 },
  },
  {
    id: 'm-stack2',
    icon: '🏗️',
    title: 'ブロックを 2だんに つんでみよう',
    goal: 1,
    counter: 'blocksStacked',
    reward: { coins: 8, xp: 8, petExp: 1 },
  },
]

/** その日のミッション一覧（将来ここで日替わりにする） */
export function missionsForDate(_date: string): MissionDef[] {
  return DAILY_MISSIONS
}

/** ミッションの進行度（きょうのカウンターから） */
export function missionProgress(save: SaveData, m: MissionDef): number {
  return Math.min(save.daily.counters[m.counter] ?? 0, m.goal)
}

/** 達成済みか（受け取りはまだでもよい） */
export function missionDone(save: SaveData, m: MissionDef): boolean {
  return (save.daily.counters[m.counter] ?? 0) >= m.goal
}

/** 受け取り済みか */
export function missionClaimed(save: SaveData, m: MissionDef): boolean {
  return save.daily.claimed.includes(m.id)
}
