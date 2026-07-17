import { useGameStore } from '../store/gameStore'
import { UI } from '../data/uiText'
import type { Settings } from '../types/game'

/** 設定1項目分：ラベル＋選択肢ボタン */
function SettingRow<K extends keyof Settings>({
  label,
  settingKey,
  options,
}: {
  label: string
  settingKey: K
  options: { value: Settings[K]; label: string }[]
}) {
  const value = useGameStore((s) => s.settings[settingKey])
  const updateSettings = useGameStore((s) => s.updateSettings)
  return (
    <div className="setting-row">
      <div className="setting-label">{label}</div>
      <div className="setting-options">
        {options.map((o) => (
          <button
            key={String(o.value)}
            className={`btn setting-option ${value === o.value ? 'selected' : ''}`}
            onClick={() => updateSettings({ [settingKey]: o.value } as Partial<Settings>)}
          >
            {value === o.value ? '✓ ' : ''}
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function SettingsScreen() {
  const closeSettings = useGameStore((s) => s.closeSettings)
  const openHelp = useGameStore((s) => s.openHelp)

  return (
    <div className="screen panel-screen">
      <div className="panel-header">
        <button className="btn btn-ghost btn-big" onClick={closeSettings}>
          {UI.common.back}
        </button>
        <h2>{UI.settings.heading}</h2>
        <div />
      </div>

      <div className="panel-body">
        <div className="status-card">
          <SettingRow
            label={UI.settings.textSize}
            settingKey="textSize"
            options={[
              { value: 'normal', label: UI.settings.textSizeNormal },
              { value: 'large', label: UI.settings.textSizeLarge },
            ]}
          />
          <SettingRow
            label={UI.settings.furigana}
            settingKey="furigana"
            options={[
              { value: 'on', label: UI.settings.furiganaOn },
              { value: 'off', label: UI.settings.furiganaOff },
            ]}
          />
          <SettingRow
            label={UI.settings.touchButtons}
            settingKey="touchButtons"
            options={[
              { value: 'auto', label: UI.settings.touchAuto },
              { value: 'on', label: UI.settings.touchOn },
              { value: 'off', label: UI.settings.touchOff },
            ]}
          />
          <SettingRow
            label={UI.settings.sound}
            settingKey="sound"
            options={[
              { value: 'on', label: UI.settings.soundOn },
              { value: 'off', label: UI.settings.soundOff },
            ]}
          />
          <SettingRow
            label={UI.settings.messages}
            settingKey="messages"
            options={[
              { value: 'on', label: UI.settings.messagesOn },
              { value: 'off', label: UI.settings.messagesOff },
            ]}
          />
          <SettingRow
            label={UI.settings.liteMode}
            settingKey="liteMode"
            options={[
              { value: 'off', label: UI.settings.liteOff },
              { value: 'on', label: UI.settings.liteOn },
            ]}
          />
        </div>
        <button className="btn btn-secondary btn-big" onClick={openHelp}>
          {UI.help.open}
        </button>
        <p className="hint-text center">{UI.settings.note}</p>
      </div>
    </div>
  )
}
