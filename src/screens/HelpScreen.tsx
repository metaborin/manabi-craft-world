import { useGameStore } from '../store/gameStore'
import { UI } from '../data/uiText'

/** あそびかた（ヘルプ）画面。せんせい・おうちのかた向けの説明つき */
export function HelpScreen() {
  const closeSettings = useGameStore((s) => s.closeSettings)
  const save = useGameStore((s) => s.save)
  const replayStory = useGameStore((s) => s.replayStory)

  return (
    <div className="screen panel-screen">
      <div className="panel-header">
        <button className="btn btn-ghost btn-big" onClick={closeSettings}>
          {UI.common.back}
        </button>
        <h2>{UI.help.heading}</h2>
        <div />
      </div>

      <div className="panel-body">
        {UI.help.items.map((item, i) => (
          <div key={i} className="status-card help-card">
            <div className="help-q">
              <span className="help-q-icon">Ｑ</span>
              {item.q}
            </div>
            <div className="help-a">{item.a}</div>
          </div>
        ))}

        {save && (
          <button className="btn btn-secondary btn-big" onClick={replayStory}>
            {UI.story.replay}
          </button>
        )}

        <div className="status-card teacher-card">
          <div className="status-row-label">{UI.help.teacherHeading}</div>
          <p className="teacher-text">{UI.help.teacherText}</p>
        </div>
      </div>
    </div>
  )
}
