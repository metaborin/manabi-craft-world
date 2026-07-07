import { useGameStore } from '../store/gameStore'
import { UI } from '../data/uiText'
import { Furigana } from './Furigana'

/**
 * NPC・看板の会話ウィンドウ。セリフを1行ずつ表示し、
 * クエストNPCなら最後に「ちょうせんする！」ボタンが出る。
 */
export function DialogBox() {
  const dialog = useGameStore((s) => s.dialog)
  const dialogNext = useGameStore((s) => s.dialogNext)
  const closeDialog = useGameStore((s) => s.closeDialog)
  const acceptQuest = useGameStore((s) => s.acceptQuestFromDialog)
  if (!dialog) return null

  const lines = dialog.npc.dialog ?? []
  const line = lines[Math.min(dialog.index, lines.length - 1)]
  const isLast = dialog.index >= lines.length - 1
  const isQuest = dialog.npc.kind === 'quest'

  return (
    <div className="dialog-wrap">
      <div className="dialog-box" key={dialog.index}>
        <div className="dialog-name" style={{ background: dialog.npc.color }}>
          {dialog.npc.kind === 'sign' ? '📌' : '💬'} {dialog.npc.label}
        </div>
        <p className="dialog-text">
          <Furigana text={line} />
        </p>
        <div className="dialog-buttons">
          {!isLast && (
            <button className="btn btn-primary btn-big" onClick={dialogNext}>
              {UI.dialog.next}
            </button>
          )}
          {isLast && isQuest && (
            <>
              <button className="btn btn-ghost" onClick={closeDialog}>
                {UI.dialog.later}
              </button>
              <button className="btn btn-primary btn-big" onClick={acceptQuest}>
                {UI.dialog.accept}
              </button>
            </>
          )}
          {isLast && !isQuest && (
            <button className="btn btn-secondary btn-big" onClick={closeDialog}>
              {UI.dialog.ok}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
