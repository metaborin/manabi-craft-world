// Development performance metrics. These values are updated only in dev builds.
// They can also be inspected from window.__perf while debugging.
export const perfInfo = {
  // FPS metrics are updated by FpsMeter.
  fps: 0,
  minFps: Infinity,
  avgFps: 0,
  // three.js renderer.info metrics are updated by PerfProbe.
  drawCalls: 0,
  triangles: 0,
  geometries: 0,
  textures: 0,
  frames: 0,
  // Save timing metrics are updated by saveSystem.
  lastStringifyMs: 0,
  lastSetItemMs: 0,
  saveCount: 0,
}

/** Reset rolling FPS samples before a fresh measurement. */
export function resetPerf() {
  perfInfo.minFps = Infinity
  perfInfo.avgFps = 0
  fpsSamples.length = 0
}

export const fpsSamples: number[] = []

export function recordFps(fps: number) {
  perfInfo.fps = fps
  if (fps > 0 && fps < perfInfo.minFps) perfInfo.minFps = fps
  fpsSamples.push(fps)
  if (fpsSamples.length > 120) fpsSamples.shift()
  perfInfo.avgFps = Math.round(fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length)
}

/** Count React component renders in development. */
export function countRender(name: string) {
  if (!import.meta.env.DEV) return
  const w = window as unknown as { __renders?: Record<string, number> }
  w.__renders ??= {}
  w.__renders[name] = (w.__renders[name] ?? 0) + 1
}

if (import.meta.env.DEV) {
  ;(window as unknown as Record<string, unknown>).__perf = perfInfo
  ;(window as unknown as Record<string, unknown>).__resetPerf = resetPerf
}
