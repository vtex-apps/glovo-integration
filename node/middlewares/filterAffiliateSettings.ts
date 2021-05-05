import { UserInputError } from '@vtex/api'
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
    throw new UserInputError('Missing or invalid affiliate information')
  }

  ctx.state.affiliateInfo = affiliateInfo
  ctx.state.catalogUpdate = catalogUpdate

  await next()
}
