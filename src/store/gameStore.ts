import { create } from 'zustand'
import type {
  Grade,
  Question,
  SaveData,
  Screen,
  Settings,
  Subject,
  WorldNPC,
} from '../types/game'
import { getQuestions } from '../data/questions'
import { SUBJECTS } from '../data/grades'
import { BADGES, BLOCK_MAP, DAILY_BONUS, PET_MAP, xpForLevel } from '../data/rewards'
import { TREASURE_REWARDS } from '../data/world'
import { UI } from '../data/uiText'
import { petCelebrate, playFx, type FxType } from '../game/effects'
import { playSound, soundState } from '../game/sound'
import {
  createNewSave,
  deleteSave,
  loadSave,
  writeSave,
  todayString,
  type SlotId,
} from './saveSystem'
import { loadSettings, writeSettings } from './settingsSystem'
import { resetPlayerState } from '../game/playerState'

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
  /** 画面に一時的に出すメッセージ */
  toast: { id: number; text: string } | null
  /** 「はじめから」でスロットを選んだ直後か（名前入力→学年選択に進む用） */
  isNewGame: boolean
  buildSelection: string | null

  setScreen: (s: Screen) => void
  openSettings: () => void
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
  placeBlock: (cell: number) => void
  selectBuildBlock: (blockId: string | null) => void
  buyBlock: (blockId: string) => void
  buyPet: (petId: string) => void
  showToast: (text: string) => void
  backToTitle: () => void
  /** チュートリアルを1つ進める（stepが一致するときだけ） */
  advanceTutorial: (step: number) => void
}

let toastId = 0

/** ストア内でセーブデータを変更して自動保存するヘルパー */
function mutateSave(
  get: () => GameState,
  set: (p: Partial<GameState>) => void,
  fn: (s: SaveData) => void,
) {
  const { save, slot } = get()
  if (!save || !slot) return
  const next = structuredClone(save)
  fn(next)
  writeSave(slot, next)
  set({ save: next })
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
  toast: null,
  isNewGame: false,
  buildSelection: null,

  setScreen: (s) => set({ screen: s }),

  openSettings: () => set({ settingsReturn: get().screen, screen: 'settings' }),

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
      (nearby.kind === 'quest' || nearby.kind === 'shop' || nearby.kind === 'build') &&
      !save.metNPCs.includes(nearby.id)
    ) {
      mutateSave(get, set, (s) => {
        s.metNPCs.push(nearby.id)
      })
    }

    switch (nearby.kind) {
      case 'quest':
      case 'sign':
        // 会話ウィンドウを開く（セリフがなければ即クエスト）
        playSound('talk')
        if (nearby.dialog && nearby.dialog.length > 0) {
          set({ dialog: { npc: nearby, index: 0 } })
        } else if (nearby.kind === 'quest') {
          get().startQuest(nearby.subject!)
        }
        break
      case 'shop':
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
      if (s.pet) s.pet.growth += 1

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
    const { quest } = get()
    if (!quest) return
    if (quest.index + 1 >= quest.questions.length) {
      set({ quest: { ...quest, phase: 'done' } })
      // チュートリアル⑤：クエストを さいごまで やった
      get().advanceTutorial(4)
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

  placeBlock: (cell) => {
    const { save, buildSelection } = get()
    if (!save) return
    const current = save.buildGrid[cell]
    if (current) {
      // 置いてあるブロックをはずす（手もとに戻る）
      playSound('remove')
      mutateSave(get, set, (s) => {
        s.blocks[current] = (s.blocks[current] ?? 0) + 1
        s.buildGrid[cell] = null
      })
    } else if (buildSelection && (save.blocks[buildSelection] ?? 0) > 0) {
      playSound('place')
      mutateSave(get, set, (s) => {
        s.blocks[buildSelection] = (s.blocks[buildSelection] ?? 0) - 1
        s.buildGrid[cell] = buildSelection
        s.stats.blocksPlaced += 1
        const earned = checkBadges(s)
        if (earned.length > 0) {
          // チュートリアル完了トーストと重ならないよう、少し待ってから出す
          setTimeout(() => get().showToast(UI.toast.newBadge), 2600)
        }
      })
      // チュートリアル⑥：ブロックを おいた
      get().advanceTutorial(5)
    }
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

  showToast: (text) => {
    set({ toast: { id: ++toastId, text } })
  },

  backToTitle: () => {
    resetPlayerState()
    set({ screen: 'title', slot: null, save: null, quest: null, nearby: null, dialog: null, fx: null })
  },

  advanceTutorial: (step) => {
    const { save } = get()
    if (!save || save.tutorialDone || save.tutorialStep !== step) return
    const nextStep = step + 1
    const finished = nextStep >= 6
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
