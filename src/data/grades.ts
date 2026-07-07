import type { Grade, Subject } from '../types/game'

/** 教科の表示情報 */
export const SUBJECTS: Record<
  Subject,
  { name: string; color: string; icon: string }
> = {
  sansu: { name: 'さんすう', color: '#f59e42', icon: '🔢' },
  kokugo: { name: 'こくご', color: '#4cb944', icon: '📖' },
  seikatsu: { name: 'せいかつ', color: '#f06292', icon: '🌱' },
  rika: { name: 'りか', color: '#26c6da', icon: '🔬' },
  shakai: { name: 'しゃかい', color: '#a1887f', icon: '🗾' },
  eigo: { name: 'えいご', color: '#9575cd', icon: '🌍' },
}

/** 学年ごとの説明と、中心になる教科 */
export const GRADES: Record<
  Grade,
  { label: string; desc: string; mainSubjects: Subject[] }
> = {
  1: {
    label: '1ねんせい',
    desc: 'ひらがな・かず・たしざん・せいかつ',
    mainSubjects: ['kokugo', 'sansu', 'seikatsu'],
  },
  2: {
    label: '2ねんせい',
    desc: 'かけざん・カタカナ・かんじ',
    mainSubjects: ['kokugo', 'sansu', 'seikatsu'],
  },
  3: {
    label: '3ねんせい',
    desc: 'わりざん・りか・しゃかいが はじまるよ',
    mainSubjects: ['kokugo', 'sansu', 'rika', 'shakai'],
  },
  4: {
    label: '4ねんせい',
    desc: 'がい数・角度・でんき・都道府県',
    mainSubjects: ['kokugo', 'sansu', 'rika', 'shakai'],
  },
  5: {
    label: '5ねんせい',
    desc: '分数・ふりこ・えいごも はじまるよ',
    mainSubjects: ['kokugo', 'sansu', 'rika', 'shakai', 'eigo'],
  },
  6: {
    label: '6ねんせい',
    desc: '比・れきし・えいごで しつもん',
    mainSubjects: ['kokugo', 'sansu', 'rika', 'shakai', 'eigo'],
  },
}

export const GRADE_LIST: Grade[] = [1, 2, 3, 4, 5, 6]
