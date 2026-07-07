// 効果音システム。
// 外部の音源ファイルは使わず、Web Audio APIで短い電子音を生成する。
// - 音量はひかえめ（学校での利用を想定）
// - せっていでオフにすると完全に鳴らない
// - AudioContextは最初のユーザー操作のあとに開始する（自動再生制限対策）
// - エラーが出てもゲームは止まらない

export type SoundName =
  | 'tap' // ボタンを押した
  | 'correct' // 正解
  | 'wrong' // 不正解（やさしく）
  | 'coin' // コイン獲得
  | 'chest' // 宝箱を開けた
  | 'levelup' // レベルアップ
  | 'place' // ブロックを置いた
  | 'remove' // ブロックを消した
  | 'buy' // ショップで購入
  | 'talk' // NPCに話しかけた
  | 'jump' // ジャンプ

/** せっていと連動するフラグ（gameStoreが同期する） */
export const soundState = {
  enabled: true,
}

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  try {
    if (!ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      ctx = new AC()
    }
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  } catch {
    return null
  }
}

/**
 * 最初のユーザー操作でAudioContextを起動する。
 * App起動時に1回呼ぶ。戻り値で解除できる。
 */
export function initAudioUnlock(): () => void {
  const unlock = () => {
    getCtx()
  }
  window.addEventListener('pointerdown', unlock, { once: true })
  window.addEventListener('keydown', unlock, { once: true })
  return () => {
    window.removeEventListener('pointerdown', unlock)
    window.removeEventListener('keydown', unlock)
  }
}

/** 1音を鳴らす（低レベルヘルパー） */
function tone(
  c: AudioContext,
  {
    freq,
    duration,
    type = 'sine',
    volume = 0.1,
    delay = 0,
    slideTo,
  }: {
    freq: number
    duration: number
    type?: OscillatorType
    volume?: number
    delay?: number
    slideTo?: number
  },
) {
  const t0 = c.currentTime + delay
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, t0)
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + duration)
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(gain)
  gain.connect(c.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.05)
}

/** 効果音を鳴らす。オフのときや失敗時は静かに何もしない */
export function playSound(name: SoundName): void {
  if (!soundState.enabled) return
  try {
    const c = getCtx()
    if (!c) return
    switch (name) {
      case 'tap':
        tone(c, { freq: 660, duration: 0.06, type: 'square', volume: 0.05 })
        break
      case 'correct':
        // ドミソのあかるいアルペジオ
        tone(c, { freq: 523, duration: 0.14, volume: 0.1 })
        tone(c, { freq: 659, duration: 0.14, volume: 0.1, delay: 0.09 })
        tone(c, { freq: 784, duration: 0.22, volume: 0.11, delay: 0.18 })
        break
      case 'wrong':
        // やさしい「おしい」音（責めない、低く短く）
        tone(c, { freq: 392, duration: 0.12, type: 'triangle', volume: 0.07 })
        tone(c, { freq: 330, duration: 0.18, type: 'triangle', volume: 0.06, delay: 0.1 })
        break
      case 'coin':
        tone(c, { freq: 988, duration: 0.08, volume: 0.08 })
        tone(c, { freq: 1319, duration: 0.14, volume: 0.08, delay: 0.06 })
        break
      case 'chest':
        // ひらいて キラキラ
        tone(c, { freq: 440, duration: 0.1, type: 'triangle', volume: 0.09 })
        tone(c, { freq: 659, duration: 0.1, volume: 0.08, delay: 0.08 })
        tone(c, { freq: 880, duration: 0.1, volume: 0.08, delay: 0.16 })
        tone(c, { freq: 1319, duration: 0.24, volume: 0.09, delay: 0.24 })
        break
      case 'levelup':
        // 小さなファンファーレ
        tone(c, { freq: 523, duration: 0.12, volume: 0.1 })
        tone(c, { freq: 659, duration: 0.12, volume: 0.1, delay: 0.1 })
        tone(c, { freq: 784, duration: 0.12, volume: 0.1, delay: 0.2 })
        tone(c, { freq: 1047, duration: 0.34, volume: 0.12, delay: 0.3 })
        tone(c, { freq: 1319, duration: 0.3, volume: 0.07, delay: 0.38 })
        break
      case 'place':
        tone(c, { freq: 220, duration: 0.09, type: 'square', volume: 0.07 })
        tone(c, { freq: 330, duration: 0.06, type: 'square', volume: 0.05, delay: 0.03 })
        break
      case 'remove':
        tone(c, { freq: 330, duration: 0.12, type: 'square', volume: 0.06, slideTo: 180 })
        break
      case 'buy':
        // レジのチャリン
        tone(c, { freq: 880, duration: 0.08, volume: 0.08 })
        tone(c, { freq: 1175, duration: 0.16, volume: 0.09, delay: 0.07 })
        break
      case 'talk':
        tone(c, { freq: 440, duration: 0.07, type: 'triangle', volume: 0.08 })
        tone(c, { freq: 587, duration: 0.09, type: 'triangle', volume: 0.07, delay: 0.05 })
        break
      case 'jump':
        tone(c, { freq: 300, duration: 0.14, volume: 0.06, slideTo: 620 })
        break
    }
  } catch {
    // 音が鳴らせない環境でもゲームは続行する
  }
}
