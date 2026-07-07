// キーボード・タッチ両方の入力をひとつにまとめるモジュール。
// Reactの再レンダリングを起こさず、毎フレーム読み取れるようにする。

export const inputState = {
  /** 移動方向（-1〜1）。カメラ基準で x=よこ, z=たて */
  moveX: 0,
  moveZ: 0,
  /** タッチパッドからの移動（キーボードと合成） */
  touchX: 0,
  touchZ: 0,
  jump: false,
  /** カメラの水平回転（ドラッグで変わる） */
  cameraYaw: 0,
}

const keys = new Set<string>()

function updateMoveFromKeys() {
  let x = 0
  let z = 0
  if (keys.has('KeyW') || keys.has('ArrowUp')) z -= 1
  if (keys.has('KeyS') || keys.has('ArrowDown')) z += 1
  if (keys.has('KeyA') || keys.has('ArrowLeft')) x -= 1
  if (keys.has('KeyD') || keys.has('ArrowRight')) x += 1
  inputState.moveX = x
  inputState.moveZ = z
}

/** キーボードリスナーを登録する。戻り値で解除 */
export function attachKeyboard(onInteract: () => void): () => void {
  const down = (e: KeyboardEvent) => {
    // 入力欄にフォーカスがあるときはゲーム操作しない
    const tag = (e.target as HTMLElement)?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') return
    if (e.code === 'Space') {
      inputState.jump = true
      e.preventDefault()
    }
    if (e.code === 'KeyE' || e.code === 'Enter') onInteract()
    keys.add(e.code)
    updateMoveFromKeys()
  }
  const up = (e: KeyboardEvent) => {
    if (e.code === 'Space') inputState.jump = false
    keys.delete(e.code)
    updateMoveFromKeys()
  }
  const blur = () => {
    keys.clear()
    inputState.jump = false
    updateMoveFromKeys()
  }
  window.addEventListener('keydown', down)
  window.addEventListener('keyup', up)
  window.addEventListener('blur', blur)
  return () => {
    window.removeEventListener('keydown', down)
    window.removeEventListener('keyup', up)
    window.removeEventListener('blur', blur)
    blur()
  }
}

/** タッチ対応端末かどうか */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}
