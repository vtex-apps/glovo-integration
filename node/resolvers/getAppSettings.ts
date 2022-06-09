export const getGlovoIntegrationSettings = async (
  _: unknown,
  __: unknown,
  ctx: Context
): Promise<AppSettings> => {
  const {
    clients: { apps },
  } = ctx

  const appSettings = await apps.getAppSettings(
    process.env.VTEX_APP_ID as string
  )

  return appSettings
}
