import type { Grade, SaveData } from '../types/game'
import { BUILD_GRID_SIZE } from '../data/world'

const KEY_PREFIX = 'manabi-craft-save-'

export type SlotId = 1 | 2

function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
}

/** 新しいセーブデータを作る */
export function createNewSave(name: string, avatar: number): SaveData {
  return {
    version: 1,
    name,
    avatar,
    grade: 1 as Grade,
    coins: 20,
    level: 1,
    xp: 0,
    unlockedAreas: ['plaza', 'sansu', 'kokugo', 'build', 'shop'],
    blocks: { grass: 3, dirt: 3 },
    items: [],
    clearedQuests: [],
    badges: [],
    pet: null,
    buildGrid: Array(BUILD_GRID_SIZE * BUILD_GRID_SIZE).fill(null),
    stats: { answered: 0, correct: 0, blocksPlaced: 0, bySubject: {} },
    lastPlayed: new Date().toISOString(),
    dailyCount: 0,
    dailyDate: todayString(),
    chestDate: '',
    tutorialStep: 0,
    tutorialDone: false,
    openedChests: [],
    metNPCs: [],
  }
}

/** スロットからセーブデータを読み込む（なければnull） */
export function loadSave(slot: SlotId): SaveData | null {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + slot)
    if (!raw) return null
    const data = JSON.parse(raw) as SaveData
    if (data.version !== 1) return null
    // 日付が変わっていたら「きょうのカウント」をリセット
    if (data.dailyDate !== todayString()) {
      data.dailyDate = todayString()
      data.dailyCount = 0
    }
    // フェーズ1のセーブにはチュートリアル項目がないので補完する
    // （すでに問題に答えたことがある子はチュートリアル済みとみなす）
    if (data.tutorialDone === undefined) {
      data.tutorialDone = data.stats.answered > 0
      data.tutorialStep = data.tutorialDone ? 6 : 0
    }
    // フェーズ2.5で追加された項目を補完する
    data.openedChests ??= []
    data.metNPCs ??= []
    return data
  } catch {
    return null
  }
}

/** スロットにセーブする */
export function writeSave(slot: SlotId, data: SaveData): void {
  try {
    data.lastPlayed = new Date().toISOString()
    localStorage.setItem(KEY_PREFIX + slot, JSON.stringify(data))
  } catch {
    // 保存に失敗しても遊び続けられるようにする（容量不足など）
  }
}

/** 「さいごにあそんだ日」の表示用（例: 7/7 19:30）。古い形式はそのまま返す */
export function formatLastPlayed(raw: string): string {
  const d = new Date(raw)
  if (isNaN(d.getTime())) return raw
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${pad(d.getMinutes())}`
}

/** スロットのデータを消す */
export function deleteSave(slot: SlotId): void {
  localStorage.removeItem(KEY_PREFIX + slot)
}

export { todayString }
