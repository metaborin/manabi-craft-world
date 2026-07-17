import { create } from 'zustand'
import type {
  Grade,
  MissionCounter,
  Question,
  SaveData,
  Screen,
  Settings,
  Subject,
  WorldNPC,
} from '../types/game'
import { getQuestions } from '../data/questions'
import { SUBJECTS } from '../data/grades'
import { BADGES, BLOCK_MAP, DAILY_BONUS, PET_MAP, petLevel, TITLES, xpForLevel } from '../data/rewards'
import { checkAreaUnlocks, isAreaUnlocked, NPC_AREA, type AreaDef } from '../data/areas'
import { activeSubjectsText, BOSS_MAP, BOSS_RULES, bossState, isBossEnabled, isTempleReady } from '../data/bosses'
import { missionsForDate, missionClaimed, missionDone } from '../data/missions'
import { BUILD_TEMPLATES, templateCost, templateCell } from '../data/templates'
import {
  BUILD_BLOCK_LIMIT,
  BUILD_GRID_SIZE,
  BUILD_MAX_LAYERS,
  BUILD_ORIGIN,
  CHEST_COOLDOWN_MS,
  CHEST_REPEAT_COINS,
  REPEATABLE_CHESTS,
  TREASURE_REWARDS,
  chestRemainingMs,
  formatRemain,
} from '../data/world'
import { UI } from '../data/uiText'
import { petCelebrate, playFx, registerFxSink, type FxType } from '../game/effects'
import { playSound, soundState } from '../game/sound'
import {
  createNewSave,
  deleteSave,
  flushSave,
  loadSave,
  scheduleSave,
  writeSave,
  todayString,
  type SlotId,
} from './saveSystem'
import { loadSettings, writeSettings } from './settingsSystem'
import { playerState, resetPlayerState } from '../game/playerState'

/** 1クエスト＝3問のセッション */
export interface QuestSession {
  subject: Subject
  questions: Question[]
  index: number
  /** いまの問題でまちがえた回数 */
  wrong: number
  /** 表示中のヒントレベル 0=なし 1=ヒント1 2=ヒント2 */
  hintLevel: number
  /** 2回まちがえたら、正解をひからせて一緒に解く */
  assist: boolean
  phase: 'ask' | 'correct' | 'done'
  /** 直前の正解でもらった報酬 */
  lastReward: { coins: number; xp: number; blockNames: string[] } | null
  /** はげまし・フィードバックメッセージ */
  message: string | null
  levelUp: boolean
  newBadges: string[]
  /** このセッションで正解した数 */
  clearedCount: number
  /** このセッションでもらったコイン合計（ボーナス込み） */
  earnedCoins: number
  /** セッション終了ボーナスのメッセージ */
  bonusMessages: string[]
}

/** ボス・しんでんチャレンジのセッション */
export interface BossSession {
  kind: 'boss' | 'temple'
  /** ボスのときの教科（しんでんはnull） */
  subject: Subject | null
  questions: Question[]
  index: number
  /** せいかい数・まちがい数 */
  correct: number
  wrong: number
  /** ヒントはチャレンジ中1回だけ */
  hintUsed: boolean
  /** いまの問題でヒントを見ているか */
  hintShown: boolean
  phase: 'intro' | 'ask' | 'feedback' | 'clear' | 'fail'
  lastCorrect: boolean
  feedbackMsg: string
  /** はじめてのクリアか（ごほうび・エンディング用） */
  firstClear: boolean
  /** クリア画面に出すごほうびの一覧 */
  rewardText: string[]
}

interface GameState {
  screen: Screen
  slot: SlotId | null
  save: SaveData | null
  settings: Settings
  /** せってい画面から戻る先 */
  settingsReturn: Screen
  /** いま近くにいるNPC（しらべるボタンの対象） */
  nearby: WorldNPC | null
  quest: QuestSession | null
  /** 会話ウィンドウ（NPC・看板のセリフ表示） */
  dialog: { npc: WorldNPC; index: number } | null
  /** ボス・しんでんチャレンジ */
  boss: BossSession | null
  /** エンディング表示中か */
  endingOpen: boolean
  /** 報酬などの演出イベント（FxOverlayが拾って表示する） */
  fx: { id: number; type: FxType; text?: string } | null
  /** エリア解放のお祝い表示 */
  areaUnlock: AreaDef | null
  /** ペットが近くの宝箱を感じているか（レベル2のとくぎ） */
  petSense: boolean
  /** おはなしをもういちど見るモード */
  storyReplay: boolean
  /** 画面に一時的に出すメッセージ */
  toast: { id: number; text: string } | null
  /** 「はじめから」でスロットを選んだ直後か（名前入力→学年選択に進む用） */
  isNewGame: boolean
  buildSelection: string | null

