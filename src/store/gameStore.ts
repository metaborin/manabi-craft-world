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
import { checkAreaUnlocks, NPC_AREA, type AreaDef } from '../data/areas'
import { missionsForDate, missionClaimed, missionDone } from '../data/missions'
import { BUILD_TEMPLATES, templateCost, templateCell } from '../data/templates'
import {
  BUILD_BLOCK_LIMIT,
  BUILD_GRID_SIZE,
  BUILD_MAX_LAYERS,
  BUILD_ORIGIN,
  TREASURE_REWARDS,
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
    const { nearby, save, quest, dialog } = get()
    if (!nearby || !save || quest || dialog) return
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
        // たんけんの たからばこ（1回だけ）
        if (save.openedChests.includes(nearby.id)) {
          get().showToast(UI.world.treasureAlready)
          break
        }
        const reward = TREASURE_REWARDS[nearby.id]
        if (!reward) break
        const parts: string[] = []
        let newBadges: string[] = []
        mutateSave(get, set, (s) => {
          s.openedChests.push(nearby.id)
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
