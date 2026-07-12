import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { loadSave, formatLastPlayed, type SlotId } from '../store/saveSystem'
import { GRADES } from '../data/grades'
import { AVATARS } from '../data/avatars'
import { BADGES, BLOCKS } from '../data/rewards'
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
          {/* しんこうど */}
          <div className="slot-progress">
            <span className="slot-progress-item">🏅 {data.badges.length}／{BADGES.length}</span>
            <span className="slot-progress-item">
              🧱{' '}
              {
                BLOCKS.filter(
                  (b) =>
                    (data.blocks[b.id] ?? 0) > 0 ||
                    data.buildLayers.some((layer) => layer.includes(b.id)),
                ).length
              }
              ／{BLOCKS.length}
            </span>
            <span className="slot-progress-item">⭐ {data.clearedQuests.length}もん</span>
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

/** タイトル画面のボクセルワールド風の背景（CSSのみ） */
function TitleBackground() {
  const blocks = [
    { left: '8%', top: '18%', color: '#6abe30', delay: '0s', size: 44 },
    { left: '86%', top: '14%', color: '#ffd54f', delay: '0.8s', size: 36 },
    { left: '78%', top: '55%', color: '#d95f3b', delay: '1.6s', size: 40 },
    { left: '14%', top: '62%', color: '#5ec8f2', delay: '2.4s', size: 34 },
    { left: '68%', top: '30%', color: '#b388ff', delay: '3.2s', size: 30 },
    { left: '26%', top: '34%', color: '#c98f4e', delay: '1.2s', size: 32 },
  ]
  return (
    <div className="title-bg" aria-hidden>
      <div className="title-sun" />
      <div className="title-cloud c1" />
      <div className="title-cloud c2" />
      <div className="title-cloud c3" />
      {blocks.map((b, i) => (
        <span
          key={i}
          className="title-float-block"
          style={{
            left: b.left,
            top: b.top,
            background: b.color,
            width: b.size,
            height: b.size,
            animationDelay: b.delay,
          }}
        />
      ))}
      <div className="title-hill h1" />
      <div className="title-hill h2" />
      <div className="title-ground" />
    </div>
  )
}

export function TitleScreen() {
  const openSettings = useGameStore((s) => s.openSettings)
  const openHelp = useGameStore((s) => s.openHelp)
  return (
    <div className="screen title-screen">
      <TitleBackground />
      <div className="title-content">
        <div className="title-logo">
          <div className="title-logo-blocks">
            <span className="logo-cube" style={{ background: '#6abe30' }} />
            <span className="logo-cube" style={{ background: '#ffd54f' }} />
            <span className="logo-cube" style={{ background: '#5ec8f2' }} />
          </div>
          <h1>{UI.title.gameName}</h1>
          <p className="title-sub">{UI.title.subtitle}</p>
        </div>
        <div className="slot-row">
          <SlotCard slot={1} />
          <SlotCard slot={2} />
        </div>
        <div className="bottom-row">
          <button className="btn btn-ghost" onClick={openSettings}>
            {UI.title.settings}
          </button>
          <button className="btn btn-ghost" onClick={openHelp}>
            {UI.help.open}
          </button>
        </div>
        <p className="title-note">{UI.title.saveNote}</p>
      </div>
    </div>
  )
}