  setScreen: (s: Screen) => void
  openSettings: () => void
  openHelp: () => void
  closeSettings: () => void
  updateSettings: (patch: Partial<Settings>) => void
  selectSlot: (slot: SlotId) => void
  startNewOnSlot: (slot: SlotId) => void
  createSave: (name: string, avatar: number) => void
  setGrade: (g: Grade) => void
  setAvatar: (i: number) => void
  setNearby: (npc: WorldNPC | null) => void
  interact: () => void
  dialogNext: () => void
  closeDialog: () => void
  acceptQuestFromDialog: () => void
  /** ボスチャレンジ */
  startBoss: (subject: Subject) => void
  startTemple: () => void
  bossStartQuestions: () => void
  bossAnswer: (choice: number) => void
  bossUseHint: () => void
  bossNext: () => void
  closeBoss: () => void
  finishEnding: () => void
  triggerFx: (type: FxType, text?: string) => void
  startQuest: (subject: Subject) => void
  answerQuestion: (choice: number) => void
  showHint: () => void
  questNext: () => void
  closeQuest: () => void
  /** 建築モード（おく／けす） */
  buildMode: 'place' | 'erase'
  setBuildMode: (m: 'place' | 'erase') => void
  /** ブロックを置く（いちばん下のあいている段に積む） */
  placeBlockAt: (cell: number) => void
  /** いちばん上のブロックをけす（てもとに戻る） */
  eraseBlockAt: (cell: number) => void
  /** おてほん建築をたてる */
  applyTemplate: (templateId: string) => void
  selectBuildBlock: (blockId: string | null) => void
  buyBlock: (blockId: string) => void
  buyPet: (petId: string) => void
  /** ミッションのカウンターを進める（達成したら知らせる） */
  bumpMission: (counter: MissionCounter, n?: number) => void
  /** ミッション報酬を受け取る */
  claimMission: (missionId: string) => void
  /** 1日1回の「ようこそボーナス」 */
  grantDailyWelcome: () => void
  dismissAreaUnlock: () => void
  setPetSense: (v: boolean) => void
  /** オープニングを見おわった */
  finishStory: () => void
  /** おはなしをもういちど見る */
  replayStory: () => void
  /** 称号をつけかえる */
  setTitle: (titleId: string) => void
  showToast: (text: string) => void
  backToTitle: () => void
  /** チュートリアルを1つ進める（stepが一致するときだけ） */
  advanceTutorial: (step: number) => void
}

let toastId = 0

/** 同じ内容の おしらせを まとめる時間（ミリ秒） */
const TOAST_DEDUPE_MS = 1500
let lastToastText = ''
let lastToastAt = 0

/** 1次元配列が同じ内容か */
function sameArray<T>(a: readonly T[], b: readonly T[]): boolean {
  if (a === b) return true
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

/** 建築レイヤー（2次元配列）が同じ内容か */
function sameLayers(a: (string | null)[][], b: (string | null)[][]): boolean {
  if (a === b) return true
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (!sameArray(a[i], b[i])) return false
  return true
}

/** Record<string, number> が同じ内容か */
function sameRecord(a: Record<string, number>, b: Record<string, number>): boolean {
  if (a === b) return true
  const ka = Object.keys(a)
  const kb = Object.keys(b)
  if (ka.length !== kb.length) return false
  for (const k of ka) if (a[k] !== b[k]) return false
  return true
}

/**
 * ストア内でセーブデータを変更して自動保存するヘルパー。
 * ここで称号とエリア解放も自動チェックする（変更の通り道が1本なので確実）。
 *
 * パフォーマンス上の工夫：
 * - structuredCloneで全体が新しい参照になるため、そのままだと
 *   「コインが増えただけ」でも建築ブロックの3D表示などが作り直されてしまう。
 *   変わっていない配列は元の参照に戻して、不要な再レンダリングを防ぐ。
 * - localStorageへの書き込みはdebounce（連続操作で毎回書かない）。
 */
function mutateSave(
  get: () => GameState,
  set: (p: Partial<GameState>) => void,
  fn: (s: SaveData) => void,
) {
  const { save, slot } = get()
  if (!save || !slot) return
  const next = structuredClone(save)
  fn(next)
  // 称号の自動獲得
  const newTitles = TITLES.filter((t) => !next.earnedTitles.includes(t.id) && t.check(next))
  for (const t of newTitles) next.earnedTitles.push(t.id)
  // エリア解放の自動チェック
  const newAreas = checkAreaUnlocks(next)

  // 内容が変わっていない配列・オブジェクトは元の参照を使う（3D側の無駄な再描画防止）
  if (sameLayers(next.buildLayers, save.buildLayers)) next.buildLayers = save.buildLayers
  if (sameArray(next.unlockedAreas, save.unlockedAreas)) next.unlockedAreas = save.unlockedAreas
  if (sameArray(next.openedChests, save.openedChests)) next.openedChests = save.openedChests
  if (sameArray(next.metNPCs, save.metNPCs)) next.metNPCs = save.metNPCs
  if (sameArray(next.badges, save.badges)) next.badges = save.badges
  if (sameArray(next.earnedTitles, save.earnedTitles)) next.earnedTitles = save.earnedTitles
  if (sameArray(next.clearedQuests, save.clearedQuests)) next.clearedQuests = save.clearedQuests
  if (sameArray(next.items, save.items)) next.items = save.items
  if (sameRecord(next.blocks, save.blocks)) next.blocks = save.blocks

  scheduleSave(slot, next)
  set({ save: next })
  if (newTitles.length > 0) {
    setTimeout(() => get().showToast(UI.title2.earned), 3400)
  }
  if (newAreas.length > 0) {
    // 1つめは大きなお祝い、2つめ以降はトーストで知らせる
    setTimeout(() => {
      set({ areaUnlock: newAreas[0] })
      playSound('levelup')
    }, 1000)
    for (let i = 1; i < newAreas.length; i++) {
      setTimeout(
        () => get().showToast(`${newAreas[i].icon} ${newAreas[i].name}も ひらいたよ！`),
        4000 + i * 2000,
      )
    }
  }
}

/** 経験値を加えてレベルアップ処理。レベルが上がったらtrue */
function addXp(s: SaveData, amount: number): boolean {
  s.xp += amount
  let leveled = false
  while (s.xp >= xpForLevel(s.level)) {
    s.xp -= xpForLevel(s.level)
    s.level += 1
    leveled = true
  }
  return leveled
}

/**
 * ペットに経験値を足す。レベルが上がったらtrueを返す。
 * （ペットレベルは pet.growth から計算するので、保存項目は増えない）
 */
function addPetExpTo(s: SaveData, n: number): boolean {
  if (!s.pet) return false
  const before = petLevel(s.pet.growth)
  s.pet.growth += n
  return petLevel(s.pet.growth) > before
}

/** ペットレベルアップの演出（トースト＋音＋よろこび） */
function notifyPetLevelUp(get: () => GameState) {
  const growth = get().save?.pet?.growth ?? 0
  get().showToast(UI.petLevel.up(petLevel(growth)))
  playSound('levelup')
  petCelebrate(3000)
}

/** きょうのカウンターが日付切り替えでリセットされているか確認 */
function ensureDaily(s: SaveData) {
  if (s.daily.date !== todayString()) {
    s.daily = { date: todayString(), counters: {}, claimed: [], bonusClaimed: false }
  }
}

/** 新しく取れたバッジのIDを返す */
function checkBadges(s: SaveData): string[] {
  const earned: string[] = []
  for (const b of BADGES) {
    if (!s.badges.includes(b.id) && b.check(s)) {
      s.badges.push(b.id)
      earned.push(b.id)
    }
  }
  return earned
}

/** 未クリア優先で、ランダムに3問えらぶ */
function pickQuestions(save: SaveData, subject: Subject): Question[] {
  const pool = getQuestions(save.grade, subject)
  if (pool.length === 0) return []
  const fresh = pool.filter((q) => !save.clearedQuests.includes(q.id))
  const done = pool.filter((q) => save.clearedQuests.includes(q.id))
  const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)
  return [...shuffle(fresh), ...shuffle(done)].slice(0, 3)
}

