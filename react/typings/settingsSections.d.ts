import type { Dispatch, SetStateAction } from 'react'

export interface SettingsSection {
  settings: AppSettings
  setSettings: Dispatch<SetStateAction<AppSettings>>
  saveSettings: (settings: AppSettings) => Promise<boolean>
}
