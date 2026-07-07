// 報酬・演出のイベントをまとめるモジュール。
// 効果音を入れるときは playFx() の中にサウンド再生を足すだけでよい。

import { useGameStore } from '../store/gameStore'

export type FxType = 'coins' | 'chest' | 'levelup' | 'badge' | 'correct'

/** ペットのきぶん（正解やレベルアップでよろこぶ） */
export const petMood = {
  celebrateUntil: 0,
}

export function petCelebrate(durationMs = 1800) {
  petMood.celebrateUntil = performance.now() + durationMs
}

/**
 * 演出を発火する。画面のキラキラはFxOverlayが表示する。
 * （将来ここに効果音の再生を追加する。settings.soundを見てON/OFF）
 */
export function playFx(type: FxType, text?: string) {
  useGameStore.getState().triggerFx(type, text)
  // TODO: フェーズ3で効果音を再生する
  // const { settings } = useGameStore.getState()
  // if (settings.sound === 'on') playSound(type)
}
