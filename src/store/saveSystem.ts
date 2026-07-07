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
    lastPlayed: todayString(),
    dailyCount: 0,
    dailyDate: todayString(),
    chestDate: '',
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
    return data
  } catch {
    return null
  }
}

/** スロットにセーブする */
export function writeSave(slot: SlotId, data: SaveData): void {
  try {
    data.lastPlayed = todayString()
    localStorage.setItem(KEY_PREFIX + slot, JSON.stringify(data))
  } catch {
    // 保存に失敗しても遊び続けられるようにする（容量不足など）
  }
}

/** スロットのデータを消す */
export function deleteSave(slot: SlotId): void {
  localStorage.removeItem(KEY_PREFIX + slot)
}

export { todayString }
