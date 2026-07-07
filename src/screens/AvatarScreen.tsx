import { useGameStore } from '../store/gameStore'
import { AVATARS } from '../data/avatars'
import { UI } from '../data/uiText'
import { AvatarPreview } from '../components/AvatarPreview'

/** アバターの見た目を選ぶ画面（ステータス画面から開く） */
export function AvatarScreen() {
  const save = useGameStore((s) => s.save)
  const setScreen = useGameStore((s) => s.setScreen)
  const setAvatar = useGameStore((s) => s.setAvatar)
  const showToast = useGameStore((s) => s.showToast)
  if (!save) return null

  return (
    <div className="screen panel-screen">
      <div className="panel-header">
        <button className="btn btn-ghost btn-big" onClick={() => setScreen('status')}>
          {UI.common.back}
        </button>
        <h2>{UI.avatar.heading}</h2>
        <div />
      </div>

      <p className="hint-text center">{UI.avatar.choose}</p>

      <div className="avatar-grid">
        {AVATARS.map((a, i) => {
          const selected = save.avatar % AVATARS.length === i
          return (
            <button
              key={i}
              className={`avatar-card ${selected ? 'selected' : ''}`}
              onClick={() => {
                if (!selected) {
                  setAvatar(i)
                  showToast(UI.avatar.changed(a.name))
                }
              }}
            >
              <AvatarPreview def={a} />
              <span className="avatar-card-name">
                {a.icon} {a.name}タイプ
              </span>
              <span className="avatar-card-desc">{a.desc}</span>
              {selected && <span className="avatar-current-chip">{UI.avatar.current}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
