/** アバターの見た目タイプ */
export interface AvatarDef {
  /** 表示名 */
  name: string
  /** ふくの色（UIのアイコン背景にも使う） */
  color: string
  /** かみ・ぼうしの色 */
  hair: string
  /** あたまのかざり */
  hat: 'cap' | 'leaf' | 'band' | 'star'
  /** UI用アイコン */
  icon: string
  /** 説明 */
  desc: string
}

/**
 * アバターのタイプ（なまえ画面・ステータス画面で選べる）。
 * セーブデータには配列の番号（avatar: number）で保存される。
 * 新しいタイプを増やすときは、末尾に追加すること（番号がずれないように）。
 */
export const AVATARS: AvatarDef[] = [
  {
    name: 'そら',
    color: '#42a5f5',
    hair: '#2d6fb8',
    hat: 'cap',
    icon: '☁️',
    desc: 'ぼうしが めじるしの たんけんか',
  },
  {
    name: 'もり',
    color: '#66bb6a',
    hair: '#5d4a36',
    hat: 'leaf',
    icon: '🌱',
    desc: 'はっぱが おきにいりの しぜんずき',
  },
  {
    name: 'たいよう',
    color: '#ffa726',
    hair: '#c9662a',
    hat: 'band',
    icon: '☀️',
    desc: 'ハチマキで やるきまんまん',
  },
  {
    name: 'ほし',
    color: '#ab47bc',
    hair: '#5e35b1',
    hat: 'star',
    icon: '⭐',
    desc: 'ほしかざりの ふしぎな こ',
  },
]
