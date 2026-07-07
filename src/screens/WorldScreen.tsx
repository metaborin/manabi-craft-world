import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { WorldCanvas, AVATARS } from '../game/WorldCanvas'
import { attachKeyboard, inputState, isTouchDevice } from '../game/input'
import { TouchControls, InteractButton } from '../components/TouchControls'
import { Toast } from '../components/Toast'
import { QuestModal } from './QuestModal'
import { GRADES, SUBJECTS } from '../data/grades'
import { xpForLevel, DAILY_BONUS } from '../data/rewards'
import type { Subject } from '../types/game'

/** 曜日と学年から「きょうのおすすめ教科」を決める */
function todaysSubject(grade: number): Subject {
  const subjects = GRADES[grade as 1].mainSubjects
  return subjects[new Date().getDay() % subjects.length]
}

export function WorldScreen() {
  const save = useGameStore((s) => s.save)
  const setScreen = useGameStore((s) => s.setScreen)
  const quest = useGameStore((s) => s.quest)
  const dragRef = useRef<{ id: number; x: number } | null>(null)

  useEffect(() => {
    return attachKeyboard(() => useGameStore.getState().interact())
  }, [])

  if (!save) return null
  const needXp = xpForLevel(save.level)
  const rec = todaysSubject(save.grade)
  const nextBonus =
    save.dailyCount < DAILY_BONUS.small.at
      ? DAILY_BONUS.small.at
      : save.dailyCount < DAILY_BONUS.big.at
        ? DAILY_BONUS.big.at
        : null

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

      {/* 上部HUD */}
      <div className="hud-top">
        <div className="hud-left">
          <div className="hud-player">
            <span
              className="hud-avatar"
              style={{ background: AVATARS[save.avatar % AVATARS.length].color }}
            >
              🙂
            </span>
            <div>
              <div className="hud-name">{save.name}</div>
              <div className="hud-level">
                Lv.{save.level}
                <span className="xp-bar">
                  <span className="xp-fill" style={{ width: `${(save.xp / needXp) * 100}%` }} />
                </span>
              </div>
            </div>
          </div>
          <div className="hud-coins">🪙 {save.coins}</div>
        </div>
        <div className="hud-right">
          <button className="btn btn-chip" onClick={() => setScreen('grade')}>
            {GRADES[save.grade].label}
          </button>
          <button className="btn btn-chip" onClick={() => setScreen('status')}>
            📋 ステータス
          </button>
        </div>
      </div>

      {/* きょうのおすすめ＆進捗 */}
      <div className="hud-daily">
        <span className="daily-rec">
          きょうの おすすめ：{SUBJECTS[rec].icon} {SUBJECTS[rec].name}
        </span>
        {nextBonus && (
          <span className="daily-progress">
            🎯 きょう {save.dailyCount}／{nextBonus}もん で ボーナス！
          </span>
        )}
      </div>

      {/* 操作説明（PC） */}
      {!isTouchDevice() && (
        <div className="hud-help">
          ⌨️ WASD・やじるし：いどう ／ スペース：ジャンプ ／ E：はなす ／ ドラッグ：カメラ
        </div>
      )}

      <InteractButton />
      {isTouchDevice() && <TouchControls />}
      <Toast />
      {quest && <QuestModal />}
    </div>
  )
}
