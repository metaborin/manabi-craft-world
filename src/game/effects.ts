// 報酬・演出のイベントをまとめるモジュール。
// 画面のキラキラ（FxOverlay）と効果音（sound.ts）をここで同時に発火する。

import { useGameStore } from '../store/gameStore'
import { playSound, type SoundName } from './sound'

export type FxType = 'coins' | 'chest' | 'levelup' | 'badge' | 'correct'

/** 演出タイプごとの効果音 */
const FX_SOUND: Record<FxType, SoundName> = {
  coins: 'coin',
  chest: 'chest',
  levelup: 'levelup',
  badge: 'coin',
  correct: 'correct',
}

/** ペットのきぶん（正解やレベルアップでよろこぶ） */
export const petMood = {
  celebrateUntil: 0,
}

export function petCelebrate(durationMs = 1800) {
  petMood.celebrateUntil = performance.now() + durationMs
}

/** 演出（キラキラ＋効果音）を発火する。音が鳴らなくても画面演出は動く */
export function playFx(type: FxType, text?: string) {
  playSound(FX_SOUND[type])
  useGameStore.getState().triggerFx(type, text)
}
