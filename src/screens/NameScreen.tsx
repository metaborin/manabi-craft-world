import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { AVATARS } from '../data/avatars'
import { AvatarPreview } from '../components/AvatarPreview'

const RANDOM_NAMES = ['そらまめ', 'ほしのこ', 'みどりん', 'こはるん', 'ぽんた', 'ひかり', 'らいと', 'つむぎ']

export function NameScreen() {
  const createSave = useGameStore((s) => s.createSave)
  const setScreen = useGameStore((s) => s.setScreen)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(0)

  return (
    <div className="screen name-screen">
      <h2>なまえを きめよう</h2>
      <div className="name-input-row">
        <input
          className="name-input"
          value={name}
          maxLength={8}
          placeholder="ニックネーム"
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="btn btn-ghost"
          onClick={() => setName(RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)])}
        >
          🎲 おまかせ
        </button>
      </div>
      <p className="hint-text">※ ほんとうの なまえじゃなくて いいよ</p>

      <h2>すきな すがたを えらぼう</h2>
      <div className="avatar-row">
        {AVATARS.map((a, i) => (
          <button
            key={i}
            className={`avatar-choice ${avatar === i ? 'selected' : ''}`}
            onClick={() => setAvatar(i)}
          >
            <AvatarPreview def={a} />
            <span className="avatar-name">
              {a.icon} {a.name}
            </span>
          </button>
        ))}
      </div>

      <div className="bottom-row">
        <button className="btn btn-ghost btn-big" onClick={() => setScreen('title')}>
          ◀ もどる
        </button>
        <button
          className="btn btn-primary btn-big"
          onClick={() => createSave(name.trim() || 'たんけんか', avatar)}
        >
          けってい ▶
        </button>
      </div>
    </div>
  )
}
