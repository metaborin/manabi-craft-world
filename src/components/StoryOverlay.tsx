import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { UI } from '../data/uiText'

/**
 * オープニングのおはなし（新しいセーブの最初のワールド入場時）。
 * ヘルプ画面の「おはなしを もういちど みる」でも表示される。
 */
export function StoryOverlay() {
  const finishStory = useGameStore((s) => s.finishStory)
  const [index, setIndex] = useState(0)
  const slides = UI.story.slides
  const slide = slides[index]
  const isLast = index >= slides.length - 1

  return (
    <div className="story-overlay">
      <div className="story-card" key={index}>
        <div className="story-icon">{slide.icon}</div>
        <p className="story-text">
          {slide.text.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </p>
        <div className="story-dots">
          {slides.map((_, i) => (
            <span key={i} className={`dot ${i === index ? 'now' : i < index ? 'done' : ''}`} />
          ))}
        </div>
        {isLast ? (
          <button className="btn btn-primary btn-big" onClick={finishStory}>
            {UI.story.start}
          </button>
        ) : (
          <button className="btn btn-primary btn-big" onClick={() => setIndex(index + 1)}>
            {UI.story.next}
          </button>
        )}
      </div>
    </div>
  )
}
