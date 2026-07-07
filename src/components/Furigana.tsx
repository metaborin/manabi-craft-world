import { Fragment } from 'react'

/**
 * 「{漢字|かんじ}」の形式で書かれたテキストを、ふりがな付き(<ruby>)で表示する。
 * 例: <Furigana text="{晴|は}れの日" /> → 晴(は)れの日
 */
export function Furigana({ text }: { text: string }) {
  const re = /\{([^|{}]+)\|([^|{}]+)\}/g
  const parts: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  let key = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(<Fragment key={key++}>{text.slice(last, m.index)}</Fragment>)
    parts.push(
      <ruby key={key++}>
        {m[1]}
        <rt>{m[2]}</rt>
      </ruby>,
    )
    last = m.index + m[0].length
  }
  if (last < text.length) parts.push(<Fragment key={key++}>{text.slice(last)}</Fragment>)
  return <>{parts}</>
}
