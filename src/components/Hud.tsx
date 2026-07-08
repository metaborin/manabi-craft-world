import { useGameStore } from '../store/gameStore'
import { GRADES } from '../data/grades'
import { AVATARS } from '../data/avatars'
import { xpForLevel } from '../data/rewards'
import { requestRespawn } from '../game/playerState'
import { UI } from '../data/uiText'

/** ワールド画面の上部HUD（プレイヤー情報・コイン・ボタン類） */
export function Hud() {
  const save = useGameStore((s) => s.save)
  const setScreen = useGameStore((s) => s.setScreen)
  const openSettings = useGameStore((s) => s.openSettings)
  if (!save) return null
  const needXp = xpForLevel(save.level)

  return (
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
        {/* keyにコイン数を入れて、増えるたびにアニメーションさせる */}
        <div className="hud-coins coin-bump" key={save.coins}>
          🪙 {save.coins}
        </div>
      </div>
      <div className="hud-right">
        <button className="btn btn-chip" onClick={() => setScreen('grade')}>
          {GRADES[save.grade].label}
        </button>
        <button className="btn btn-chip" onClick={() => setScreen('mission')}>
          {UI.mission.open}
        </button>
        <button className="btn btn-chip" onClick={() => setScreen('status')}>
          📋 ステータス
        </button>
        <button className="btn btn-chip" onClick={openSettings} aria-label={UI.settings.heading}>
          ⚙️
        </button>
        <button
          className="btn btn-chip"
          onClick={() => {
            requestRespawn()
            useGameStore.getState().showToast(UI.world2.backedToPlaza)
          }}
        >
          {UI.world2.backToPlaza}
        </button>
      </div>
    </div>
  )
}
