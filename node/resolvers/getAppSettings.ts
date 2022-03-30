export const getAppSettings = async (
  _: unknown,
  __: unknown,
  ctx: Context
): Promise<AppConfig> => {
  const {
    clients: { apps },
  } = ctx

  const appSettings = await apps.getAppSettings(
    process.env.VTEX_APP_ID as string
  )

  return appSettings
}
