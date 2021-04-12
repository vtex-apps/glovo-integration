import { UserInputError } from '@vtex/api'

export async function validateEventSettings(
  ctx: StatusChangeContext,
  next: () => Promise<void>
) {
  // eslint-disable-next-line no-console
  console.log('Inside the validate Settings')

  const {
    clients: { apps },
  } = ctx

  const appConfig = await apps.getAppSettings(process.env.VTEX_APP_ID as string)

  // eslint-disable-next-line no-console
  console.log(appConfig)

  if (!appConfig.glovoToken) {
    throw new UserInputError('Missing Glovo token. Please check app settings')
  }

  ctx.state.glovoToken = appConfig.glovoToken
  ctx.state.affiliateConfig = appConfig.affiliateConfig

  await next()
}
