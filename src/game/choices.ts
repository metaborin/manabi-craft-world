import type { Question } from '../types/game'

/**
 * 画面に出す 選択肢1つ分。
 * originalIndex（元の question.choices での ばんごう）を いっしょに持つので、
 * ならびを かえても 正解はんていが ずれない。
 */
export interface ShuffledChoice {
  /** 画面に出す文（ふりがな記法つきのまま） */
  text: string
  /** 元の question.choices での ばんごう。正解はんていに つかう */
  originalIndex: number
}

/**
 * 選択肢の ならびを ランダムにする。
 *
 * ・元の question.choices は さわらない（コピーしてから ならべかえる）
 * ・かたよりの少ない Fisher–Yates を つかう
 *   （sort(() => Math.random() - 0.5) は かたよるので つかわない）
 * ・正解は originalIndex で 見わけるので、同じ文の選択肢が あっても まちがえない
 *
 * ※ 呼ぶ側は「問題が かわったときだけ」呼ぶこと（useMemo など）。
 *   毎レンダーで 呼ぶと、こたえるたびに ならびが 動いてしまう。
 */
export function shuffleChoices(q: Question): ShuffledChoice[] {
  const list: ShuffledChoice[] = q.choices.map((text, originalIndex) => ({ text, originalIndex }))
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = list[i]
    list[i] = list[j]
    list[j] = tmp
  }
  return list
}
