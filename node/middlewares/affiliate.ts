export async function affiliate(ctx: Context, next: () => Promise<any>) {
  const {
    state: { glovoToken, affiliateConfig },
  } = ctx

  ctx.status = 200
  ctx.body = { glovoToken, affiliateConfig }
  await next()
}
