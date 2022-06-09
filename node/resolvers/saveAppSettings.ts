import { validateInputs } from '../../common/utils'

export const saveGlovoIntegrationSettings = async (
  _: unknown,
  { settings }: { settings: AppSettings },
  ctx: Context
): Promise<boolean> => {
  const {
    clients: { apps },
    vtex: { logger },
  } = ctx

  if (!validateInputs(settings)) {
    return false
  }

  try {
    await apps.saveAppSettings(process.env.VTEX_APP_ID as string, settings)

    return true
  } catch (error) {
    logger.error({
      message: `Unable to save apps settings`,
      error: error.response,
    })

    return false
  }
}
