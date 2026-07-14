import type { Grade, SaveData, Subject } from '../types/game'
import { getQuestions, subjectQuestionCount } from './questions'
import { SUBJECTS } from './grades'

/**
 * エリアボス（5教科）。
 * 「敵を倒す」ではなく「まなびの力で 元気にする」存在。
 *
 * ■ 教科ボスを 有効化する手順
 *   1. src/data/questions.ts に その教科の問題を追加する
 *      （全学年合計 BOSS_RULES.enableQuestions 問以上）
 *   2. この配列の available を true にする
 *   3. 特定の学年だけで出したいときは availableGrades にその学年を書く
 *      （例: 理科は小3の問題だけあるので availableGrades: [3]）
 *   → これだけでワールドで挑戦できるようになり、
 *     図鑑・神殿の光・バッジ・称号も自動で連動する。
 *   問題数が足りない／対象学年でないうちは有効化されない
 *   （isBossEnabled が available・学年・問題数をまとめて見るため、
 *     意図しない解放は起きない）。
 */
export interface BossDef {
  id: Subject
  /** ボスの名まえ（こわくない よびかた） */
  name: string
  icon: string
  color: string
  /** どんなボスかの説明（図鑑などに出す） */
  desc: string
  /** 登場時のひとこと（1〜2文・ひらがな多め） */
  intro: string
  /** クリアしたときのひとこと */
  outro: string
  /** 明示的な有効化フラグ。問題がそろっても false のあいだは挑戦できない */
  available: boolean
  /**
   * 挑戦できる学年（省略すると どの学年でも可）。
   * その教科の問題が特定の学年にしか無いときに使う。
   * 例: 理科は小3の問題だけあるので [3]。
   */
  availableGrades?: Grade[]
  /** じゅんび中のあいだの表示（前向きな ことばで） */
  soonText: string
  /** 今後 追加予定の単元例（じゅんび中の表示に使う） */
  futureUnits: string[]
  /** ワールドのどこにいるか */
  pos: [number, number, number]
  /** 挑戦条件をみたしているか */
  isReady: (s: SaveData) => boolean
  /** 条件の説明 */
  conditionText: string
  /** あとどれくらいかのヒント（達成済みなら null） */
  remainingHint: (s: SaveData) => string | null
}

/** ボスチャレンジのルール（かんたんに調整できるようにここへ） */
export const BOSS_RULES = {
  /** ボスは5問（3問せいかいでクリア） */
  bossQuestions: 5,
  bossNeed: 3,
  /** しんでんは4問（こくご2＋さんすう2、3問せいかいでクリア） */
  templeQuestions: 4,
  templeNeed: 3,
  /** ヒントはチャレンジ中に1回だけ */
  hintLimit: 1,
  /** ボスを有効化できる、その教科の最低問題数（全学年合計） */
  enableQuestions: 20,
}

export const BOSSES: BossDef[] = [
  {
    id: 'kokugo',
    name: 'ことばの もやもや',
    icon: '🌫️',
    color: '#8e7cc3',
    desc: 'ことばの もんだいで もやを はらって、光を とりもどそう。',
    intro: 'もやもや〜…。ことばが わからなくて、もやもや しているの…。ことばの 力で わたしを 元気に して！',
    outro: 'もやが はれた〜！ ことばの 光を ありがとう！',
    available: true,
    soonText: '',
    futureUnits: [],
    pos: [-12, 0, -16.5],
    isReady: (s) => (s.stats.bySubject.kokugo?.cleared ?? 0) >= 5,
    conditionText: 'こくごの もんだいを 5もん クリアすると ちょうせんできるよ',
    remainingHint: (s) => {
      const left = 5 - (s.stats.bySubject.kokugo?.cleared ?? 0)
      return left > 0 ? `あと ${left}もん クリアで ちょうせんできるよ` : null
    },
  },
  {
    id: 'sansu',
    name: 'かずの からくり',
    icon: '⚙️',
    color: '#e8863b',
    desc: 'けいさんの 力で からくりを なおして、光を とりもどそう。',
    intro: 'ガタ…ゴト…。かずが バラバラで うごけないんだ…。けいさんの 力で ぼくを なおして！',
    outro: 'カチッ！ うごけるように なったよ！ かずの 光を ありがとう！',
    available: true,
    soonText: '',
    futureUnits: [],
    pos: [12.5, 0, -15],
    isReady: (s) =>
      (s.stats.bySubject.sansu?.cleared ?? 0) >= 5 && s.totalMissionsCompleted >= 1,
    conditionText: 'さんすうを 5もん クリアして、ミッションを 1かい たっせいすると ちょうせんできるよ',
    remainingHint: (s) => {
      const left = 5 - (s.stats.bySubject.sansu?.cleared ?? 0)
      if (left > 0) return `あと ${left}もん クリアで ちょうせんできるよ`
      if (s.totalMissionsCompleted < 1) return 'ミッションを 1かい たっせいしよう'
      return null
    },
  },
  // ---- ここから下は じゅんび中のボス（問題がそろったら available:true にする） ----
  {
    id: 'rika',
    name: 'しぜんの なぞ',
    icon: '🔍',
    color: '#26c6da',
    desc: 'はな・むし・ほし・てんきの なぞを、まなびの 力で といていこう。',
    intro: 'ふしぎ ふしぎ…。しぜんの なぞが いっぱい なの。りかの 力で なぞを といて！',
    outro: 'なぞが とけて すっきり！ しぜんの 光を ありがとう！',
    available: true,
    // 理科の問題は いまは小3ぶんだけ。小1・小2では じゅんび中のまま。
    availableGrades: [3],
    soonText: 'あたらしい まなびを じゅんびちゅう',
    futureUnits: ['しょくぶつ', 'こんちゅう', 'たいよう と かげ', 'でんき', 'じしゃく'],
    pos: [4.5, 0, -19.5],
    isReady: (s) => (s.stats.bySubject.rika?.cleared ?? 0) >= 5,
    conditionText: 'りかの もんだいを 5もん クリアすると ちょうせんできるよ',
    remainingHint: (s) => {
      const left = 5 - (s.stats.bySubject.rika?.cleared ?? 0)
      return left > 0 ? `あと ${left}もん クリアで ちょうせんできるよ` : null
    },
  },
  {
    id: 'shakai',
    name: 'まちの まよい道',
    icon: '🗺️',
    color: '#a1887f',
    desc: 'まち・おみせ・ちずの ことを まなんで、みちを ひらこう。',
    intro: 'あれれ…。みちが わからなく なっちゃった…。まちの ことを おしえて、みちを ひらいて！',
    outro: 'みちが ひらけた！ まちの 光を ありがとう！',
    available: false,
    soonText: 'もうすぐ ひらくよ',
    futureUnits: ['まちたんけん', 'おみせの しごと', 'ちず', 'こうつう', 'あんぜん'],
    pos: [20, 0, 5],
    isReady: (s) => (s.stats.bySubject.shakai?.cleared ?? 0) >= 5,
    conditionText: 'しゃかいの もんだいを 5もん クリアすると ちょうせんできるよ',
    remainingHint: (s) => {
      const left = 5 - (s.stats.bySubject.shakai?.cleared ?? 0)
      return left > 0 ? `あと ${left}もん クリアで ちょうせんできるよ` : null
    },
  },
  {
    id: 'eigo',
    name: 'ことばの とびら',
    icon: '🚪',
    color: '#9575cd',
    desc: 'あいさつや いろ、かずの えいごで、とびらを ひらこう。',
    intro: 'Hello（ハロー）！ とびらを ひらく ことばを おしえて！',
    outro: 'Thank you（サンキュー）！ とびらが ひらいたよ！',
    available: false,
    soonText: 'ことばの とびらを じゅんびちゅう',
    futureUnits: ['あいさつ', 'いろ', 'かず', 'どうぶつ', 'てんき', 'きもち'],
    pos: [-17, 0, 6],
    isReady: (s) => (s.stats.bySubject.eigo?.cleared ?? 0) >= 5,
    conditionText: 'えいごの もんだいを 5もん クリアすると ちょうせんできるよ',
    remainingHint: (s) => {
      const left = 5 - (s.stats.bySubject.eigo?.cleared ?? 0)
      return left > 0 ? `あと ${left}もん クリアで ちょうせんできるよ` : null
    },
  },
]

