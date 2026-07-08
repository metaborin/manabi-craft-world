// かんたんな地形判定（本格的な物理エンジンは使わない）。
// 「この場所の地面の高さ」「壁かどうか」「水かどうか」を返すだけの仕組み。
// Player.tsx が毎フレームこれを見て、乗る・のぼる・落ちるを決める。

import { BUILD_GRID_SIZE, BUILD_ORIGIN, TREE_POSITIONS } from '../data/world'

/** これ以下の段差は歩いてそのまま上れる。これより高いとジャンプが必要 */
export const STEP_UP = 0.55

/** プレイヤーの半径（壁にめり込まないための余白） */
const PLAYER_R = 0.28

export interface TerrainSample {
  /** 立てる地面の高さ */
  height: number
  /** 壁（入れない） */
  wall: boolean
  /** 水（落ちたら近くの地面へもどす） */
  water: boolean
}

interface TerrainBox {
  x1: number
  z1: number
  x2: number
  z2: number
  /** 立てる高さ。wall=trueのときは使わない */
  h: number
  wall?: boolean
}

/** 決め打ちの地形ボックス（WorldCanvasの飾りの配置と対応） */
const BOXES: TerrainBox[] = [
  // ---- 橋（わたれる）。てすりは見た目だけにして、引っかからないようにする ----
  { x1: 9.05, z1: -1.2, x2: 11.95, z2: 1.2, h: 0.37 },
  // ---- かずのかいだん（のぼれる：0.5ずつ） ----
  { x1: 11.7, z1: -12.5, x2: 12.7, z2: -11.5, h: 0.5 },
  { x1: 12.75, z1: -12.5, x2: 13.75, z2: -11.5, h: 1.0 },
  { x1: 13.8, z1: -12.5, x2: 14.8, z2: -11.5, h: 1.5 },
  { x1: 14.85, z1: -12.5, x2: 15.85, z2: -11.5, h: 2.0 },
  // ---- かずのとう（大きいので壁） ----
  { x1: 16, z1: -14, x2: 18, z2: -12, h: 0, wall: true },
  // ---- ふうしゃ・いえ・やたい・ふんすい・クレーンのはしら（壁） ----
  { x1: 19.1, z1: -11.85, x2: 20.9, z2: -10.15, h: 0, wall: true }, // ふうしゃ
  { x1: 18.1, z1: -1.9, x2: 19.9, z2: -0.1, h: 0, wall: true }, // いえ1
  { x1: 15.1, z1: 4.1, x2: 16.9, z2: 5.9, h: 0, wall: true }, // いえ2
  { x1: 8.3, z1: 10.7, x2: 10.7, z2: 12.3, h: 0, wall: true }, // やたい
  { x1: 0.9, z1: -4.1, x2: 4.1, z2: -0.9, h: 0, wall: true }, // ふんすい
  { x1: 7.25, z1: 15.75, x2: 7.75, z2: 16.25, h: 0, wall: true }, // クレーン
  // ---- のれる かざり ----
  { x1: -7.4, z1: 10, x2: -5.6, z2: 11, h: 0.85 }, // さぎょうだい
  { x1: 5.2, z1: 11.5, x2: 7.3, z2: 12.6, h: 0.8 }, // ブロックおきば（下段）
  { x1: 6.0, z1: 11.65, x2: 6.8, z2: 12.45, h: 1.6 }, // ブロックおきば（上段）
  { x1: -20.2, z1: 4.2, x2: -18.8, z2: 6.8, h: 0.75 }, // ふね
  { x1: -13.5, z1: -14.3, x2: -10.5, z2: -11.7, h: 0.8 }, // おおきな本
  { x1: -17.8, z1: -11.4, x2: -16.2, z2: -8.6, h: 0.55 }, // えんぴつ
]

/** 木のみき（細い壁）をTREE_POSITIONSから作る */
const TREE_BOXES: TerrainBox[] = Object.values(TREE_POSITIONS)
  .flat()
  .map(([x, , z]) => ({ x1: x - 0.3, z1: z - 0.3, x2: x + 0.3, z2: z + 0.3, h: 0, wall: true }))

const ALL_BOXES = [...BOXES, ...TREE_BOXES]

function inWater(x: number, z: number): boolean {
  // 見た目の水面より少し内側だけを「水」にする。
  // 岸辺を歩いただけで落ちないように、余白を持たせる。
  // りかのいけ
  if (Math.hypot(x - 8, z + 17) < 2.9) return true
  // 川（いけから南へ）
  if (x >= 9.8 && x <= 11.2 && z >= -15.2) return true
  return false
}

/**
 * その場所の地形を調べる。
 * buildGrid を渡すと、建築エリアに置いたブロック（高さ1）にも乗れる。
 */
export function sampleGround(
  x: number,
  z: number,
  buildGrid: (string | null)[] | null | undefined,
): TerrainSample {
  let height = 0
  let wall = false

  // 建築エリアのブロック
  if (buildGrid) {
    const [ox, oz] = BUILD_ORIGIN
    const col = Math.round(x - ox)
    const row = Math.round(z - oz)
    if (col >= 0 && col < BUILD_GRID_SIZE && row >= 0 && row < BUILD_GRID_SIZE) {
      if (buildGrid[row * BUILD_GRID_SIZE + col]) height = 1.0
    }
  }

  for (const b of ALL_BOXES) {
    if (b.wall) {
      // 壁はプレイヤーの半径ぶんふくらませて判定（めり込み防止）
      if (x >= b.x1 - PLAYER_R && x <= b.x2 + PLAYER_R && z >= b.z1 - PLAYER_R && z <= b.z2 + PLAYER_R) {
        wall = true
      }
    } else if (x >= b.x1 && x <= b.x2 && z >= b.z1 && z <= b.z2) {
      height = Math.max(height, b.h)
    }
  }

  const water = height === 0 && !wall && inWater(x, z)
  return { height, wall, water }
}

// 開発時のデバッグ用（本番ビルドには含まれない）
if (import.meta.env.DEV) {
  ;(window as unknown as Record<string, unknown>).__sampleGround = sampleGround
}