function getBlockPrice(blockId: string): number | null {
  return BLOCK_MAP[blockId]?.price ?? null
}


const initialSettings = loadSettings()
// 効果音モジュールに設定を反映（以後は updateSettings が同期する）
soundState.enabled = initialSettings.sound === 'on'

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'title',
  slot: null,
  save: null,
  settings: initialSettings,
  settingsReturn: 'title',
  nearby: null,
  quest: null,
  dialog: null,
  boss: null,
  endingOpen: false,
  fx: null,
  areaUnlock: null,
  petSense: false,
  storyReplay: false,
  toast: null,
  isNewGame: false,
  buildSelection: null,
  buildMode: 'place',

  setScreen: (s) => {
    set({ screen: s })
    // チュートリアル⑦：ミッションを ひらいた
    if (s === 'mission') get().advanceTutorial(6)
  },

  openSettings: () => set({ settingsReturn: get().screen, screen: 'settings' }),

  openHelp: () => set({ settingsReturn: get().screen, screen: 'help' }),

  closeSettings: () => set({ screen: get().settingsReturn }),

  updateSettings: (patch) => {
    const next = { ...get().settings, ...patch }
    writeSettings(next)
    soundState.enabled = next.sound === 'on'
    set({ settings: next })
  },

  selectSlot: (slot) => {
    const data = loadSave(slot)
    if (data) {
      writeSave(slot, data)
      resetPlayerState()
      set({ slot, save: data, screen: 'world', isNewGame: false })
      // きょう初めてなら「ようこそボーナス」（ワールドが見えてから）
      setTimeout(() => get().grantDailyWelcome(), 900)
    } else {
      set({ slot, save: null, screen: 'name', isNewGame: true })
    }
  },

  /** 「はじめから」：スロットのデータを消して名前入力へ */
  startNewOnSlot: (slot) => {
    deleteSave(slot)
    resetPlayerState()
    set({ slot, save: null, screen: 'name', isNewGame: true })
  },

  createSave: (name, avatar) => {
    const { slot } = get()
    if (!slot) return
    const data = createNewSave(name || 'たんけんか', avatar)
    writeSave(slot, data)
    set({ save: data, screen: 'grade' })
  },

  setGrade: (g) => {
    mutateSave(get, set, (s) => {
      s.grade = g
    })
    set({ screen: 'world' })
  },

  setAvatar: (i) => {
    mutateSave(get, set, (s) => {
      s.avatar = i
    })
  },

  setNearby: (npc) => {
    if (get().nearby?.id !== npc?.id) {
      set({ nearby: npc })
      // チュートリアル②：なにかに ちかづいた
      if (npc) get().advanceTutorial(1)
    }
  },

  interact: () => {
    const { nearby, save, quest, dialog, boss } = get()
    if (!nearby || !save || quest || dialog || boss) return
    // チュートリアル③：しらべるを おした
    get().advanceTutorial(2)

    // 図鑑用：キャラクターNPCに会った記録
    if (
      (nearby.kind === 'quest' ||
        nearby.kind === 'shop' ||
        nearby.kind === 'build' ||
        nearby.kind === 'guide') &&
      !save.metNPCs.includes(nearby.id)
    ) {
      mutateSave(get, set, (s) => {
        s.metNPCs.push(nearby.id)
      })
    }

    // まだ ひらいていないエリアの せんせいには はなしかけられない
    const lockedArea = NPC_AREA[nearby.id]
    if (nearby.kind === 'quest' && lockedArea && !save.unlockedAreas.includes(lockedArea.id)) {
      playSound('talk')
      const hint = lockedArea.remainingHint(save)
      get().showToast(
        `${UI.area.locked(lockedArea.name)}。${lockedArea.conditionText}${hint ? `（${hint}）` : ''}`,
      )
      return
    }

    switch (nearby.kind) {
      case 'quest':
      case 'sign':
      case 'guide':
        // 会話ウィンドウを開く（セリフがなければ即クエスト）
        playSound('talk')
        get().bumpMission('npcTalked')
        if (nearby.dialog && nearby.dialog.length > 0) {
          set({ dialog: { npc: nearby, index: 0 } })
        } else if (nearby.kind === 'quest') {
          get().startQuest(nearby.subject!)
        }
        break
      case 'shop':
        get().bumpMission('shopVisited')
        set({ screen: 'shop' })
        break
      case 'boss':
        if (nearby.subject) get().startBoss(nearby.subject)
        break
      case 'temple':
        get().startTemple()
        break
      case 'build':
        set({ screen: 'build' })
        break
      case 'chest': {
        // まいにちボックス（1日1回）
        if (save.chestDate === todayString()) {
          get().showToast(UI.world.chestClosed)
        } else {
          mutateSave(get, set, (s) => {
            s.chestDate = todayString()
            s.coins += 10
          })
          playFx('chest', '+10 🪙')
          petCelebrate(1400)
          get().showToast(UI.world.chestOpened)
          get().bumpMission('chestsOpened')
        }
        break
      }
      case 'treasure': {
        // たんけんの たからばこ
        // ・はじめて：これまでどおりの ごほうび＋バッジ＋図鑑の記録
        // ・2回目から：時間をあけて、ひかえめな ごほうび（バッジ・ブロックは 出ない）
        const firstTime = !save.openedChests.includes(nearby.id)
        const repeatable = REPEATABLE_CHESTS.has(nearby.id)
        if (!firstTime && !repeatable) {
          // 一度きりの 特別な宝箱は これまでどおり
          get().showToast(UI.world.treasureAlready)
          break
        }
        if (!firstTime) {
          // くりかえし あけられる宝箱：まだ 時間が のこっていたら 待ってもらう
          const remain = chestRemainingMs(save.chestCooldowns?.[nearby.id], Date.now())
          if (remain > 0) {
            playSound('talk')
            get().showToast(UI.world.treasureWaiting(formatRemain(remain)))
            break
          }
          // 2回目からの ごほうび（コインだけ・少なめ）
          mutateSave(get, set, (s) => {
            s.coins += CHEST_REPEAT_COINS
            s.chestCooldowns = { ...(s.chestCooldowns ?? {}), [nearby.id]: Date.now() + CHEST_COOLDOWN_MS }
          })
          playFx('chest', `+${CHEST_REPEAT_COINS} 🪙`)
          petCelebrate(1200)
          get().showToast(UI.world.treasureAgain(CHEST_REPEAT_COINS))
          break
        }
        const reward = TREASURE_REWARDS[nearby.id]
        if (!reward) break
        const parts: string[] = []
        let newBadges: string[] = []
        mutateSave(get, set, (s) => {
          s.openedChests.push(nearby.id)
          if (repeatable) {
            s.chestCooldowns = { ...(s.chestCooldowns ?? {}), [nearby.id]: Date.now() + CHEST_COOLDOWN_MS }
          }
          if (reward.coins) {
            s.coins += reward.coins
            parts.push(`🪙${reward.coins}まい`)
          }
          for (const [blockId, count] of Object.entries(reward.blocks ?? {})) {
            s.blocks[blockId] = (s.blocks[blockId] ?? 0) + count
            const def = BLOCK_MAP[blockId]
            if (def) parts.push(`${def.emoji}${def.name}×${count}`)
          }
          newBadges = checkBadges(s)
        })
        playFx('chest', parts.join('　'))
        petCelebrate(1600)
        get().showToast(`${UI.world.treasureOpened} ${parts.join('、')} をゲット！🎉`)
        get().bumpMission('chestsOpened')
        // チュートリアル⑧：たからばこを あけた
        get().advanceTutorial(7)
        if (newBadges.length > 0) {
          setTimeout(() => get().showToast(UI.toast.newBadge), 2600)
        }
        break
      }
    }
  },

  dialogNext: () => {
    const { dialog } = get()
    if (!dialog) return
    set({ dialog: { ...dialog, index: dialog.index + 1 } })
  },

  // ============================================================
  // ボス・しんでんチャレンジ
  // ============================================================

  startBoss: (subject) => {
    const { save } = get()
    if (!save) return
    const def = BOSS_MAP[subject]
    if (!def) return
    // まず学年条件でチェックする。いまの学年で挑戦できないボスは、
    // モーダルを開く前に ここで止めて、案内だけ出す（問題不足で止める形にしない）。
    if (!isBossEnabled(def, save.grade)) {
      playSound('talk')
      if (save.bossCleared.includes(subject) && def.availableGrades) {
        // ほかの学年でクリア済み。クリア記録は保持したまま、この学年では あそべない。
        const gradeLabel = def.availableGrades.map((g) => `${g}年生`).join('・')
        get().showToast(UI.boss.clearedElsewhere(def.name, gradeLabel))
      } else {
        get().showToast(UI.boss.comingSoon(def.icon, def.name, def.soonText, activeSubjectsText(save.grade)))
      }
      return
    }
    // ここから先は、この学年で有効なボス（available / locked / cleared）
    const state = bossState(save, def)
    if (state === 'locked') {
      const hint = def.remainingHint(save)
      get().showToast(`${UI.boss.notReady(def.name)} ${def.conditionText}${hint ? `（${hint}）` : ''}`)
      return
    }
    // その学年・教科から5問えらぶ（念のための最終チェック）
    const pool = getQuestions(save.grade, subject)
    if (pool.length < BOSS_RULES.bossQuestions) {
      get().showToast(UI.boss.preparing)
      return
    }
    const questions = [...pool].sort(() => Math.random() - 0.5).slice(0, BOSS_RULES.bossQuestions)
    playSound('talk')
    set({
      boss: {
        kind: 'boss',
        subject,
        questions,
        index: 0,
        correct: 0,
        wrong: 0,
        hintUsed: false,
        hintShown: false,
        phase: 'intro',
        lastCorrect: false,
        feedbackMsg: '',
        firstClear: !save.bossCleared.includes(subject),
        rewardText: [],
      },
    })
  },

  startTemple: () => {
    const { save } = get()
    if (!save) return
    if (!isAreaUnlocked(save, 'temple') || !isTempleReady(save)) {
      const left: string[] = []
      if (!save.bossCleared.includes('kokugo')) left.push('こくごボス')
      if (!save.bossCleared.includes('sansu')) left.push('さんすうボス')
      get().showToast(
        `${UI.temple.locked} ${left.length > 0 ? `${left.join('と ')}を クリアしよう` : ''}`,
      )
      return
    }
    // こくご2問＋さんすう2問（その学年から）
    const shuffle = <T,>(a: T[]) => [...a].sort(() => Math.random() - 0.5)
    const kokugo = shuffle(getQuestions(save.grade, 'kokugo')).slice(0, 2)
    const sansu = shuffle(getQuestions(save.grade, 'sansu')).slice(0, 2)
    const questions = shuffle([...kokugo, ...sansu])
    if (questions.length < BOSS_RULES.templeQuestions) {
      get().showToast(UI.boss.preparing)
      return
    }
    playSound('talk')
    set({
      boss: {
        kind: 'temple',
        subject: null,
        questions,
        index: 0,
        correct: 0,
        wrong: 0,
        hintUsed: false,
        hintShown: false,
        phase: 'intro',
        lastCorrect: false,
        feedbackMsg: '',
        firstClear: !save.templeCleared,
        rewardText: [],
      },
    })
  },

  bossStartQuestions: () => {
    const { boss } = get()
    if (!boss || boss.phase !== 'intro') return
    set({ boss: { ...boss, phase: 'ask' } })
  },

  bossAnswer: (choice) => {
    const { boss } = get()
    if (!boss || boss.phase !== 'ask') return
    const q = boss.questions[boss.index]
    const isCorrect = choice === q.answer
    if (isCorrect) {
      playSound('correct')
      const msgs = UI.boss.correctFeedback
      set({
        boss: {
          ...boss,
          correct: boss.correct + 1,
          phase: 'feedback',
          lastCorrect: true,
          feedbackMsg: msgs[Math.floor(Math.random() * msgs.length)],
        },
      })
    } else {
      playSound('wrong')
      set({
        boss: {
          ...boss,
          wrong: boss.wrong + 1,
          phase: 'feedback',
          lastCorrect: false,
          feedbackMsg: `${UI.boss.wrongFeedback}（${UI.boss.answerWas}「${q.choices[q.answer]}」）`,
        },
      })
    }
  },

  bossUseHint: () => {
    const { boss } = get()
    if (!boss || boss.phase !== 'ask' || boss.hintUsed) return
    set({ boss: { ...boss, hintUsed: true, hintShown: true } })
  },

  bossNext: () => {
    const { boss, save } = get()
    if (!boss || boss.phase !== 'feedback' || !save) return
    const rules = boss.kind === 'boss' ? BOSS_RULES.bossQuestions : BOSS_RULES.templeQuestions
    const need = boss.kind === 'boss' ? BOSS_RULES.bossNeed : BOSS_RULES.templeNeed

    // 3問せいかい → その場でクリア！
    if (boss.correct >= need) {
      const rewardText: string[] = []
      const isTemple = boss.kind === 'temple'
      const first = boss.firstClear
      // 報酬は「はじめてクリア」したときだけ。
      // 2回目からは 何度あそんでも コイン・経験値・ブロック・バッジ・称号・光は
      // いっさい増えない（クリア済み表示と 効果音だけ）。
      if (first) {
        let petLeveled = false
        mutateSave(get, set, (s) => {
          const coins = isTemple ? 50 : 30
          const xp = isTemple ? 60 : 40
          s.coins += coins
          rewardText.push(`🪙 +${coins}`)
          addXp(s, xp)
          rewardText.push(`✨ けいけんち +${xp}`)
          const petExp = isTemple ? 5 : 3
          petLeveled = addPetExpTo(s, petExp)
          if (s.pet) rewardText.push(`🐾 +${petExp}`)
          const blocks: Record<string, number> = isTemple
            ? { gem: 2, gold: 2 }
            : boss.subject === 'kokugo'
              ? { bookshelf: 2, gold: 1 }
              : { star: 2, gold: 1 }
          for (const [id, n] of Object.entries(blocks)) {
            s.blocks[id] = (s.blocks[id] ?? 0) + n
            const def = BLOCK_MAP[id]
            if (def) rewardText.push(`${def.emoji} ${def.name}×${n}`)
          }
          if (isTemple) {
            s.templeCleared = true
          } else if (boss.subject && !s.bossCleared.includes(boss.subject)) {
            s.bossCleared.push(boss.subject)
            rewardText.push(UI.boss.lightGet)
          }
          checkBadges(s)
        })
        if (petLeveled) setTimeout(() => notifyPetLevelUp(get), 2000)
      }
      // クリアの喜び（音・ペット）は 再クリアでも出す（報酬ではない）
      playSound('levelup')
      petCelebrate(3000)
      set({ boss: { ...get().boss!, phase: 'clear', rewardText } })
      return
    }

    // もう3問せいかいが むりになったら、やさしく おわる
    const impossible = boss.wrong > rules - need
    const finished = boss.index + 1 >= rules
    if (impossible || finished) {
      set({ boss: { ...boss, phase: 'fail' } })
      petCelebrate(1500) // おうえん
      return
    }
    set({ boss: { ...boss, index: boss.index + 1, phase: 'ask', hintShown: false } })
  },

  closeBoss: () => {
    const { boss, save } = get()
    const wasTempleFirstClear =
      boss?.kind === 'temple' && boss.phase === 'clear' && boss.firstClear
    set({ boss: null })
    // しんでん はじめてクリア → エンディングへ
    if (wasTempleFirstClear && save && !save.endingSeen) {
      set({ endingOpen: true })
    }
  },

  finishEnding: () => {
    set({ endingOpen: false })
    const { save } = get()
    if (save && !save.endingSeen) {
      mutateSave(get, set, (s) => {
        s.endingSeen = true
        checkBadges(s)
      })
      petCelebrate(4000)
      playFx('levelup', '🌟 クリア おめでとう！')
    }
  },

  closeDialog: () => set({ dialog: null }),

  acceptQuestFromDialog: () => {
    const { dialog } = get()
    if (!dialog || dialog.npc.kind !== 'quest') return
    const subject = dialog.npc.subject!
    set({ dialog: null })
    get().startQuest(subject)
  },

  triggerFx: (type, text) => {
    set({ fx: { id: ++toastId, type, text } })
  },

  startQuest: (subject) => {
    const { save } = get()
    if (!save) return
    const questions = pickQuestions(save, subject)
    if (questions.length === 0) {
      get().showToast(UI.world.noQuestions(SUBJECTS[subject].name, save.grade))
      return
    }
    set({
      quest: {
        subject,
        questions,
        index: 0,
        wrong: 0,
        hintLevel: 0,
        assist: false,
        phase: 'ask',
        lastReward: null,
        message: null,
        levelUp: false,
        newBadges: [],
        clearedCount: 0,
        earnedCoins: 0,
        bonusMessages: [],
      },
    })
  },

  answerQuestion: (choice) => {
    const { quest, save } = get()
    if (!quest || !save || quest.phase !== 'ask') return
    const q = quest.questions[quest.index]
    const correct = choice === q.answer

    if (!correct) {
      playSound('wrong')
      const wrong = quest.wrong + 1
      set({
        quest: {
          ...quest,
          wrong,
          hintLevel: Math.min(wrong, 2),
          assist: wrong >= 2,
          message: UI.quest.encourage[Math.min(wrong - 1, UI.quest.encourage.length - 1)],
        },
      })
      // まちがえても記録は「ちょうせんした」だけ。ペナルティなし
      return
    }

    // ===== 正解！ =====
    const firstTime = !save.clearedQuests.includes(q.id)
    const coins = firstTime ? q.reward.coins : Math.max(1, Math.floor(q.reward.coins / 2))
    const xp = q.reward.xp
    let levelUp = false
    let petLeveled = false
    let newBadges: string[] = []
    let bonusCoins = 0
    const bonusMessages: string[] = []
    const blockNames: string[] = []

    mutateSave(get, set, (s) => {
      s.coins += coins
      levelUp = addXp(s, xp)
      if (firstTime) {
        s.clearedQuests.push(q.id)
        if (q.reward.blocks) {
          for (const [blockId, count] of Object.entries(q.reward.blocks)) {
            s.blocks[blockId] = (s.blocks[blockId] ?? 0) + count
            blockNames.push(blockId)
          }
        }
      }
      s.stats.answered += 1
      s.stats.correct += 1
      const sub = (s.stats.bySubject[q.subject] ??= { answered: 0, cleared: 0 })
      sub.answered += 1
      if (firstTime) sub.cleared += 1

      // ペットの経験値（正解で+1）
      petLeveled = addPetExpTo(s, 1)

      // きょうのクリア数ボーナス
      s.dailyCount += 1
      if (s.dailyCount === DAILY_BONUS.small.at) {
        s.coins += DAILY_BONUS.small.coins
        bonusCoins += DAILY_BONUS.small.coins
        bonusMessages.push(DAILY_BONUS.small.message)
      }
      if (s.dailyCount === DAILY_BONUS.big.at) {
        s.coins += DAILY_BONUS.big.coins
        bonusCoins += DAILY_BONUS.big.coins
        bonusMessages.push(DAILY_BONUS.big.message)
      }
      newBadges = checkBadges(s)
    })

    // チュートリアル④：はじめて せいかいした
    get().advanceTutorial(3)

    // 正解音（レベルアップなら少しあとにファンファーレ）
    playSound('correct')
    if (levelUp) setTimeout(() => playSound('levelup'), 400)

    // ペットがよろこぶ（レベルアップのときは長めに）
    petCelebrate(levelUp ? 3000 : 1800)

    // ミッション：もんだいをクリア
    get().bumpMission('questsCleared')

    // ペットのレベルアップ通知（正解演出のあとに）
    if (petLeveled) setTimeout(() => notifyPetLevelUp(get), 1600)

    set({
      quest: {
        ...quest,
        phase: 'correct',
        lastReward: { coins, xp, blockNames },
        message: UI.quest.praise[Math.floor(Math.random() * UI.quest.praise.length)],
        levelUp,
        newBadges,
        clearedCount: quest.clearedCount + 1,
        earnedCoins: quest.earnedCoins + coins + bonusCoins,
        bonusMessages,
      },
    })
  },

  showHint: () => {
    const { quest } = get()
    if (!quest || quest.phase !== 'ask') return
    if (quest.hintLevel === 0) set({ quest: { ...quest, hintLevel: 1 } })
  },

  questNext: () => {
    const { quest, save } = get()
    if (!quest) return
    if (quest.index + 1 >= quest.questions.length) {
      set({ quest: { ...quest, phase: 'done' } })
      // チュートリアル⑤：クエストを さいごまで やった
      get().advanceTutorial(4)
      // ペットのとくぎ（レベル4）：クエストのあと コインをひろってくる
      if (save?.pet && petLevel(save.pet.growth) >= 4 && quest.clearedCount > 0) {
        mutateSave(get, set, (s) => {
          s.coins += 2
        })
        setTimeout(() => get().showToast(UI.petAbility.coinGift), 900)
      }
    } else {
      set({
        quest: {
          ...quest,
          index: quest.index + 1,
          wrong: 0,
          hintLevel: 0,
          assist: false,
          phase: 'ask',
          lastReward: null,
          message: null,
          levelUp: false,
          newBadges: [],
          bonusMessages: [],
        },
      })
    }
  },

  closeQuest: () => set({ quest: null }),

  selectBuildBlock: (blockId) => set({ buildSelection: blockId }),

  setBuildMode: (m) => set({ buildMode: m }),

  placeBlockAt: (cell) => {
    const { save, buildSelection } = get()
    if (!save) return
    // どの段に置くか＝いちばん下のあいている段（浮いたブロックはできない）
    let layer = 0
    while (layer < BUILD_MAX_LAYERS && save.buildLayers[layer][cell]) layer++
    if (layer >= BUILD_MAX_LAYERS) {
      get().showToast(UI.build.tooHigh)
      return
    }
    if (!buildSelection) {
      get().showToast(UI.build.noBlockSelected)
      return
    }
    if ((save.blocks[buildSelection] ?? 0) <= 0) {
      get().showToast(UI.build.outOfBlock)
      return
    }
    // 上限チェック
    const placedCount = save.buildLayers.flat().filter(Boolean).length
    if (placedCount >= BUILD_BLOCK_LIMIT) {
      get().showToast(UI.build.limitReached)
      return
    }
    // プレイヤーが立っているマスには置けない（とじこめ防止）
    const [px, , pz] = playerState.pos
    const [ox, oz] = BUILD_ORIGIN
    const pCol = Math.round(px - ox)
    const pRow = Math.round(pz - oz)
    if (pRow * BUILD_GRID_SIZE + pCol === cell) {
      get().showToast(UI.build.cantPlaceHere)
      return
    }

    playSound('place')
    mutateSave(get, set, (s) => {
      s.blocks[buildSelection] = (s.blocks[buildSelection] ?? 0) - 1
      s.buildLayers[layer][cell] = buildSelection
      s.stats.blocksPlaced += 1
      const earned = checkBadges(s)
      if (earned.length > 0) {
        setTimeout(() => get().showToast(UI.toast.newBadge), 2600)
      }
    })
    // チュートリアル⑥：ブロックを おいた
    get().advanceTutorial(5)
    // ミッション：ブロックをおく／2だんにつむ
    get().bumpMission('blocksPlaced')
    if (layer >= 1) get().bumpMission('blocksStacked')
  },

  eraseBlockAt: (cell) => {
    const { save } = get()
    if (!save) return
    // いちばん上のブロックをさがす
    let layer = BUILD_MAX_LAYERS - 1
    while (layer >= 0 && !save.buildLayers[layer][cell]) layer--
    if (layer < 0) {
      get().showToast(UI.build.nothingToErase)
      return
    }
    const blockId = save.buildLayers[layer][cell]!
    playSound('remove')
    mutateSave(get, set, (s) => {
      s.blocks[blockId] = (s.blocks[blockId] ?? 0) + 1
      s.buildLayers[layer][cell] = null
    })
    // ミッション：ブロックをけす
    get().bumpMission('blocksErased')
  },

  applyTemplate: (templateId) => {
    const { save } = get()
    if (!save) return
    const t = BUILD_TEMPLATES.find((x) => x.id === templateId)
    if (!t) return
    // 置くばしょが あいているか
    for (const [col, row, layer] of t.blocks) {
      if (save.buildLayers[layer][templateCell(col, row)]) {
        get().showToast(UI.build.templateBlocked)
        return
      }
    }
    // 上限チェック
    const placedCount = save.buildLayers.flat().filter(Boolean).length
    if (placedCount + t.blocks.length > BUILD_BLOCK_LIMIT) {
      get().showToast(UI.build.templateLimit)
      return
    }
    // ブロックが足りるか
    const cost = templateCost(t)
    for (const [blockId, count] of Object.entries(cost)) {
      if ((save.blocks[blockId] ?? 0) < count) {
        const def = BLOCK_MAP[blockId]
        get().showToast(
          UI.build.templateNeed(def?.name ?? blockId, count - (save.blocks[blockId] ?? 0)),
        )
        return
      }
    }
    // たてる！（上限チェック済み）
    mutateSave(get, set, (s) => {
      for (const [blockId, count] of Object.entries(cost)) {
        s.blocks[blockId] = (s.blocks[blockId] ?? 0) - count
      }
      for (const [col, row, layer, blockId] of t.blocks) {
        s.buildLayers[layer][templateCell(col, row)] = blockId
      }
      s.stats.blocksPlaced += t.blocks.length
      s.stats.templatesUsed = (s.stats.templatesUsed ?? 0) + 1
      checkBadges(s)
    })
    playFx('chest', `${t.icon} ${t.name}！`)
    get().showToast(UI.build.templateDone(t.name))
    get().bumpMission('blocksPlaced', t.blocks.length)
    if (t.blocks.some(([, , layer]) => layer >= 1)) get().bumpMission('blocksStacked')
  },

  buyBlock: (blockId) => {
    const { save } = get()
    if (!save) return
    const price = getBlockPrice(blockId)
    if (price === null || save.coins < price) {
      get().showToast(UI.shop.noCoins)
      return
    }
    mutateSave(get, set, (s) => {
      s.coins -= price
      s.blocks[blockId] = (s.blocks[blockId] ?? 0) + 1
      checkBadges(s)
    })
    playSound('buy')
    get().showToast(UI.shop.bought)
  },

  buyPet: (petId) => {
    const { save } = get()
    if (!save) return
    if (save.pet) {
      get().showToast(UI.shop.alreadyPet)
      return
    }
    const pet = PET_MAP[petId]
    if (!pet || save.coins < pet.price) {
      get().showToast(UI.shop.noCoins)
      return
    }
    mutateSave(get, set, (s) => {
      s.coins -= pet.price
      s.pet = { type: petId, growth: 0 }
      checkBadges(s)
    })
    playSound('buy')
    get().showToast(UI.shop.petBought(pet.name, pet.emoji))
  },

  bumpMission: (counter, n = 1) => {
    const { save } = get()
    if (!save) return
    const missions = missionsForDate(todayString())
    const before = save.daily.date === todayString() ? (save.daily.counters[counter] ?? 0) : 0
    mutateSave(get, set, (s) => {
      ensureDaily(s)
      s.daily.counters[counter] = (s.daily.counters[counter] ?? 0) + n
    })
    // このカウンターのミッションが「いま」達成されたら知らせる
    const after = before + n
    const justDone = missions.some(
      (m) => m.counter === counter && before < m.goal && after >= m.goal,
    )
    if (justDone) {
      playSound('coin')
      setTimeout(() => get().showToast(UI.mission.doneToast), 1200)
    }
  },

  claimMission: (missionId) => {
    const { save } = get()
    if (!save) return
    const m = missionsForDate(todayString()).find((x) => x.id === missionId)
    if (!m || !missionDone(save, m) || missionClaimed(save, m)) return
    let petLeveled = false
    let allDone = false
    const parts: string[] = []
    mutateSave(get, set, (s) => {
      ensureDaily(s)
      s.daily.claimed.push(m.id)
      s.totalMissionsCompleted += 1
      // きょうのミッションを ぜんぶ うけとった？
      const missions = missionsForDate(todayString())
      if (missions.every((x) => s.daily.claimed.includes(x.id))) {
        s.allMissionDays = (s.allMissionDays ?? 0) + 1
        allDone = true
      }
      if (m.reward.coins) {
        s.coins += m.reward.coins
        parts.push(`🪙${m.reward.coins}`)
      }
      if (m.reward.xp) {
        addXp(s, m.reward.xp)
        parts.push(`✨${m.reward.xp}`)
      }
      if (m.reward.petExp && s.pet) {
        petLeveled = addPetExpTo(s, m.reward.petExp)
        parts.push(`🐾+${m.reward.petExp}`)
      }
      for (const [blockId, count] of Object.entries(m.reward.blocks ?? {})) {
        s.blocks[blockId] = (s.blocks[blockId] ?? 0) + count
        const def = BLOCK_MAP[blockId]
        if (def) parts.push(`${def.emoji}${def.name}`)
      }
      checkBadges(s)
    })
    playFx('chest', parts.join('　'))
    petCelebrate(1600)
    get().showToast(UI.mission.claimedToast(m.title))
    if (petLeveled) setTimeout(() => notifyPetLevelUp(get), 1800)
    // ぜんぶクリアのお祝い
    if (allDone) {
      setTimeout(() => {
        playFx('levelup', '🌟 ぜんぶクリア！')
        get().showToast(UI.mission.allDone)
      }, 2000)
    }
  },

  grantDailyWelcome: () => {
    const { save } = get()
    if (!save || save.daily.bonusClaimed) return
    let petLeveled = false
    mutateSave(get, set, (s) => {
      ensureDaily(s)
      if (s.daily.bonusClaimed) return
      s.daily.bonusClaimed = true
      s.coins += 5
      if (s.pet) petLeveled = addPetExpTo(s, 1)
    })
    playFx('coins', '+5 🪙')
    get().showToast(UI.mission.welcome)
    if (petLeveled) setTimeout(() => notifyPetLevelUp(get), 1800)
  },

  showToast: (text) => {
    // 同じ おしらせが 短いあいだに 何度も出るのを ふせぐ
    // （ちがう おしらせは そのまま 出す）
    const now = Date.now()
    if (text === lastToastText && now - lastToastAt < TOAST_DEDUPE_MS) return
    lastToastText = text
    lastToastAt = now
    set({ toast: { id: ++toastId, text } })
  },

  backToTitle: () => {
    flushSave()
    resetPlayerState()
    set({
      screen: 'title',
      slot: null,
      save: null,
      quest: null,
      nearby: null,
      dialog: null,
      boss: null,
      endingOpen: false,
      fx: null,
      areaUnlock: null,
      petSense: false,
      storyReplay: false,
    })
  },

  dismissAreaUnlock: () => set({ areaUnlock: null }),

  setPetSense: (v) => {
    if (get().petSense !== v) set({ petSense: v })
  },

  finishStory: () => {
    set({ storyReplay: false })
    const { save } = get()
    if (save && save.storyProgress === 0) {
      mutateSave(get, set, (s) => {
        s.storyProgress = 1
      })
    }
  },

  replayStory: () => set({ storyReplay: true, screen: 'world' }),

  setTitle: (titleId) => {
    const { save } = get()
    if (!save || !save.earnedTitles.includes(titleId)) return
    mutateSave(get, set, (s) => {
      s.currentTitle = titleId
    })
    const t = TITLES.find((x) => x.id === titleId)
    if (t) get().showToast(UI.title2.changed(t.name))
  },

  advanceTutorial: (step) => {
    const { save } = get()
    if (!save || save.tutorialDone || save.tutorialStep !== step) return
    const nextStep = step + 1
    const finished = nextStep >= UI.tutorial.steps.length
    mutateSave(get, set, (s) => {
      s.tutorialStep = nextStep
      if (finished) {
        s.tutorialDone = true
        s.coins += 10
      }
    })
    if (finished) get().showToast(UI.tutorial.done)
  },
}))

// effects.ts の playFx がFxOverlayに演出を届けられるように登録する
registerFxSink((type, text) => useGameStore.getState().triggerFx(type, text))

// 開発時のデバッグ用（本番ビルドには含まれない）
if (import.meta.env.DEV) {
  ;(window as unknown as Record<string, unknown>).__store = useGameStore
}