export const BOSS_MAP: Record<string, BossDef> = Object.fromEntries(
  BOSSES.map((b) => [b.id, b]),
)

/**
 * その学年で いま挑戦できる教科か。
 * 判定の順番：
 *   1. 明示的な有効化（available）が true
 *   2. 学年しばり（availableGrades があれば 今の学年が含まれるか）
 *   3. 挑戦できる学年に、必要数以上の問題があるか
 *      → 学年しばりボスは「その学年だけ」の問題数で数える（全学年合計は使わない）。
 *        例: 理科は小3の27問で判定（全学年合計30ではない）。
 *      → 学年しばりの無いボス（国語・算数）は、これまでどおり全学年合計で判定
 *        （どの学年でも遊べる想定のため）。
 * これにより「問題を追加しただけ」「フラグを立てただけ」では解放されない。
 * また 小1・小2に理科問題が無いうちは、その学年では有効化されない。
 */
export function isBossEnabled(b: BossDef, grade: Grade): boolean {
  if (!b.available) return false
  if (b.availableGrades) {
    if (!b.availableGrades.includes(grade)) return false
    // 学年しばりボスは その学年の問題数だけで判定する（全学年合計は使わない）
    // 例: 理科は getQuestions(3, 'rika').length = 27 で判定
    return getQuestions(grade, b.id).length >= BOSS_RULES.enableQuestions
  }
  // 学年しばりの無いボスは 従来どおり全学年合計で判定
  return subjectQuestionCount(b.id) >= BOSS_RULES.enableQuestions
}

/** その学年で いま挑戦できるボスの一覧 */
export function activeBosses(grade: Grade): BossDef[] {
  return BOSSES.filter((b) => isBossEnabled(b, grade))
}

/** ボスの状態。画面ごとに条件式を書かず、必ずこれで判定する（学年は save から見る） */
export type BossState = 'cleared' | 'available' | 'locked' | 'comingSoon'

export function bossState(s: SaveData, b: BossDef): BossState {
  if (s.bossCleared.includes(b.id)) return 'cleared'
  if (!isBossEnabled(b, s.grade)) return 'comingSoon'
  return b.isReady(s) ? 'available' : 'locked'
}

/** 「いまは こくごと さんすう」のような、その学年で いま遊べる教科の案内文 */
export function activeSubjectsText(grade: Grade): string {
  return activeBosses(grade).map((b) => SUBJECTS[b.id].name).join('と ')
}

/**
 * しんでんが ひらく条件：こくご＋さんすうの ボスをクリア。
 * ※ 5教科そろっても、この解放条件は かんたんなまま変えない
 *   （5教科の完全達成は allLightsCollected で別に見る）
 */
export function isTempleReady(s: SaveData): boolean {
  return s.bossCleared.includes('kokugo') && s.bossCleared.includes('sansu')
}

/**
 * 将来の「5教科すべての光」達成（しんでんの解放条件とは別の概念）。
 * まなびマスター系のバッジ・称号がこれを見る。
 */
export function allLightsCollected(s: SaveData): boolean {
  return BOSSES.every((b) => s.bossCleared.includes(b.id))
}
