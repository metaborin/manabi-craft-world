import { useGameStore } from '../store/gameStore'
import { GRADES, SUBJECTS } from '../data/grades'
import { DAILY_BONUS, BLOCK_MAP } from '../data/rewards'
import { UI } from '../data/uiText'
import type { Subject } from '../types/game'

/** 曜日と学年から「きょうのおすすめ教科」を決める */
function todaysSubject(grade: number): Subject {
  const subjects = GRADES[grade as 1].mainSubjects
  return subjects[new Date().getDay() % subjects.length]
}

/**
 * ワールド画面の上部に出す「つぎにすること」の案内。
 * はじめてのプレイではチュートリアル（6ステップ）を表示し、
 * おわったあとは いまの状態に合わせたおすすめを表示する。
 */
export function TutorialGuide() {
  const save = useGameStore((s) => s.save)
  if (!save) return null

  // チュートリアル中
  if (!save.tutorialDone) {
    const step = Math.min(save.tutorialStep, UI.tutorial.steps.length - 1)
    return (
      <div className="hud-guide">
        <div className="guide-banner tutorial">
          <span className="guide-icon">🧭</span>
          <span className="guide-text">{UI.tutorial.steps[step]}</span>
          <span className="guide-step">
            {step + 1}／{UI.tutorial.steps.length}
          </span>
        </div>
      </div>
    )
  }

  // チュートリアル後：「つぎにすること」のおすすめ
  let action: string
  if (save.dailyCount < DAILY_BONUS.small.at) {
    action = UI.nextAction.quest(save.dailyCount, DAILY_BONUS.small.at)
  } else if (save.dailyCount < DAILY_BONUS.big.at) {
    action = UI.nextAction.quest(save.dailyCount, DAILY_BONUS.big.at)
  } else if (Object.values(save.blocks).some((n) => n > 0)) {
    action = UI.nextAction.build
  } else if (save.coins >= Math.min(...Object.values(BLOCK_MAP).map((b) => b.price))) {
    action = UI.nextAction.shop
  } else {
    action = UI.nextAction.free
  }

  const rec = todaysSubject(save.grade)
  return (
    <div className="hud-guide">
      <div className="guide-banner">
        <span className="guide-icon">📢</span>
        <span className="guide-text">{action}</span>
      </div>
      <span className="daily-rec">
        {UI.world.todaysRec}
        {SUBJECTS[rec].icon} {SUBJECTS[rec].name}
      </span>
    </div>
  )
}
