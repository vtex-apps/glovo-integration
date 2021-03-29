export async function affiliate(ctx: Context, next: () => Promise<any>) {
  const {
    state: { glovoToken, affiliateIds },
  } = ctx

  ctx.status = 200
  ctx.body = { glovoToken, affiliateIds }
  await next()
}
