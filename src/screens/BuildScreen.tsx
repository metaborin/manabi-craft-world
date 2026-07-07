import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { BLOCKS, BLOCK_MAP } from '../data/rewards'
import { BUILD_GRID_SIZE } from '../data/world'
import { UI } from '../data/uiText'

/**
 * 建築画面。10x10のマスに持っているブロックを置ける。
 * 置いたブロックは3Dワールドの「けんちくエリア」にも表示される。
 */
export function BuildScreen() {
  const save = useGameStore((s) => s.save)
  const setScreen = useGameStore((s) => s.setScreen)
  const placeBlock = useGameStore((s) => s.placeBlock)
  const selection = useGameStore((s) => s.buildSelection)
  const selectBuildBlock = useGameStore((s) => s.selectBuildBlock)
  /** ブロックを置く／はずすたびに「ほぞんしたよ」を出す */
  const [savedAt, setSavedAt] = useState(0)
  if (!save) return null

  const handleCell = (i: number) => {
    const before = save.buildGrid[i]
    const canChange = before !== null || (selection && (save.blocks[selection] ?? 0) > 0)
    placeBlock(i)
    if (canChange) setSavedAt(Date.now())
  }

  const selectedDef = selection ? BLOCK_MAP[selection] : null
  const canPlace = selection !== null && (save.blocks[selection] ?? 0) > 0

  return (
    <div className="screen panel-screen">
      <div className="panel-header">
        <button className="btn btn-secondary btn-big" onClick={() => setScreen('world')}>
          ◀ {UI.common.backToWorld}
        </button>
        <h2>{UI.build.heading}</h2>
        <div className="panel-header-right">
          {savedAt > 0 && (
            <span className="saved-chip" key={savedAt}>
              {UI.build.saved}
            </span>
          )}
          <div className="hud-coins coin-bump" key={`c${save.coins}`}>
            🪙 {save.coins}
          </div>
        </div>
      </div>

      {/* いま えらんでいるブロック */}
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

      {/* もっているブロック */}
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

      {/* グリッド。ブロックを選んでいるときは、置けるマスがわかるように光る */}
      <div
        className={`build-grid ${canPlace ? 'placing' : ''}`}
        style={{ gridTemplateColumns: `repeat(${BUILD_GRID_SIZE}, 1fr)` }}
      >
        {save.buildGrid.map((cell, i) => (
          <button
            key={i}
            className={`build-cell ${cell ? 'filled' : ''}`}
            style={cell ? { background: BLOCK_MAP[cell]?.color } : undefined}
            onClick={() => handleCell(i)}
          >
            {cell ? BLOCK_MAP[cell]?.emoji : ''}
          </button>
        ))}
      </div>

      <p className="hint-text center">{UI.build.tip}</p>
      <p className="hint-text center">
        {UI.build.tipMore} {UI.build.needBlocks}
      </p>
    </div>
  )
}
