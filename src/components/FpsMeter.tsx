import { useEffect, useRef } from 'react'
import { perfInfo, recordFps } from '../game/perf'

/**
 * 開発時だけ表示する計測メーター。
 * 現在FPS／最低FPS／平均FPS と、three.jsの draw calls・triangles・
 * geometries・textures を表示する。
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
        recordFps(fps)
        if (ref.current) {
          const min = perfInfo.minFps === Infinity ? '-' : perfInfo.minFps
          ref.current.textContent =
            `${fps}fps (min ${min} / avg ${perfInfo.avgFps}) | ` +
            `calls ${perfInfo.drawCalls} | tri ${(perfInfo.triangles / 1000).toFixed(1)}k | ` +
            `geo ${perfInfo.geometries} | tex ${perfInfo.textures} | save ${perfInfo.lastStringifyMs.toFixed(1)}+${perfInfo.lastSetItemMs.toFixed(1)}ms`
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
