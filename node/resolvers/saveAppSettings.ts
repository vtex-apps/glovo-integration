export const saveAppSettings = async (
  _: unknown,
  settings: AppConfig,
  { clients: { apps }, vtex: { logger } }: Context
): Promise<boolean> => {
  try {
    await apps.saveAppSettings(process.env.VTEX_APP_ID as string, settings)

    return true
  } catch (error) {
    logger.error({
      message: `Unable to save apps settings`,
      error,
    })

    return false
  }
}
