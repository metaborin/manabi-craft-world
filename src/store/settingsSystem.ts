import type { Quality, Settings } from '../types/game'

const KEY = 'manabi-craft-settings'

export const DEFAULT_SETTINGS: Settings = {
  textSize: 'normal',
  touchButtons: 'auto',
  sound: 'on',
  furigana: 'on',
  liteMode: 'off',
}

/** 端末に保存された設定を読み込む */
export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

/**
 * 実際に使う描画品質を決める。
 * quality が明示されていればそれを、なければ けいりょうモードから決める。
 */
export function getQuality(settings: Settings): Quality {
  return settings.quality ?? (settings.liteMode === 'on' ? 'lite' : 'normal')
}

/** 設定を端末に保存する */
export function writeSettings(settings: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings))
  } catch {
    // 保存できなくても遊べるようにする
  }
}
