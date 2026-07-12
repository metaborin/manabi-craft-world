import { useEffect, useRef } from 'react'

/**
 * 開発時だけ表示する簡易FPSメーター。
 * Reactのstateを使わず、textContentを直接書き換えるので計測自体は軽い。
 * 本番ビルド（import.meta.env.DEV=false）では呼び出し側で表示しない。
 */
export function FpsMeter() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let frames = 0
    let last = performance.now()
    let raf = 0
    const loop = () => {
      frames++
      const now = performance.now()
      if (now - last >= 500) {
        const fps = Math.round((frames * 1000) / (now - last))
        if (ref.current) {
          ref.current.textContent = `${fps} FPS`
          ref.current.style.color = fps >= 50 ? '#2e7d32' : fps >= 30 ? '#b35a00' : '#c62828'
        }
        frames = 0
        last = now
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  return <div className="fps-meter" ref={ref} />
}
