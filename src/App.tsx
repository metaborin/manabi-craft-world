import { useGameStore } from './store/gameStore'
import { TitleScreen } from './screens/TitleScreen'
import { NameScreen } from './screens/NameScreen'
import { GradeScreen } from './screens/GradeScreen'
import { WorldScreen } from './screens/WorldScreen'
import { StatusScreen } from './screens/StatusScreen'
import { BuildScreen } from './screens/BuildScreen'
import { ShopScreen } from './screens/ShopScreen'
import { Toast } from './components/Toast'

export default function App() {
  const screen = useGameStore((s) => s.screen)

  return (
    <div className="app">
      {screen === 'title' && <TitleScreen />}
      {screen === 'name' && <NameScreen />}
      {screen === 'grade' && <GradeScreen />}
      {screen === 'world' && <WorldScreen />}
      {screen === 'status' && <StatusScreen />}
      {screen === 'build' && <BuildScreen />}
      {screen === 'shop' && <ShopScreen />}
      {/* ワールド画面以外でもトーストを出せるように */}
      {screen !== 'world' && <Toast />}
    </div>
  )
}
