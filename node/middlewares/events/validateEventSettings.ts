import { UserInputError } from '@vtex/api'
import type { GlovoIntegrationSettings } from 'vtex.glovo-integration'

import { APP_SETTINGS, GLOVO } from '../../constants'

export async function validateEventSettings(
  ctx: StatusChangeContext,
  next: () => Promise<void>
) {
  const {
    clients: { vbase },
  } = ctx

  const appSettings: GlovoIntegrationSettings = await vbase.getJSON(
    GLOVO,
    APP_SETTINGS,
    true
  )

  if (!appSettings.glovoToken) {
    throw new UserInputError(
      'Missing or invalid Glovo token. Please check app settings'
    )
  }

  ctx.state.stores = appSettings.stores
  ctx.state.glovoToken = appSettings.glovoToken

  await next()
}
