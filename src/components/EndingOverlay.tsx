import { useState } from 'react'
import { useGameStore } from '../store/gameStore'
import { UI } from '../data/uiText'

/**
 * しんでんチャレンジを はじめてクリアしたときの 短いエンディング。
 * 見おわったあとも ゲームは つづけられる。
 */
export function EndingOverlay() {
  const finishEnding = useGameStore((s) => s.finishEnding)
  const [index, setIndex] = useState(0)
  const slides = UI.ending.slides
  const isFinal = index >= slides.length
  const slide = slides[Math.min(index, slides.length - 1)]

  if (isFinal) {
    // さいごの おいわい画面
    return (
      <div className="story-overlay ending-overlay">
        <div className="story-card ending-card">
          <div className="ending-rays" aria-hidden />
          <div className="story-icon">🏆</div>
          <h2 className="ending-congrats">{UI.ending.congrats}</h2>
          <div className="reward-box">
            <span className="reward-item">🎬 はじめての エンディング</span>
            <span className="reward-item">🌟 ワールドを げんきにした こ</span>
            <span className="reward-item">🐾 ペットも おおよろこび！</span>
          </div>
          <p className="done-sub">
            まだ あつめていない バッジや たからばこが あるよ。ワールドは これからも つづく！
          </p>
          <button className="btn btn-primary btn-big" onClick={finishEnding}>
            {UI.ending.keepPlaying}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="story-overlay ending-overlay">
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
        <button className="btn btn-primary btn-big" onClick={() => setIndex(index + 1)}>
          {UI.ending.next}
        </button>
      </div>
    </div>
  )
}
