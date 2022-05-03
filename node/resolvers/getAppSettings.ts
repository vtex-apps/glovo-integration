import { APP_SETTINGS, GLOVO } from '../constants'

export const getGlovoIntegrationSettings = async (
  _: unknown,
  __: unknown,
  ctx: Context
): Promise<AppSettings> => {
  const {
    clients: { vbase },
  } = ctx

  const appSettings: AppSettings = await vbase.getJSON(
    GLOVO,
    APP_SETTINGS,
    true
  )

  return appSettings
}
