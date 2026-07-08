import { useGameStore } from '../store/gameStore'
import { GRADES, SUBJECTS } from '../data/grades'
import { BADGES, BLOCKS, PET_MAP, petLevel, petStage, petNextStage, xpForLevel } from '../data/rewards'
import { getQuestions } from '../data/questions'
import { AVATARS } from '../data/avatars'
import { TREASURE_COUNT } from '../data/world'
import { UI } from '../data/uiText'

export function StatusScreen() {
  const save = useGameStore((s) => s.save)
  const setScreen = useGameStore((s) => s.setScreen)
  const backToTitle = useGameStore((s) => s.backToTitle)
  if (!save) return null

  const needXp = xpForLevel(save.level)
  const subjects = GRADES[save.grade].mainSubjects
  const pet = save.pet ? PET_MAP[save.pet.type] : null

  return (
    <div className="screen panel-screen">
      <div className="panel-header">
        <button className="btn btn-ghost btn-big" onClick={() => setScreen('world')}>
          ◀ もどる
        </button>
        <h2>📋 ステータス</h2>
        <div />
      </div>

      <div className="panel-body">
        {/* プレイヤーカード */}
        <div className="status-card player-card">
          <span
            className="hud-avatar big"
            style={{ background: AVATARS[save.avatar % AVATARS.length].color }}
          >
            🙂
          </span>
          <div className="status-player-info">
            <div className="status-name">{save.name}</div>
            <div className="status-grade-row">
              <span>{GRADES[save.grade].label}</span>
              <button className="btn btn-chip" onClick={() => setScreen('grade')}>
                がくねんを かえる
              </button>
              <button className="btn btn-chip" onClick={() => setScreen('avatar')}>
                {UI.avatar.change}
              </button>
            </div>
          </div>
          <div className="status-coins">🪙 {save.coins}</div>
        </div>

        {/* レベル */}
        <div className="status-card">
          <div className="status-row-label">レベル {save.level}</div>
          <div className="xp-bar large">
            <span className="xp-fill" style={{ width: `${(save.xp / needXp) * 100}%` }} />
          </div>
          <div className="status-sub">
            つぎのレベルまで あと {needXp - save.xp} けいけんち
          </div>
        </div>

        {/* 教科ごとのすすみぐあい */}
        <div className="status-card">
          <div className="status-row-label">きょうかの すすみぐあい（{GRADES[save.grade].label}）</div>
          {subjects.map((sub) => {
            const total = getQuestions(save.grade, sub).length
            const cleared = getQuestions(save.grade, sub).filter((q) =>
              save.clearedQuests.includes(q.id),
            ).length
            const pct = total === 0 ? 0 : Math.round((cleared / total) * 100)
            return (
              <div key={sub} className="subject-progress">
                <span className="subject-name">
                  {SUBJECTS[sub].icon} {SUBJECTS[sub].name}
                </span>
                <span className="subject-bar">
                  <span
                    className="subject-fill"
                    style={{ width: `${pct}%`, background: SUBJECTS[sub].color }}
                  />
                </span>
                <span className="subject-count">
                  {cleared}／{total}
                </span>
              </div>
            )
          })}
        </div>

        {/* たんけん・あつめたもの */}
        <div className="status-card">
          <div className="status-row-label">🗺️ たんけん・コレクション</div>
          <div className="explore-stats">
            <span className="explore-stat">
              🎁 たからばこ {save.openedChests.length}／{TREASURE_COUNT}
            </span>
            <span className="explore-stat">
              🧱 ブロック{' '}
              {
                BLOCKS.filter(
                  (b) =>
                    (save.blocks[b.id] ?? 0) > 0 ||
                    save.buildLayers.some((layer) => layer.includes(b.id)),
                ).length
              }
              ／{BLOCKS.length}しゅるい
            </span>
            <span className="explore-stat">
              🏗️ おいたブロック {save.stats.blocksPlaced}こ
            </span>
            <span className="explore-stat">
              🎯 ミッションたっせい {save.totalMissionsCompleted}かい
            </span>
          </div>
          <div className="bottom-row">
            <button className="btn btn-primary" onClick={() => setScreen('mission')}>
              {UI.mission.open} をみる ▶
            </button>
            <button className="btn btn-primary" onClick={() => setScreen('zukan')}>
              {UI.zukan.openZukan} をみる ▶
            </button>
          </div>
        </div>

        {/* ペット */}
        <div className="status-card">
          <div className="status-row-label">ペット</div>
          {pet && save.pet ? (
            <>
              <div className="pet-row">
                <span className="pet-emoji">{pet.emoji}</span>
                <div>
                  <div>
                    {pet.name}（{petStage(save.pet.growth)}）　{UI.petLevel.label(petLevel(save.pet.growth))}
                  </div>
                  <div className="status-sub">{pet.desc}</div>
                </div>
              </div>
              {(() => {
                const next = petNextStage(save.pet.growth)
                return next ? (
                  <>
                    <div className="xp-bar large">
                      <span
                        className="xp-fill pet-fill"
                        style={{ width: `${next.progress * 100}%` }}
                      />
                    </div>
                    <div className="status-sub">
                      {UI.pet.growUp(next.next)} {next.remaining}かい せいかい！（{UI.pet.growHint}）
                    </div>
                  </>
                ) : (
                  <div className="status-sub">{UI.pet.grownUp}</div>
                )
              })()}
            </>
          ) : (
            <div className="status-sub">まだ いないよ。ショップで たまごを かってみよう🥚</div>
          )}
        </div>

        {/* バッジ */}
        <div className="status-card">
          <div className="status-row-label">がくしゅうバッジ（{save.badges.length}／{BADGES.length}）</div>
          <div className="badge-grid">
            {BADGES.map((b) => {
              const earned = save.badges.includes(b.id)
              return (
                <div key={b.id} className={`badge ${earned ? 'earned' : ''}`}>
                  <span className="badge-icon">{earned ? b.icon : '❓'}</span>
                  <span className="badge-name">{earned ? b.name : '？？？'}</span>
                  <span className="badge-desc">{b.desc}</span>
                </div>
              )
            })}
          </div>
        </div>

        <button className="btn btn-ghost btn-big" onClick={backToTitle}>
          🏠 タイトルへ もどる（セーブずみ）
        </button>
      </div>
    </div>
  )
}
