import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { WorldCanvas } from '../game/WorldCanvas'
import { attachKeyboard, inputState, isTouchDevice } from '../game/input'
import { TouchControls, InteractButton } from '../components/TouchControls'
import { Hud } from '../components/Hud'
import { TutorialGuide } from '../components/TutorialGuide'
import { Toast } from '../components/Toast'
import { QuestModal } from './QuestModal'
import { UI } from '../data/uiText'

export function WorldScreen() {
  const save = useGameStore((s) => s.save)
  const quest = useGameStore((s) => s.quest)
  const touchSetting = useGameStore((s) => s.settings.touchButtons)
  const dragRef = useRef<{ id: number; x: number } | null>(null)

  useEffect(() => {
    return attachKeyboard(() => useGameStore.getState().interact())
  }, [])

  if (!save) return null

  const showTouchControls =
    touchSetting === 'on' || (touchSetting === 'auto' && isTouchDevice())

  return (
    <div className="screen world-screen">
      {/* 3Dワールド（ドラッグで視点回転） */}
      <div
        className="world-canvas-wrap"
        onPointerDown={(e) => {
          if (!dragRef.current) dragRef.current = { id: e.pointerId, x: e.clientX }
        }}
        onPointerMove={(e) => {
          if (dragRef.current?.id === e.pointerId) {
            inputState.cameraYaw -= (e.clientX - dragRef.current.x) * 0.006
            dragRef.current.x = e.clientX
          }
        }}
        onPointerUp={(e) => {
          if (dragRef.current?.id === e.pointerId) dragRef.current = null
        }}
        onPointerCancel={() => (dragRef.current = null)}
      >
        <WorldCanvas />
      </div>

      <Hud />
      <TutorialGuide />

      {/* 操作説明（PCでタッチボタン非表示のとき） */}
      {!showTouchControls && <div className="hud-help">{UI.world.keyboardHelp}</div>}

      {/* タッチボタンを出すときは中央のピルは出さない（右下にしらべるボタンがある） */}
      {showTouchControls ? <TouchControls /> : <InteractButton />}
      <Toast />
      {quest && <QuestModal />}
    </div>
  )
}
