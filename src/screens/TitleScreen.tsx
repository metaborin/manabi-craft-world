import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { loadSave, type SlotId } from '../store/saveSystem'
import { GRADES } from '../data/grades'

function SlotCard({ slot }: { slot: SlotId }) {
  const selectSlot = useGameStore((s) => s.selectSlot)
  const startNewOnSlot = useGameStore((s) => s.startNewOnSlot)
  const deleteSlot = useGameStore((s) => s.deleteSlot)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [, forceUpdate] = useState(0)
  const data = loadSave(slot)

  return (
    <div className="slot-card">
      <div className="slot-title">セーブ {slot}</div>
      {data ? (
        <>
          <div className="slot-info">
            <span className="slot-name">{data.name}</span>
            <span className="slot-detail">
              {GRADES[data.grade].label} ／ レベル{data.level} ／ 🪙{data.coins}
            </span>
          </div>
          <button className="btn btn-primary btn-big" onClick={() => selectSlot(slot)}>
            つづきから ▶
          </button>
          {confirmDelete ? (
            <div className="slot-delete-confirm">
              <span>ほんとうに けす？</span>
              <button
                className="btn btn-danger btn-small"
                onClick={() => {
                  deleteSlot(slot)
                  setConfirmDelete(false)
                  forceUpdate((n) => n + 1)
                }}
              >
                けす
              </button>
              <button className="btn btn-ghost btn-small" onClick={() => setConfirmDelete(false)}>
                やめる
              </button>
            </div>
          ) : (
            <button className="btn btn-ghost btn-small" onClick={() => setConfirmDelete(true)}>
              さいしょから やりなおす
            </button>
          )}
        </>
      ) : (
        <>
          <div className="slot-info slot-empty">— データなし —</div>
          <button className="btn btn-secondary btn-big" onClick={() => startNewOnSlot(slot)}>
            あたらしく はじめる ✨
          </button>
        </>
      )}
    </div>
  )
}

export function TitleScreen() {
  return (
    <div className="screen title-screen">
      <div className="title-logo">
        <span className="title-block">🟩</span>
        <h1>まなびクラフトワールド</h1>
        <p className="title-sub">たんけんして あそんで まなぼう！</p>
      </div>
      <div className="slot-row">
        <SlotCard slot={1} />
        <SlotCard slot={2} />
      </div>
      <p className="title-note">セーブデータは この たんまつの なかに ほぞんされるよ</p>
    </div>
  )
}
