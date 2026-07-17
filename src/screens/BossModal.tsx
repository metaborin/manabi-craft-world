import { useMemo } from 'react'
import { useGameStore } from '../store/gameStore'
import { BOSSES, BOSS_MAP, BOSS_RULES, isBossEnabled } from '../data/bosses'
import { SUBJECTS } from '../data/grades'
import { UI } from '../data/uiText'
import { Furigana } from '../components/Furigana'
import { shuffleChoices } from '../game/choices'
import type { Grade } from '../types/game'

/** しんでんイントロに出す「5教科の光」の一覧 */
function TempleLights({ bossCleared, grade }: { bossCleared: string[]; grade: Grade }) {
  return (
    <div className="temple-lights">
      <div className="temple-lights-label">💡 {UI.temple.lightsLabel}</div>
      <div className="temple-lights-row">
        {BOSSES.map((b) => {
          const lit = bossCleared.includes(b.id)
          const soon = !isBossEnabled(b, grade)
          return (
            <span key={b.id} className={`temple-light ${lit ? 'lit' : ''}`}>
              {lit ? '💡' : '⚪'} {SUBJECTS[b.id].name}：
              {lit ? UI.temple.lightOn : soon ? UI.temple.lightSoon : UI.temple.lightOff}
            </span>
          )
        })}
      </div>
    </div>
  )
}

/**
 * ボスチャレンジ／しんでんチャレンジの画面。
 * ・ボス：5問中3問せいかいでクリア
 * ・しんでん：4問中3問せいかいでクリア
 * ・ヒントはチャレンジ中に1回だけ
 * ・まちがえても すぐには おわらない。3問せいかいが むりになったら やさしく おわる
 */
