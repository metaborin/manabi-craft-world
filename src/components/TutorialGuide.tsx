import { useGameStore } from '../store/gameStore'
import { GRADES, SUBJECTS } from '../data/grades'
import { petExpToNext } from '../data/rewards'
import { missionsForDate, missionClaimed, missionDone, missionProgress } from '../data/missions'
import { todayString } from '../store/saveSystem'
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
 * おわったあとは きょうのミッションに合わせた目標を表示する。
 * バナーをタップするとミッション画面が開く。
 */
export function TutorialGuide() {
  const save = useGameStore((s) => s.save)
  const setScreen = useGameStore((s) => s.setScreen)
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

  // チュートリアル後：ミッションにあわせた「つぎにすること」
  const missions = missionsForDate(todayString())
  const claimable = missions.find((m) => missionDone(save, m) && !missionClaimed(save, m))
  const nextMission = missions.find((m) => !missionDone(save, m))

  let action: string
  if (save.pet && petExpToNext(save.pet.growth) <= 2) {
    action = UI.petLevel.toNext(petExpToNext(save.pet.growth))
  } else if (claimable) {
    action = 'ミッション たっせい！🎁 ここを タップして うけとろう'
  } else if (nextMission) {
    action = `${nextMission.title}（${UI.mission.left(nextMission.goal - missionProgress(save, nextMission))}）`
  } else {
    action = 'きょうの ミッション ぜんぶクリア！🌟 じゆうに あそぼう'
  }

  const rec = todaysSubject(save.grade)
  return (
    <div className="hud-guide">
      <button
        className={`guide-banner guide-clickable ${claimable ? 'guide-ready' : ''}`}
        onClick={() => setScreen('mission')}
      >
        <span className="guide-icon">🎯</span>
        <span className="guide-text">{action}</span>
        <span className="guide-open">▶</span>
      </button>
      <span className="daily-rec">
        {UI.world.todaysRec}
        {SUBJECTS[rec].icon} {SUBJECTS[rec].name}
      </span>
    </div>
  )
}
