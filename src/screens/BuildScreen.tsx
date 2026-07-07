import { useGameStore } from '../store/gameStore'
import { BLOCKS, BLOCK_MAP } from '../data/rewards'
import { BUILD_GRID_SIZE } from '../data/world'

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
  if (!save) return null

  return (
    <div className="screen panel-screen">
      <div className="panel-header">
        <button className="btn btn-ghost btn-big" onClick={() => setScreen('world')}>
          ◀ もどる
        </button>
        <h2>🏠 けんちくエリア</h2>
        <div className="hud-coins">🪙 {save.coins}</div>
      </div>

      <p className="hint-text center">
        ブロックを えらんで マスを タップ！ おいた ブロックは もういちど タップで はずせるよ
      </p>

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

      {/* グリッド */}
      <div
        className="build-grid"
        style={{ gridTemplateColumns: `repeat(${BUILD_GRID_SIZE}, 1fr)` }}
      >
        {save.buildGrid.map((cell, i) => (
          <button
            key={i}
            className={`build-cell ${cell ? 'filled' : ''}`}
            style={cell ? { background: BLOCK_MAP[cell]?.color } : undefined}
            onClick={() => placeBlock(i)}
          >
            {cell ? BLOCK_MAP[cell]?.emoji : ''}
          </button>
        ))}
      </div>

      <p className="hint-text center">
        ブロックが たりなくなったら クエストや ショップで あつめよう！
      </p>
    </div>
  )
}
