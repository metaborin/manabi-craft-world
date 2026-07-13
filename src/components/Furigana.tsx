import { Fragment } from 'react'
import { useGameStore } from '../store/gameStore'

/**
 * 「{漢字|かんじ}」の形式で書かれたテキストを、ふりがな付き(<ruby>)で表示する。
 * せっていで「ふりがな：つけない」にすると、漢字だけを表示する。
 * 例: <Furigana text="{晴|は}れの日" /> → 晴(は)れの日
 *
 * readingTarget を指定すると、その漢字の {漢字|よみ} だけは
 * ふりがなONでもルビを出さない（漢字の読み方を答える問題で、
 * 答えの読みが見えてしまうのを防ぐため）。
 * 指定しなければ従来どおり、すべての {漢字|よみ} をふりがな付きで表示する。
 */
export function Furigana({ text, readingTarget }: { text: string; readingTarget?: string }) {
  const showRuby = useGameStore((s) => s.settings.furigana === 'on')
  const re = /\{([^|{}]+)\|([^|{}]+)\}/g
  const parts: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  let key = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(<Fragment key={key++}>{text.slice(last, m.index)}</Fragment>)
    // 読み方問題の「答えにあたる漢字」は、ふりがなONでもルビを出さない
    const asRuby = showRuby && m[1] !== readingTarget
    parts.push(
      asRuby ? (
        <ruby key={key++}>
          {m[1]}
          <rt>{m[2]}</rt>
        </ruby>
      ) : (
        <Fragment key={key++}>{m[1]}</Fragment>
      ),
    )
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(<Fragment key={key++}>{text.slice(last)}</Fragment>)
  return <>{parts}</>
}
