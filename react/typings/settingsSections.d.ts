import type { Dispatch, SetStateAction } from 'react'

export interface SettingsSection {
  settings: AppConfig
  setSettings: Dispatch<SetStateAction<AppConfig>>
  saveSettings: (settings: AppConfig) => Promise<boolean>
}
