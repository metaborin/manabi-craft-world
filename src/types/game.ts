// ゲーム全体で使う型定義

export type Grade = 1 | 2 | 3 | 4 | 5 | 6

export type Subject = 'kokugo' | 'sansu' | 'rika' | 'shakai' | 'eigo' | 'seikatsu'

export type Difficulty = 1 | 2 | 3 | 4 | 5

/**
 * 学習クエストの問題データ。
 * 問題を追加するときは src/data/questions.ts に
 * この形式のオブジェクトを追加するだけでよい。
 *
 * 問題文・選択肢には「{漢字|かんじ}」の形でふりがなを入れられる。
 */
export interface Question {
  id: string
  grade: Grade
  subject: Subject
  /** 単元名（例:「たしざん」「ひらがな」） */
  unit: string
  difficulty: Difficulty
  /** 問題文 */
  question: string
  /** 絵文字などで問題を視覚的に見せる行（任意） */
  visual?: string
  /** 選択肢（3つ推奨） */
  choices: string[]
  /** 正解の選択肢の番号（0はじまり） */
  answer: number
  /** 1回目のヒント（やさしい） */
  hint: string
  /** 2回目のヒント（さらに具体的） */
  hint2: string
  /** 正解後に表示する短い解説 */
  explanation: string
  /** 報酬 */
  reward: QuestReward
}

export interface QuestReward {
  coins: number
  xp: number
  /** もらえるブロック（ブロックID → 個数） */
  blocks?: Record<string, number>
}

export interface BlockDef {
  id: string
  name: string
  color: string
  emoji: string
  /** ショップでの値段（コイン） */
  price: number
  /** ショップのカテゴリ（block=ブロック / deco=かざり） */
  category: 'block' | 'deco'
  /** falseならショップに並ばない（宝箱やクエストで手に入る） */
  inShop: boolean
}

export interface PetDef {
  id: string
  name: string
  color: string
  emoji: string
  price: number
  /** せいかく・説明 */
  desc: string
}

export interface PetState {
  type: string
  /** せいちょうポイント（正解するとたまる） */
  growth: number
}

export interface BadgeDef {
  id: string
  name: string
  desc: string
  icon: string
}

export interface SubjectStats {
  answered: number
  cleared: number
}

export interface SaveStats {
  answered: number
  correct: number
  blocksPlaced: number
  bySubject: Partial<Record<Subject, SubjectStats>>
}

/** セーブスロット1つ分のデータ（localStorageに保存） */
export interface SaveData {
  version: 1
  name: string
  avatar: number
  grade: Grade
  coins: number
  level: number
  xp: number
  unlockedAreas: string[]
  /** 所持ブロック（ブロックID → 個数） */
  blocks: Record<string, number>
  items: string[]
  clearedQuests: string[]
  badges: string[]
  pet: PetState | null
  /** 建築エリア（10x10グリッド）。null = 何も置いていない */
  buildGrid: (string | null)[]
  stats: SaveStats
  lastPlayed: string
  /** きょうクリアした問題数（日付が変わるとリセット） */
  dailyCount: number
  dailyDate: string
  /** たからばこを最後に開けた日 */
  chestDate: string
  /** チュートリアルの進行ステップ（0〜5） */
  tutorialStep: number
  /** チュートリアルが終わったか */
  tutorialDone: boolean
  /** 開けた たからばこ のID（一度きりの宝箱） */
  openedChests: string[]
  /** 話しかけたことのあるNPCのID（図鑑用） */
  metNPCs: string[]
}

/** 端末ごとの設定（セーブとは別にlocalStorageへ保存） */
export interface Settings {
  /** もじのおおきさ */
  textSize: 'normal' | 'large'
  /** 画面内ボタン（移動パッドなど）の表示 */
  touchButtons: 'auto' | 'on' | 'off'
  /** 効果音（今は設定のみ。音はフェーズ3で追加） */
  sound: 'on' | 'off'
  /** ふりがな表示 */
  furigana: 'on' | 'off'
}

export type Screen =
  | 'title'
  | 'name'
  | 'grade'
  | 'world'
  | 'status'
  | 'build'
  | 'shop'
  | 'settings'
  | 'zukan'
  | 'avatar'

/** ワールド内で話しかけられるもの（NPC・看板・宝箱など） */
export interface WorldNPC {
  id: string
  kind: 'quest' | 'shop' | 'build' | 'sign' | 'chest' | 'treasure'
  subject?: Subject
  label: string
  /** 話しかけたときのセリフ（sign用） */
  message?: string
  /** 会話ウィンドウで1行ずつ表示するセリフ */
  dialog?: string[]
  pos: [number, number, number]
  color: string
}

/** たからばこの中身 */
export interface TreasureReward {
  coins?: number
  blocks?: Record<string, number>
}
