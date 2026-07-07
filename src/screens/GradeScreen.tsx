import { useGameStore } from '../store/gameStore'
import { GRADES, GRADE_LIST, SUBJECTS } from '../data/grades'

export function GradeScreen() {
  const setGrade = useGameStore((s) => s.setGrade)
  const setScreen = useGameStore((s) => s.setScreen)
  const save = useGameStore((s) => s.save)
  const isNewGame = useGameStore((s) => s.isNewGame)

  return (
    <div className="screen grade-screen">
      <h2>がくねんを えらぼう</h2>
      <p className="hint-text">あとから いつでも かえられるよ</p>
      <div className="grade-grid">
        {GRADE_LIST.map((g) => (
          <button
            key={g}
            className={`grade-card ${save?.grade === g && !isNewGame ? 'selected' : ''}`}
            onClick={() => setGrade(g)}
          >
            <span className="grade-num">{g}</span>
            <span className="grade-label">{GRADES[g].label}</span>
            <span className="grade-desc">{GRADES[g].desc}</span>
            <span className="grade-subjects">
              {GRADES[g].mainSubjects.map((sub) => (
                <span key={sub} title={SUBJECTS[sub].name}>
                  {SUBJECTS[sub].icon}
                </span>
              ))}
            </span>
          </button>
        ))}
      </div>
      {!isNewGame && (
        <button className="btn btn-ghost btn-big" onClick={() => setScreen('world')}>
          ◀ もどる
        </button>
      )}
    </div>
  )
}
