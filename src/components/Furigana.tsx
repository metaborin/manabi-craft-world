import { Fragment, useMemo } from 'react'
import { useGameStore } from '../store/gameStore'

/**
 * 「{漢字|かんじ}」の形式で書かれたテキストを、ふりがな付き(<ruby>)で表示する。
 * せっていで「ふりがな：つけない」にすると、漢字だけを表示する。
 * 例: <Furigana text="{晴|は}れの日" /> → 晴(は)れの日
 *
 * ルビを隠したい漢字は、次の2つで指定できる（どちらも漢字自体は表示し、ルビだけ出さない）。
 * - readingTarget: 漢字の読み方を答える問題で「答えにあたる漢字」（例: '学校'）
 * - furiganaHiddenTargets: 読み方問題以外でも、ふりがなが答えを教えてしまう
 *   問題の対象漢字（例:「三」は いくつ？ の '三'）。複数指定できる。
 * どちらも未指定なら、従来どおりすべての {漢字|よみ} をふりがな付きで表示する。
 */
export function Furigana({
  text,
  readingTarget,
  furiganaHiddenTargets,
}: {
  text: string
  readingTarget?: string
  furiganaHiddenTargets?: string[]
}) {
  const showRuby = useGameStore((s) => s.settings.furigana === 'on')
  // ルビを出さない漢字の集合（readingTarget と furiganaHiddenTargets をまとめる）。
  // 空文字は無視し、重複はSetが自動でまとめる。
  const hidden = useMemo(() => {
    const set = new Set<string>()
    if (readingTarget) set.add(readingTarget)
    if (furiganaHiddenTargets) for (const t of furiganaHiddenTargets) if (t) set.add(t)
    return set
  }, [readingTarget, furiganaHiddenTargets])
  const re = /\{([^|{}]+)\|([^|{}]+)\}/g
  const parts: React.ReactNode[] = []
  let last = 0
  let m: RegExpExecArray | null
  let key = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(<Fragment key={key++}>{text.slice(last, m.index)}</Fragment>)
    // 指定された「答えにあたる漢字」は、ふりがなONでもルビを出さない
    const asRuby = showRuby && !hidden.has(m[1])
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
