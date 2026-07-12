import { useGameStore } from '../store/gameStore'
import { UI } from '../data/uiText'

/** あたらしいエリアが ひらいたときの お祝い表示 */
export function AreaUnlockOverlay() {
  const areaUnlock = useGameStore((s) => s.areaUnlock)
  const dismiss = useGameStore((s) => s.dismissAreaUnlock)
  if (!areaUnlock) return null

  return (
    <div className="unlock-overlay" onClick={dismiss}>
      <div className="unlock-card" onClick={(e) => e.stopPropagation()}>
        <div className="unlock-rays" aria-hidden />
        <div className="unlock-banner">{UI.area.unlockedBanner}</div>
        <div className="unlock-icon">{areaUnlock.icon}</div>
        <div className="unlock-name">{areaUnlock.name}</div>
        <button className="btn btn-primary btn-big" onClick={dismiss}>
          {UI.area.go}
        </button>
      </div>
    </div>
  )
}
