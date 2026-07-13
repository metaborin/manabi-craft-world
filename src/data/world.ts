import type { TreasureReward, WorldNPC } from '../types/game'
import { ACTIVE_BOSSES } from './bosses'

/** ワールドの広さ（-WORLD_HALF 〜 +WORLD_HALF） */
export const WORLD_HALF = 22

/** 建築エリアのグリッド設定（ワールド内にも表示される） */
export const BUILD_GRID_SIZE = 10
export const BUILD_ORIGIN: [number, number] = [-4.5, 12] // グリッド左上のワールド座標(x,z)
/** 積める高さ（段数）。将来ここを増やせば4段以上にできる */
export const BUILD_MAX_LAYERS = 3
/** 置けるブロックの合計数の上限（低スペック端末対策。ここで変更できる） */
export const BUILD_BLOCK_LIMIT = 50

/** 空の建築レイヤーを作る */
export function emptyBuildLayers(): (string | null)[][] {
  return Array.from({ length: BUILD_MAX_LAYERS }, () =>
    Array(BUILD_GRID_SIZE * BUILD_GRID_SIZE).fill(null),
  )
}

/** ワールドに配置するNPC・看板・宝箱 */
export const WORLD_NPCS: WorldNPC[] = [
  {
    id: 'npc-sansu',
    kind: 'quest',
    subject: 'sansu',
    label: 'カズくん',
    dialog: [
      'こんにちは！ ここは さんすうのおか だよ。',
      'かずの ちからで この おかの とうを たてたんだ！',
      'かんたんな もんだいに ちょうせんしてみる？',
    ],
    pos: [14, 0, -10],
    color: '#f59e42',
  },
  {
    id: 'npc-kokugo',
    kind: 'quest',
    subject: 'kokugo',
    label: 'ふでちゃん',
    dialog: [
      'ようこそ〜。ここは ことばのもり だよ。',
      'おおきな ほんと えんぴつが めじるしなの。',
      'ことばの もんだい、いっしょに やってみよう！',
    ],
    pos: [-14, 0, -10],
    color: '#4cb944',
  },
  {
    id: 'npc-seikatsu',
    kind: 'quest',
    subject: 'seikatsu',
    label: 'はなさん',
    dialog: [
      'こんにちは！ わたしは はなさん。',
      'おはなや いきものの こと、どれくらい しってるかな？',
      'せいかつの もんだいに ちょうせんしてみる？',
    ],
    pos: [-4, 0, -14],
    color: '#f06292',
  },
  {
    id: 'npc-rika',
    kind: 'quest',
    subject: 'rika',
    label: 'いけのはかせ',
    dialog: [
      'わしは いけのはかせ じゃ。',
      'この いけには ふしぎが いっぱい あるんじゃよ。',
      'りかの もんだいに ちょうせんして みるかの？',
    ],
    pos: [4, 0, -16],
    color: '#26c6da',
  },
  {
    id: 'npc-shakai',
    kind: 'quest',
    subject: 'shakai',
    label: 'まちこさん',
    dialog: [
      'いらっしゃい！ ここは ちいさな まち よ。',
      'ちずや まちの こと、おしえてあげるわ。',
      'しゃかいの もんだいに ちょうせんしてみる？',
    ],
    pos: [18, 0, 2],
    color: '#a1887f',
  },
  {
    id: 'npc-eigo',
    kind: 'quest',
    subject: 'eigo',
    label: 'ミナトせんちょう',
    dialog: [
      'Ahoy（アホーイ）！ ようこそ えいごのみなと へ！',
      'ふねに のって せかいじゅうを たびしてきたぞ。',
      'えいごの もんだいに チャレンジ してみるか？',
    ],
    pos: [-18, 0, 2],
    color: '#9575cd',
  },
  {
    id: 'npc-guide',
    kind: 'guide',
    label: 'ナビちゃん',
    dialog: [
      'ここは まなびクラフトワールド！ まなびの ちからで できた せかいだよ。',
      'さいきん せかいの げんきが すこし へっているの…。',
      'もんだいを といたり、たからばこを みつけたり、けんちくを すると せかいが げんきに なるよ！',
      'こまったら わたしに はなしかけてね。がんばって、たんけんか さん！',
    ],
    pos: [3, 0, 4],
    color: '#ffb74d',
  },
  {
    id: 'npc-shop',
    kind: 'shop',
    label: 'ペンタてんちょう',
    pos: [8, 0, 10],
    color: '#5c6bc0',
  },
  {
    id: 'npc-build',
    kind: 'build',
    label: 'とんかちさん',
    pos: [-8, 0, 10],
    color: '#8d6e63',
  },
  {
    id: 'chest-daily',
    kind: 'chest',
    label: 'まいにちボックス',
    pos: [0, 0, -6],
    color: '#e8b93e',
  },
  {
    id: 'sign-welcome',
    kind: 'sign',
    label: 'かんばん',
    dialog: [
      'まなびクラフトワールドへ ようこそ！',
      'せんせいたちに はなしかけて クエストに チャレンジしよう🌟',
      'ワールドの どこかに たからばこも かくれているよ…！',
    ],
    pos: [0, 0, 3],
    color: '#b58a5a',
  },
  {
    id: 'sign-build',
    kind: 'sign',
    label: 'けんちくエリア',
    dialog: [
      'ここは けんちくエリア！',
      'クエストで もらった ブロックで じゆうに つくってみよう🏠',
    ],
    pos: [-1.5, 0, 9],
    color: '#b58a5a',
  },
  // ============================================================
  // たんけんで見つける たからばこ（1回だけ開けられる）
  // ============================================================
  {
    id: 'treasure-forest',
    kind: 'treasure',
    label: 'たからばこ',
    pos: [-19, 0, -16],
    color: '#c0392b',
  },
  {
    id: 'treasure-hill',
    kind: 'treasure',
    label: 'たからばこ',
    pos: [19, 0, -15],
    color: '#c0392b',
  },
  {
    id: 'treasure-port',
    kind: 'treasure',
    label: 'たからばこ',
    pos: [-21, 0, 8],
    color: '#c0392b',
  },
  {
    id: 'treasure-flower',
    kind: 'treasure',
    label: 'たからばこ',
    pos: [-15, 0, 18],
    color: '#c0392b',
  },
  {
    id: 'treasure-pond',
    kind: 'treasure',
    label: 'たからばこ',
    pos: [12, 0, -19],
    color: '#c0392b',
  },
  // ============================================================
  // エリアボスと まなびのしんでん（フェーズ3.5）
  // ============================================================
  ...ACTIVE_BOSSES.map(
    (b): WorldNPC => ({
      id: `boss-${b.id}`,
      kind: 'boss',
      subject: b.id,
      label: b.name,
      pos: b.pos,
      color: b.color,
    }),
  ),
  {
    id: 'temple-gate',
    kind: 'temple',
    label: 'まなびの しんでん',
    pos: [0, 0, -18],
    color: '#ffd54f',
  },
]

