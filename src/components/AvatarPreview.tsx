import type { AvatarDef } from '../data/avatars'

/** アバターのミニプレビュー（CSSだけのボクセル風ミニフィギュア） */
export function AvatarPreview({ def }: { def: AvatarDef }) {
  return (
    <span className="ava-prev" aria-hidden>
      <span className={`ava-hat hat-${def.hat}`} style={{ background: def.hair }}>
        {def.hat === 'star' && <span className="ava-star">★</span>}
        {def.hat === 'leaf' && <span className="ava-leaf">🌿</span>}
      </span>
      <span className="ava-face">
        <span className="ava-eye" />
        <span className="ava-eye" />
      </span>
      <span className="ava-body" style={{ background: def.color }} />
    </span>
  )
}
