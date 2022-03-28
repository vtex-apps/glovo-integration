import type { Dispatch, SetStateAction } from 'react'
import { createContext } from 'react'

interface ContextProps {
  settings: AppConfig
  setSettings: Dispatch<SetStateAction<AppConfig>>
}

export const SettingsContext = createContext({} as ContextProps)
