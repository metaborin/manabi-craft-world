/**
 * ゲーム内の主要なUI文言。
 * 文言を変えたいときは、このファイルを編集するだけでよい。
 * 「{漢字|かんじ}」の形でふりがなを入れられる（ふりがな対応のテキストのみ）。
 */
export const UI = {
  title: {
    gameName: 'まなびクラフトワールド',
    subtitle: 'たんけんして あそんで まなぼう！',
    saveSlot: 'セーブ',
    emptySlot: 'まだ はじめていません',
    newGame: 'はじめから ✨',
    continueGame: 'つづきから ▶',
    lastPlayed: 'さいごに あそんだ日：',
    confirmReset: 'このデータを けして、はじめから あそびますか？',
    confirmYes: 'はい（データを けす）',
    confirmNo: 'いいえ（やめる）',
    saveNote: 'セーブデータは この たんまつの なかに ほぞんされるよ',
    settings: '⚙️ せってい',
  },

  common: {
    back: '◀ もどる',
    next: 'すすむ ▶',
    retry: 'もういちど 🔁',
    hint: '💡 ヒントを みる',
    quit: '✕ やめる',
    backToWorld: 'ワールドに もどる',
    decide: 'けってい ▶',
  },

  name: {
    heading: 'なまえを きめよう',
    placeholder: 'ニックネーム',
    random: '🎲 おまかせ',
    note: '※ ほんとうの なまえじゃなくて いいよ',
    colorHeading: 'すきな いろを えらぼう',
  },

  grade: {
    heading: 'がくねんを えらぼう',
    note: 'あとから いつでも かえられるよ',
  },

  world: {
    interactVerbQuest: 'はなす',
    interactVerbChest: 'あける',
    interactVerbOther: 'しらべる',
    interactKeyHint: 'Eキー / タップ',
    keyboardHelp: '⌨️ WASD・やじるし：いどう ／ スペース：ジャンプ ／ E：はなす ／ ドラッグ：カメラ',
    movePad: 'いどう',
    jumpButton: 'ジャンプ',
    searchButton: 'しらべる',
    todaysRec: 'きょうの おすすめ：',
    dailyProgress: (done: number, goal: number) => `🎯 きょう ${done}／${goal}もん で ボーナス！`,
    dailyMax: '🌟 きょうは たくさん がんばったね！',
    chestOpened: 'まいにちボックスを あけた！ +10コイン🪙',
    chestClosed: 'まいにちボックスは あした また あくよ🔒',
    treasureOpened: 'たからばこを みつけた！',
    treasureAlready: 'この たからばこは もう あけたよ✨',
    noQuestions: (subject: string, grade: number) =>
      `${subject}の もんだいは ${grade}ねんせいでは じゅんびちゅう！ ほかの がくねんで あそんでみてね`,
  },

  /** チュートリアル（はじめてあそぶときの あんない） */
  tutorial: {
    steps: [
      '① あるいてみよう！（パッド か WASDキー）',
      '② ちかくの かんばん に ちかづいてみよう',
      '③ 「しらべる」ボタンを おしてみよう',
      '④ せんせいに はなしかけて もんだいに こたえよう',
      '⑤ 3もん といて ごほうびを もらおう',
      '⑥ とんかちさんの けんちくエリアで ブロックを おこう',
    ],
    done: '🎉 チュートリアル クリア！ +10コイン！ すきに あそんでね！',
  },

  /** チュートリアルのあとの「つぎにすること」 */
  nextAction: {
    quest: (done: number, goal: number) =>
      `せんせいに はなしかけて もんだいに チャレンジ！（きょう ${done}／${goal}もん）`,
    build: 'ブロックが たまったよ！ けんちくエリアで おいてみよう🏠',
    shop: 'コインが たまったよ！ ショップを のぞいてみよう🛒',
    free: 'すきな エリアを たんけんしてみよう🗺️',
  },

  dialog: {
    next: 'つぎへ ▶',
    accept: 'ちょうせんする！💪',
    later: 'またこんど',
    ok: 'わかった！',
  },

  quest: {
    praise: ['せいかい！ よくできたね！🎉', 'すごい！ せいかい！✨', 'その ちょうし！🌟', 'ピンポーン！ だいせいかい！🎊'],
    encourage: [
      'おしい！ ヒントを みてみよう',
      'だいじょうぶ。いっしょに かんがえよう',
      'いい ちょうせん！ ひかっている こたえを おしてみよう',
    ],
    assistBanner: '✨ ひかっている こたえを おしてみよう！',
    explanationLabel: 'かいせつ',
    rewardLabel: 'ごほうび：',
    xpName: 'けいけんち',
    levelUp: '🎊 レベルアップ！',
    newBadge: '🏅 あたらしい バッジを ゲット！',
    nextQuestion: (left: number) => `つぎの もんだいへ ▶（あと${left}もん）`,
    seeResult: 'けっかを みる ▶',
    doneHeading: 'クエスト クリア！🎉',
    doneMessage: (cleared: number, coins: number) =>
      `${cleared}もんクリア！ コインを ${coins}まい もらったよ！`,
    doneSub: 'チャレンジ できたのが すごいよ！ つかれたら やすんでも いいからね☕',
    playAgain: 'もういちど あそぶ 🔁',
  },

  build: {
    heading: '🏠 けんちくエリア',
    saved: '✓ ほぞんしたよ',
    selectedLabel: 'いま えらんでいる：',
    noSelection: 'したから ブロックを えらんでね',
    tip: 'ブロックを えらんで マスを タップ！ おいた ブロックは もういちど タップで はずせるよ',
    tipMore: 'おいた ブロックは ワールドの けんちくエリアにも あらわれるよ！',
    needBlocks: 'ブロックが たりなくなったら クエストや ショップで あつめよう！',
  },

  shop: {
    heading: '🛒 ごほうびショップ',
    tabBlocks: '🧱 ブロック',
    tabDeco: '✨ かざり',
    tabPets: '🐾 ペット',
    tabAvatar: '🎨 アバター',
    avatarComingSoon:
      'みためは ステータスがめんの「🎨みためを かえる」で えらべるよ！ おようふくの おみせは じゅんびちゅう🎨',
    notForSale: 'たからばこや クエストで みつけよう！',
    petSection: '🥚 ペットのたまご（1ぴきだけ かえるよ）',
    owned: (n: number) => `もっているかず：${n}`,
    buy: (price: number) => `🪙${price} で かう`,
    welcome: (price: number) => `🪙${price} で むかえる`,
    notEnough: (missing: number) => `あと 🪙${missing}まい`,
    havePet: 'もっています',
    petNote: 'もんだいに せいかいすると そだつよ',
    bought: 'かったよ！ けんちくエリアで つかってみよう🧱',
    petBought: (name: string, emoji: string) => `${name}が なかまに なった！${emoji}`,
    noCoins: 'コインが たりないよ。クエストで ためよう！',
    alreadyPet: 'もう ペットが いるよ🐾 だいじに そだてよう！',
  },

  settings: {
    heading: '⚙️ せってい',
    textSize: 'もじの おおきさ',
    textSizeNormal: 'ふつう',
    textSizeLarge: 'おおきい',
    touchButtons: 'がめんの ボタン（いどうパッドなど）',
    touchAuto: 'じどう',
    touchOn: 'ひょうじする',
    touchOff: 'ひょうじしない',
    sound: 'こうかおん',
    soundOn: 'オン',
    soundOff: 'オフ',
    furigana: 'ふりがな',
    furiganaOn: 'つける',
    furiganaOff: 'つけない',
    note: 'せっていは この たんまつに ほぞんされるよ',
  },

  avatar: {
    heading: '🎨 みための せってい',
    change: '🎨 みためを かえる',
    current: 'いまの すがた',
    choose: 'すきな すがたを えらぼう！ ワールドの じぶんに すぐ はんえいされるよ',
    changed: (name: string) => `${name}タイプに へんしん！✨`,
  },

  pet: {
    growUp: (stage: string) => `つぎは「${stage}」！ あと`,
    grownUp: 'りっぱな おとなに なったよ！🎉',
    growHint: 'もんだいに せいかいすると そだつよ',
  },

  mission: {
    heading: '🎯 きょうの ミッション',
    open: '🎯 ミッション',
    subheading: 'きょうの もくひょう！ クリアして ごほうびを もらおう',
    claim: 'ごほうびを うけとる！🎁',
    claimed: '✓ うけとった',
    doneToast: 'ミッション たっせい！🎯 「ミッション」で ごほうびを うけとろう',
    claimedToast: (title: string) => `「${title}」の ごほうびを もらった！🎉`,
    allDone: '🌟 きょうの ミッション ぜんぶクリア！ すごい！ また あした あそぼうね',
    left: (n: number) => `あと ${n}`,
    welcome: 'きょうも ようこそ！ ボーナス +5🪙',
    welcomeBonus: 'きょうの ようこそボーナス',
    welcomeClaimed: 'きょうは もう うけとったよ。また あしたね！',
    totalDone: (n: number) => `いままでに たっせいした ミッション：${n}かい`,
  },

  petLevel: {
    label: (lv: number) => `ペットレベル ${lv}`,
    up: (lv: number) => `🐾 ペットの レベルが あがった！ レベル${lv}に なったよ！`,
    toNext: (n: number) => `あと ${n}ポイントで ペットが せいちょう！`,
  },

  world2: {
    backToPlaza: '⛲ ひろばへ',
    backedToPlaza: 'ひろばに もどったよ⛲',
    splash: 'ぷはっ！ みずから あがったよ💦',
  },

  zukan: {
    heading: '📖 コレクション',
    blocks: '🧱 あつめた ブロック',
    badges: '🏅 がくしゅうバッジ',
    chests: '🎁 みつけた たからばこ',
    npcs: '👋 であった なかま',
    pet: '🐾 ペット',
    avatars: '🎨 アバター',
    unknown: '？？？',
    chestHint: 'ワールドの すみずみを たんけんしてみよう！',
    openZukan: '📖 コレクション',
  },

  status: {
    heading: '📋 ステータス',
    changeGrade: 'がくねんを かえる',
    level: 'レベル',
    nextLevel: (xp: number) => `つぎのレベルまで あと ${xp} けいけんち`,
    subjectProgress: (grade: string) => `きょうかの すすみぐあい（${grade}）`,
    pet: 'ペット',
    noPet: 'まだ いないよ。ショップで たまごを かってみよう🥚',
    petGrowth: (n: number) => `せいちょうポイント：${n}（もんだいに せいかいすると そだつよ）`,
    badges: 'がくしゅうバッジ',
    backToTitle: '🏠 タイトルへ もどる（セーブずみ）',
  },

  toast: {
    dataDeleted: 'データを けしました',
    newBadge: 'あたらしい バッジを ゲット！🏅',
  },
}
