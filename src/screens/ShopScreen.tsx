import { useGameStore } from '../store/gameStore'
import { BLOCKS, PETS } from '../data/rewards'
import { UI } from '../data/uiText'

export function ShopScreen() {
  const save = useGameStore((s) => s.save)
  const setScreen = useGameStore((s) => s.setScreen)
  const buyBlock = useGameStore((s) => s.buyBlock)
  const buyPet = useGameStore((s) => s.buyPet)
  if (!save) return null

  return (
    <div className="screen panel-screen">
      <div className="panel-header">
        <button className="btn btn-secondary btn-big" onClick={() => setScreen('world')}>
          ◀ {UI.common.backToWorld}
        </button>
        <h2>{UI.shop.heading}</h2>
        <div className="hud-coins coin-bump" key={save.coins}>
          🪙 {save.coins}
        </div>
      </div>

      <div className="panel-body">
        <div className="status-row-label">{UI.shop.blockSection}</div>
        <div className="shop-grid">
          {BLOCKS.map((b) => {
            const affordable = save.coins >= b.price
            return (
              <div key={b.id} className="shop-item">
                <span className="palette-swatch big" style={{ background: b.color }} />
                <span className="shop-name">{b.name}</span>
                <span className="shop-owned">{UI.shop.owned(save.blocks[b.id] ?? 0)}</span>
                <button
                  className="btn btn-primary"
                  disabled={!affordable}
                  onClick={() => buyBlock(b.id)}
                >
                  {UI.shop.buy(b.price)}
                </button>
                {!affordable && (
                  <span className="shop-reason">{UI.shop.notEnough(b.price - save.coins)}</span>
                )}
              </div>
            )
          })}
        </div>

        <div className="status-row-label">{UI.shop.petSection}</div>
        <div className="shop-grid">
          {PETS.map((p) => {
            const isMine = save.pet?.type === p.id
            const affordable = save.coins >= p.price
            const disabled = !affordable || save.pet !== null
            return (
              <div key={p.id} className="shop-item">
                <span className="shop-pet-emoji">{p.emoji}</span>
                <span className="shop-name">{p.name}</span>
                <span className="shop-owned">
                  {isMine ? `${UI.shop.havePet}💕` : UI.shop.petNote}
                </span>
                <button
                  className="btn btn-primary"
                  disabled={disabled}
                  onClick={() => buyPet(p.id)}
                >
                  {isMine ? UI.shop.havePet : UI.shop.welcome(p.price)}
                </button>
                {!isMine && save.pet === null && !affordable && (
                  <span className="shop-reason">{UI.shop.notEnough(p.price - save.coins)}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