/** たからばこの中身（IDはWORLD_NPCSのtreasure-*と対応） */
export const TREASURE_REWARDS: Record<string, TreasureReward> = {
  'treasure-forest': { coins: 10, blocks: { bookshelf: 1 } },
  'treasure-hill': { coins: 10, blocks: { gold: 2 } },
  'treasure-port': { coins: 15, blocks: { glass: 2 } },
  'treasure-flower': { coins: 5, blocks: { flower: 3 } },
  'treasure-pond': { coins: 10, blocks: { gem: 1 } },
}

/** たからばこの総数（図鑑・ステータス表示用） */
export const TREASURE_COUNT = Object.keys(TREASURE_REWARDS).length

/** 図鑑に載せるキャラクターNPC（quest/shop/build/guide） */
export const CHARACTER_NPCS = WORLD_NPCS.filter(
  (n) => n.kind === 'quest' || n.kind === 'shop' || n.kind === 'build' || n.kind === 'guide',
)

/**
 * 木の位置（見た目はWorldCanvas、当たり判定はterrainが同じデータを使う）
 */
export const TREE_POSITIONS: Record<
  'normal' | 'sakura' | 'pine',
  [number, number, number][]
> = {
  normal: [
    // こくごのもり
    [-17, 0, -13],
    [-11, 0, -13],
    [-17, 0, -7],
    [-14, 0, -15],
    // そのほか
    [12, 0, 16],
    [-19, 0, 13],
    [20, 0, 8],
  ],
  sakura: [
    [-11, 0, -7],
    [4, 0, 6],
    [-4, 0, 20],
  ],
  pine: [
    [19, 0, -19],
    [16, 0, -17],
    [-6, 0, -19],
  ],
}
