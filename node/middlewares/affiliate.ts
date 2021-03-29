export async function affiliate(ctx: Context, next: () => Promise<any>) {
  const {
    clients: { apps },
  } = ctx

  const appConfig = await apps.getAppSettings(process.env.VTEX_APP_ID as string)

  ctx.status = 200
  ctx.body = appConfig

  await next()
}
