import { UserInputError } from '@vtex/api'

export async function validateSettings(
  ctx: Context,
  next: () => Promise<void>
) {
  const {
    clients: { apps },
  } = ctx

  const appSettings = await apps.getAppSettings(
    process.env.VTEX_APP_ID as string
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
