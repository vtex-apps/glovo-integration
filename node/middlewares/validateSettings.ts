import { UserInputError } from '@vtex/api'

export async function validateSettings(
  ctx: Context,
  next: () => Promise<void>
) {
  const {
    clients: { apps },
  } = ctx

  const appConfig = await apps.getAppSettings(process.env.VTEX_APP_ID as string)

  if (!appConfig.glovoToken) {
    throw new UserInputError('Missing Glovo token. Please check app settings')
  }

  ctx.state.affiliateConfig = appConfig.affiliateConfig

  await next()
}
