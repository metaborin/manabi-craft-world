/** 「ほんとうに いいですか？」を確認するダイアログ */
export function ConfirmDialog({
  message,
  yesLabel,
  noLabel,
  onYes,
  onNo,
}: {
  message: string
  yesLabel: string
  noLabel: string
  onYes: () => void
  onNo: () => void
}) {
  return (
    <div className="confirm-overlay" onClick={onNo}>
      <div className="confirm-card" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-message">{message}</p>
        <div className="confirm-buttons">
          <button className="btn btn-ghost btn-big" onClick={onNo}>
            {noLabel}
          </button>
          <button className="btn btn-danger btn-big" onClick={onYes}>
            {yesLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
