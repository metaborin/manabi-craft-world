import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { BLOCKS, BLOCK_MAP } from '../data/rewards'
import { BUILD_GRID_SIZE, BUILD_MAX_LAYERS, BUILD_BLOCK_LIMIT } from '../data/world'
import { BUILD_TEMPLATES, templateCost } from '../data/templates'
import { requestRespawn } from '../game/playerState'
import { FxOverlay } from '../components/FxOverlay'
import { UI } from '../data/uiText'

/**
 * 建築画面。10×10のマスに、持っているブロックを3段まで積める。
 * 「おく」モード＝選んだブロックを一番下のあいている段に置く。
 * 「けす」モード＝一番上のブロックをはずして手もとに戻す。
 * 置いたものは3Dワールドの「けんちくエリア」にも表示され、上に乗れる。
 */
export function BuildScreen() {
  const save = useGameStore((s) => s.save)
  const setScreen = useGameStore((s) => s.setScreen)
  const buildMode = useGameStore((s) => s.buildMode)
  const setBuildMode = useGameStore((s) => s.setBuildMode)
  const placeBlockAt = useGameStore((s) => s.placeBlockAt)
  const eraseBlockAt = useGameStore((s) => s.eraseBlockAt)
  const applyTemplate = useGameStore((s) => s.applyTemplate)
  const selection = useGameStore((s) => s.buildSelection)
  const selectBuildBlock = useGameStore((s) => s.selectBuildBlock)
  /** 直近の操作を「おいたよ！／けしたよ！」チップで見せる */
  const [action, setAction] = useState<{ at: number; text: string } | null>(null)
  if (!save) return null

  const layers = save.buildLayers
  const placedCount = layers.flat().filter(Boolean).length
  const nearLimit = placedCount >= BUILD_BLOCK_LIMIT - 10
  const selectedDef = selection ? BLOCK_MAP[selection] : null
  const canPlace = buildMode === 'place' && selection !== null && (save.blocks[selection] ?? 0) > 0

  /** セルの見た目：いちばん上のブロックと、つんだ段数 */
  const cellInfo = (i: number) => {
    let top: string | null = null
    let count = 0
    for (let l = 0; l < BUILD_MAX_LAYERS; l++) {
      if (layers[l][i]) {
        top = layers[l][i]
        count++
      }
    }
    return { top, count }
  }

  const handleCell = (i: number) => {
    const before = placedCount
    if (buildMode === 'place') {
      placeBlockAt(i)
      // 実際に置けたときだけチップを出す
      const after = useGameStore.getState().save?.buildLayers.flat().filter(Boolean).length ?? 0
      if (after > before) setAction({ at: Date.now(), text: UI.build.placed })
    } else {
      eraseBlockAt(i)
      const after = useGameStore.getState().save?.buildLayers.flat().filter(Boolean).length ?? 0
      if (after < before) setAction({ at: Date.now(), text: UI.build.erased })
    }
  }

  return (
    <div className="screen panel-screen">
      <div className="panel-header">
        <button className="btn btn-secondary btn-big" onClick={() => setScreen('world')}>
          ◀ {UI.common.backToWorld}
        </button>
        <h2>{UI.build.heading}</h2>
        <div className="panel-header-right">
          {action && (
            <span className="saved-chip" key={action.at}>
              {action.text} {UI.build.saved}
            </span>
          )}
          <span className={`build-limit ${nearLimit ? 'warn' : ''}`}>
            {UI.build.limitCount(placedCount, BUILD_BLOCK_LIMIT)}
          </span>
        </div>
      </div>

      {/* モード切替（おく／けす） */}
      <div className="build-mode-row">
        <span className="build-mode-label">{UI.build.modeLabel}</span>
        <button
          className={`btn build-mode-btn ${buildMode === 'place' ? 'selected' : ''}`}
          onClick={() => setBuildMode('place')}
        >
          {UI.build.modePlace}
        </button>
        <button
          className={`btn build-mode-btn erase ${buildMode === 'erase' ? 'selected' : ''}`}
          onClick={() => setBuildMode('erase')}
        >
          {UI.build.modeErase}
        </button>
        <button
          className="btn btn-chip"
          onClick={() => {
            requestRespawn()
            setScreen('world')
          }}
        >
          {UI.world2.backToPlaza}
        </button>
      </div>

      {/* いま えらんでいるブロック（おくモードのみ） */}
      {buildMode === 'place' && (
        <div className="build-selected">
          {selectedDef ? (
            <>
              <span>{UI.build.selectedLabel}</span>
              <span className="palette-swatch" style={{ background: selectedDef.color }} />
              <strong>{selectedDef.name}</strong>
              <span className="palette-count">×{save.blocks[selection!] ?? 0}</span>
            </>
          ) : (
            <span>👇 {UI.build.noSelection}</span>
          )}
        </div>
      )}

      {/* もっているブロック（おくモードのみ） */}
      {buildMode === 'place' && (
        <div className="palette-row">
          {BLOCKS.map((b) => {
            const count = save.blocks[b.id] ?? 0
            return (
              <button
                key={b.id}
                className={`palette-btn ${selection === b.id ? 'selected' : ''}`}
                disabled={count === 0}
                style={{ borderColor: b.color }}
                onClick={() => selectBuildBlock(selection === b.id ? null : b.id)}
              >
                <span className="palette-swatch" style={{ background: b.color }} />
                <span className="palette-name">{b.name}</span>
                <span className="palette-count">×{count}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* グリッド */}
      <div
        className={`build-grid ${canPlace ? 'placing' : ''} ${buildMode === 'erase' ? 'erasing' : ''}`}
        style={{ gridTemplateColumns: `repeat(${BUILD_GRID_SIZE}, 1fr)` }}
      >
        {Array.from({ length: BUILD_GRID_SIZE * BUILD_GRID_SIZE }).map((_, i) => {
          const { top, count } = cellInfo(i)
          return (
            <button
              key={i}
              className={`build-cell ${top ? 'filled' : ''}`}
              style={top ? { background: BLOCK_MAP[top]?.color } : undefined}
              onClick={() => handleCell(i)}
            >
              {top ? BLOCK_MAP[top]?.emoji : ''}
              {count >= 2 && <span className="stack-badge">{count}</span>}
            </button>
          )
        })}
      </div>

      {/* おてほん建築 */}
      <div className="template-row">
        <span className="build-mode-label">{UI.build.templateHeading}</span>
        {BUILD_TEMPLATES.map((t) => {
          const cost = templateCost(t)
          const costText = Object.entries(cost)
            .map(([id, n]) => `${BLOCK_MAP[id]?.emoji ?? ''}×${n}`)
            .join(' ')
          return (
            <button key={t.id} className="btn btn-ghost" onClick={() => applyTemplate(t.id)}>
              {t.icon} {UI.build.templateApply(t.name)}（{costText}）
            </button>
          )
        })}
      </div>

      <p className="hint-text center">
        {buildMode === 'place' ? UI.build.tipPlace : UI.build.tipErase}
      </p>
      <p className="hint-text center">
        {UI.build.tipMore} {UI.build.needBlocks}
      </p>
      <FxOverlay />
    </div>
  )
}
