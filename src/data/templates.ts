import { BUILD_GRID_SIZE } from './world'

/**
 * おてほん建築（テンプレート）。
 * blocks は [列, 行, 段, ブロックID]。段は下から0,1,2。
 * 新しいおてほんは、この配列にオブジェクトを足すだけで増やせる。
 */
export interface BuildTemplate {
  id: string
  name: string
  icon: string
  /** [col, row, layer, blockId] */
  blocks: [number, number, number, string][]
}

/** ちいさな いえ（3×3・2階だて）を作るヘルパー */
function smallHouse(): [number, number, number, string][] {
  const blocks: [number, number, number, string][] = []
  // かべ（1だんめ）: 3x3のまわり。まえの まんなかは ドアで あけておく
  for (let c = 3; c <= 5; c++) {
    for (let r = 3; r <= 5; r++) {
      const isEdge = c === 3 || c === 5 || r === 3 || r === 5
      const isDoor = c === 4 && r === 5 // まえがわ（ひろば側）
      if (isEdge && !isDoor) blocks.push([c, r, 0, 'brick'])
    }
  }
  // やね（2だんめ）: 3x3ぜんぶ
  for (let c = 3; c <= 5; c++) {
    for (let r = 3; r <= 5; r++) {
      blocks.push([c, r, 1, 'wood'])
    }
  }
  return blocks
}

/** はなだん（2×3の つちの上に はな） */
function flowerBed(): [number, number, number, string][] {
  const blocks: [number, number, number, string][] = []
  for (let c = 7; c <= 8; c++) {
    for (let r = 1; r <= 3; r++) {
      blocks.push([c, r, 0, 'dirt'])
      blocks.push([c, r, 1, 'flower'])
    }
  }
  return blocks
}

/** ほんだなコーナー（L字の ほんだな） */
function bookCorner(): [number, number, number, string][] {
  return [
    [1, 7, 0, 'bookshelf'],
    [1, 8, 0, 'bookshelf'],
    [2, 8, 0, 'wood'],
    [1, 7, 1, 'bookshelf'],
  ]
}

/** みち（よこに 6マスの みち） */
function road(): [number, number, number, string][] {
  const blocks: [number, number, number, string][] = []
  for (let c = 2; c <= 7; c++) blocks.push([c, 0, 0, 'road'])
  return blocks
}

/** ちいさな とう（2×2で 3だん。てっぺんに ほし） */
function tower(): [number, number, number, string][] {
  const blocks: [number, number, number, string][] = []
  for (let l = 0; l <= 1; l++) {
    for (let c = 7; c <= 8; c++) {
      for (let r = 7; r <= 8; r++) blocks.push([c, r, l, 'stone'])
    }
  }
  blocks.push([7, 7, 2, 'star'])
  blocks.push([8, 8, 2, 'star'])
  return blocks
}

export const BUILD_TEMPLATES: BuildTemplate[] = [
  { id: 'small-house', name: 'ちいさな いえ', icon: '🏠', blocks: smallHouse() },
  { id: 'flower-bed', name: 'はなだん', icon: '🌸', blocks: flowerBed() },
  { id: 'book-corner', name: 'ほんだなコーナー', icon: '📚', blocks: bookCorner() },
  { id: 'road', name: 'みち', icon: '🛤️', blocks: road() },
  { id: 'tower', name: 'ちいさな とう', icon: '🗼', blocks: tower() },
]

/** テンプレートに必要なブロック数（ブロックID → 個数） */
export function templateCost(t: BuildTemplate): Record<string, number> {
  const cost: Record<string, number> = {}
  for (const [, , , id] of t.blocks) cost[id] = (cost[id] ?? 0) + 1
  return cost
}

/** グリッドのセル番号に変換 */
export function templateCell(col: number, row: number): number {
  return row * BUILD_GRID_SIZE + col
}
