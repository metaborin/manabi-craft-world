// プレイヤーの位置を画面をまたいで覚えておくモジュール。
// 建築・ショップ・ステータス画面から戻っても、同じ場所から続けられる。
// （セーブデータには入れない。リロードすると広場スタートに戻る）

import { inputState } from './input'

export const playerState = {
  pos: [0, 0, 5] as [number, number, number],
  /** trueにすると、次のフレームでひろばにもどる（つまり救出ボタン） */
  respawnQueued: false,
}

/** 新しいゲームを始めるとき・タイトルに戻るときに呼ぶ */
export function resetPlayerState() {
  playerState.pos = [0, 0, 5]
  playerState.respawnQueued = false
  inputState.cameraYaw = 0
}

/** 「ひろばへもどる」ボタンから呼ぶ */
export function requestRespawn() {
  playerState.respawnQueued = true
}
