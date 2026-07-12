import { useGameStore } from '../store/gameStore'
import { SUBJECTS } from '../data/grades'
import { BLOCK_MAP } from '../data/rewards'
import { UI } from '../data/uiText'
import { Furigana } from '../components/Furigana'
import { countRender } from '../game/perf'

/** クエスト完了画面のかるい紙ふぶき（CSSアニメーション） */
function Confetti() {
  const pieces = ['🎉', '⭐', '✨', '🎊', '🌟', '💛']
  return (
    <div className="confetti" aria-hidden>
      {pieces.map((p, i) => (
        <span key={i} className="confetti-piece" style={{ left: `${8 + i * 15}%`, animationDelay: `${i * 0.18}s` }}>
          {p}
        </span>
      ))}
    </div>
  )
}

/**
 * クエスト画面（1クエスト＝3問）。
 * まちがえてもゲームオーバーなし。ヒント→さらに具体的なヒント→
 * 2回まちがえたら正解がひかって「いっしょに解く」形になる。
 */
export function QuestModal() {
  countRender('QuestModal')
  const quest = useGameStore((s) => s.quest)
  const answerQuestion = useGameStore((s) => s.answerQuestion)
  const showHint = useGameStore((s) => s.showHint)
  const questNext = useGameStore((s) => s.questNext)
  const closeQuest = useGameStore((s) => s.closeQuest)
  if (!quest) return null

  const subject = SUBJECTS[quest.subject]
  const q = quest.questions[quest.index]
  const isLast = quest.index + 1 >= quest.questions.length

  // ===== セッション終了画面 =====
  if (quest.phase === 'done') {
    return (
      <div className="quest-overlay">
        <div className="quest-card quest-done">
          <Confetti />
          <h2>{UI.quest.doneHeading}</h2>
          <div className="done-stars">
            {quest.questions.map((_, i) => (
              <span key={i} className="star">
                {i < quest.clearedCount ? '⭐' : '🌟'}
              </span>
            ))}
          </div>
          <p className="done-message">
            {UI.quest.doneMessage(quest.clearedCount, quest.earnedCoins)}
          </p>
          <p className="done-sub">{UI.quest.doneSub}</p>
          <div className="bottom-row">
            <button className="btn btn-secondary btn-big" onClick={closeQuest}>
              {UI.common.backToWorld}
            </button>
            <button
              className="btn btn-primary btn-big"
              onClick={() => {
                const sub = quest.subject
                closeQuest()
                useGameStore.getState().startQuest(sub)
              }}
            >
              {UI.quest.playAgain}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== 正解画面 =====
  if (quest.phase === 'correct') {
    return (
      <div className="quest-overlay">
        <div className="quest-card quest-correct">
          <div className="correct-mark">⭕</div>
          <h2>{quest.message}</h2>
          <div className="explanation-box">
            <span className="explanation-label">{UI.quest.explanationLabel}</span>
            <p>
              <Furigana text={q.explanation} />
            </p>
          </div>
          {quest.lastReward && (
            <div className="reward-box">
              <span>{UI.quest.rewardLabel}</span>
              <span className="reward-item">🪙 +{quest.lastReward.coins}</span>
              <span className="reward-item">
                ✨ {UI.quest.xpName} +{quest.lastReward.xp}
              </span>
              {quest.lastReward.blockNames.map((b) => (
                <span key={b} className="reward-item">
                  {BLOCK_MAP[b]?.emoji} {BLOCK_MAP[b]?.name}
                </span>
              ))}
            </div>
          )}
          {quest.levelUp && <div className="levelup-banner">{UI.quest.levelUp}</div>}
          {quest.newBadges.length > 0 && (
            <div className="levelup-banner">{UI.quest.newBadge}</div>
          )}
          {quest.bonusMessages.map((m, i) => (
            <div key={i} className="bonus-banner">
              {m}
            </div>
          ))}
          <button className="btn btn-primary btn-big btn-wide" onClick={questNext}>
            {isLast
              ? UI.quest.seeResult
              : UI.quest.nextQuestion(quest.questions.length - quest.index - 1)}
          </button>
        </div>
      </div>
    )
  }

  // ===== 問題画面 =====
  return (
    <div className="quest-overlay">
      <div className="quest-card">
        <div className="quest-header" style={{ background: subject.color }}>
          <span className="quest-subject">
            {subject.icon} {subject.name}（{q.unit}）
          </span>
          <span className="quest-dots">
            {quest.questions.map((_, i) => (
              <span key={i} className={`dot ${i < quest.index ? 'done' : i === quest.index ? 'now' : ''}`} />
            ))}
          </span>
          <button className="btn-close" onClick={closeQuest} aria-label="やめる">
            {UI.common.quit}
          </button>
        </div>

        <div className="quest-body">
          <p className="quest-question">
            <Furigana text={q.question} />
          </p>
          {q.visual && <div className="quest-visual">{q.visual}</div>}

          {quest.message && <div className="feedback-banner">{quest.message}</div>}

          {quest.hintLevel >= 1 && (
            <div className="hint-box">
              💡 <Furigana text={q.hint} />
            </div>
          )}
          {quest.hintLevel >= 2 && (
            <div className="hint-box hint-strong">
              💡💡 <Furigana text={q.hint2} />
            </div>
          )}
          {quest.assist && <div className="assist-banner">{UI.quest.assistBanner}</div>}

          <div className="choice-list">
            {q.choices.map((c, i) => (
              <button
                key={i}
                className={`choice-btn ${quest.assist && i === q.answer ? 'assist-glow' : ''}`}
                onClick={() => answerQuestion(i)}
              >
                <Furigana text={c} />
              </button>
            ))}
          </div>

          {quest.hintLevel === 0 && (
            <button className="btn btn-ghost" onClick={showHint}>
              {UI.common.hint}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
