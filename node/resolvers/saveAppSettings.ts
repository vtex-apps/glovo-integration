import type { SaveGlovoIntegrationSettings } from 'vtex.glovo-integration'

import { validateInputs } from '../../common/utils'
import { APP_SETTINGS, GLOVO } from '../constants'

export const saveGlovoIntegrationSettings = async (
  _: unknown,
  { settings }: { settings: SaveGlovoIntegrationSettings },
  ctx: Context
): Promise<boolean> => {
  const {
    clients: { vbase },
    vtex: { logger },
  } = ctx

  if (!validateInputs(settings)) {
    return false
  }

  const validatedSettings: SaveGlovoIntegrationSettings = {
    ...settings,
    minimumStock: settings.minimumStock > 20 ? 20 : settings.minimumStock,
  }

  try {
    await vbase.saveJSON(GLOVO, APP_SETTINGS, validatedSettings)

    return true
  } catch (error) {
    logger.error({
      message: `Unable to save apps settings`,
      error: error.response,
    })

    return false
  }
}
