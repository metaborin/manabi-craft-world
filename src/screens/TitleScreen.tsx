import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { loadSave, formatLastPlayed, type SlotId } from '../store/saveSystem'
import { GRADES } from '../data/grades'
import { AVATARS } from '../data/avatars'
import { UI } from '../data/uiText'
import { ConfirmDialog } from '../components/ConfirmDialog'

function SlotCard({ slot }: { slot: SlotId }) {
  const selectSlot = useGameStore((s) => s.selectSlot)
  const startNewOnSlot = useGameStore((s) => s.startNewOnSlot)
  const [confirming, setConfirming] = useState(false)
  const data = loadSave(slot)

  return (
    <div className="slot-card">
      <div className="slot-title">
        {UI.title.saveSlot} {slot}
      </div>
      {data ? (
        <>
          <div className="slot-info">
            <span
              className="hud-avatar"
              style={{ background: AVATARS[data.avatar % AVATARS.length].color }}
            >
              🙂
            </span>
            <div className="slot-info-text">
              <span className="slot-name">{data.name}</span>
              <span className="slot-detail">
                {GRADES[data.grade].label} ／ レベル{data.level} ／ 🪙{data.coins}
              </span>
              <span className="slot-date">
                {UI.title.lastPlayed}
                {formatLastPlayed(data.lastPlayed)}
              </span>
            </div>
          </div>
          <button className="btn btn-primary btn-big btn-wide" onClick={() => selectSlot(slot)}>
            {UI.title.continueGame}
          </button>
          <button className="btn btn-ghost" onClick={() => setConfirming(true)}>
            {UI.title.newGame}
          </button>
          {confirming && (
            <ConfirmDialog
              message={UI.title.confirmReset}
              yesLabel={UI.title.confirmYes}
              noLabel={UI.title.confirmNo}
              onYes={() => {
                setConfirming(false)
                startNewOnSlot(slot)
              }}
              onNo={() => setConfirming(false)}
            />
          )}
        </>
      ) : (
        <>
          <div className="slot-info slot-empty">{UI.title.emptySlot}</div>
          <button
            className="btn btn-secondary btn-big btn-wide"
            onClick={() => startNewOnSlot(slot)}
          >
            {UI.title.newGame}
          </button>
        </>
      )}
    </div>
  )
}

export function TitleScreen() {
  const openSettings = useGameStore((s) => s.openSettings)
  return (
    <div className="screen title-screen">
      <div className="title-logo">
        <span className="title-block">🟩</span>
        <h1>{UI.title.gameName}</h1>
        <p className="title-sub">{UI.title.subtitle}</p>
      </div>
      <div className="slot-row">
        <SlotCard slot={1} />
        <SlotCard slot={2} />
      </div>
      <button className="btn btn-ghost" onClick={openSettings}>
        {UI.title.settings}
      </button>
      <p className="title-note">{UI.title.saveNote}</p>
    </div>
  )
}
