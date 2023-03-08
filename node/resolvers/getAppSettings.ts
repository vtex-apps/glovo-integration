import type { GlovoIntegrationSettings } from 'vtex.glovo-integration'

import { APP_SETTINGS, GLOVO } from '../constants'

export const getGlovoIntegrationSettings = async (
  _: unknown,
  __: unknown,
  ctx: Context
): Promise<GlovoIntegrationSettings> => {
  const {
    clients: { vbase },
  } = ctx

  const appSettings: GlovoIntegrationSettings = await vbase.getJSON(
    GLOVO,
    APP_SETTINGS,
    true
  )

  return appSettings
}
