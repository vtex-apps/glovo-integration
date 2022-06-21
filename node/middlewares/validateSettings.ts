import { UserInputError } from '@vtex/api'

import { APP_SETTINGS, GLOVO } from '../constants'

export async function validateSettings(
  ctx: Context,
  next: () => Promise<void>
) {
  const {
    clients: { vbase },
  } = ctx

  const appSettings: AppSettings = await vbase.getJSON(
    GLOVO,
    APP_SETTINGS,
    true
  )

  if (!appSettings.glovoToken) {
    throw new UserInputError('Missing Glovo token. Please check app settings')
  }

  ctx.state.glovoToken = appSettings.glovoToken
  ctx.state.marketplace = appSettings.marketplace
  ctx.state.stores = appSettings.stores
  ctx.state.clientProfileData = appSettings.clientProfileData

  await next()
}
