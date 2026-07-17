import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'

/** 出てから 消えるまでの 時間（ミリ秒） */
const SHOW_MS = 4000
/** 消えるまえの フェードアウトの 時間 */
const FADE_MS = 400

/**
 * 画面のすみに 少しのあいだ出る おしらせ。
 *
 * ・ゲームの まんなかや、下の そうさボタンに かぶらない場所に出す（CSS）
 * ・4びょうで しずかに 消える
 * ・「✕」で すぐ 消せる（見た目より 大きい タップ領域）
 * ・せっていで「ひょうじしない」にすると 出ない
 *   （もんだいの ○×・かいせつ・かくにん画面は トーストではないので 消えない）
 */
export function Toast() {
  const toast = useGameStore((s) => s.toast)
  const show = useGameStore((s) => s.settings.messages !== 'off')
  // 「消した おしらせ」のIDを おぼえる。新しい おしらせが来たら また出る
  const [closedId, setClosedId] = useState<number | null>(null)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (!toast) return
    setLeaving(false)
    const fade = setTimeout(() => setLeaving(true), SHOW_MS - FADE_MS)
    const hide = setTimeout(() => setClosedId(toast.id), SHOW_MS)
    return () => {
      clearTimeout(fade)
      clearTimeout(hide)
    }
  }, [toast])

  if (!toast || !show || closedId === toast.id) return null

  return (
    <div
      className={`toast ${leaving ? 'toast-leaving' : ''}`}
      key={toast.id}
      role="status"
      aria-live="polite"
    >
      <span className="toast-text">{toast.text}</span>
      <button
        className="toast-close"
        onClick={() => setClosedId(toast.id)}
        aria-label="おしらせを とじる"
      >
        ✕
      </button>
    </div>
  )
}
