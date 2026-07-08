import { useGameStore } from '../store/gameStore'
import { missionsForDate, missionClaimed, missionDone, missionProgress } from '../data/missions'
import { BLOCK_MAP, PET_MAP, petLevel, petExpToNext, petLevelProgress } from '../data/rewards'
import { todayString } from '../store/saveSystem'
import { UI } from '../data/uiText'

/** きょうのミッション画面 */
export function MissionScreen() {
  const save = useGameStore((s) => s.save)
  const setScreen = useGameStore((s) => s.setScreen)
  const claimMission = useGameStore((s) => s.claimMission)
  if (!save) return null

  const missions = missionsForDate(todayString())
  const allClaimed = missions.every((m) => missionClaimed(save, m))
  const pet = save.pet ? PET_MAP[save.pet.type] : null

  return (
    <div className="screen panel-screen">
      <div className="panel-header">
        <button className="btn btn-secondary btn-big" onClick={() => setScreen('world')}>
          ◀ {UI.common.backToWorld}
        </button>
        <h2>{UI.mission.heading}</h2>
        <div className="hud-coins coin-bump" key={save.coins}>
          🪙 {save.coins}
        </div>
      </div>

      <p className="hint-text center">{UI.mission.subheading}</p>

      <div className="panel-body">
        {/* ようこそボーナス */}
        <div className={`mission-card ${save.daily.bonusClaimed ? 'claimed' : ''}`}>
          <span className="mission-icon">🌅</span>
          <div className="mission-info">
            <div className="mission-title">{UI.mission.welcomeBonus}</div>
            <div className="mission-reward">🪙5 {save.pet ? '＋🐾1' : ''}</div>
          </div>
          <span className="mission-state done">
            {save.daily.bonusClaimed ? UI.mission.claimed : '…'}
          </span>
        </div>

        {/* ミッション一覧 */}
        {missions.map((m) => {
          const progress = missionProgress(save, m)
          const done = missionDone(save, m)
          const claimed = missionClaimed(save, m)
          const rewardParts: string[] = []
          if (m.reward.coins) rewardParts.push(`🪙${m.reward.coins}`)
          if (m.reward.xp) rewardParts.push(`✨${m.reward.xp}`)
          if (m.reward.petExp) rewardParts.push(`🐾${m.reward.petExp}`)
          for (const [id] of Object.entries(m.reward.blocks ?? {})) {
            const def = BLOCK_MAP[id]
            if (def) rewardParts.push(`${def.emoji}`)
          }
          return (
            <div key={m.id} className={`mission-card ${claimed ? 'claimed' : done ? 'ready' : ''}`}>
              <span className="mission-icon">{m.icon}</span>
              <div className="mission-info">
                <div className="mission-title">{m.title}</div>
                <div className="mission-progress-row">
                  <span className="subject-bar">
                    <span
                      className="subject-fill mission-fill"
                      style={{ width: `${(progress / m.goal) * 100}%` }}
                    />
                  </span>
                  <span className="mission-count">
                    {progress}／{m.goal}
                  </span>
                </div>
                <div className="mission-reward">{rewardParts.join('　')}</div>
              </div>
              {claimed ? (
                <span className="mission-state done">{UI.mission.claimed}</span>
              ) : done ? (
                <button className="btn btn-primary mission-claim" onClick={() => claimMission(m.id)}>
                  {UI.mission.claim}
                </button>
              ) : (
                <span className="mission-state">
                  {UI.mission.left(m.goal - progress)}
                </span>
              )}
            </div>
          )
        })}

        {allClaimed && <div className="mission-alldone">{UI.mission.allDone}</div>}

        {/* ペットのせいちょう */}
        <div className="status-card">
          <div className="status-row-label">🐾 ペットの せいちょう</div>
          {pet && save.pet ? (
            <>
              <div className="pet-row">
                <span className="pet-emoji">{pet.emoji}</span>
                <div>
                  <div>
                    {pet.name}　{UI.petLevel.label(petLevel(save.pet.growth))}
                  </div>
                  <div className="status-sub">{UI.petLevel.toNext(petExpToNext(save.pet.growth))}</div>
                </div>
              </div>
              <div className="xp-bar large">
                <span
                  className="xp-fill pet-fill"
                  style={{ width: `${petLevelProgress(save.pet.growth) * 100}%` }}
                />
              </div>
            </>
          ) : (
            <div className="status-sub">{UI.status.noPet}</div>
          )}
        </div>

        <p className="hint-text center">{UI.mission.totalDone(save.totalMissionsCompleted)}</p>
      </div>
    </div>
  )
}
