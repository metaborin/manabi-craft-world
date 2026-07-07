import { useGameStore } from '../store/gameStore'
import { BLOCKS, PETS } from '../data/rewards'

export function ShopScreen() {
  const save = useGameStore((s) => s.save)
  const setScreen = useGameStore((s) => s.setScreen)
  const buyBlock = useGameStore((s) => s.buyBlock)
  const buyPet = useGameStore((s) => s.buyPet)
  if (!save) return null

  return (
    <div className="screen panel-screen">
      <div className="panel-header">
        <button className="btn btn-ghost btn-big" onClick={() => setScreen('world')}>
          ◀ もどる
        </button>
        <h2>🛒 ごほうびショップ</h2>
        <div className="hud-coins">🪙 {save.coins}</div>
      </div>

      <div className="panel-body">
        <div className="status-row-label">🧱 ブロック</div>
        <div className="shop-grid">
          {BLOCKS.map((b) => (
            <div key={b.id} className="shop-item">
              <span className="palette-swatch big" style={{ background: b.color }} />
              <span className="shop-name">{b.name}</span>
              <span className="shop-owned">もっているかず：{save.blocks[b.id] ?? 0}</span>
              <button
                className="btn btn-primary"
                disabled={save.coins < b.price}
                onClick={() => buyBlock(b.id)}
              >
                🪙{b.price} で かう
              </button>
            </div>
          ))}
        </div>

        <div className="status-row-label">🥚 ペットのたまご（1ぴきだけ かえるよ）</div>
        <div className="shop-grid">
          {PETS.map((p) => (
            <div key={p.id} className="shop-item">
              <span className="shop-pet-emoji">{p.emoji}</span>
              <span className="shop-name">{p.name}</span>
              <span className="shop-owned">
                {save.pet?.type === p.id ? 'なかまに なったよ！' : 'もんだいに せいかいすると そだつよ'}
              </span>
              <button
                className="btn btn-primary"
                disabled={save.coins < p.price || save.pet !== null}
                onClick={() => buyPet(p.id)}
              >
                🪙{p.price} で むかえる
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
