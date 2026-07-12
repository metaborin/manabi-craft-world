import type { Grade, SaveData } from '../types/game'
import { emptyBuildLayers } from '../data/world'

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
    blocks: { grass: 3, dirt: 3, road: 2 },
    items: [],
    clearedQuests: [],
    badges: [],
    pet: null,
    buildLayers: emptyBuildLayers(),
    stats: { answered: 0, correct: 0, blocksPlaced: 0, bySubject: {} },
    lastPlayed: new Date().toISOString(),
    dailyCount: 0,
    dailyDate: todayString(),
    chestDate: '',
    tutorialStep: 0,
    tutorialDone: false,
    openedChests: [],
    metNPCs: [],
    daily: { date: todayString(), counters: {}, claimed: [], bonusClaimed: false },
    totalMissionsCompleted: 0,
    storyProgress: 0,
    earnedTitles: ['egg'],
    currentTitle: 'egg',
    playDays: 1,
    allMissionDays: 0,
  }
}

/** スロットからセーブデータを読み込む（なければnull） */
export function loadSave(slot: SlotId): SaveData | null {
  // 書き込み待ちのデータがあると古い内容を読んでしまうので、先に書き込む
  flushSave()
  try {
    const raw = localStorage.getItem(KEY_PREFIX + slot)
    if (!raw) return null
    const data = JSON.parse(raw) as SaveData
    if (data.version !== 1) return null
    // 日付が変わっていたら「きょうのカウント」をリセット＆あそんだ日数+1
    if (data.dailyDate !== todayString()) {
      data.dailyDate = todayString()
      data.dailyCount = 0
      data.playDays = (data.playDays ?? 1) + 1
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
    // フェーズ2.7：ミッション関連を補完。日付が変わっていたらリセット
    data.daily ??= { date: todayString(), counters: {}, claimed: [], bonusClaimed: false }
    if (data.daily.date !== todayString()) {
      data.daily = { date: todayString(), counters: {}, claimed: [], bonusClaimed: false }
    }
    data.totalMissionsCompleted ??= 0
    // フェーズ3.0：ストーリー・称号・日数を補完（古いセーブはオープニングをスキップ）
    data.storyProgress ??= data.stats.answered > 0 ? 1 : 0
    data.earnedTitles ??= ['egg']
    data.currentTitle ??= 'egg'
    data.playDays ??= 1
    data.allMissionDays ??= 0
    // フェーズ2.8：建築を3段レイヤーに拡張。旧buildGrid（1段）は1だんめに変換
    if (!data.buildLayers) {
      data.buildLayers = emptyBuildLayers()
      if (data.buildGrid) {
        for (let i = 0; i < Math.min(data.buildGrid.length, data.buildLayers[0].length); i++) {
          data.buildLayers[0][i] = data.buildGrid[i]
        }
        delete data.buildGrid
      }
    }
    return data
  } catch {
    return null
  }
}

/** スロットにセーブする */
export function writeSave(slot: SlotId, data: SaveData): void {
  try {
    data.lastPlayed = new Date().toISOString()
    if (import.meta.env.DEV) {
      // 開発時はJSON化と書き込みの時間を計測する
      const t0 = performance.now()
      const json = JSON.stringify(data)
      const t1 = performance.now()
      localStorage.setItem(KEY_PREFIX + slot, json)
      const t2 = performance.now()
      void import('../game/perf').then(({ perfInfo }) => {
        perfInfo.lastStringifyMs = t1 - t0
        perfInfo.lastSetItemMs = t2 - t1
        perfInfo.saveCount += 1
      })
    } else {
      localStorage.setItem(KEY_PREFIX + slot, JSON.stringify(data))
    }
  } catch {
    // 保存に失敗しても遊び続けられるようにする（容量不足など）
  }
}

// ---- 保存のdebounce ----
// 連続操作（建築の連打・クエスト連答など）で毎回JSON化＋同期書き込みをしないよう、
// 少し待ってからまとめて保存する。タブを閉じる直前は flushSave() で確実に書き込む。
let pendingSave: { slot: SlotId; data: SaveData } | null = null
let saveTimer: number | null = null
const SAVE_DELAY_MS = 400

/** 少し待ってから保存する（連続呼び出しは最後の1回だけ書き込まれる） */
export function scheduleSave(slot: SlotId, data: SaveData): void {
  pendingSave = { slot, data }
  if (saveTimer !== null) return
  saveTimer = window.setTimeout(() => {
    saveTimer = null
    flushSave()
  }, SAVE_DELAY_MS)
}

/** まだ書き込んでいないセーブを今すぐ書き込む */
export function flushSave(): void {
  if (saveTimer !== null) {
    clearTimeout(saveTimer)
    saveTimer = null
  }
  if (pendingSave) {
    const { slot, data } = pendingSave
    pendingSave = null
    writeSave(slot, data)
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
  // 書き込み待ちが後から復活させないように、同じスロットの保留分は捨てる
  if (pendingSave?.slot === slot) {
    pendingSave = null
    if (saveTimer !== null) {
      clearTimeout(saveTimer)
      saveTimer = null
    }
  }
  localStorage.removeItem(KEY_PREFIX + slot)
}

export { todayString }
