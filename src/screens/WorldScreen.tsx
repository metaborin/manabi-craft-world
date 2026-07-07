import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { WorldCanvas } from '../game/WorldCanvas'
import { attachKeyboard, inputState, isTouchDevice } from '../game/input'
import { TouchControls, InteractButton } from '../components/TouchControls'
import { Hud } from '../components/Hud'
import { TutorialGuide } from '../components/TutorialGuide'
import { Toast } from '../components/Toast'
import { DialogBox } from '../components/DialogBox'
import { FxOverlay } from '../components/FxOverlay'
import { QuestModal } from './QuestModal'
import { UI } from '../data/uiText'

export function WorldScreen() {
  const save = useGameStore((s) => s.save)
  const quest = useGameStore((s) => s.quest)
  const touchSetting = useGameStore((s) => s.settings.touchButtons)
  const dragRef = useRef<{ id: number; x: number } | null>(null)

  useEffect(() => {
    // E/Enterキー：会話中はセリフ送り、それ以外は「しらべる」
    return attachKeyboard(() => {
      const state = useGameStore.getState()
      if (state.dialog) {
        const lines = state.dialog.npc.dialog ?? []
        if (state.dialog.index < lines.length - 1) state.dialogNext()
        // 最後の行はボタン（ちょうせんする／わかった）で選ばせる
      } else {
        state.interact()
      }
    })
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
      <DialogBox />
      <FxOverlay />
      <Toast />
      {quest && <QuestModal />}
    </div>
  )
}
