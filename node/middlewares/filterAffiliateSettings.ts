import { json } from 'co-body'

export async function filterAffiliateSettings(
  ctx: Context,
  next: () => Promise<void>
) {
  const {
    state: { affiliateConfig },
  } = ctx

  const catalogUpdate: CatalogChange = await json(ctx.req)

  const { IdAffiliate } = catalogUpdate

  const affiliateInfo = affiliateConfig.find(
    ({ affiliateId }) => affiliateId === IdAffiliate
  )

  if (!affiliateInfo) {
    ctx.status = 204

    return
  }

  ctx.state.affiliateInfo = affiliateInfo
  ctx.state.catalogUpdate = catalogUpdate

  await next()
}
