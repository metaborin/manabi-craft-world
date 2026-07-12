import { useFrame, useThree } from '@react-three/fiber'
import { perfInfo } from './perf'

/**
 * Copies three.js renderer metrics into perfInfo from inside Canvas.
 * This is read-only and only mounted in development.
 */
export function PerfProbe() {
  const gl = useThree((s) => s.gl)
  const advance = useThree((s) => s.advance)

  useFrame(() => {
    const info = gl.info
    perfInfo.drawCalls = info.render.calls
    perfInfo.triangles = info.render.triangles
    perfInfo.frames = info.render.frame
    perfInfo.geometries = info.memory.geometries
    perfInfo.textures = info.memory.textures
  })

  // Allow manual frame advancement while checking frameloop="demand" in dev.
  if (import.meta.env.DEV) {
    ;(window as unknown as Record<string, unknown>).__advanceFrame = (n = 1) => {
      for (let i = 0; i < n; i++) advance(performance.now(), true)
    }
  }

  return null
}
