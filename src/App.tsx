import { lazy, Suspense, useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { initAudioUnlock, playSound } from './game/sound'
import { countRender } from './game/perf'
import { flushSave } from './store/saveSystem'
import { TitleScreen } from './screens/TitleScreen'
import { NameScreen } from './screens/NameScreen'
import { GradeScreen } from './screens/GradeScreen'
import { WorldScreen } from './screens/WorldScreen'
import { Toast } from './components/Toast'
import { StoryOverlay } from './components/StoryOverlay'
import { AreaUnlockOverlay } from './components/AreaUnlockOverlay'
import { EndingOverlay } from './components/EndingOverlay'

// あまり開かない画面は遅延読み込みにして、最初の読み込みを軽くする
const StatusScreen = lazy(() =>
  import('./screens/StatusScreen').then((m) => ({ default: m.StatusScreen })),
)
const BuildScreen = lazy(() =>
  import('./screens/BuildScreen').then((m) => ({ default: m.BuildScreen })),
)
const ShopScreen = lazy(() =>
  import('./screens/ShopScreen').then((m) => ({ default: m.ShopScreen })),
)
const SettingsScreen = lazy(() =>
  import('./screens/SettingsScreen').then((m) => ({ default: m.SettingsScreen })),
)
const ZukanScreen = lazy(() =>
  import('./screens/ZukanScreen').then((m) => ({ default: m.ZukanScreen })),
)
const AvatarScreen = lazy(() =>
  import('./screens/AvatarScreen').then((m) => ({ default: m.AvatarScreen })),
)
const MissionScreen = lazy(() =>
  import('./screens/MissionScreen').then((m) => ({ default: m.MissionScreen })),
)
const HelpScreen = lazy(() =>
  import('./screens/HelpScreen').then((m) => ({ default: m.HelpScreen })),
)

/** 個別の効果音（正解・設置など）が鳴るボタンには「タップ音」を重ねない */
const TAP_SOUND_EXCLUDE = ['.choice-btn', '.interact-btn', '.touch-search', '.touch-jump', '.build-cell']

/** 遅延読み込み中に一瞬だけ出す表示 */
function LazyFallback() {
  return <div className="screen panel-screen lazy-loading">よみこみちゅう…</div>
}

/** エンディング表示（しんでんチャレンジ はじめてクリアのあと） */
function EndingGate() {
  const open = useGameStore((s) => s.endingOpen)
  return open ? <EndingOverlay /> : null
}

export default function App() {
  countRender('App')
  const screen = useGameStore((s) => s.screen)
  const hasSave = useGameStore((s) => s.save !== null)
  const textSize = useGameStore((s) => s.settings.textSize)
  const lite = useGameStore((s) => s.settings.liteMode === 'on')
  const showStory = useGameStore(
    (s) => s.storyReplay || (s.screen === 'world' && s.save?.storyProgress === 0),
  )

  useEffect(() => {
    // 自動再生制限対策：最初の操作でAudioContextを起動
    const removeUnlock = initAudioUnlock()
    // すべてのボタンに軽いタップ音（1か所で一括）
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement)?.closest?.('button')
      if (!el) return
      if (TAP_SOUND_EXCLUDE.some((sel) => el.matches(sel))) return
      playSound('tap')
    }
    document.addEventListener('click', onClick, true)
    // タブを閉じる・切りかえる前に、書き込み待ちのセーブを確実に保存する
    const onHide = () => {
      if (document.visibilityState === 'hidden') flushSave()
    }
    window.addEventListener('pagehide', flushSave)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      removeUnlock()
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('pagehide', flushSave)
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [])

  return (
    <div className={`app ${textSize === 'large' ? 'text-large' : ''} ${lite ? 'lite' : ''}`}>
      {screen === 'title' && <TitleScreen />}
      {screen === 'name' && <NameScreen />}
      {screen === 'grade' && <GradeScreen />}
      {/* ワールドはセーブ中はずっとマウントしたまま隠す。
          画面を切りかえるたびにWebGLコンテキストを作り直すと
          PCで大きな引っかかりになるため（フェーズ3.2の計測結果より） */}
      {hasSave && <WorldScreen active={screen === 'world'} />}
      <Suspense fallback={<LazyFallback />}>
        {screen === 'status' && <StatusScreen />}
        {screen === 'build' && <BuildScreen />}
        {screen === 'shop' && <ShopScreen />}
        {screen === 'settings' && <SettingsScreen />}
        {screen === 'zukan' && <ZukanScreen />}
        {screen === 'avatar' && <AvatarScreen />}
        {screen === 'mission' && <MissionScreen />}
        {screen === 'help' && <HelpScreen />}
      </Suspense>
      {/* オープニング・エンディング・エリア解放のお祝いは、どの画面よりも上に出す */}
      {showStory && <StoryOverlay />}
      <EndingGate />
      <AreaUnlockOverlay />
      {/* ワールド画面以外でもトーストを出せるように */}
      {screen !== 'world' && <Toast />}
    </div>
  )
}
