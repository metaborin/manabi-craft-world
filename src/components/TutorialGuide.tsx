import { useGameStore } from '../store/gameStore'
import { GRADES, SUBJECTS } from '../data/grades'
import { BADGES, petExpToNext, petLevel } from '../data/rewards'
import { missionsForDate, missionClaimed, missionDone, missionProgress } from '../data/missions'
import { UNLOCKABLE_AREAS } from '../data/areas'
import { activeBosses, isTempleReady } from '../data/bosses'
import { TREASURE_COUNT } from '../data/world'
import { todayString } from '../store/saveSystem'
import { UI } from '../data/uiText'
import { countRender } from '../game/perf'
import type { Subject } from '../types/game'

/** 曜日と学年から「きょうのおすすめ教科」を決める */
function todaysSubject(grade: number): Subject {
  const subjects = GRADES[grade as 1].mainSubjects
  return subjects[new Date().getDay() % subjects.length]
}

/**
 * ワールド画面の上部に出す「つぎにすること」の案内。
 * はじめてのプレイではチュートリアル（8ステップ）を表示し、
 * おわったあとは ミッション → エリア解放 の順で目標を出す。
 * ペットがレベル3になると、ペットがヒントをくれる形になる。
 */
export function TutorialGuide() {
  countRender('TutorialGuide')
  const save = useGameStore((s) => s.save)
  const petSense = useGameStore((s) => s.petSense)
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

  // チュートリアル後：ミッション → ボス・しんでん → エリア解放 → クリア後の目標
  const missions = missionsForDate(todayString())
  const claimable = missions.find((m) => missionDone(save, m) && !missionClaimed(save, m))
  const nextMission = missions.find((m) => !missionDone(save, m))
  const nextArea = UNLOCKABLE_AREAS.find(
    (a) => a.id !== 'temple' && !save.unlockedAreas.includes(a.id),
  )
  const readyBoss = activeBosses(save.grade).find(
    (b) => !save.bossCleared.includes(b.id) && b.isReady(save),
  )
  const templeReady = isTempleReady(save) && !save.templeCleared

  let action: string
  if (save.pet && petExpToNext(save.pet.growth) <= 2) {
    action = UI.petLevel.toNext(petExpToNext(save.pet.growth))
  } else if (claimable) {
    action = 'ミッション たっせい！🎁 ここを タップして うけとろう'
  } else if (templeReady) {
    action = '🏛️ しんでんの とびらが ひらいた！ チャレンジに いこう！'
  } else if (readyBoss) {
    action = `${readyBoss.icon}「${readyBoss.name}」に ちょうせんできるよ！`
  } else if (nextMission) {
    action = `${nextMission.title}（${UI.mission.left(nextMission.goal - missionProgress(save, nextMission))}）`
  } else if (nextArea) {
    action = `${nextArea.icon} ${UI.area.soon} ${nextArea.remainingHint(save) ?? ''}`
  } else if (save.templeCleared) {
    // クリア後：のこりの あそびを 日がわりで おすすめ
    const badgesLeft = BADGES.length - save.badges.length
    const chestsLeft = TREASURE_COUNT - save.openedChests.length
    if (badgesLeft > 0 && new Date().getDay() % 2 === 0) action = UI.postGame.badges(badgesLeft)
    else if (chestsLeft > 0) action = UI.postGame.treasure
    else {
      const rotate = [UI.postGame.build, UI.postGame.pet, UI.postGame.future]
      action = rotate[new Date().getDay() % rotate.length]
    }
  } else {
    action = 'きょうの ミッション ぜんぶクリア！🌟 じゆうに あそぼう'
  }

  // ペットがレベル3なら、ペットがおしえてくれる
  const petHints = save.pet && petLevel(save.pet.growth) >= 3
  if (petHints) action = `${UI.petAbility.hintPrefix}${action}`

  const rec = todaysSubject(save.grade)
  return (
    <div className="hud-guide">
      <button
        className={`guide-banner guide-clickable ${claimable ? 'guide-ready' : ''}`}
        onClick={() => setScreen('mission')}
      >
        <span className="guide-icon">{petHints ? '🐾' : '🎯'}</span>
        <span className="guide-text">{action}</span>
        <span className="guide-open">▶</span>
      </button>
      {petSense && <span className="daily-rec pet-sense">{UI.petAbility.sense}</span>}
      <span className="daily-rec">
        {UI.world.todaysRec}
        {SUBJECTS[rec].icon} {SUBJECTS[rec].name}
      </span>
    </div>
  )
}
