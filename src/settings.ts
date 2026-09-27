import { useLiveQuery } from 'dexie-react-hooks'
import { db, defaultSettings, type Settings } from './db.ts'

export function useSettings(): Settings {
  return useLiveQuery(() => db.settings.get('settings'), []) ?? defaultSettings
}

export async function updateSettings(changes: Partial<Omit<Settings, 'id'>>) {
  const current = (await db.settings.get('settings')) ?? defaultSettings
  await db.settings.put({ ...current, ...changes })
}
