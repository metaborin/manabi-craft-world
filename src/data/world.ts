import type { WorldNPC } from '../types/game'

/** ワールドの広さ（-WORLD_HALF 〜 +WORLD_HALF） */
export const WORLD_HALF = 22

/** 建築エリアのグリッド設定（ワールド内にも表示される） */
export const BUILD_GRID_SIZE = 10
export const BUILD_ORIGIN: [number, number] = [-4.5, 12] // グリッド左上のワールド座標(x,z)

/** ワールドに配置するNPC・看板・宝箱 */
export const WORLD_NPCS: WorldNPC[] = [
  {
    id: 'npc-sansu',
    kind: 'quest',
    subject: 'sansu',
    label: 'カズくん',
    pos: [14, 0, -10],
    color: '#f59e42',
  },
  {
    id: 'npc-kokugo',
    kind: 'quest',
    subject: 'kokugo',
    label: 'ふでちゃん',
    pos: [-14, 0, -10],
    color: '#4cb944',
  },
  {
    id: 'npc-seikatsu',
    kind: 'quest',
    subject: 'seikatsu',
    label: 'はなさん',
    pos: [-4, 0, -14],
    color: '#f06292',
  },
  {
    id: 'npc-rika',
    kind: 'quest',
    subject: 'rika',
    label: 'いけのはかせ',
    pos: [4, 0, -16],
    color: '#26c6da',
  },
  {
    id: 'npc-shakai',
    kind: 'quest',
    subject: 'shakai',
    label: 'まちこさん',
    pos: [18, 0, 2],
    color: '#a1887f',
  },
  {
    id: 'npc-eigo',
    kind: 'quest',
    subject: 'eigo',
    label: 'ミナトせんちょう',
    pos: [-18, 0, 2],
    color: '#9575cd',
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
    label: 'たからばこ',
    pos: [0, 0, -6],
    color: '#e8b93e',
  },
  {
    id: 'sign-welcome',
    kind: 'sign',
    label: 'かんばん',
    message:
      'まなびクラフトワールドへ ようこそ！ せんせいたちに はなしかけて クエストに チャレンジしよう🌟',
    pos: [0, 0, 3],
    color: '#b58a5a',
  },
  {
    id: 'sign-build',
    kind: 'sign',
    label: 'けんちくエリア',
    message:
      'ここは けんちくエリア！ クエストで もらった ブロックで じゆうに つくってみよう🏠',
    pos: [-1.5, 0, 9],
    color: '#b58a5a',
  },
]
