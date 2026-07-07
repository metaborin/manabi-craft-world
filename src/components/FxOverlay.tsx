import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'

/**
 * 報酬などの演出（キラキラ・コインのポップ）を画面に重ねて表示する。
 * store.fx が更新されるたびに1回再生する。
 * 効果音はフェーズ3で src/game/effects.ts の playFx に追加する。
 */
export function FxOverlay() {
  const fx = useGameStore((s) => s.fx)
  const [active, setActive] = useState<typeof fx>(null)

  useEffect(() => {
    if (!fx) return
    setActive(fx)
    const t = setTimeout(() => setActive(null), 1600)
    return () => clearTimeout(t)
  }, [fx])

  if (!active) return null

  const emojis =
    active.type === 'chest'
      ? ['✨', '🪙', '⭐', '✨', '🎁', '🪙', '✨', '⭐']
      : active.type === 'levelup'
        ? ['🎉', '⭐', '✨', '🎊', '⭐', '✨', '🎉', '⭐']
        : ['✨', '🪙', '✨', '🪙', '✨', '🪙', '✨', '🪙']

  return (
    <div className="fx-overlay" key={active.id} aria-hidden>
      {emojis.map((e, i) => (
        <span
          key={i}
          className="fx-burst"
          style={
            {
              '--dx': `${Math.cos((i / emojis.length) * Math.PI * 2) * (70 + (i % 3) * 30)}px`,
              '--dy': `${Math.sin((i / emojis.length) * Math.PI * 2) * (50 + (i % 3) * 25) - 60}px`,
              animationDelay: `${i * 0.04}s`,
            } as React.CSSProperties
          }
        >
          {e}
        </span>
      ))}
      {active.text && <div className="fx-text">{active.text}</div>}
    </div>
  )
}
