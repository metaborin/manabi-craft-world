import { useGameStore } from '../store/gameStore'
import { BLOCKS, BADGES, PET_MAP, petLevel, petStage } from '../data/rewards'
import { CHARACTER_NPCS, TREASURE_COUNT } from '../data/world'
import { ALL_AREAS, AREA_MAP } from '../data/areas'
import { BOSSES, activeSubjectsText, bossState, isTempleReady } from '../data/bosses'
import { SUBJECTS } from '../data/grades'
import { AVATARS } from '../data/avatars'
import { UI } from '../data/uiText'
import { AvatarPreview } from '../components/AvatarPreview'

/**
 * コレクション（図鑑）画面。
 * あつめたブロック・バッジ・たからばこ・であったNPC・ペットが見られる。
 */
export function ZukanScreen() {
  const save = useGameStore((s) => s.save)
  const setScreen = useGameStore((s) => s.setScreen)
  if (!save) return null

  /** ブロックを「あつめた」＝いま持っている or 建築でつかっている */
  const hasBlock = (id: string) =>
    (save.blocks[id] ?? 0) > 0 || save.buildLayers.some((layer) => layer.includes(id))

  const collectedBlocks = BLOCKS.filter((b) => hasBlock(b.id)).length
  const pet = save.pet ? PET_MAP[save.pet.type] : null

  return (
    <div className="screen panel-screen">
      <div className="panel-header">
        <button className="btn btn-ghost btn-big" onClick={() => setScreen('status')}>
          {UI.common.back}
        </button>
        <h2>{UI.zukan.heading}</h2>
        <div />
      </div>

      <div className="panel-body">
        {/* ブロック */}
        <div className="status-card">
          <div className="status-row-label">
            {UI.zukan.blocks}（{collectedBlocks}／{BLOCKS.length}）
          </div>
          <div className="zukan-grid">
            {BLOCKS.map((b) => {
              const got = hasBlock(b.id)
              return (
                <div key={b.id} className={`zukan-item ${got ? 'got' : ''}`}>
                  <span
                    className="palette-swatch"
                    style={{ background: got ? b.color : '#d5cdc0' }}
                  />
                  <span className="zukan-name">{got ? b.name : UI.zukan.unknown}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* バッジ */}
        <div className="status-card">
          <div className="status-row-label">
            {UI.zukan.badges}（{save.badges.length}／{BADGES.length}）
          </div>
          <div className="badge-grid">
            {BADGES.map((b) => {
              const earned = save.badges.includes(b.id)
              return (
                <div key={b.id} className={`badge ${earned ? 'earned' : ''}`}>
                  <span className="badge-icon">{earned ? b.icon : '❓'}</span>
                  <span className="badge-name">{earned ? b.name : UI.zukan.unknown}</span>
                  <span className="badge-desc">{b.desc}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* たからばこ */}
        <div className="status-card">
          <div className="status-row-label">
            {UI.zukan.chests}（{save.openedChests.length}／{TREASURE_COUNT}）
          </div>
          <div className="zukan-grid">
            {Array.from({ length: TREASURE_COUNT }).map((_, i) => {
              const found = i < save.openedChests.length
              return (
                <div key={i} className={`zukan-item ${found ? 'got' : ''}`}>
                  <span className="zukan-chest">{found ? '🎁' : '❓'}</span>
                  <span className="zukan-name">{found ? 'はっけん！' : UI.zukan.unknown}</span>
                </div>
              )
            })}
          </div>
          {save.openedChests.length < TREASURE_COUNT && (
            <div className="status-sub">{UI.zukan.chestHint}</div>
          )}
        </div>

        {/* であったなかま */}
        <div className="status-card">
          <div className="status-row-label">
            {UI.zukan.npcs}（{save.metNPCs.length}／{CHARACTER_NPCS.length}）
          </div>
          <div className="zukan-grid">
            {CHARACTER_NPCS.map((n) => {
              const met = save.metNPCs.includes(n.id)
              return (
                <div key={n.id} className={`zukan-item ${met ? 'got' : ''}`}>
                  <span
                    className="zukan-npc"
                    style={{ background: met ? n.color : '#d5cdc0' }}
                  >
                    {met ? '🙂' : '❓'}
                  </span>
                  <span className="zukan-name">
                    {met ? n.label : UI.zukan.unknown}
                    {met && n.subject && (
                      <span className="zukan-sub"> {SUBJECTS[n.subject].icon}</span>
                    )}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ペット */}
        <div className="status-card">
          <div className="status-row-label">{UI.zukan.pet}</div>
          {pet && save.pet ? (
            <div className="pet-row">
              <span className="pet-emoji">{pet.emoji}</span>
              <div>
                <div>
                  {pet.name}（{petStage(save.pet.growth)}）　{UI.petLevel.label(petLevel(save.pet.growth))}
                </div>
                <div className="status-sub">{pet.desc}</div>
                <div className="status-sub">{UI.status.petGrowth(save.pet.growth)}</div>
              </div>
            </div>
          ) : (
            <div className="status-sub">{UI.status.noPet}</div>
          )}
          <div className="status-sub">{UI.mission.totalDone(save.totalMissionsCompleted)}</div>
        </div>

        {/* まなびの光（5教科ボス・しんでん・エンディング） */}
        <div className="status-card">
          <div className="status-row-label">
            ✨ まなびの光（{save.bossCleared.length}／{BOSSES.length}）
          </div>
          <div className="status-sub">{UI.temple.lightsNote(activeSubjectsText())}</div>
          <div className="boss-list">
            {BOSSES.map((b) => {
              const state = bossState(save, b)
              return (
                <div key={b.id} className={`boss-row ${state}`}>
                  <span className="boss-row-light">
                    {state === 'cleared' ? '💡' : state === 'comingSoon' ? '💤' : '⚪'}
                  </span>
                  <div className="boss-row-main">
                    <div className="boss-row-name">
                      {SUBJECTS[b.id].icon} {SUBJECTS[b.id].name}：{b.icon} {b.name}
                    </div>
                    <div className="boss-row-sub">
                      {state === 'cleared' && `${UI.boss.stateCleared}　${UI.boss.playAgainHint}`}
                      {state === 'available' && `${UI.boss.stateAvailable}　${UI.boss.rewardHint}`}
                      {state === 'locked' &&
                        `${b.conditionText}${b.remainingHint(save) ? `（${b.remainingHint(save)}）` : ''}`}
                      {state === 'comingSoon' && (
                        <>
                          {b.soonText}
                          <br />
                          {UI.boss.futureUnitsLabel(b.futureUnits.join('・'))}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            <div className={`boss-row ${save.templeCleared ? 'cleared' : ''}`}>
              <span className="boss-row-light">{save.templeCleared ? '💡' : '⚪'}</span>
              <div className="boss-row-main">
                <div className="boss-row-name">🏛️ {UI.temple.challengeName}</div>
                <div className="boss-row-sub">
                  {save.templeCleared
                    ? `${UI.boss.stateCleared}　${UI.boss.playAgainHint}`
                    : isTempleReady(save)
                      ? UI.boss.stateAvailable
                      : AREA_MAP['temple'].conditionText}
                </div>
              </div>
            </div>
            <div className={`boss-row ${save.endingSeen ? 'cleared' : ''}`}>
              <span className="boss-row-light">{save.endingSeen ? '💡' : '⚪'}</span>
              <div className="boss-row-main">
                <div className="boss-row-name">🎬 エンディング</div>
                <div className="boss-row-sub">{save.endingSeen ? '⭐ 見た！' : 'まだ'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* エリア */}
        <div className="status-card">
          <div className="status-row-label">
            {UI.area.zukanSection}（
            {ALL_AREAS.filter((a) => save.unlockedAreas.includes(a.id)).length}／{ALL_AREAS.length}）
          </div>
          <div className="zukan-grid">
            {ALL_AREAS.map((a) => {
              const unlocked = save.unlockedAreas.includes(a.id)
              return (
                <div key={a.id} className={`zukan-item ${unlocked ? 'got' : ''}`}>
                  <span className="zukan-chest">{unlocked ? a.icon : '🔒'}</span>
                  <span className="zukan-name">{unlocked ? a.name : UI.zukan.unknown}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* アバター */}
        <div className="status-card">
          <div className="status-row-label">{UI.zukan.avatars}</div>
          <div className="zukan-grid">
            {AVATARS.map((a, i) => {
              const current = save.avatar % AVATARS.length === i
              return (
                <div key={i} className={`zukan-item got ${current ? 'current' : ''}`}>
                  <AvatarPreview def={a} />
                  <span className="zukan-name">
                    {a.icon} {a.name}
                  </span>
                  {current && <span className="zukan-current">{UI.avatar.current}</span>}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
