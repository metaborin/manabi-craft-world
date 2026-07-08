import { useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { initAudioUnlock, playSound } from './game/sound'
import { TitleScreen } from './screens/TitleScreen'
import { NameScreen } from './screens/NameScreen'
import { GradeScreen } from './screens/GradeScreen'
import { WorldScreen } from './screens/WorldScreen'
import { StatusScreen } from './screens/StatusScreen'
import { BuildScreen } from './screens/BuildScreen'
import { ShopScreen } from './screens/ShopScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { ZukanScreen } from './screens/ZukanScreen'
import { AvatarScreen } from './screens/AvatarScreen'
import { MissionScreen } from './screens/MissionScreen'
import { Toast } from './components/Toast'

/** 個別の効果音（正解・設置など）が鳴るボタンには「タップ音」を重ねない */
const TAP_SOUND_EXCLUDE = ['.choice-btn', '.interact-btn', '.touch-search', '.touch-jump', '.build-cell']

export default function App() {
  const screen = useGameStore((s) => s.screen)
  const textSize = useGameStore((s) => s.settings.textSize)

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
    return () => {
      removeUnlock()
      document.removeEventListener('click', onClick, true)
    }
  }, [])

  return (
    <div className={`app ${textSize === 'large' ? 'text-large' : ''}`}>
      {screen === 'title' && <TitleScreen />}
      {screen === 'name' && <NameScreen />}
      {screen === 'grade' && <GradeScreen />}
      {screen === 'world' && <WorldScreen />}
      {screen === 'status' && <StatusScreen />}
      {screen === 'build' && <BuildScreen />}
      {screen === 'shop' && <ShopScreen />}
      {screen === 'settings' && <SettingsScreen />}
      {screen === 'zukan' && <ZukanScreen />}
      {screen === 'avatar' && <AvatarScreen />}
      {screen === 'mission' && <MissionScreen />}
      {/* ワールド画面以外でもトーストを出せるように */}
      {screen !== 'world' && <Toast />}
    </div>
  )
}
