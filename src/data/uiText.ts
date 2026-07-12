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
      '② ちかくの かんばんや ナビちゃんに ちかづこう',
      '③ 「しらべる」ボタンを おしてみよう',
      '④ せんせいに はなしかけて もんだいに こたえよう',
      '⑤ 3もん といて ごほうびを もらおう',
      '⑥ とんかちさんの けんちくエリアで ブロックを おこう',
      '⑦ うえの「🎯ミッション」を ひらいてみよう',
      '⑧ ✨がひかる たからばこを さがして あけよう',
    ],
    done: '🎉 チュートリアル クリア！ +10コイン！ すきに あそんでね！',
  },

  /** オープニングのおはなし（1画面1〜2文） */
  story: {
    slides: [
      {
        icon: '🌍',
        text: 'ここは まなびクラフトワールド。\nまなびの ちからで できた せかい だよ。',
      },
      {
        icon: '🌫️',
        text: 'でも さいきん、せかいの げんきが すこしずつ へっているんだ…。',
      },
      {
        icon: '✨',
        text: 'もんだいを といたり、たからばこを みつけたり、けんちくを すると\nせかいに げんきが もどるよ！',
      },
      {
        icon: '🐾',
        text: 'せんせいたちや ペットと いっしょに、\nせかいを ピカピカに しよう！',
      },
    ],
    start: 'ぼうけんを はじめる！',
    next: 'つぎへ ▶',
    replay: '📖 おはなしを もういちど みる',
  },

  /** エリア解放 */
  area: {
    locked: (name: string) => `🔒 ${name}は まだ ひらいていないよ`,
    unlockedBanner: 'あたらしい エリアが ひらいた！',
    go: 'あそびに いこう！',
    soon: 'もうすぐ ひらくよ！',
    zukanSection: '🗺️ エリア',
  },

  /** 称号 */
  title2: {
    label: 'しょうごう',
    changed: (name: string) => `しょうごうが「${name}」に なったよ！`,
    earned: 'あたらしい しょうごうを ゲット！🎖️',
  },

  /** ペットのとくぎ */
  petAbility: {
    heading: '🐾 ペットの とくぎ',
    lockedAt: (lv: number) => `レベル${lv}で おぼえるよ`,
    sense: '🐾 ペットが たからばこの けはいを かんじてる…！',
    coinGift: '🐾 ペットが コインを ひろってきた！ +2🪙',
    hintPrefix: '🐾 ペットのヒント：',
  },

  /** ヘルプ */
  help: {
    heading: '❓ あそびかた',
    open: '❓ あそびかた',
    items: [
      { q: 'どうやって うごくの？', a: 'PCは WASDキーか やじるしキー。タブレットは ひだりしたの まるい パッドで うごけるよ。スペースキーか ⤴️ボタンで ジャンプ！' },
      { q: 'もんだいを とくには？', a: 'せんせいに ちかづいて「しらべる」を おすと、おはなしのあとに もんだいが はじまるよ。まちがえても だいじょうぶ！ ヒントが でるよ。' },
      { q: 'たからばこって なに？', a: 'せかいの どこかに かくれている ごほうびばこ。✨が ひかっているのは まだ あけていない しるしだよ。' },
      { q: 'ブロックは どうやって おくの？', a: 'けんちくエリアで とんかちさんに はなしかけると けんちくがめんが ひらくよ。ブロックを えらんで マスを タップ！ かさねると 2だん・3だんに つめるよ。' },
      { q: 'ミッションって なに？', a: 'きょうの もくひょうだよ。うえの「🎯ミッション」ボタンから みられるよ。クリアして「うけとる」を おすと ごほうびが もらえる！' },
      { q: 'ペットは どうやって そだつの？', a: 'ショップで たまごを かうと なかまに なるよ。もんだいに せいかいすると そだって、レベルが あがると とくぎを おぼえるよ。' },
      { q: 'セーブは どうなるの？', a: 'あそんだ きろくは じどうで ほぞんされるよ。おなじ パソコン・タブレットの おなじ ブラウザで ひらくと つづきから あそべるよ。' },
    ],
    teacherHeading: '👨‍🏫 せんせい・おうちのかたへ',
    teacherText:
      'このゲームは、小学生が探索や建築を楽しみながら国語・算数などの問題に取り組める学習ゲームです。個人情報は収集・送信せず、セーブデータはブラウザ内(localStorage)にのみ保存されます。問題データは今後追加・編集できます。本作はオリジナル作品であり、Minecraft公式とは関係ありません。',
  },

  /** ショップの追加表示 */
  shop2: {
    recommended: '⭐ きょうの おすすめ！',
    comingSoonPet: '🎀 ペットようひんは じゅんびちゅう！ おたのしみに',
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
    placed: 'おいたよ！',
    erased: 'けしたよ！',
    selectedLabel: 'いま えらんでいる：',
    noSelection: 'したから ブロックを えらんでね',
    modeLabel: 'いま：',
    modePlace: '🧱 おく',
    modeErase: '🧽 けす',
    tipPlace: 'ブロックを えらんで、おきたい マスを タップ！ うえに かさねると 2だん・3だんに つめるよ',
    tipErase: 'けしたい マスを タップ！ いちばん うえの ブロックが てもとに もどるよ',
    tipMore: 'おいた ブロックは ワールドの けんちくエリアにも あらわれて、うえに のれるよ！',
    needBlocks: 'ブロックが たりなくなったら クエストや ショップで あつめよう！',
    noBlockSelected: 'さきに ブロックを えらんでね👇',
    outOfBlock: 'その ブロックは もう もっていないよ',
    tooHigh: 'これより たかくは つめないよ（3だんまで）',
    limitReached: 'これいじょうは おけないよ（さいだい50こ）',
    limitCount: (n: number, max: number) => `おいたブロック ${n}／${max}`,
    cantPlaceHere: 'じぶんの いるばしょには おけないよ',
    nothingToErase: 'ここには ブロックが ないよ',
    myBuild: '✨ じぶんの けんちく',
    templateHeading: '📐 おてほんで たてる',
    templateApply: (name: string) => `おてほん：${name}`,
    templateDone: (name: string) => `おてほんの「${name}」が できたよ！🎉`,
    templateNeed: (name: string, n: number) => `${name}が あと${n}こ たりないよ。ショップや クエストで あつめよう！`,
    templateBlocked: 'おてほんを おくばしょに ブロックが あるよ。まんなかを あけてから ためしてね',
    templateLimit: 'おてほんを たてると 50こを こえちゃうよ。すこし けしてから ためしてね',
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
    liteMode: 'けいりょうモード（PCで うごきが おもいときは オンにしてね）',
    liteOn: 'オン',
    liteOff: 'オフ',
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
