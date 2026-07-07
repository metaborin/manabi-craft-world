import { useEffect, useState } from 'react'
import { useGameStore } from '../store/gameStore'

/** 画面下部に一時的に出るメッセージ */
export function Toast() {
  const toast = useGameStore((s) => s.toast)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!toast) return
    setVisible(true)
    const t = setTimeout(() => setVisible(false), 4000)
    return () => clearTimeout(t)
  }, [toast])

  if (!toast || !visible) return null
  return (
    <div className="toast" key={toast.id} onClick={() => setVisible(false)}>
      {toast.text}
    </div>
  )
}
