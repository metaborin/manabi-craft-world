import { useGameStore } from '../store/gameStore'
import { GRADES } from '../data/grades'
import { AVATARS } from '../data/avatars'
import { xpForLevel } from '../data/rewards'
import { requestRespawn } from '../game/playerState'
import { UI } from '../data/uiText'

/** ワールド画面の上部HUD（プレイヤー情報・コイン・ボタン類） */
export function Hud() {
  // 必要な値だけを購読する（save全体を購読すると毎回再レンダリングされる）
  const name = useGameStore((s) => s.save?.name)
  const avatar = useGameStore((s) => s.save?.avatar ?? 0)
  const level = useGameStore((s) => s.save?.level ?? 1)
  const xp = useGameStore((s) => s.save?.xp ?? 0)
  const coins = useGameStore((s) => s.save?.coins ?? 0)
  const grade = useGameStore((s) => s.save?.grade)
  const setScreen = useGameStore((s) => s.setScreen)
  const openSettings = useGameStore((s) => s.openSettings)
  if (name === undefined || grade === undefined) return null
  const needXp = xpForLevel(level)

  return (
    <div className="hud-top">
      <div className="hud-left">
        <div className="hud-player">
          <span
            className="hud-avatar"
            style={{ background: AVATARS[avatar % AVATARS.length].color }}
          >
            🙂
          </span>
          <div>
            <div className="hud-name">{name}</div>
            <div className="hud-level">
              Lv.{level}
              <span className="xp-bar">
                <span className="xp-fill" style={{ width: `${(xp / needXp) * 100}%` }} />
              </span>
            </div>
          </div>
        </div>
        {/* keyにコイン数を入れて、増えるたびにアニメーションさせる */}
        <div className="hud-coins coin-bump" key={coins}>
          🪙 {coins}
        </div>
      </div>
      <div className="hud-right">
        <button className="btn btn-chip" onClick={() => setScreen('grade')}>
          {GRADES[grade].label}
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