export function BossModal() {
  const boss = useGameStore((s) => s.boss)
  const bossStartQuestions = useGameStore((s) => s.bossStartQuestions)
  const bossAnswer = useGameStore((s) => s.bossAnswer)
  const bossUseHint = useGameStore((s) => s.bossUseHint)
  const bossNext = useGameStore((s) => s.bossNext)
  const closeBoss = useGameStore((s) => s.closeBoss)
  const bossCleared = useGameStore((s) => s.save?.bossCleared)
  const grade = useGameStore((s) => s.save?.grade ?? 1)
  // 選択肢の ならびは「問題が かわったときだけ」きめる。
  // questions は チャレンジごとに 新しい配列、index は 問題ごとに かわるので、
  // ・同じ問題のあいだ（とうじょう→出題、○×、かいせつ、ヒント）は 動かない
  // ・つぎの問題／もう一度 ちょうせん では ならびかえ直す
  const choices = useMemo(
    () => (boss ? shuffleChoices(boss.questions[boss.index]) : []),
    [boss?.questions, boss?.index],
  )
  if (!boss) return null

  const isTemple = boss.kind === 'temple'
  const def = boss.subject ? BOSS_MAP[boss.subject] : null
  const icon = isTemple ? '🏛️' : (def?.icon ?? '✨')
  const name = isTemple ? UI.temple.challengeName : (def?.name ?? '')
  const color = isTemple ? '#c9a227' : (def?.color ?? '#8e7cc3')
  const total = isTemple ? BOSS_RULES.templeQuestions : BOSS_RULES.bossQuestions
  const need = isTemple ? BOSS_RULES.templeNeed : BOSS_RULES.bossNeed
  const q = boss.questions[boss.index]

  // ===== とうじょう =====
  if (boss.phase === 'intro') {
    return (
      <div className="quest-overlay boss-overlay">
        <div className="quest-card boss-card boss-intro">
          <div className="boss-icon-big">{icon}</div>
          <div className="boss-name" style={{ color }}>
            {name}
          </div>
          <p className="boss-intro-text">{isTemple ? UI.temple.intro : def?.intro}</p>
          {isTemple && <TempleLights bossCleared={bossCleared ?? []} grade={grade} />}
          <p className="boss-rule">
            {total}もん中 {need}もん せいかいで クリア！ ヒントは 1回だけ つかえるよ
          </p>
          <div className="bottom-row">
            <button className="btn btn-ghost btn-big" onClick={closeBoss}>
              {UI.boss.later}
            </button>
            <button className="btn btn-primary btn-big" onClick={bossStartQuestions}>
              {UI.boss.start}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== クリア =====
  if (boss.phase === 'clear') {
    return (
      <div className="quest-overlay boss-overlay">
        <div className="quest-card boss-card boss-clear">
          <div className="boss-clear-glow" aria-hidden />
          <h2>{UI.boss.clearHeading}</h2>
          <div className="boss-icon-big happy">{icon}</div>
          <p className="done-message">{isTemple ? UI.temple.outro : def?.outro}</p>
          <p className="done-sub">{UI.boss.clearSub}</p>
          {boss.rewardText.length > 0 && (
            <>
              <div className="status-row-label">{UI.boss.rewardHeading}</div>
              <div className="reward-box">
                {boss.rewardText.map((r, i) => (
                  <span key={i} className="reward-item">
                    {r}
                  </span>
                ))}
              </div>
            </>
          )}
          <button className="btn btn-primary btn-big btn-wide" onClick={closeBoss}>
            {UI.boss.backToWorld}
          </button>
        </div>
      </div>
    )
  }

  // ===== もうすこし（やさしい おわりかた） =====
  if (boss.phase === 'fail') {
    return (
      <div className="quest-overlay boss-overlay">
        <div className="quest-card boss-card">
          <h2>{UI.boss.failHeading}</h2>
          <div className="boss-icon-big">{icon}</div>
          <p className="done-message">
            {boss.correct}もん せいかいできたよ！ あと {need - boss.correct}もんだった！
          </p>
          <p className="done-sub">{UI.boss.failSub}</p>
          <div className="bottom-row">
            <button className="btn btn-secondary btn-big" onClick={closeBoss}>
              {UI.boss.backToWorld}
            </button>
            <button
              className="btn btn-primary btn-big"
              onClick={() => {
                const subject = boss.subject
                const isT = isTemple
                closeBoss()
                const st = useGameStore.getState()
                if (isT) st.startTemple()
                else if (subject) st.startBoss(subject)
              }}
            >
              {UI.boss.retry}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== 出題・フィードバック =====
  return (
    <div className="quest-overlay boss-overlay">
      <div className="quest-card boss-card">
        <div className="quest-header boss-header" style={{ background: color }}>
          <span className="quest-subject">
            {icon} {name}
          </span>
          <button className="btn-close" onClick={closeBoss} aria-label="やめる">
            {UI.common.quit}
          </button>
        </div>

        {/* まなびゲージ（needぶん せいかいで クリア） */}
        <div className="boss-gauge-row">
          <span className="boss-gauge-label">{UI.boss.gaugeLabel}</span>
          <span className="boss-gauge">
            {Array.from({ length: need }).map((_, i) => (
              <span key={i} className={`gauge-orb ${i < boss.correct ? 'lit' : ''}`}>
                {i < boss.correct ? '💡' : '⚪'}
              </span>
            ))}
          </span>
          <span className="boss-progress">
            {boss.index + 1}／{total}もん
          </span>
        </div>

        <div className="quest-body">
          {boss.phase === 'ask' && (
            <>
              <p className="quest-question">
                <Furigana
                  text={q.question}
                  readingTarget={q.readingTarget}
                  furiganaHiddenTargets={q.furiganaHiddenTargets}
                />
              </p>
              {q.visual && <div className="quest-visual">{q.visual}</div>}
              {boss.hintShown && (
                <div className="hint-box">
                  💡 <Furigana text={q.hint} />
                </div>
              )}
              <div className="choice-list">
                {choices.map((c) => (
                  <button
                    key={c.originalIndex}
                    className="choice-btn"
                    onClick={() => bossAnswer(c.originalIndex)}
                  >
                    <Furigana text={c.text} />
                  </button>
                ))}
              </div>
              {!boss.hintUsed ? (
                <button className="btn btn-ghost" onClick={bossUseHint}>
                  {UI.boss.hintButton}
                </button>
              ) : (
                <p className="hint-text center">{UI.boss.hintUsed}</p>
              )}
            </>
          )}

          {boss.phase === 'feedback' && (
            <>
              <div className={`correct-mark ${boss.lastCorrect ? '' : 'soft'}`}>
                {boss.lastCorrect ? '⭕' : '💪'}
              </div>
              <div className={boss.lastCorrect ? 'feedback-banner ok' : 'feedback-banner'}>
                {boss.feedbackMsg}
              </div>
              {boss.lastCorrect && (
                <div className="explanation-box">
                  <span className="explanation-label">{UI.quest.explanationLabel}</span>
                  <p>
                    <Furigana text={q.explanation} />
                  </p>
                </div>
              )}
              <button className="btn btn-primary btn-big btn-wide" onClick={bossNext}>
                {UI.boss.next}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
