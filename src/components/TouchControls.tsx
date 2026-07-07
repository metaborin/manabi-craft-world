import { useRef } from 'react'
import { inputState } from '../game/input'
import { useGameStore } from '../store/gameStore'

/**
 * タブレット・スマホ用の画面内コントローラー。
 * 左下：移動パッド ／ 右下：ジャンプボタン
 * （「しらべる」ボタンはHUD側で近くにいるときだけ表示）
 */
export function TouchControls() {
  const padRef = useRef<HTMLDivElement>(null)
  const knobRef = useRef<HTMLDivElement>(null)
  const activeId = useRef<number | null>(null)

  const updateFromPointer = (clientX: number, clientY: number) => {
    const pad = padRef.current
    const knob = knobRef.current
    if (!pad || !knob) return
    const rect = pad.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let dx = (clientX - cx) / (rect.width / 2)
    let dy = (clientY - cy) / (rect.height / 2)
    const len = Math.hypot(dx, dy)
    if (len > 1) {
      dx /= len
      dy /= len
    }
    inputState.touchX = dx
    inputState.touchZ = dy
    knob.style.transform = `translate(${dx * 34}px, ${dy * 34}px)`
  }

  const reset = () => {
    activeId.current = null
    inputState.touchX = 0
    inputState.touchZ = 0
    if (knobRef.current) knobRef.current.style.transform = 'translate(0px, 0px)'
  }

  return (
    <>
      <div
        ref={padRef}
        className="touch-pad"
        onPointerDown={(e) => {
          activeId.current = e.pointerId
          ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
          updateFromPointer(e.clientX, e.clientY)
        }}
        onPointerMove={(e) => {
          if (activeId.current === e.pointerId) updateFromPointer(e.clientX, e.clientY)
        }}
        onPointerUp={reset}
        onPointerCancel={reset}
      >
        <div className="touch-pad-knob" ref={knobRef} />
        <span className="touch-pad-label">いどう</span>
      </div>
      <button
        className="touch-jump"
        onPointerDown={(e) => {
          e.preventDefault()
          inputState.jump = true
        }}
        onPointerUp={() => {
          inputState.jump = false
        }}
        onPointerCancel={() => {
          inputState.jump = false
        }}
      >
        ジャンプ
      </button>
    </>
  )
}

/** 近くにNPCがいるときに出る「しらべる」ボタン */
export function InteractButton() {
  const nearby = useGameStore((s) => s.nearby)
  const interact = useGameStore((s) => s.interact)
  if (!nearby) return null
  const verb =
    nearby.kind === 'quest' ? 'はなす' : nearby.kind === 'chest' ? 'あける' : 'しらべる'
  return (
    <button className="interact-btn" onClick={interact}>
      🔍 {nearby.label}と {verb}
      <span className="interact-key">Eキー / タップ</span>
    </button>
  )
}
